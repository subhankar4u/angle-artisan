import { CalendarClock, CheckCircle2, Clock, Loader2, Lock, RotateCcw, Send } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Approval, CreatorSettings, QaResult } from "@/lib/studio/types";

export function ApprovalPanel({
  approval,
  qa,
  settings,
  busy,
  onDecide,
}: {
  approval: Approval | null;
  qa: QaResult | undefined;
  settings: CreatorSettings;
  busy: boolean;
  onDecide: (decision: "approved" | "changes_requested" | "pending", approver: string, notes: string) => void;
}) {
  const [approver, setApprover] = useState(approval?.approver_name || settings.creator_name);
  const [notes, setNotes] = useState(approval?.notes ?? "");
  const decision = approval?.decision ?? "pending";
  const blockedByQa = qa?.verdict === "fail";

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Human approval</h3>
        {decision === "approved" ? (
          <Badge className="bg-success text-success-foreground text-[10px]">Approved</Badge>
        ) : decision === "changes_requested" ? (
          <Badge variant="destructive" className="text-[10px]">
            Changes requested
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px]">
            <Clock className="mr-1 size-3" /> Awaiting review
          </Badge>
        )}
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        A person has to sign off on every draft. Approval records who decided and when — it does not publish
        anything.
      </p>

      {decision === "approved" && approval?.decided_at ? (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-success">
          <CheckCircle2 className="size-3.5" />
          {approval.approver_name} approved on {new Date(approval.decided_at).toLocaleString()}
        </p>
      ) : null}

      <div className="mt-3 space-y-2.5">
        <div className="space-y-1.5">
          <Label htmlFor="approver" className="text-xs">
            Approver
          </Label>
          <Input
            id="approver"
            value={approver}
            onChange={(e) => setApprover(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="approval-notes" className="text-xs">
            Notes
          </Label>
          <Textarea
            id="approval-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What still needs a human fact-check before this goes out?"
            className="min-h-20 resize-y text-sm"
          />
        </div>
      </div>

      {blockedByQa ? (
        <p className="mt-2.5 text-[11px] font-medium text-destructive">
          QA has a failing check. Fix it before approving.
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={busy || blockedByQa || decision === "approved"}
          onClick={() => onDecide("approved", approver, notes)}
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
          Approve draft
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => onDecide("changes_requested", approver, notes)}
        >
          Request changes
        </Button>
        {decision !== "pending" ? (
          <Button variant="ghost" size="sm" disabled={busy} onClick={() => onDecide("pending", approver, notes)}>
            <RotateCcw className="size-3.5" /> Reset
          </Button>
        ) : null}
      </div>

      <div className="mt-4 space-y-2 rounded-lg border border-dashed border-border bg-surface-2/50 p-3">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold">
          <Lock className="size-3.5" /> Publishing is disabled
        </p>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {settings.linkedin_connected
            ? "A LinkedIn integration is marked as configured in Settings, but this build ships no publishing transport, so scheduling stays locked."
            : "No LinkedIn integration is connected. Scheduling and posting unlock only once a real integration is configured."}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled className="text-[11px]">
            <CalendarClock className="size-3.5" /> Schedule
          </Button>
          <Button variant="outline" size="sm" disabled className="text-[11px]">
            <Send className="size-3.5" /> Publish to LinkedIn
          </Button>
        </div>
      </div>
    </div>
  );
}
