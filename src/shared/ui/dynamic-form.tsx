import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { ConfigInterface } from "../model/schemas/configInterface";

export default function DynamicForm<
  TData,
  TRow extends object,
  TParams,
  TFormValues extends Record<string, unknown>,
  TMutationResponse,
>({
  config,
  onSuccessCallback,
}: {
  config: ConfigInterface<TData, TRow, TParams, TFormValues, TMutationResponse>;
  onSuccessCallback?: () => void;
}) {
  const queryClient = useQueryClient();
  const formConfig = config.form;
  if (!formConfig) return null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TFormValues>({ resolver: zodResolver(formConfig.schema) });

  const mutation = useMutation({
    mutationFn: formConfig.mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries();
      onSuccessCallback?.();
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="space-y-4"
    >
      {formConfig.fields.map((field) => (
        <div key={field.name as string} className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-foreground">
            {field.label}
          </label>
          <input
            type={field.type}
            placeholder={field.placeholder}
            {...register(field.name as any)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors[field.name] && (
            <span className="text-xs text-destructive">
              {errors[field.name]?.message as string}
            </span>
          )}
        </div>
      ))}

      <Button type="submit" disabled={mutation.isPending} className={"w-full"}>
        {mutation.isPending ? "..." : "Сохранить"}
      </Button>
      {mutation.isError && (
        <div className="text-sm text-destructive mt-2">
          Произошла ошибка при сохранении
        </div>
      )}
    </form>
  );
}
