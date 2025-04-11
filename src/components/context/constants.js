export const roles = {
  USER: 1,
  ADMIN: 2
}

export const roleList = () => {
  const list = []

  for (const key in roles) {
    list.push({
      idRol: roles[key],
      rol: key
    })
  }

  return list
}

const isRole = (roles, rol) => {
  if (!roles && !roles?.length) return false

  return roles.some((role) => role.rol === rol)
}
export const getIsAdmin = (roles) => {
  return isRole(roles, 'ADMIN')
}

export const getIsUser = (roles) => {
  return isRole(roles, 'USER')
}

export const roleById = (idRol) => {
  return Object.keys(roles).find((key) => roles[key] === idRol)
}
