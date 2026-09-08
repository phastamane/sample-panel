import  DynamicTable  from '@/shared/ui/dynamic-table';
import { reportConfig } from '@/entities/report/api/report-api';

export function ReportPage() {
  return (
    <div className="space-y-4">
      <DynamicTable config={reportConfig} />
    </div>
  );
}