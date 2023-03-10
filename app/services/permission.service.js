const db = require('../../config/database');

const hasPermission = async (permission, user) => {
    if (await hasRole('SuperAdmin', user.id)) {
        return true;
    } else if (await userHasPermission(permission, user.id)) {
        return true;
    } else if (await permissionThroughRole(permission, user.id)) {
        return true;
    }
    return false;
}

const permissionThroughRole = async (permission, userId) => {

    let userRole = await getUserRole(userId);

    let p = userRole && await roleHasPermission(userRole.name, permission);

    return !!p;

}

const roleHasPermission = async (role, permission) => {
    return db('roles')
        .join('role_permissions', 'role_permissions.roleId', '=', 'roles.id')
        .join('permissions', 'permissions.id', '=', 'role_permissions.permissionId')
        .where({'roles.name': role, 'permissions.name': permission})
        .first();
}

const userHasPermission = async (permission, id) => {
    return db('permissions')
        .join('user_permissions', 'user_permissions.permissionId', '=', 'permissions.id')
        .join('admin_users', 'admin_users.id', '=', 'user_permissions.userId')
        .where({'admin_users.id': id, 'permissions.name': permission})
        .first();
}

const getUserRole = async (userId) => {
    return db('roles')
        .select('roles.name')
        .join('user_roles', 'user_roles.roleId', '=', 'roles.id')
        .join('admin_users', 'admin_users.id', '=', 'user_roles.userId')
        .where({'admin_users.id': userId})
        .first();
}

const hasRole = async (role, userId) => {
    return db('roles')
        .join('user_roles', 'user_roles.roleId', '=', 'roles.id')
        .join('admin_users', 'admin_users.id', '=', 'user_roles.userId')
        .where({'roles.name': role, 'admin_users.id': userId})
        .first();

}

//get user permissions

const rolePermissions = async (role) => {
    return db('roles')
        .select('permissions.name')
        .join('role_permissions', 'role_permissions.roleId', '=', 'roles.id')
        .join('permissions', 'permissions.id', '=', 'role_permissions.permissionId')
        .where({'roles.name': role});
}

const getUserPermissions = async (id) => {

    let role = await getUserRole(id);

    let permissions = role ? await rolePermissions(role.name) : [];

    let p = await db('permissions')
        .select('permissions.name')
        .join('user_permissions', 'user_permissions.permissionId', '=', 'permissions.id')
        .join('admin_users', 'admin_users.id', '=', 'user_permissions.userId')
        .where({'admin_users.id': id});

    let combinedPerms = [...permissions, ...p].map(item=>item.name);

    return [role && role.name, combinedPerms];
}

module.exports = {
    hasPermission,
    getUserPermissions,
    getUserRole
}
