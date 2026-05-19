export interface Permission {
  id: string
  key: string
  action: string
}

export interface PermissionGroup {
  module: string
  actions: Permission[]
}

export interface RoleListItem {
  id: string
  name: string
  isSystem: boolean
  permissionCount: number
  permissions: { key: string }[]
  userCount: number
  createdAt: string
}

export interface RoleDetail extends RoleListItem {
  permissionIds: string[]
}

export interface AdminUserListItem {
  id: string
  email: string
  username: string
  roles: { id: string; name: string }[]
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  dateOfBirth?: string
  createdAt: string
}
