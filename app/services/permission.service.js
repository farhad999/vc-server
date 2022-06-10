
const db = require('../../config/database');

const hasPermission = async (permission, user) => {
    if(await hasRole('SuperAdmin', user.id)){
        return true;
    }else if(await userHasPermission(permission, user.id)){
        return  true;
    }else if(await permissionThroughRole(permission, user.id)){
        return true;
    }
    return false;
}

const permissionThroughRole = async (permission, userId) => {

    let userRole = await getUserRole(userId);

    console.log('user role', userRole);

    let p = await roleHasPermission(userRole.name, permission);

    return !!p;

}

const roleHasPermission = async (role, permission) => {
    let perm  = await db('roles')
        .join('role_permissions', 'role_permissions.roleId', '=' ,'roles.id')
        .join('permissions', 'permissions.id', '=', 'role_permissions.permissionId')
        .where({'roles.name': role, 'permissions.name': permission})
        .first();
    return perm;
}

const userHasPermission = async (permission, id) => {
    let perm = await db('permissions')
        .join('user_permissions', 'user_permissions.permissionId', '=', 'permissions.id')
        .join('users', 'users.id', '=', 'user_permissions.userId')
        .where({'users.id': id, 'permissions.name': permission})
        .first();

    return perm;
}

const getUserRole = async (userId) => {
  return  db('roles')
      .select('roles.name')
      .join('user_roles', 'user_roles.roleId', '=', 'roles.id')
      .join('users', 'users.id', '=', 'user_roles.userId')
      .where({'users.id': userId})
      .first();
}

const hasRole = async (role, userId) => {
    let r = await db('roles')
        .join('user_roles', 'user_roles.roleId', '=', 'roles.id')
        .join('users', 'users.id', '=', 'user_roles.userId')
        .where({'roles.name': role, 'users.id': userId})
        .first();

    console.log("pppp", role, userId, r);

    return r;

}

module.exports = {
    hasPermission
}