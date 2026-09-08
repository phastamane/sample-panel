import DynamicTable from "@/shared/ui/dynamic-table";
import { tournamentConfig } from "@/entities/tournament/api/tournament-api";

export function TournamentPage() {
  return (
    <div className="space-y-4">
      <DynamicTable config={tournamentConfig} />
    </div>
  );
}
