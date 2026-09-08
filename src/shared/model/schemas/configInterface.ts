import { type UseQueryResult } from "@tanstack/react-query";
import type { ZodType } from "zod";

export type ConfigHook<TData, TParams = void> = TParams extends void
  ? () => UseQueryResult<TData | undefined>
  : (params: TParams) => UseQueryResult<TData | undefined, Error | null>;

// Типы поддерживаемых полей
export type FieldType = "text" | "number" | "password";

export interface FormField<TFormValues> {
  name: keyof TFormValues & string;
  label: string;
  type: FieldType;
  placeholder?: string;
}

export interface ConfigInterface<
  TData,
  TRow extends object,
  TParams = void,
  TFormValues extends Record<string, unknown> = Record<string, unknown>,
  TMutationResponse = unknown,
> {
  entityName: string;
  table: {
    useHook: ConfigHook<TData, TParams>;
    params?: TParams;
    columns: {
      header: string;
      accessorKey: keyof TRow & string;
      cell?: (info: {
        getValue: () => any;
        row: { original: TRow };
      }) => React.ReactNode;
    }[];
    getRows: (response: TData) => TRow[];
  };
  form?: {
    schema: ZodType<TFormValues, TFormValues>;
    mutationFn: (data: TFormValues) => Promise<TMutationResponse>;
    fields: FormField<TFormValues>[];
  };
}

export function defineTableConfig<
  TData,
  TRow extends object,
  TParams = void,
  TFormValues extends Record<string, unknown> = Record<string, unknown>,
  TMutationResponse = unknown,
>(
  config: ConfigInterface<TData, TRow, TParams, TFormValues, TMutationResponse>,
): ConfigInterface<TData, TRow, TParams, TFormValues, TMutationResponse> {
  return config;
}
