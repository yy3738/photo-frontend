import { http } from '@/utils/request.js'

// ---- 组织管理 ----
/** 获取组织树 */
export const getOrgTree = () => http.get('/admin/orgs/tree')
/** 新增组织 */
export const createOrg = (data) => http.post('/admin/orgs', data)
/** 编辑组织 */
export const updateOrg = (id, data) => http.put(`/admin/orgs/${id}`, data)
/** 启用/禁用组织 */
export const toggleOrgStatus = (id, status) => http.patch(`/admin/orgs/${id}/status`, { status })
/** 删除组织 */
export const deleteOrg = (id) => http.delete(`/admin/orgs/${id}`)

// ---- 角色管理 ----
/** 获取角色列表 */
export const getRoles = (params) => http.get('/admin/roles', params)
/** 获取角色详情 */
export const getRoleDetail = (id) => http.get(`/admin/roles/${id}`)
/** 新增角色 */
export const createRole = (data) => http.post('/admin/roles', data)
/** 编辑角色 */
export const updateRole = (id, data) => http.put(`/admin/roles/${id}`, data)
/** 启用/禁用角色 */
export const toggleRoleStatus = (id, status) => http.patch(`/admin/roles/${id}/status`, { status })
/** 删除角色 */
export const deleteRole = (id) => http.delete(`/admin/roles/${id}`)

// ---- 菜单管理 ----
/** 获取菜单树 */
export const getMenuTree = () => http.get('/admin/menus')
/** 新增菜单 */
export const createMenu = (data) => http.post('/admin/menus', data)
/** 编辑菜单 */
export const updateMenu = (id, data) => http.put(`/admin/menus/${id}`, data)
/** 删除菜单 */
export const deleteMenu = (id) => http.delete(`/admin/menus/${id}`)

// ---- 用户角色分配 ----
/** 获取用户已分配角色 */
export const getUserRoles = (userId) => http.get(`/admin/users/${userId}/roles`)
/** 设置用户角色（全量替换） */
export const setUserRoles = (userId, roleIds) => http.put(`/admin/users/${userId}/roles`, { roleIds })
/** 设置用户所属组织 */
export const setUserOrg = (userId, orgId) => http.put(`/admin/users/${userId}/org`, { orgId })
