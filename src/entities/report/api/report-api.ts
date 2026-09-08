import {
  reportControllerHandleReportCreate,
  reportControllerHandleReportList,
  useReportControllerHandleReportList,
} from "@/shared/model/petstore";
import { ReportCreateSchemaDataReport } from "@/shared/model/schemas";
import { defineTableConfig } from "@/shared/model/schemas/configInterface";
import type z from "zod";

type ReportListResponse = Awaited<
  ReturnType<typeof reportControllerHandleReportList>
>;
type ReportRow = ReportListResponse["data"]["data"]["reports"][number];
type ReportListParams = Parameters<
  typeof useReportControllerHandleReportList
>[0];
type ReportFormValues = z.infer<typeof ReportCreateSchemaDataReport>;
type ReportCreateResponse = Awaited<
  ReturnType<typeof reportControllerHandleReportCreate>
>;

export const reportConfig = defineTableConfig<
  ReportListResponse,
  ReportRow,
  ReportListParams,
  ReportFormValues,
  ReportCreateResponse
>({
  entityName: "Протоколы",
  table: {
    useHook: (params) => useReportControllerHandleReportList(params),
    getRows: (res) => res.data.data.reports,
    columns: [
      { header: "ID", accessorKey: "reportId" },
      { header: "Название", accessorKey: "title" },
      { header: "Создан", accessorKey: "createdAt" },
      { header: "Обновлен", accessorKey: "updatedAt" },
    ],
  },
  form: {
    schema: ReportCreateSchemaDataReport,
    mutationFn: (data) =>
      reportControllerHandleReportCreate({ data: { report: data } }),
    fields: [
      {
        name: "title",
        label: "Название",
        type: "text",
        placeholder: "Введите значение",
      },
    ],
  },
});
