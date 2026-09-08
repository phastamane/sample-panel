import {
  eventControllerHandleEventCreate,
  eventControllerHandleEventList,
  useEventControllerHandleEventList,
} from "@/shared/model/petstore";
import { EventCreateSchemaDataEvent } from "@/shared/model/schemas";
import { defineTableConfig } from "@/shared/model/schemas/configInterface";
import type z from "zod";

type EventListResponse = Awaited<
  ReturnType<typeof eventControllerHandleEventList>
>;
type EventRow = EventListResponse["data"]["data"]["events"][number];
type EventListParams = Parameters<typeof useEventControllerHandleEventList>[0];
type EventFormValues = z.infer<typeof EventCreateSchemaDataEvent>;
type EventCreateResponse = Awaited<
  ReturnType<typeof eventControllerHandleEventCreate>
>;

export const eventConfig = defineTableConfig<
  EventListResponse,
  EventRow,
  EventListParams,
  EventFormValues,
  EventCreateResponse
>({
  entityName: "События",
  table: {
    useHook: (params) => useEventControllerHandleEventList(params),
    getRows: (res) => res.data.data.events,
    columns: [
      { header: "ID", accessorKey: "eventId" },
      { header: "Название", accessorKey: "title" },
      { header: "Создан", accessorKey: "createdAt" },
      { header: "Обновлен", accessorKey: "updatedAt" },
    ],
  },
  form: {
    schema: EventCreateSchemaDataEvent,
    mutationFn: (data) =>
      eventControllerHandleEventCreate({
        data: { event: data },
        meta: { blue: { boxerId: "" }, red: { boxerId: "" } },
      }),
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
