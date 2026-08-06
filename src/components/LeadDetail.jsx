import React, { useEffect, useState } from "react";
import { Building2, User, Check, Sparkles, RotateCcw, Search, UserSearch, PenLine, Clock3, Trash2 } from "lucide-react";
import { Card, StagePill, StageRail } from "./ui";
import {
  ACCENT,
  BORDER,
  RUST,
  STAGES,
  STAGE_COLOR,
  SURFACE_2,
  TEXT,
  TEXT_FAINT,
  TEXT_MUTED,
  daysBetween,
  fmt,
} from "../lib/constants";
import * as api from "../lib/api";

export default function LeadDetail({ lead, history, onBack, onChangeStage, onReopen }) {
  const [interactions, setInteractions] = useState([]);
  const [agentTasks, setAgentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const [newType, setNewType] = useState("note");
  const [newChannel, setNewChannel] = useState("");
  const [newSummary, setNewSummary] = useState("");

  const [showDraftForm, setShowDraftForm] = useState(false);
  const [draftGoal, setDraftGoal] = useState("");

  async function refetchLeadData() {
    const [ints, tasks] = await Promise.all([api.fetchInteractions(lead.id), api.fetchAgentTasks(lead.id)]);
    setInteractions(ints);
    setAgentTasks(tasks);
  }

  useEffect(() => {
    setLoading(true);
    refetchLeadData()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead.id]);

  async function withBusy(fn) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function handleAddInteraction() {
    if (!newSummary.trim()) return;
    withBusy(async () => {
      await api.addInteraction(lead.id, lead.contact_id, newType, newChannel, newSummary);
      setNewSummary("");
      setNewChannel("");
      await refetchLeadData();
    });
  }

  function handleRunAgent(type) {
    withBusy(async () => {
      if (type === "research") await api.runResearchAgent(lead);
      else if (type === "contact_lookup") await api.runContactLookupAgent(lead);
      await refetchLeadData();
    });
  }

  function handleGenerateDraft() {
    withBusy(async () => {
      await api.generateDraft(lead, draftGoal);
      setDraftGoal("");
      setShowDraftForm(false);
      await refetchLeadData();
    });
  }

  function handleApproveDraft(task) {
    withBusy(async () => {
      await api.approveDraft(task, lead);
      await refetchLeadData();
    });
  }

  function handleDiscardDraft(task) {
    withBusy(async () => {
      await api.discardDraft(task);
      await refetchLeadData();
    });
  }

  const daysOpen =
    lead.stage === "Customer" || lead.stage === "Lost"
      ? daysBetween(lead.created_at, lead.closed_at)
      : daysBetween(lead.created_at, new Date());

  const pendingTasks = agentTasks.filter((t) => t.status === "pending_approval");

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <button onClick={onBack} className="text-sm flex items-center gap-1 mb-4 hover:opacity-80" style={{ color: TEXT_MUTED }}>
        ← All leads
      </button>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Building2 size={18} style={{ color: TEXT_FAINT }} />
            <h1 className="font-display text-2xl font-semibold" style={{ color: TEXT }}>
              {lead.account.name}
            </h1>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-sm" style={{ color: TEXT_MUTED }}>
            {lead.contact && (
              <span className="flex items-center gap-1">
                <User size={13} /> {lead.contact.name}
                {lead.contact.role ? ` · ${lead.contact.role}` : ""}
              </span>
            )}
            {lead.account.source && (
              <>
                <span>·</span>
                <span>{lead.account.source}</span>
              </>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-xs" style={{ color: TEXT_FAINT }}>
            {daysOpen} days {lead.stage === "Customer" ? "to close" : lead.stage === "Lost" ? "before lost" : "open"}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 text-sm px-3 py-2 rounded-md" style={{ backgroundColor: "#E8674A1a", color: "#E8674A" }}>
          {error}
        </div>
      )}

      <Card className="mt-6">
        <div className="flex items-center justify-between mb-5">
          <div className="text-sm font-semibold" style={{ color: TEXT }}>
            Stage
          </div>
          {lead.stage === "Lost" ? (
            <button
              onClick={onReopen}
              disabled={busy}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md disabled:opacity-50"
              style={{ backgroundColor: ACCENT, color: "#04141A", boxShadow: `0 0 12px ${ACCENT}55` }}
            >
              <RotateCcw size={13} /> Reopen lead
            </button>
          ) : (
            <select
              value={lead.stage}
              onChange={(e) => onChangeStage(e.target.value)}
              disabled={busy}
              className="text-sm rounded-md px-2.5 py-1.5"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }}
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value="Lost">Lost</option>
            </select>
          )}
        </div>
        <StageRail currentStage={lead.stage === "Lost" ? lead.pre_lost_stage : lead.stage} isLost={lead.stage === "Lost"} />
        {lead.stage === "Lost" && (
          <div className="mt-4 text-sm px-3 py-2 rounded-md" style={{ backgroundColor: STAGE_COLOR.Lost + "1a", color: STAGE_COLOR.Lost }}>
            Lost from <strong>{lead.pre_lost_stage}</strong> — {lead.lost_reason}. History below is preserved.
          </div>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="col-span-2 space-y-4">
          <Card>
            <div className="text-sm font-semibold mb-4" style={{ color: TEXT }}>
              Add to timeline
            </div>
            <div className="flex gap-2 mb-2">
              {["message", "meeting", "note"].map((t) => (
                <button
                  key={t}
                  onClick={() => setNewType(t)}
                  className="text-xs px-2.5 py-1.5 rounded-md font-medium capitalize"
                  style={newType === t ? { backgroundColor: ACCENT, color: "#04141A" } : { backgroundColor: SURFACE_2, color: TEXT_MUTED }}
                >
                  {t}
                </button>
              ))}
              <input
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value)}
                placeholder="channel (optional)"
                className="text-xs px-2.5 py-1.5 rounded-md flex-1"
                style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }}
              />
            </div>
            <textarea
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              placeholder="What happened?"
              rows={2}
              className="w-full text-sm rounded-md px-3 py-2 resize-none"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }}
            />
            <button
              onClick={handleAddInteraction}
              disabled={busy}
              className="mt-2 text-sm font-medium px-3 py-1.5 rounded-md disabled:opacity-50"
              style={{ backgroundColor: ACCENT, color: "#04141A" }}
            >
              Log entry
            </button>
          </Card>

          <div className="space-y-3">
            {loading && (
              <div className="text-sm px-1" style={{ color: TEXT_FAINT }}>
                Loading activity…
              </div>
            )}
            {!loading &&
              interactions.map((i) => (
                <Card key={i.id} className="!p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold capitalize flex items-center gap-1.5" style={{ color: TEXT }}>
                      {i.type === "message" && <PenLine size={12} />}
                      {i.type === "meeting" && <Clock3 size={12} />}
                      {i.type === "note" && <span className="inline-block w-[12px] h-[12px] rounded-sm border border-current" />}
                      {i.type}
                      {i.channel ? ` · ${i.channel}` : ""}
                    </span>
                    <span className="font-mono text-[11px]" style={{ color: TEXT_FAINT }}>
                      {fmt(i.occurred_at)}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: TEXT_MUTED }}>
                    {i.summary}
                  </p>
                </Card>
              ))}
            {!loading && interactions.length === 0 && (
              <div className="text-sm px-1" style={{ color: TEXT_FAINT }}>
                No activity logged yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="!p-5">
            <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: TEXT_FAINT }}>
              Next action
            </div>
            <div className="text-sm font-medium" style={{ color: TEXT }}>
              {lead.next_action || "—"}
            </div>
            {lead.next_action_due && (
              <div className="font-mono text-xs mt-1" style={{ color: RUST }}>
                due {fmt(lead.next_action_due)}
              </div>
            )}
          </Card>

          <Card className="!p-5">
            <div className="text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-1.5" style={{ color: TEXT_FAINT }}>
              <Sparkles size={12} style={{ color: ACCENT }} /> Agents
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleRunAgent("research")}
                disabled={busy}
                className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-md hover:bg-white/[0.03] disabled:opacity-50"
                style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}
              >
                <Search size={14} /> Research company
              </button>
              <button
                onClick={() => handleRunAgent("contact_lookup")}
                disabled={busy}
                className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-md hover:bg-white/[0.03] disabled:opacity-50"
                style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}
              >
                <UserSearch size={14} /> Look up contact
              </button>
              <button
                onClick={() => setShowDraftForm(!showDraftForm)}
                className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-md hover:bg-white/[0.03]"
                style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}
              >
                <PenLine size={14} /> Draft a message
              </button>
            </div>
            {showDraftForm && (
              <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                <input
                  value={draftGoal}
                  onChange={(e) => setDraftGoal(e.target.value)}
                  placeholder="Goal, e.g. follow up after demo"
                  className="w-full text-sm rounded-md px-2.5 py-1.5 mb-2"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }}
                />
                <button
                  onClick={handleGenerateDraft}
                  disabled={busy}
                  className="text-sm font-medium px-3 py-1.5 rounded-md w-full disabled:opacity-50"
                  style={{ backgroundColor: ACCENT, color: "#04141A" }}
                >
                  Generate draft
                </button>
              </div>
            )}
            <div className="text-[11px] mt-3 leading-relaxed" style={{ color: TEXT_FAINT }}>
              Research and contact lookups log automatically. Anything that goes out to the prospect always needs your approval below.
            </div>
          </Card>

          {pendingTasks.length > 0 && (
            <Card className="!p-5" style={{ border: `1px solid ${RUST}55` }}>
              <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: RUST }}>
                Pending your approval
              </div>
              {pendingTasks.map((t) => (
                <div key={t.id} className="mb-3 last:mb-0">
                  <p className="text-sm rounded-md p-3 mb-2" style={{ backgroundColor: SURFACE_2, color: TEXT_MUTED }}>
                    {t.output}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveDraft(t)}
                      disabled={busy}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md disabled:opacity-50"
                      style={{ backgroundColor: ACCENT, color: "#04141A" }}
                    >
                      <Check size={12} /> Approve & send
                    </button>
                    <button
                      onClick={() => handleDiscardDraft(t)}
                      disabled={busy}
                      className="flex items-center justify-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md disabled:opacity-50"
                      style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}
                    >
                      <Trash2 size={12} /> Discard
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
