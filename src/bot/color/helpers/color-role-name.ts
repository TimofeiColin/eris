export const createColorRoleNaming = (prefix: string) => {
  const colorNameFromRole = (roleName: string) =>
    roleName.startsWith(prefix) ? roleName.slice(prefix.length) : undefined;

  return {
    colorRoleName: (colorName: string) => `${prefix}${colorName}`,
    colorNameFromRole,
    isColorRole: (roleName: string) => colorNameFromRole(roleName) !== undefined,
  };
};
