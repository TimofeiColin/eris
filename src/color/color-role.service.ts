import { Injectable, Logger } from '@nestjs/common';
import { GuildMember, PermissionFlagsBits, Role } from 'discord.js';
import { DISCORD_COLORS, DiscordColor } from './colors';

const COLOR_ROLE_PREFIX = 'Color ';

const colorRoleName = ({ name }: DiscordColor) => `${COLOR_ROLE_PREFIX}${name}`;

const COLOR_ROLE_NAMES = new Set(DISCORD_COLORS.map(colorRoleName));

@Injectable()
export class ColorRoleService {
  private readonly logger = new Logger(ColorRoleService.name);

  getCurrentColor(member: GuildMember) {
    return DISCORD_COLORS.find((color) => member.roles.cache.some(({ name }) => name === colorRoleName(color)));
  }

  async applyColor(member: GuildMember, color: DiscordColor, report: (step: string) => Promise<void>) {
    const { guild } = member;
    const roleName = colorRoleName(color);

    if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return '❌ I need the **Manage Roles** permission to change colors.';
    }

    await report(`🔍 Checking if the **${roleName}** role exists...`);

    let role = guild.roles.cache.find(({ name }) => name === roleName);

    if (!role) {
      await report(`🛠️ Creating the **${roleName}** role...`);

      role = await guild.roles.create({
        name: roleName,
        colors: { primaryColor: color.value },
        permissions: [],
        reason: 'Create color role',
      });

      await this.moveBelowBot(role, report);
    }

    const otherColorRoles = member.roles.cache.filter(({ id, name }) => id !== role.id && COLOR_ROLE_NAMES.has(name));

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

  async clearColors(member: GuildMember, report: (step: string) => Promise<void>) {
    if (!member.guild.members.me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return '❌ I need the **Manage Roles** permission to change colors.';
    }

    await report('🔍 Checking your color roles...');

    const colorRoles = member.roles.cache.filter(({ name }) => COLOR_ROLE_NAMES.has(name));
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
