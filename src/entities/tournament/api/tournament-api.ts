import {
  tournamentControllerHandleTournamentCreate,
  tournamentControllerHandleTournamentList,
  useTournamentControllerHandleTournamentList,
} from "@/shared/model/petstore";
import { defineTableConfig } from "@/shared/model/schemas/configInterface";
import type z from "zod";

type TournamentListResponse = Awaited<
  ReturnType<typeof tournamentControllerHandleTournamentList>
>;
type TournamentRow =
  TournamentListResponse["data"]["data"]["tournaments"][number];
type TournamentListParams = Parameters<
  typeof useTournamentControllerHandleTournamentList
>[0];

export const tournamentConfig = defineTableConfig<
  TournamentListResponse,
  TournamentRow,
  TournamentListParams
>({
  entityName: "Турниры",
  table: {
    useHook: (params) => useTournamentControllerHandleTournamentList(params),
    getRows: (res) => res.data.data.tournaments,
    columns: [
      { header: "ID", accessorKey: "tournamentId" },
      { header: "Название", accessorKey: "title" },
      { header: "Создан", accessorKey: "createdAt" },
      { header: "Обновлен", accessorKey: "updatedAt" },
    ],
  },
});
