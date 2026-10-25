"use client";

import { Avatar } from "@/components/ui/avatar";
import { useI18n } from "@/lib/i18n";
import type { TeamMember } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AssigneeStack({
  members,
  max = 2,
  className,
}: {
  members: TeamMember[];
  max?: number;
  className?: string;
}) {
  const { pick } = useI18n();
  if (members.length === 0) return null;
  const shown = members.slice(0, max);
  return (
    <span className={cn("flex shrink-0 items-center -space-x-1.5", className)}>
      {shown.map((member) => (
        <Avatar
          key={member.id}
          name={pick(member.name)}
          color={member.accent}
          size="xs"
          ring
        />
      ))}
      {members.length > max && (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[8px] font-medium text-slate-500 ring-2 ring-white">
          +{members.length - max}
        </span>
      )}
    </span>
  );
}
