<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import {
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { computed } from 'vue'
import type { CompanyRole, PermissionCategory } from '@/shared/lib/roles/types'
import { Checkbox } from '@/shared/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { cn } from '@lib/utils'

type MatrixRowType = 'category' | 'permission'

interface MatrixTableRow {
  id: string
  rowType: MatrixRowType
  name: string
}

const props = defineProps<{
  categories: PermissionCategory[]
  roles: CompanyRole[]
  compareMode: boolean
  isGranted: (permissionId: string, roleId: string) => boolean
  rowHasDifference: (permissionId: string) => boolean
}>()

const emit = defineEmits<{
  'update:permission': [payload: { permissionId: string, roleId: string, granted: boolean }]
}>()

const tableRows = computed<MatrixTableRow[]>(() => {
  const rows: MatrixTableRow[] = []

  for (const category of props.categories) {
    rows.push({
      id: `category-${category.id}`,
      rowType: 'category',
      name: category.name,
    })

    for (const item of category.items) {
      rows.push({
        id: item.id,
        rowType: 'permission',
        name: item.name,
      })
    }
  }

  return rows
})

function roleColumnId(roleId: string) {
  return `role-${roleId}`
}

function roleForColumn(columnId: string): CompanyRole | undefined {
  if (!columnId.startsWith('role-')) {
    return undefined
  }

  const roleId = columnId.slice('role-'.length)
  return props.roles.find((role) => role.id === roleId)
}

function onPermissionToggle(
  permissionId: string,
  roleId: string,
  value: boolean | 'indeterminate',
) {
  emit('update:permission', {
    permissionId,
    roleId,
    granted: value === true,
  })
}

const columns = computed<ColumnDef<MatrixTableRow>[]>(() => [
  {
    id: 'function',
    accessorKey: 'name',
    header: () => null,
    enableSorting: false,
  },
  ...props.roles.map((role) => ({
    id: roleColumnId(role.id),
    header: () => null,
    enableSorting: false,
  })),
])

const table = useVueTable({
  get data() {
    return tableRows.value
  },
  get columns() {
    return columns.value
  },
  getRowId: (row) => row.id,
  getCoreRowModel: getCoreRowModel(),
})

const leafColumnCount = computed(() => table.getAllLeafColumns().length)
</script>

<template>
  <Table
    class="w-full table-fixed"
    container-class="overflow-visible rounded-md border border-border"
  >
    <TableHeader>
      <TableRow
        v-for="headerGroup in table.getHeaderGroups()"
        :key="headerGroup.id"
        class="border-border border-b hover:bg-transparent"
      >
        <TableHead
          v-for="header in headerGroup.headers"
          :key="header.id"
          :class="cn(
            'sticky top-0 z-20 border-border border-r bg-muted/95 align-middle backdrop-blur-sm last:border-r-0',
            header.column.id === 'function'
              ? 'w-[30%] px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'
              : 'px-2 py-3 text-center',
          )"
        >
          <template v-if="header.column.id === 'function'">
            Функция
          </template>
          <template v-else>
            <div
              v-if="roleForColumn(header.column.id)"
              class="mx-auto flex w-full flex-col items-center gap-1 p-2"
            >
              <span
                class="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground"
                aria-hidden="true"
              >
                <component
                  :is="roleForColumn(header.column.id)!.icon"
                  class="size-4 shrink-0"
                />
              </span>
              <span class="text-xs font-semibold leading-tight text-foreground">
                {{ roleForColumn(header.column.id)!.name }}
              </span>
              <span class="text-[10px] text-muted-foreground">
                {{ roleForColumn(header.column.id)!.memberCount }} чел.
              </span>
            </div>
          </template>
        </TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      <TableRow
        v-for="row in table.getRowModel().rows"
        :key="row.id"
        :class="cn(
          'border-border border-b transition-colors',
          row.original.rowType === 'permission' && 'group hover:bg-muted/20',
          row.original.rowType === 'permission'
            && rowHasDifference(row.original.id)
            && 'bg-primary-50/30 hover:bg-primary-50/40',
        )"
      >
        <template v-if="row.original.rowType === 'category'">
          <TableCell
            :colspan="leafColumnCount"
            class="border-border border-r bg-muted/50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
          >
            {{ row.original.name }}
          </TableCell>
        </template>

        <template v-else>
          <TableCell
            v-for="cell in row.getVisibleCells()"
            :key="cell.id"
            :class="cn(
              'border-border border-r align-middle last:border-r-0',
              cell.column.id === 'function'
                ? cn(
                  'w-[30%] bg-background px-4 py-2.5 text-left text-xs leading-snug text-foreground group-hover:bg-muted/20',
                  rowHasDifference(row.original.id) && 'bg-primary-50/30 group-hover:bg-primary-50/40',
                )
                : cn(
                  'px-2 py-2.5 text-center',
                  rowHasDifference(row.original.id) && 'bg-primary-50/30',
                ),
            )"
          >
            <template v-if="cell.column.id === 'function'">
              {{ row.original.name }}
            </template>
            <template v-else>
              <div class="flex justify-center">
                <Checkbox
                  :model-value="isGranted(row.original.id, roleForColumn(cell.column.id)!.id)"
                  :aria-label="`${row.original.name} — ${roleForColumn(cell.column.id)!.name}`"
                  @update:model-value="(value) => onPermissionToggle(
                    row.original.id,
                    roleForColumn(cell.column.id)!.id,
                    value,
                  )"
                />
              </div>
            </template>
          </TableCell>
        </template>
      </TableRow>
    </TableBody>
  </Table>
</template>
