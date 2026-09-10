import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { ConfigInterface } from "../model/schemas/configInterface";
import DynamicForm from "./dynamic-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PenLine } from "lucide-react";

export default function RowActions<
  TData,
  TRow extends object,
  TParams,
  TFormValues extends Record<string, unknown>,
  TMutationResponse,
  TUpdateValues extends Record<string, unknown>,
>({
  config,
  row,
}: {
  config: ConfigInterface<
    TData,
    TRow,
    TParams,
    TFormValues,
    TMutationResponse,
    TUpdateValues
  >;
  row: TRow;
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const queryClient = useQueryClient();
  const id = config.table.getRowId(row);

  const updateMutation = useMutation({
    mutationFn: (values: TUpdateValues) =>
      config.update!.mutationFn(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setIsEditOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => config.delete!.mutationFn(id),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setIsDeleteOpen(false);
    },
  });

  return (
    <div className="flex items-center gap-2 justify-center">
      {config.update && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogTrigger
            render={<Button className="ьч-фгещ" variant="outline" size="sm" />}
          >
            <PenLine />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Изменить запись ({config.entityName})</DialogTitle>
            </DialogHeader>
            <DynamicForm
              schema={config.update.schema}
              fields={config.update.fields}
              defaultValues={config.update.getDefaultValues?.(row)}
              onSubmit={(values) => updateMutation.mutate(values)}
              isPending={updateMutation.isPending}
              isError={updateMutation.isError}
            />
          </DialogContent>
        </Dialog>
      )}

      {config.delete && (
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogTrigger render={<Button variant="destructive" size="sm" />}>
            Удалить
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Удалить запись?</DialogTitle>
              <DialogDescription>
                {config.delete.confirmLabel?.(row) ??
                  "Действие нельзя отменить."}
              </DialogDescription>
            </DialogHeader>
            {deleteMutation.isError && (
              <div className="text-sm text-destructive">
                Не удалось удалить запись
              </div>
            )}
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Отмена
              </DialogClose>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
              >
                {deleteMutation.isPending ? "..." : "Удалить"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
