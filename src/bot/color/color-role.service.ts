import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Guild, GuildMember, PermissionFlagsBits, Role } from 'discord.js';

import type { EnvConfig } from '../../env.validation';
import { ColorCatalogService } from './color-catalog.service';
import { createColorRoleNaming } from './helpers';
import { ColorOption } from './types';

@Injectable()
export class ColorRoleService {
  private readonly logger = new Logger(ColorRoleService.name);

  private readonly naming: ReturnType<typeof createColorRoleNaming>;

  constructor(
    config: ConfigService<EnvConfig, true>,
    private readonly colorCatalog: ColorCatalogService,
  ) {
    this.naming = createColorRoleNaming(config.getOrThrow('COLOR_ROLE_PREFIX', { infer: true }));
  }

  async getCurrentColor(member: GuildMember) {
    const colorNames = member.roles.cache
      .map(({ name }) => this.naming.colorNameFromRole(name))
      .filter((name) => name !== undefined);

    return this.colorCatalog.findColorByNames(colorNames);
  }

  async applyColor(member: GuildMember, color: ColorOption, report: (step: string) => Promise<void>) {
    const { guild } = member;
    const roleName = this.naming.colorRoleName(color.name);

    if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return '❌ I need the **Manage Roles** permission to change colors.';
    }

    const { role } = await this.ensureRole(guild, color, report);

    const otherColorRoles = member.roles.cache.filter(
      ({ id, name }) => id !== role.id && this.naming.isColorRole(name),
    );

    if ([role, ...otherColorRoles.values()].some(({ editable }) => !editable)) {
      return '❌ I am not allowed to change your color roles, my role must be above them.';
    }

    await report(`🎨 Giving you the **${roleName}** role...`);
    await member.roles.add(role, 'Member selected name color');

    if (otherColorRoles.size) {
      await report(`🧹 Removing your other color roles: ${otherColorRoles.map(({ name }) => name).join(', ')}...`);
      await member.roles.remove(otherColorRoles, 'Member changed name color');
    }

    return `✅ Your name color is now **${color.name}**!`;
  }

  async createColorRole(guild: Guild, color: ColorOption, report: (step: string) => Promise<void>) {
    if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return '❌ I need the **Manage Roles** permission to create color roles.';
    }

    const { role, created } = await this.ensureRole(guild, color, report);

    return created ? `✅ Created the **${role.name}** role.` : `ℹ️ The **${role.name}** role already exists.`;
  }

  async clearColors(member: GuildMember, report: (step: string) => Promise<void>) {
    if (!member.guild.members.me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return '❌ I need the **Manage Roles** permission to change colors.';
    }

    await report('🔍 Checking your color roles...');

    const colorRoles = member.roles.cache.filter(({ name }) => this.naming.isColorRole(name));
    const colorNames = colorRoles.map(({ name }) => name).join(', ');

    if (!colorRoles.size) {
      return '❌ You do not have any color roles.';
    }

    if (colorRoles.some(({ editable }) => !editable)) {
      return '❌ I am not allowed to remove your color roles, my role must be above them.';
    }

    await report(`🧹 Removing your color roles: ${colorNames}...`);
    await member.roles.remove(colorRoles, 'Member cleared name colors');

    return `✅ Removed your color roles: ${colorNames}.`;
  }

  private async ensureRole(guild: Guild, color: ColorOption, report: (step: string) => Promise<void>) {
    const roleName = this.naming.colorRoleName(color.name);

    await report(`🔍 Checking if the **${roleName}** role exists...`);

    const existingRole = guild.roles.cache.find(({ name }) => name === roleName);

    if (existingRole) {
      return { role: existingRole, created: false };
    }

    await report(`🛠️ Creating the **${roleName}** role...`);

    const role = await guild.roles.create({
      name: roleName,
      colors: { primaryColor: color.value },
      permissions: [],
      reason: 'Create color role',
    });

    await this.moveBelowBot(role, report);

    return { role, created: true };
  }

  private async moveBelowBot(role: Role, report: (step: string) => Promise<void>) {
    const botPosition = role.guild.members.me?.roles.highest.position ?? 0;

    if (role.position >= botPosition - 1) {
      return;
    }

    await report(`📍 Moving **${role.name}** below my role...`);

    try {
      await role.setPosition(botPosition - 1, { reason: 'Place color role below the bot' });
    } catch (error) {
      const { message } = error as Error;
      this.logger.warn(`Could not move ${role.name} below the bot: ${message}`);
    }
  }
}
