import { toast } from 'vue-sonner'
import {
  COMPANY_ROLES,
  createInitialMatrixSnapshot,
} from './default-roles-matrix'
import { isPermissionGranted, levelFromGranted } from './permission-level'
import type {
  PermissionCategory,
  PermissionLevel,
  RoleId,
  RolesMatrixSnapshot,
} from './types'

function snapshotsEqual(
  a: RolesMatrixSnapshot,
  b: RolesMatrixSnapshot,
): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function useRolesPermissionsMatrix() {
  const matrix = ref<RolesMatrixSnapshot>(createInitialMatrixSnapshot())
  const savedMatrix = ref<RolesMatrixSnapshot>(createInitialMatrixSnapshot())
  const compareMode = ref(false)
  const saving = ref(false)

  const isDirty = computed(
    () => !snapshotsEqual(matrix.value, savedMatrix.value),
  )

  const matrixRoles = computed(() => COMPANY_ROLES)

  function getPermissionLevel(
    permissionId: string,
    roleId: RoleId,
  ): PermissionLevel {
    for (const category of matrix.value.categories) {
      const item = category.items.find((row) => row.id === permissionId)
      if (item) {
        return item.levels[roleId] ?? 0
      }
    }
    return 0
  }

  function isGranted(permissionId: string, roleId: RoleId): boolean {
    return isPermissionGranted(getPermissionLevel(permissionId, roleId))
  }

  function setPermission(
    permissionId: string,
    roleId: RoleId,
    granted: boolean,
  ) {
    const categories = matrix.value.categories as PermissionCategory[]
    for (const category of categories) {
      const item = category.items.find((row) => row.id === permissionId)
      if (item) {
        item.levels[roleId] = levelFromGranted(granted)
        return
      }
    }
  }

  function rowHasDifference(permissionId: string): boolean {
    if (!compareMode.value || matrixRoles.value.length < 2) {
      return false
    }
    const levels = matrixRoles.value.map((role) =>
      getPermissionLevel(permissionId, role.id),
    )
    return new Set(levels).size > 1
  }

  async function saveMatrix() {
    if (!isDirty.value || saving.value) {
      return
    }
    saving.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 400))
      savedMatrix.value = structuredClone(matrix.value)
      toast.success('Права доступа сохранены')
    } finally {
      saving.value = false
    }
  }

  function exportMatrix() {
    toast.info('Экспорт матрицы прав будет доступен позже')
  }

  return reactive({
    matrixRoles,
    matrix,
    compareMode,
    isDirty,
    saving,
    isGranted,
    setPermission,
    rowHasDifference,
    saveMatrix,
    exportMatrix,
  })
}
