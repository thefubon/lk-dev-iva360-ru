import type { Component } from 'vue'

export type RoleId = string

/** 0 = denied, 1 = partial, 2 = full access (mockup semantics) */
export type PermissionLevel = 0 | 1 | 2

export interface CompanyRole {
  id: RoleId
  name: string
  icon: Component
  memberCount: number
}

export interface PermissionRow {
  id: string
  name: string
  /** Permission level per role id */
  levels: Record<RoleId, PermissionLevel>
}

export interface PermissionCategory {
  id: string
  name: string
  items: PermissionRow[]
}

export interface RolesMatrixSnapshot {
  categories: PermissionCategory[]
}
