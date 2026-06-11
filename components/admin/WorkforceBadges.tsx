import { cn } from '@/lib/utils';
import {
  TASK_STATUS_LABEL, TASK_STATUS_STYLE,
  TASK_PRIORITY_LABEL, TASK_PRIORITY_STYLE,
  FIELD_REPORT_STATUS_LABEL, FIELD_REPORT_STATUS_STYLE,
  INCIDENT_STATUS_LABEL, INCIDENT_STATUS_STYLE,
} from '@/lib/admin/labels';
import type { TaskStatus, TaskPriority, FieldReportStatus, IncidentStatus } from '@/lib/admin/types';

const BASE = 'inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border';

export function TaskBadge({ status, className }: { status: TaskStatus; className?: string }) {
  return <span className={cn(BASE, TASK_STATUS_STYLE[status], className)}>{TASK_STATUS_LABEL[status]}</span>;
}

export function PriorityBadge({ priority, className }: { priority: TaskPriority; className?: string }) {
  return <span className={cn(BASE, TASK_PRIORITY_STYLE[priority], className)}>Priorité {TASK_PRIORITY_LABEL[priority].toLowerCase()}</span>;
}

export function ReportBadge({ status, className }: { status: FieldReportStatus; className?: string }) {
  return <span className={cn(BASE, FIELD_REPORT_STATUS_STYLE[status], className)}>{FIELD_REPORT_STATUS_LABEL[status]}</span>;
}

export function IncidentBadge({ status, className }: { status: IncidentStatus; className?: string }) {
  return <span className={cn(BASE, INCIDENT_STATUS_STYLE[status], className)}>{INCIDENT_STATUS_LABEL[status]}</span>;
}
