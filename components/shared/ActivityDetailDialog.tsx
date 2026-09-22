"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserChip } from "@/components/shared/UserChip";
import { useProjectStore } from "@/lib/store/useProjectStore";
import { useActiveBaseline } from "@/lib/store/selectors";
import { formatCurrency } from "@/lib/utils";
import { Lock } from "lucide-react";
import type { Activity } from "@/lib/types";

export function ActivityDetailDialog({ activityId, onOpenChange }: { activityId: string | null; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={!!activityId} onOpenChange={onOpenChange}>
      {activityId && <ActivityDetailDialogContent key={activityId} activityId={activityId} onOpenChange={onOpenChange} />}
    </Dialog>
  );
}

function ActivityDetailDialogContent({ activityId, onOpenChange }: { activityId: string; onOpenChange: (open: boolean) => void }) {
  const activity = useProjectStore((s) => s.activities.find((a) => a.id === activityId));
  const attemptUpdateBaselinedField = useProjectStore((s) => s.attemptUpdateBaselinedField);
  const baseline = useActiveBaseline();
  const [budget, setBudget] = useState(() => String(activity?.budget ?? ""));
  const [plannedFinish, setPlannedFinish] = useState(() => activity?.plannedFinish ?? "");

  if (!activity) return null;
  const current: Activity = activity;
  const isBaselined = !!baseline?.activitySnapshots.some((s) => s.activityId === current.id);

  function saveBudget() {
    const ok = attemptUpdateBaselinedField(current.id, "budget", { budget: Number(budget) || current.budget });
    if (ok) onOpenChange(false);
  }

  function saveDate() {
    const ok = attemptUpdateBaselinedField(current.id, "plannedDates", { plannedFinish });
    if (ok) onOpenChange(false);
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{current.name}</DialogTitle>
        <DialogDescription asChild>
          <div className="flex items-center gap-2">
            <UserChip userId={current.assigneeId} />
            {isBaselined && <Badge variant="violet" className="flex-none"><Lock className="h-3 w-3" /> Baselined</Badge>}
          </div>
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        <div>
          <Label>Budget</Label>
          <div className="flex gap-2">
            <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
            <Button variant="outline" onClick={saveBudget}>Save</Button>
          </div>
          <p className="mt-1 text-xs text-slate-400">Currently {formatCurrency(current.budget)} planned, {formatCurrency(current.actualCost)} actual.</p>
        </div>
        <div>
          <Label>Planned Finish</Label>
          <div className="flex gap-2">
            <Input type="date" value={plannedFinish} onChange={(e) => setPlannedFinish(e.target.value)} />
            <Button variant="outline" onClick={saveDate}>Save</Button>
          </div>
        </div>
        {isBaselined && (
          <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-700">
            This activity is part of the locked Performance Measurement Baseline. Saving a change here will instead open a Change Request for CCB review.
          </p>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
      </DialogFooter>
    </DialogContent>
  );
}
