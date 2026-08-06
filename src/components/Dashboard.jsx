import React, { useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, StagePill, StageRail, StatCard } from "./ui";
import { BORDER, RUST, STAGE_COLOR, STAGES, SURFACE_2, TEXT, TEXT_FAINT, TEXT_MUTED, daysBetween, fmt } from "../lib/constants";

export default function Dashboard({ leads, stageHistory, onSelectLead }) {
  const metrics = useMemo(() => {
    const won = leads.filter((l) => l.stage === "Customer");
    const lost = leads.filter((l) => l.stage === "Lost");
    const active = leads.filter((l) => l.stage !== "Customer" && l.stage !== "Lost");
    const cycleDays = won.map((l) => daysBetween(l.created_at, l.closed_at));
    const avgCycle = cycleDays.length ? Math.round(cycleDays.reduce((a, b) => a + b, 0) / cycleDays.length) : null;
    const winRate = won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) : null;

    const funnel = STAGES.map((s) => ({ stage: s, count: leads.filter((l) => l.stage === s).length }));

    const byLead = {};
    stageHistory.forEach((h) => {
      byLead[h.lead_id] = byLead[h.lead_id] || [];
      byLead[h.lead_id].push(h);
    });
    const durations = {};
    Object.values(byLead).forEach((events) => {
      const sorted = [...events].sort((a, b) => new Date(a.changed_at) - new Date(b.changed_at));
      sorted.forEach((ev, i) => {
        const next = sorted[i + 1];
        if (next) {
          const d = daysBetween(ev.changed_at, next.changed_at);
          durations[ev.to_stage] = durations[ev.to_stage] || [];
          durations[ev.to_stage].push(d);
        }
      });
    });
    const avgByStage = STAGES.map((s) => ({
      stage: s,
      avgDays: durations[s] && durations[s].length ? Math.round(durations[s].reduce((a, b) => a + b, 0) / durations[s].length) : 0,
    }));

    const now = new Date();
    const needsAttention = leads
      .filter((l) => l.stage !== "Customer" && l.stage !== "Lost" && l.next_action_due)
      .filter((l) => new Date(l.next_action_due) <= now)
      .sort((a, b) => new Date(a.next_action_due) - new Date(b.next_action_due));

    return { won, lost, active, avgCycle, winRate, funnel, avgByStage, needsAttention };
  }, [leads, stageHistory]);

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <h1 className="font-display text-2xl font-semibold" style={{ color: TEXT }}>
        Dashboard
      </h1>
      <p className="text-sm mt-1" style={{ color: TEXT_MUTED }}>
        Snapshot as of {fmt(new Date())}
      </p>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatCard label="Active leads" value={metrics.active.length} />
        <StatCard label="Customers" value={metrics.won.length} />
        <StatCard label="Avg. cycle time" value={metrics.avgCycle !== null ? `${metrics.avgCycle}d` : "—"} sub="lead → customer" />
        <StatCard label="Win rate" value={metrics.winRate !== null ? `${metrics.winRate}%` : "—"} sub="won vs. lost" />
      </div>

      <Card className="mt-6">
        <div className="text-sm font-semibold mb-5" style={{ color: TEXT }}>
          Pipeline stages
        </div>
        <StageRail currentStage="Customer" isLost={false} />
      </Card>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <Card>
          <div className="text-sm font-semibold mb-4" style={{ color: TEXT }}>
            Leads by stage
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={metrics.funnel}>
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
              <XAxis dataKey="stage" tick={{ fontSize: 11, fill: TEXT_MUTED }} axisLine={{ stroke: BORDER }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {metrics.funnel.map((f) => (
                  <Cell key={f.stage} fill={STAGE_COLOR[f.stage]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="text-sm font-semibold mb-4" style={{ color: TEXT }}>
            Avg. days spent per stage
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={metrics.avgByStage} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: TEXT_MUTED }} axisLine={{ stroke: BORDER }} tickLine={false} />
              <YAxis dataKey="stage" type="category" width={70} tick={{ fontSize: 11, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }}
                formatter={(v) => [`${v} days`, "avg"]}
              />
              <Bar dataKey="avgDays" radius={[0, 4, 4, 0]}>
                {metrics.avgByStage.map((f) => (
                  <Cell key={f.stage} fill={STAGE_COLOR[f.stage]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="mt-4">
        <div className="text-sm font-semibold mb-3 flex items-center gap-1.5" style={{ color: TEXT }}>
          <AlertCircle size={15} style={{ color: RUST }} /> Needs attention
        </div>
        <div className="space-y-2">
          {metrics.needsAttention.map((l) => (
            <button
              key={l.id}
              onClick={() => onSelectLead(l.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-white/[0.03]"
            >
              <div className="flex items-center gap-3">
                <StagePill stage={l.stage} />
                <span className="text-sm font-medium" style={{ color: TEXT }}>
                  {l.account.name}
                </span>
                <span className="text-sm" style={{ color: TEXT_MUTED }}>
                  {l.next_action}
                </span>
              </div>
              <span className="font-mono text-xs" style={{ color: RUST }}>
                due {fmt(l.next_action_due)}
              </span>
            </button>
          ))}
          {metrics.needsAttention.length === 0 && (
            <div className="text-sm" style={{ color: TEXT_FAINT }}>
              Nothing due — you're caught up.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
