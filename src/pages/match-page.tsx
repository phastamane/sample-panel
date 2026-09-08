import { MatchTable } from "@/entities/match";

export function MatchPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Управление стримами</h1>
      <MatchTable />
    </div>
  );
}
