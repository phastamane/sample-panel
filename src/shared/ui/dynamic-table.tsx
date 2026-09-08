import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
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
import { SkeletonRow } from "./skeleton-row";

export default function DynamicTable<
  TData,
  TRow extends object,
  TParams,
  TFormValues extends Record<string, unknown>,
  TMutationResponse,
>({
  config,
}: {
  config: ConfigInterface<TData, TRow, TParams, TFormValues, TMutationResponse>;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const table = useReactTable({
    data: rows,
    columns: config.table.columns,
    getCoreRowModel: getCoreRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
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
                config={config}
                onSuccessCallback={() => setIsModalOpen(false)}
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
                  {config.table.columns.map((column, colIndex) => (
                    <td key={colIndex} className="p-4 align-middle">
                      <SkeletonRow />
                    </td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td
                  colSpan={config.table.columns.length}
                  className="h-24 text-center text-destructive"
                >
                  Ошибка
                </td>
              </tr>
            ) : !rows.length ? (
              <tr>
                <td
                  colSpan={config.table.columns.length}
                  className="h-24 text-center"
                >
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
            disabled={rows.length < pagination.pageSize}
          >
            Вперед
          </Button>
        </div>
      </div>
    </div>
  );
}
