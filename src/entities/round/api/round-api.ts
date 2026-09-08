import {
  roundControllerHandleRoundList,
  useRoundControllerHandleRoundList,
} from "@/shared/model/petstore";
import { defineTableConfig } from "@/shared/model/schemas/configInterface";
import type z from "zod";

type RoundListResponse = Awaited<
  ReturnType<typeof roundControllerHandleRoundList>
>;
type RoundRow = RoundListResponse["data"]["data"]["rounds"][number];
type RoundListParams = Parameters<typeof useRoundControllerHandleRoundList>[0];

export const roundConfig = defineTableConfig<
  RoundListResponse,
  RoundRow,
  RoundListParams
>({
  entityName: "Раунды",
  table: {
    useHook: (params) => useRoundControllerHandleRoundList(params),
    getRows: (res) => res.data.data.rounds,
    columns: [
      { header: "ID", accessorKey: "roundId" },
      { header: "Название", accessorKey: "title" },
      { header: "Создан", accessorKey: "createdAt" },
      { header: "Обновлен", accessorKey: "updatedAt" },
    ],
  },
});
