import { useProjectStore } from "@/lib/store/useProjectStore";
import { cn } from "@/lib/utils";

export function useUser(userId: string | null) {
  return useProjectStore((s) => s.users.find((u) => u.id === userId) ?? null);
}

export function Avatar({ userId, size = "sm" }: { userId: string | null; size?: "sm" | "md" }) {
  const user = useUser(userId);
  const dimension = size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";
  if (!user) {
    return (
      <div className={cn("flex flex-none items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-500", dimension)}>
        ?
      </div>
    );
  }
  return (
    <div
      title={user.name}
      className={cn("flex flex-none items-center justify-center rounded-full font-semibold text-white", user.avatarColor, dimension)}
    >
      {user.initials}
    </div>
  );
}

export function UserChip({ userId }: { userId: string | null }) {
  const user = useUser(userId);
  return (
    <div className="flex items-center gap-1.5">
      <Avatar userId={userId} />
      <span className="truncate text-sm text-slate-700">{user?.name ?? "Unassigned"}</span>
    </div>
  );
}
