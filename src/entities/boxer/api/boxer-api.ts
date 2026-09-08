import {
  boxerControllerHandleBoxerCreate,
  boxerControllerHandleBoxerList,
  useBoxerControllerHandleBoxerList,
} from "@/shared/model/petstore";
import { BoxerCreateSchemaDataBoxer } from "@/shared/model/schemas";
import { defineTableConfig } from "@/shared/model/schemas/configInterface";
import type z from "zod";

type BoxerListResponse = Awaited<
  ReturnType<typeof boxerControllerHandleBoxerList>
>;
type BoxerRow = BoxerListResponse["data"]["data"]["boxers"][number];
type BoxerListParams = Parameters<typeof useBoxerControllerHandleBoxerList>[0];
type BoxerFormValues = z.infer<typeof BoxerCreateSchemaDataBoxer>;
type BoxerCreateResponse = Awaited<
  ReturnType<typeof boxerControllerHandleBoxerCreate>
>;

export const boxerConfig = defineTableConfig<
  BoxerListResponse,
  BoxerRow,
  BoxerListParams,
  BoxerFormValues,
  BoxerCreateResponse
>({
  entityName: "Участники",
  table: {
    useHook: (params) => useBoxerControllerHandleBoxerList(params),
    getRows: (res) => res.data.data.boxers,
    columns: [
      { header: "ID", accessorKey: "boxerId" },
      { header: "FIO", accessorKey: "fullname" },
      { header: "Создан", accessorKey: "createdAt" },
      { header: "Обновлен", accessorKey: "updatedAt" },
    ],
  },
  form: {
    schema: BoxerCreateSchemaDataBoxer,
    mutationFn: (data) =>
      boxerControllerHandleBoxerCreate({ data: { boxer: data } }),
    fields: [
      {
        name: "fullname",
        label: "Название",
        type: "text",
        placeholder: "Введите значение",
      },
    ],
  },
});
