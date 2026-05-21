import type { PermissionLevel } from './types'

export function isPermissionGranted(level: PermissionLevel): boolean {
  return level === 2
}

export function levelFromGranted(granted: boolean): PermissionLevel {
  return granted ? 2 : 0
}
