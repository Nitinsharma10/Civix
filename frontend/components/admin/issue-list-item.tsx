"use client";

import { CheckCircle2, Clock3, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "@/lib/time";

interface IssueListItemProps {
  title: string;
  description: string;
  category: string;
  department: string;
  severityScore: number;
  createdAt: string;
  onEdit?: () => void;
  onResolve?: () => void;
  canResolve?: boolean;
}

export function IssueListItem({
  title,
  description,
  category,
  department,
  severityScore,
  createdAt,
  onEdit,
  onResolve,
  canResolve = false,
}: IssueListItemProps) {
  const isHighPriority = severityScore > 8.5;

  return (
    <div
      className={cn(
        "rounded-xl transition-all duration-200",
        isHighPriority
          ? "bg-gradient-to-r from-red-900 via-red-700 to-red-500 p-[1.5px]"
          : ""
      )}
    >
      <article
        className={cn(
          "rounded-[11px] border bg-background px-4 py-3 shadow-sm transition-colors duration-200 hover:bg-muted/25",
          isHighPriority
            ? "border-transparent"
            : "border-border"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground line-clamp-1">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>

          {isHighPriority && (
            <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-900/35 dark:text-red-300">
              High Priority
            </span>
          )}
        </div>

        <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-5">
          <span className="truncate"><strong className="text-foreground/80">Category:</strong> {category}</span>
          <span className="truncate"><strong className="text-foreground/80">Department:</strong> {department}</span>
          <span><strong className="text-foreground/80">Severity:</strong> {Number.isFinite(severityScore) ? severityScore.toFixed(1) : "—"}</span>
          <span className="flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {formatDistanceToNow(createdAt)}
          </span>

          {(onEdit || (onResolve && canResolve)) && (
            <div className="flex items-center gap-2 lg:justify-end">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
              )}

              {onResolve && canResolve && (
                <button
                  onClick={onResolve}
                  className="flex items-center gap-1 rounded-md bg-green-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-green-700 transition-colors"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Resolve
                </button>
              )}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
