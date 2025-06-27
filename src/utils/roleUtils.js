// utils/roleUtils.js
export function hasRole(user, requiredRole) {
  if (!user || !user.role) return false;

  const rolesHierarchy = ["user", "admin"]; // add more roles here if needed
  const userIndex = rolesHierarchy.indexOf(user.role);
  const requiredIndex = rolesHierarchy.indexOf(requiredRole);

  return userIndex >= requiredIndex;
}