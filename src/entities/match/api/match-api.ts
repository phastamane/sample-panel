import { matchControllerHandleMatchList, useMatchControllerHandleMatchList } from "@/shared/model/petstore";
import { defineTableConfig } from "@/shared/model/schemas/configInterface";

type MatchListResponse = Awaited<ReturnType<typeof matchControllerHandleMatchList>>
type MatchRow = MatchListResponse["data"]["data"]['matches'][number]
type MatchListParams =  Parameters<typeof useMatchControllerHandleMatchList>[0]

export const matchConfig = defineTableConfig<MatchListResponse, MatchRow, MatchListParams>({
    entityName: "Боксеры",
    table: {
      useHook: (params) =>
        useMatchControllerHandleMatchList(params),
      getRows: (res) => res.data.data.matches,
      columns: [
        { header: "ID", accessorKey: "matchId" },
        { header: "Номер", accessorKey: "number" },
        { header: "Победитель", accessorKey: "winner" },
        { header: "Статус", accessorKey: "status" },
        { header: "Событие", accessorKey: "eventId" },
        { header: "Создан", accessorKey: "createdAt" },
        { header: "Обовлен", accessorKey: "updatedAt" },
      ],
    },
  });
  