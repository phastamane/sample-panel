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
  TUpdateValues extends Record<string, unknown> = TFormValues,
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
    getTotalCount?: (response: TData) => number | undefined;
    // Идентификатор записи: у каждой сущности свой ключ (boxerId, matchId, ...)
    getRowId: (row: TRow) => string;
  };
  form?: {
    schema: ZodType<TFormValues, TFormValues>;
    mutationFn: (data: TFormValues) => Promise<TMutationResponse>;
    fields: FormField<TFormValues>[];
  };
  update?: {
    schema: ZodType<TUpdateValues, TUpdateValues>;
    fields: FormField<TUpdateValues>[];
    mutationFn: (id: string, data: TUpdateValues) => Promise<unknown>;
    // Схема списка и схема обновления могут не совпадать по именам полей,
    // поэтому маппинг строки в значения формы задает конфиг.
    getDefaultValues?: (row: TRow) => Partial<TUpdateValues>;
  };
  delete?: {
    mutationFn: (id: string) => Promise<unknown>;
    confirmLabel?: (row: TRow) => string;
  };
}

export function defineTableConfig<
  TData,
  TRow extends object,
  TParams = void,
  TFormValues extends Record<string, unknown> = Record<string, unknown>,
  TMutationResponse = unknown,
  TUpdateValues extends Record<string, unknown> = TFormValues,
>(
  config: ConfigInterface<
    TData,
    TRow,
    TParams,
    TFormValues,
    TMutationResponse,
    TUpdateValues
  >,
): ConfigInterface<
  TData,
  TRow,
  TParams,
  TFormValues,
  TMutationResponse,
  TUpdateValues
> {
  return config;
}
