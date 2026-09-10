import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ConfigInterface } from "../model/schemas/configInterface";
import DynamicForm from "./dynamic-form";
import RowActions from "./row-actions";
import { SkeletonRow } from "./skeleton-row";

function readTotalCount(response: unknown): number | undefined {
  const count = (response as { data?: { meta?: { count?: number } } })?.data
    ?.meta?.count;
  return typeof count === "number" && Number.isFinite(count)
    ? count
    : undefined;
}

export default function DynamicTable<
  TData,
  TRow extends object,
  TParams,
  TFormValues extends Record<string, unknown>,
  TMutationResponse,
  TUpdateValues extends Record<string, unknown>,
>({
  config,
}: {
  config: ConfigInterface<
    TData,
    TRow,
    TParams,
    TFormValues,
    TMutationResponse,
    TUpdateValues
  >;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (values: TFormValues) => config.form!.mutationFn(values),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setIsModalOpen(false);
    },
  });
  const defaultTake = (config.table.params as any)?.take || 10;

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultTake,
  });
  const skip = pagination.pageIndex * pagination.pageSize;
  const take = pagination.pageSize;

  const queryParams = { ...config.table.params, skip, take } as TParams;
  const { data, isLoading, isError } = config.table.useHook(queryParams);
  const rows = data ? config.table.getRows(data) : [];
  const totalCount = data
    ? (config.table.getTotalCount?.(data) ?? readTotalCount(data))
    : undefined;
  const pageCount =
    totalCount != null
      ? Math.max(1, Math.ceil(totalCount / pagination.pageSize))
      : undefined;

  // Колонка действий синтетическая: конфиги остаются декларативными и не знают
  // про JSX, а колонка появляется сама, если у сущности есть update или delete.
  const columns = useMemo(() => {
    const base = config.table.columns as unknown as ColumnDef<TRow>[];
    if (!config.update && !config.delete) return base;

    return [
      ...base,
      {
        id: "actions",
        header: "Действия",
        cell: ({ row }) => <RowActions config={config} row={row.original} />,
      } satisfies ColumnDef<TRow>,
    ];
  }, [config]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => config.table.getRowId(row),
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: pageCount ?? -1,
    rowCount: totalCount,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold tracking-tight">
          {config.entityName}
        </h2>

        {config.form && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger render={<Button />}>Создать</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Добавить запись ({config.entityName})</DialogTitle>
              </DialogHeader>
              <DynamicForm
                schema={config.form.schema}
                fields={config.form.fields}
                onSubmit={(values) => createMutation.mutate(values)}
                isPending={createMutation.isPending}
                isError={createMutation.isError}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="rounded-md border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }, (_, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((_column, colIndex) => (
                    <td key={colIndex} className="p-4 align-middle">
                      <SkeletonRow />
                    </td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center text-destructive"
                >
                  Ошибка
                </td>
              </tr>
            ) : !rows.length ? (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center">
                  Нет данных
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Страница {table.getState().pagination.pageIndex + 1}
          {pageCount != null ? ` / ${pageCount}` : ""}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Назад
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={
              pageCount != null
                ? !table.getCanNextPage()
                : rows.length < pagination.pageSize
            }
          >
            Вперед
          </Button>
        </div>
      </div>
    </div>
  );
}
