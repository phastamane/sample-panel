import { StreamTable } from "@/entities/streams";

export function StreamsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Управление стримами</h1>
      <StreamTable />
    </div>
  );
}
