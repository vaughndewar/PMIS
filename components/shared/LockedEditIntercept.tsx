"use client";

import { useProjectStore } from "@/lib/store/useProjectStore";
import { ChangeRequestModal } from "./ChangeRequestModal";

/** Global listener: whenever a locked-baseline field edit is intercepted, prompt a formal Change Request. */
export function LockedEditIntercept() {
  const pending = useProjectStore((s) => s.pendingLockedEdit);
  const clear = useProjectStore((s) => s.clearPendingLockedEdit);

  return (
    <ChangeRequestModal
      open={!!pending}
      onOpenChange={(open) => {
        if (!open) clear();
      }}
      targetEntityType="Activity"
      targetEntityId={pending?.activityId ?? ""}
      contextLabel={pending?.attemptedLabel}
    />
  );
}
