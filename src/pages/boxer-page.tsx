import  DynamicTable  from '@/shared/ui/dynamic-table';
import { boxerConfig } from '@/entities/boxer/api/boxer-api';

export function BoxerPage() {
  return (
    <div className="space-y-4">
      <DynamicTable config={boxerConfig} />
    </div>
  );
}