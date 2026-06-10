import { Button } from '@matchtable/ui'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'

import styles from './DataTable.module.css'

type DataTableProps<T> = {
  data: T[]
  columns: ColumnDef<T>[]
  emptyMessage?: string
  page?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number) => void
}

export function DataTable<T>({
  data,
  columns,
  emptyMessage = '暂无数据',
  page,
  pageSize,
  total,
  onPageChange,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const totalPages =
    page !== undefined && pageSize !== undefined && total !== undefined
      ? Math.max(1, Math.ceil(total / pageSize))
      : null

  return (
    <div>
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className={styles.th}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className={styles.sortButton}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: ' ↑',
                          desc: ' ↓',
                        }[header.column.getIsSorted() as string] ?? null}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className={styles.empty} colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className={styles.tr}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={styles.td}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages !== null && page !== undefined && onPageChange ? (
        <div className={styles.pagination}>
          <span>
            共 {total} 条 · 第 {page} / {totalPages} 页
          </span>
          <div className={styles.paginationActions}>
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              上一页
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
