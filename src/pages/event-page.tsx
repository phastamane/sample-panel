import  DynamicTable  from '@/shared/ui/dynamic-table';
import { eventConfig } from '@/entities/event/api/event-api';

export function EventPage() {
  return (
    <div className="space-y-4">
      <DynamicTable config={eventConfig} />
    </div>
  );
}