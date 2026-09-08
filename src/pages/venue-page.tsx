import DynamicTable from "@/shared/ui/dynamic-table";
import { venueConfig } from "@/entities/venue/api/venue-api";

export function VenuePage() {
  return (
    <div className="space-y-4">
      <DynamicTable config={venueConfig} />
    </div>
  );
}
