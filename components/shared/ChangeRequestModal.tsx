"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjectStore } from "@/lib/store/useProjectStore";
import type { ChangeCategory, ChangeRequest } from "@/lib/types";
import { AlertTriangle } from "lucide-react";

const CATEGORIES: { id: ChangeCategory; label: string }[] = [
  { id: "CorrectiveAction", label: "Corrective Action" },
  { id: "PreventiveAction", label: "Preventive Action" },
  { id: "DefectRepair", label: "Defect Repair" },
  { id: "ScopeChange", label: "Scope Change" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetEntityType?: ChangeRequest["targetEntityType"];
  targetEntityId?: string;
  contextLabel?: string;
  onSubmitted?: () => void;
}

export function ChangeRequestModal({ open, onOpenChange, targetEntityType = "Activity", targetEntityId = "", contextLabel, onSubmitted }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <ChangeRequestModalContent
          key={contextLabel ?? "generic"}
          onOpenChange={onOpenChange}
          targetEntityType={targetEntityType}
          targetEntityId={targetEntityId}
          contextLabel={contextLabel}
          onSubmitted={onSubmitted}
        />
      )}
    </Dialog>
  );
}

function ChangeRequestModalContent({
  onOpenChange,
  targetEntityType,
  targetEntityId,
  contextLabel,
  onSubmitted,
}: Omit<Props, "open">) {
  const submitChangeRequest = useProjectStore((s) => s.submitChangeRequest);
  const [title, setTitle] = useState(contextLabel ? `Change to ${contextLabel}` : "");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ChangeCategory>("ScopeChange");
  const [costImpact, setCostImpact] = useState("0");
  const [scheduleImpactDays, setScheduleImpactDays] = useState("0");
  const [riskImpact, setRiskImpact] = useState("");
  const [scopeImpact, setScopeImpact] = useState("");

  function handleSubmit() {
    submitChangeRequest({
      title,
      description,
      category,
      requestedById: "u-pm",
      targetEntityType: targetEntityType ?? "Activity",
      targetEntityId: targetEntityId ?? "",
      costImpact: Number(costImpact) || 0,
      scheduleImpactDays: Number(scheduleImpactDays) || 0,
      riskImpact,
      scopeImpact,
    });
    onOpenChange(false);
    onSubmitted?.();
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Submit Change Request
        </DialogTitle>
        <DialogDescription>
          {contextLabel
            ? `"${contextLabel}" is part of the locked Performance Measurement Baseline. Direct edits to baselined scope, schedule, or cost require a formal Change Request through Integrated Change Control.`
            : "Submit a formal change request for Change Control Board (CCB) review."}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short summary of the change" />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is changing and why?" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ChangeCategory)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Schedule Impact (days)</Label>
            <Input type="number" value={scheduleImpactDays} onChange={(e) => setScheduleImpactDays(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Cost Impact ($)</Label>
          <Input type="number" value={costImpact} onChange={(e) => setCostImpact(e.target.value)} />
        </div>
        <div>
          <Label>Risk Impact</Label>
          <Textarea rows={2} value={riskImpact} onChange={(e) => setRiskImpact(e.target.value)} placeholder="Cross-domain risk impact" />
        </div>
        <div>
          <Label>Scope Impact</Label>
          <Textarea rows={2} value={scopeImpact} onChange={(e) => setScopeImpact(e.target.value)} placeholder="Effect on project scope / deliverables" />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!title.trim()}>Submit for CCB Review</Button>
      </DialogFooter>
    </DialogContent>
  );
}
