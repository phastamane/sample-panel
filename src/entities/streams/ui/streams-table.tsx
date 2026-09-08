import DynamicTable from "@/shared/ui/dynamic-table";
import { streamConfig } from "../api/streams-api";

function StreamTable() {
  return <DynamicTable config={streamConfig} />;
}

export default StreamTable;
