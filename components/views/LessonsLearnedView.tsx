"use client";

import { useMemo, useState } from "react";
import { useProjectStore } from "@/lib/store/useProjectStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserChip } from "@/components/shared/UserChip";
import { InfoTooltip } from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";
import { Plus, Search } from "lucide-react";

export function LessonsLearnedView() {
  const lessonsLearned = useProjectStore((s) => s.lessonsLearned);
  const addLessonLearned = useProjectStore((s) => s.addLessonLearned);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: "", situation: "", rootCause: "", recommendation: "", tags: "" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return lessonsLearned.filter(
      (l) =>
        !q ||
        l.category.toLowerCase().includes(q) ||
        l.situation.toLowerCase().includes(q) ||
        l.recommendation.toLowerCase().includes(q) ||
        l.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [lessonsLearned, search]);

  function submit() {
    addLessonLearned({
      category: form.category || "General",
      situation: form.situation,
      rootCause: form.rootCause,
      recommendation: form.recommendation,
      submittedById: "u-pm",
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setForm({ category: "", situation: "", rootCause: "", recommendation: "", tags: "" });
    setOpen(false);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Lessons Learned</h2>
          <p className="text-sm text-slate-500">
            <InfoTooltip text="Lessons Learned Register: knowledge gained during a project which can be used to improve future performance, captured throughout the project rather than only at closure.">
              Searchable knowledge base
            </InfoTooltip>{" "}
            captured during execution, not just at closeout.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add Lesson</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-300" />
        <Input placeholder="Search by category, tag, or keyword..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
      </div>

      <div className="space-y-3">
        {filtered.map((lesson) => (
          <Card key={lesson.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Badge variant="violet">{lesson.category}</Badge>
                {formatDate(lesson.date)}
              </CardTitle>
              <UserChip userId={lesson.submittedById} />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700"><span className="font-medium">Situation:</span> {lesson.situation}</p>
              <p className="mt-1 text-sm text-slate-700"><span className="font-medium">Root cause:</span> {lesson.rootCause}</p>
              <p className="mt-1 text-sm text-slate-700"><span className="font-medium">Recommendation:</span> {lesson.recommendation}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {lesson.tags.map((t) => <Badge key={t} variant="outline">#{t}</Badge>)}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No lessons match your search.</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Lesson Learned</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Vendor Management" />
            </div>
            <div>
              <Label>Situation</Label>
              <Textarea rows={2} value={form.situation} onChange={(e) => setForm((f) => ({ ...f, situation: e.target.value }))} />
            </div>
            <div>
              <Label>Root Cause</Label>
              <Textarea rows={2} value={form.rootCause} onChange={(e) => setForm((f) => ({ ...f, rootCause: e.target.value }))} />
            </div>
            <div>
              <Label>Recommendation</Label>
              <Textarea rows={2} value={form.recommendation} onChange={(e) => setForm((f) => ({ ...f, recommendation: e.target.value }))} />
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="process, vendor, schedule" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={!form.situation.trim()}>Save Lesson</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
