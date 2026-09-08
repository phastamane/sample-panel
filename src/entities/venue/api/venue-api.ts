import {
  venueControllerHandleVenueCreate,
  venueControllerHandleVenueList,
  useVenueControllerHandleVenueList,
} from "@/shared/model/petstore";
import { defineTableConfig } from "@/shared/model/schemas/configInterface";
import type z from "zod";

type VenueListResponse = Awaited<
  ReturnType<typeof venueControllerHandleVenueList>
>;
type VenueRow = VenueListResponse["data"]["data"]["venues"][number];
type VenueListParams = Parameters<typeof useVenueControllerHandleVenueList>[0];

export const venueConfig = defineTableConfig<
  VenueListResponse,
  VenueRow,
  VenueListParams
>({
  entityName: "Площадки",
  table: {
    useHook: (params) => useVenueControllerHandleVenueList(params),
    getRows: (res) => res.data.data.venues,
    columns: [
      { header: "ID", accessorKey: "venueId" },
      { header: "Название", accessorKey: "title" },
      { header: "Создан", accessorKey: "createdAt" },
      { header: "Обновлен", accessorKey: "updatedAt" },
    ],
  },
});
