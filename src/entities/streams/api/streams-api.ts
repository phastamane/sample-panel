import {
  streamControllerHandleStreamList,
  useStreamControllerHandleStreamList,
} from "@/shared/model/petstore";
import {
  defineTableConfig,
  type ConfigHook,
} from "@/shared/model/schemas/configInterface";

type StreamListResponse = Awaited<
  ReturnType<typeof streamControllerHandleStreamList>
>;
type StreamRow = StreamListResponse["data"]["data"]["streams"][number];

const defaultListParams = { skip: 0, take: 10 } as const;

export const streamConfig = defineTableConfig<StreamListResponse, StreamRow>({
  entityName: "Стримы",
  table: {
    useHook: (() =>
      useStreamControllerHandleStreamList(
        defaultListParams,
      )) as ConfigHook<StreamListResponse>,
    getRows: (res) => res.data.data.streams,
    columns: [
      { header: "ID", accessorKey: "streamId" },
      { header: "Название", accessorKey: "title" },
      { header: "Создан", accessorKey: "createdAt" },
      { header: "Обовлен", accessorKey: "updatedAt" },
    ],
  },
});
