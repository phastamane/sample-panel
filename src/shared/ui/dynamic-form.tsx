import { useForm, type DefaultValues, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import type { FormField } from "../model/schemas/configInterface";
import type { ZodType } from "zod";

export default function DynamicForm<TValues extends Record<string, unknown>>({
  schema,
  fields,
  defaultValues,
  onSubmit,
  isPending,
  isError,
}: {
  schema: ZodType<TValues, TValues>;
  fields: FormField<TValues>[];
  defaultValues?: Partial<TValues>;
  onSubmit: (values: TValues) => void;
  isPending?: boolean;
  isError?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TValues>({
    resolver: zodResolver(schema) as Resolver<TValues>,
    defaultValues: defaultValues as DefaultValues<TValues>,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col space-y-1">
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

      <Button type="submit" disabled={isPending} className={"w-full"}>
        {isPending ? "..." : "Сохранить"}
      </Button>
      {isError && (
        <div className="text-sm text-destructive mt-2">
          Произошла ошибка при сохранении
        </div>
      )}
    </form>
  );
}
