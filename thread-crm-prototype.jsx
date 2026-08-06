import React, { useState, useMemo } from "react";
import {
  Building2, User, Plus, X, Check, Sparkles, ChevronRight,
  RotateCcw, AlertCircle, Search, UserSearch, PenLine, Clock3,
  ArrowRight, Trash2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

// ---------- constants ----------
const STAGES = ["New", "Contacted", "Engaged", "Qualified", "Proposal", "Customer"];
const STAGE_COLOR = {
  New: "#5B6B85",
  Contacted: "#3F8CA6",
  Engaged: "#2CA6C4",
  Qualified: "#1FC2DE",
  Proposal: "#17D6E8",
  Customer: "#22E9F2",
  Lost: "#E8674A",
};
const ACCENT = "#22D3EE";
const ACCENT_DIM = "#0E7A8C";
const RUST = "#F0A344";

const BG = "#080C16";
const SURFACE = "#0E1526";
const SURFACE_2 = "#121B30";
const BORDER = "#1F2B45";
const TEXT = "#E8EDF5";
const TEXT_MUTED = "#7A8AA6";
const TEXT_FAINT = "#4C5A76";

function daysBetween(a, b) {
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));
}
function fmt(d) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function uid(prefix) {
  return prefix + "_" + Math.random().toString(36).slice(2, 9);
}

// ---------- seed data ----------
const seedAccounts = [
  { id: "acc1", name: "Northwind Robotics", industry: "Manufacturing", source: "Conference — RoboCon 2026" },
  { id: "acc2", name: "BluePeak Logistics", industry: "Logistics", source: "Referral — Sam Patel" },
  { id: "acc3", name: "Ferro & Ash Studio", industry: "Design", source: "Cold outreach" },
  { id: "acc4", name: "Solace Health", industry: "Healthcare", source: "Inbound — website form" },
];

const seedContacts = [
  { id: "c1", accountId: "acc1", name: "Elena Cho", role: "VP Operations", email: "elena@northwindrobotics.com" },
  { id: "c2", accountId: "acc1", name: "Marcus Webb", role: "Procurement Lead", email: "marcus@northwindrobotics.com" },
  { id: "c3", accountId: "acc2", name: "Dana Kim", role: "Ops Director", email: "dana@bluepeaklogistics.com" },
  { id: "c4", accountId: "acc3", name: "Priya Anand", role: "Founder", email: "priya@ferroash.studio" },
  { id: "c5", accountId: "acc4", name: "Tom Reyes", role: "Director of IT", email: "tom@solacehealth.org" },
];

const seedLeads = [
  { id: "l1", accountId: "acc1", contactId: "c1", stage: "Proposal", nextAction: "Send revised pricing", nextActionDue: "2026-07-29", createdAt: "2026-05-02", closedAt: null, lostReason: null, preLostStage: null },
  { id: "l2", accountId: "acc1", contactId: "c2", stage: "Contacted", nextAction: "Follow up on intro email", nextActionDue: "2026-07-30", createdAt: "2026-07-10", closedAt: null, lostReason: null, preLostStage: null },
  { id: "l3", accountId: "acc2", contactId: "c3", stage: "Customer", nextAction: "Kickoff call scheduling", nextActionDue: "2026-08-03", createdAt: "2026-03-15", closedAt: "2026-06-01", lostReason: null, preLostStage: null },
  { id: "l4", accountId: "acc3", contactId: "c4", stage: "Lost", nextAction: "—", nextActionDue: null, createdAt: "2026-04-01", closedAt: "2026-05-20", lostReason: "Went with an in-house solution", preLostStage: "Engaged" },
  { id: "l5", accountId: "acc4", contactId: "c5", stage: "New", nextAction: "Initial outreach", nextActionDue: "2026-07-28", createdAt: "2026-07-25", closedAt: null, lostReason: null, preLostStage: null },
];

const seedHistory = [
  { id: uid("h"), leadId: "l1", fromStage: null, toStage: "New", changedAt: "2026-05-02" },
  { id: uid("h"), leadId: "l1", fromStage: "New", toStage: "Contacted", changedAt: "2026-05-06" },
  { id: uid("h"), leadId: "l1", fromStage: "Contacted", toStage: "Engaged", changedAt: "2026-05-16" },
  { id: uid("h"), leadId: "l1", fromStage: "Engaged", toStage: "Qualified", changedAt: "2026-06-02" },
  { id: uid("h"), leadId: "l1", fromStage: "Qualified", toStage: "Proposal", changedAt: "2026-06-20" },

  { id: uid("h"), leadId: "l2", fromStage: null, toStage: "New", changedAt: "2026-07-10" },
  { id: uid("h"), leadId: "l2", fromStage: "New", toStage: "Contacted", changedAt: "2026-07-14" },

  { id: uid("h"), leadId: "l3", fromStage: null, toStage: "New", changedAt: "2026-03-15" },
  { id: uid("h"), leadId: "l3", fromStage: "New", toStage: "Contacted", changedAt: "2026-03-19" },
  { id: uid("h"), leadId: "l3", fromStage: "Contacted", toStage: "Engaged", changedAt: "2026-03-30" },
  { id: uid("h"), leadId: "l3", fromStage: "Engaged", toStage: "Qualified", changedAt: "2026-04-14" },
  { id: uid("h"), leadId: "l3", fromStage: "Qualified", toStage: "Proposal", changedAt: "2026-05-02" },
  { id: uid("h"), leadId: "l3", fromStage: "Proposal", toStage: "Customer", changedAt: "2026-06-01" },

  { id: uid("h"), leadId: "l4", fromStage: null, toStage: "New", changedAt: "2026-04-01" },
  { id: uid("h"), leadId: "l4", fromStage: "New", toStage: "Contacted", changedAt: "2026-04-05" },
  { id: uid("h"), leadId: "l4", fromStage: "Contacted", toStage: "Engaged", changedAt: "2026-04-18" },
  { id: uid("h"), leadId: "l4", fromStage: "Engaged", toStage: "Lost", changedAt: "2026-05-20" },

  { id: uid("h"), leadId: "l5", fromStage: null, toStage: "New", changedAt: "2026-07-25" },
];

const seedInteractions = [
  { id: uid("i"), leadId: "l1", contactId: "c1", type: "meeting", channel: "Video call", summary: "Discovery call — walked through current workflow, pain points around manual scheduling.", occurredAt: "2026-05-16" },
  { id: uid("i"), leadId: "l1", contactId: "c1", type: "note", channel: null, summary: "Elena mentioned budget approval needs VP Finance sign-off by end of Q3.", occurredAt: "2026-06-21" },
  { id: uid("i"), leadId: "l1", contactId: "c1", type: "message", channel: "Email", summary: "Sent initial proposal draft with three pricing tiers.", occurredAt: "2026-06-20" },
  { id: uid("i"), leadId: "l3", contactId: "c3", type: "meeting", channel: "In person", summary: "Kickoff prep — confirmed onboarding timeline and success metrics.", occurredAt: "2026-06-01" },
  { id: uid("i"), leadId: "l4", contactId: "c4", type: "note", channel: null, summary: "Priya said they'd already started building an internal tool before we reached out — timing was the issue, not fit.", occurredAt: "2026-05-20" },
];

const seedAgentTasks = [
  { id: uid("a"), leadId: "l2", agentType: "message_draft", input: "Follow-up after intro email, no reply in 2 weeks", output: "Hi Marcus — wanted to make sure my note from the 10th didn't get buried. Happy to send over a one-pager on how we've helped teams like Northwind cut scheduling overhead, or jump on a quick 15-min call this week if useful. Let me know what's easiest.", status: "pending_approval" },
];

// ---------- small UI atoms ----------
function StagePill({ stage }) {
  const color = STAGE_COLOR[stage] || "#5B6B85";
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: color + "1f", color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
      {stage}
    </span>
  );
}

function StageRail({ currentStage, isLost }) {
  const idx = STAGES.indexOf(currentStage);
  return (
    <div className="flex items-center w-full">
      {STAGES.map((s, i) => {
        const reached = !isLost && i <= idx;
        const isCurrent = !isLost && i === idx;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div
                className="w-2.5 h-2.5 rounded-full border-2 transition-colors"
                style={{
                  borderColor: reached ? STAGE_COLOR[s] : BORDER,
                  backgroundColor: isCurrent ? STAGE_COLOR[s] : reached ? STAGE_COLOR[s] + "33" : "transparent",
                  boxShadow: isCurrent ? `0 0 10px ${STAGE_COLOR[s]}99` : "none",
                }}
              />
              <span className={`text-[10px] tracking-wide ${isCurrent ? "font-semibold" : ""}`} style={{ color: isCurrent ? STAGE_COLOR[s] : TEXT_FAINT }}>
                {s}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div className="flex-1 h-[2px] mx-1 mb-4" style={{ backgroundColor: reached && i < idx ? STAGE_COLOR[s] : BORDER }} />
            )}
          </React.Fragment>
        );
      })}
      {isLost && (
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0 ml-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STAGE_COLOR.Lost, boxShadow: `0 0 8px ${STAGE_COLOR.Lost}99` }} />
          <span className="text-[10px] font-semibold" style={{ color: STAGE_COLOR.Lost }}>Lost</span>
        </div>
      )}
    </div>
  );
}

// ---------- main app ----------
export default function ThreadCRM() {
  const [accounts, setAccounts] = useState(seedAccounts);
  const [contacts, setContacts] = useState(seedContacts);
  const [leads, setLeads] = useState(seedLeads);
  const [history, setHistory] = useState(seedHistory);
  const [interactions, setInteractions] = useState(seedInteractions);
  const [agentTasks, setAgentTasks] = useState(seedAgentTasks);

  const [view, setView] = useState("dashboard");
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [showNewLead, setShowNewLead] = useState(false);
  const [draftGoal, setDraftGoal] = useState("");
  const [showDraftForm, setShowDraftForm] = useState(false);

  const accountById = (id) => accounts.find((a) => a.id === id);
  const contactById = (id) => contacts.find((c) => c.id === id);
  const leadHistory = (leadId) => history.filter((h) => h.leadId === leadId).sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt));

  // ---------- derived metrics ----------
  const metrics = useMemo(() => {
    const won = leads.filter((l) => l.stage === "Customer");
    const lost = leads.filter((l) => l.stage === "Lost");
    const active = leads.filter((l) => l.stage !== "Customer" && l.stage !== "Lost");
    const cycleDays = won.map((l) => daysBetween(l.createdAt, l.closedAt));
    const avgCycle = cycleDays.length ? Math.round(cycleDays.reduce((a, b) => a + b, 0) / cycleDays.length) : null;
    const winRate = won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) : null;

    const funnel = STAGES.map((s) => ({ stage: s, count: leads.filter((l) => l.stage === s).length }));

    const byLead = {};
    history.forEach((h) => { byLead[h.leadId] = byLead[h.leadId] || []; byLead[h.leadId].push(h); });
    const durations = {};
    Object.values(byLead).forEach((events) => {
      const sorted = [...events].sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt));
      sorted.forEach((ev, i) => {
        const next = sorted[i + 1];
        if (next) {
          const d = daysBetween(ev.changedAt, next.changedAt);
          durations[ev.toStage] = durations[ev.toStage] || [];
          durations[ev.toStage].push(d);
        }
      });
    });
    const avgByStage = STAGES.map((s) => ({
      stage: s,
      avgDays: durations[s] && durations[s].length ? Math.round(durations[s].reduce((a, b) => a + b, 0) / durations[s].length) : 0,
    }));

    const needsAttention = leads
      .filter((l) => l.stage !== "Customer" && l.stage !== "Lost" && l.nextActionDue)
      .filter((l) => new Date(l.nextActionDue) <= new Date("2026-07-30"))
      .sort((a, b) => new Date(a.nextActionDue) - new Date(b.nextActionDue));

    return { won, lost, active, avgCycle, winRate, funnel, avgByStage, needsAttention };
  }, [leads, history]);

  // ---------- actions ----------
  function addStageHistory(leadId, fromStage, toStage) {
    setHistory((h) => [...h, { id: uid("h"), leadId, fromStage, toStage, changedAt: "2026-07-28" }]);
  }

  function changeStage(lead, newStage) {
    if (newStage === "Lost") {
      const reason = window.prompt("Why was this lead lost? (optional)") || "Not specified";
      addStageHistory(lead.id, lead.stage, "Lost");
      setLeads((ls) => ls.map((l) => (l.id === lead.id ? { ...l, stage: "Lost", preLostStage: lead.stage, lostReason: reason, closedAt: "2026-07-28" } : l)));
    } else if (newStage === "Customer") {
      addStageHistory(lead.id, lead.stage, "Customer");
      setLeads((ls) => ls.map((l) => (l.id === lead.id ? { ...l, stage: "Customer", closedAt: "2026-07-28" } : l)));
    } else {
      addStageHistory(lead.id, lead.stage, newStage);
      setLeads((ls) => ls.map((l) => (l.id === lead.id ? { ...l, stage: newStage } : l)));
    }
  }

  function reopenLead(lead) {
    const back = lead.preLostStage || "Contacted";
    addStageHistory(lead.id, "Lost", back);
    setLeads((ls) => ls.map((l) => (l.id === lead.id ? { ...l, stage: back, closedAt: null, lostReason: null } : l)));
  }

  function addInteraction(leadId, contactId, type, channel, summary) {
    if (!summary.trim()) return;
    setInteractions((ints) => [{ id: uid("i"), leadId, contactId, type, channel: channel || null, summary, occurredAt: "2026-07-28" }, ...ints]);
  }

  function runAgent(lead, type) {
    if (type === "research") {
      const acc = accountById(lead.accountId);
      addInteraction(lead.id, null, "note", "Agent — research", `Research brief for ${acc.name} (${acc.industry}): mocked output. In production this agent would search the web and summarize company size, recent news, and likely priorities.`);
    } else if (type === "contact_lookup") {
      const c = contactById(lead.contactId);
      addInteraction(lead.id, c.id, "note", "Agent — contact lookup", `Contact lookup for ${c.name}: mocked output. In production this agent would confirm role, LinkedIn, and best contact channel.`);
    }
  }

  function generateDraft(lead) {
    const c = contactById(lead.contactId);
    const output = `Hi ${c.name.split(" ")[0]} — following up on where things stand. ${draftGoal || "Wanted to check in and see if now's a good time to continue the conversation."} Let me know what works.`;
    setAgentTasks((ts) => [...ts, { id: uid("a"), leadId: lead.id, agentType: "message_draft", input: draftGoal, output, status: "pending_approval" }]);
    setDraftGoal("");
    setShowDraftForm(false);
  }

  function approveDraft(task) {
    const lead = leads.find((l) => l.id === task.leadId);
    addInteraction(lead.id, lead.contactId, "message", "Email", task.output);
    setAgentTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, status: "approved" } : t)));
  }

  function discardDraft(task) {
    setAgentTasks((ts) => ts.filter((t) => t.id !== task.id));
  }

  function createLead({ accountName, industry, source, contactName, contactRole }) {
    const accId = uid("acc");
    const contId = uid("c");
    setAccounts((a) => [...a, { id: accId, name: accountName, industry: industry || "—", source: source || "—" }]);
    setContacts((c) => [...c, { id: contId, accountId: accId, name: contactName, role: contactRole || "—", email: "" }]);
    const leadId = uid("l");
    setLeads((ls) => [...ls, { id: leadId, accountId: accId, contactId: contId, stage: "New", nextAction: "First outreach", nextActionDue: "2026-07-30", createdAt: "2026-07-28", closedAt: null, lostReason: null, preLostStage: null }]);
    addStageHistory(leadId, null, "New");
    setShowNewLead(false);
    setSelectedLeadId(leadId);
    setView("leads");
  }

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  return (
    <div className="min-h-screen flex relative" style={{ backgroundColor: BG, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        ::selection { background: #22D3EE44; }
      `}</style>

      {/* ambient glow background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, #22D3EE, transparent 70%)" }} />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #22D3EE, transparent 70%)" }} />
      </div>

      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col relative z-10" style={{ backgroundColor: "#050810", borderRight: `1px solid ${BORDER}` }}>
        <div className="px-5 py-6" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `radial-gradient(circle at 35% 30%, #5EEAF5, ${ACCENT_DIM})`, boxShadow: `0 0 12px ${ACCENT}66` }}>
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            <div className="font-display font-semibold text-lg tracking-tight" style={{ color: TEXT }}>Thread</div>
          </div>
          <div className="text-[11px] mt-1" style={{ color: TEXT_FAINT }}>private CRM</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <button
            onClick={() => setView("dashboard")}
            className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors"
            style={view === "dashboard" ? { backgroundColor: ACCENT + "1a", color: ACCENT } : { color: TEXT_MUTED }}
          >
            Dashboard
          </button>
          <button
            onClick={() => { setView("leads"); setSelectedLeadId(null); }}
            className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors"
            style={view === "leads" ? { backgroundColor: ACCENT + "1a", color: ACCENT } : { color: TEXT_MUTED }}
          >
            Leads
          </button>
        </nav>
        <div className="px-3 pb-4">
          <button
            onClick={() => setShowNewLead(true)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: ACCENT, color: "#04141A", boxShadow: `0 0 16px ${ACCENT}55` }}
          >
            <Plus size={15} /> New lead
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto relative z-10">
        {view === "dashboard" && (
          <div className="max-w-5xl mx-auto px-8 py-8">
            <h1 className="font-display text-2xl font-semibold" style={{ color: TEXT }}>Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: TEXT_MUTED }}>Snapshot as of Jul 28, 2026</p>

            <div className="grid grid-cols-4 gap-4 mt-6">
              <StatCard label="Active leads" value={metrics.active.length} />
              <StatCard label="Customers" value={metrics.won.length} />
              <StatCard label="Avg. cycle time" value={metrics.avgCycle !== null ? `${metrics.avgCycle}d` : "—"} sub="lead → customer" />
              <StatCard label="Win rate" value={metrics.winRate !== null ? `${metrics.winRate}%` : "—"} sub="won vs. lost" />
            </div>

            <Card className="mt-6">
              <div className="text-sm font-semibold mb-5" style={{ color: TEXT }}>Pipeline stages</div>
              <StageRail currentStage="Customer" isLost={false} />
            </Card>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Card>
                <div className="text-sm font-semibold mb-4" style={{ color: TEXT }}>Leads by stage</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={metrics.funnel}>
                    <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                    <XAxis dataKey="stage" tick={{ fontSize: 11, fill: TEXT_MUTED }} axisLine={{ stroke: BORDER }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {metrics.funnel.map((f) => <Cell key={f.stage} fill={STAGE_COLOR[f.stage]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <div className="text-sm font-semibold mb-4" style={{ color: TEXT }}>Avg. days spent per stage</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={metrics.avgByStage} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: TEXT_MUTED }} axisLine={{ stroke: BORDER }} tickLine={false} />
                    <YAxis dataKey="stage" type="category" width={70} tick={{ fontSize: 11, fill: TEXT_MUTED }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }} formatter={(v) => [`${v} days`, "avg"]} />
                    <Bar dataKey="avgDays" radius={[0, 4, 4, 0]}>
                      {metrics.avgByStage.map((f) => <Cell key={f.stage} fill={STAGE_COLOR[f.stage]} />)}
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
                {metrics.needsAttention.map((l) => {
                  const acc = accountById(l.accountId);
                  return (
                    <button
                      key={l.id}
                      onClick={() => { setSelectedLeadId(l.id); setView("leads"); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-white/[0.03]"
                    >
                      <div className="flex items-center gap-3">
                        <StagePill stage={l.stage} />
                        <span className="text-sm font-medium" style={{ color: TEXT }}>{acc.name}</span>
                        <span className="text-sm" style={{ color: TEXT_MUTED }}>{l.nextAction}</span>
                      </div>
                      <span className="font-mono text-xs" style={{ color: RUST }}>due {fmt(l.nextActionDue)}</span>
                    </button>
                  );
                })}
                {metrics.needsAttention.length === 0 && <div className="text-sm" style={{ color: TEXT_FAINT }}>Nothing due — you're caught up.</div>}
              </div>
            </Card>
          </div>
        )}

        {view === "leads" && !selectedLead && (
          <div className="max-w-5xl mx-auto px-8 py-8">
            <h1 className="font-display text-2xl font-semibold" style={{ color: TEXT }}>Leads</h1>
            <p className="text-sm mt-1" style={{ color: TEXT_MUTED }}>{leads.length} total across {accounts.length} accounts</p>
            <Card className="mt-6 !p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }} className="text-left text-xs uppercase tracking-wide">
                    <th className="px-5 py-3 font-medium" style={{ color: TEXT_FAINT }}>Account</th>
                    <th className="px-5 py-3 font-medium" style={{ color: TEXT_FAINT }}>Contact</th>
                    <th className="px-5 py-3 font-medium" style={{ color: TEXT_FAINT }}>Stage</th>
                    <th className="px-5 py-3 font-medium" style={{ color: TEXT_FAINT }}>Next action</th>
                    <th className="px-5 py-3 font-medium" style={{ color: TEXT_FAINT }}>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => {
                    const acc = accountById(l.accountId);
                    const c = contactById(l.contactId);
                    return (
                      <tr
                        key={l.id}
                        onClick={() => setSelectedLeadId(l.id)}
                        className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                        style={{ borderBottom: `1px solid ${BORDER}` }}
                      >
                        <td className="px-5 py-3.5">
                          <div className="font-medium" style={{ color: TEXT }}>{acc.name}</div>
                          <div className="text-xs" style={{ color: TEXT_FAINT }}>{acc.industry}</div>
                        </td>
                        <td className="px-5 py-3.5" style={{ color: TEXT }}>{c.name}</td>
                        <td className="px-5 py-3.5"><StagePill stage={l.stage} /></td>
                        <td className="px-5 py-3.5" style={{ color: TEXT_MUTED }}>{l.nextAction}</td>
                        <td className="px-5 py-3.5 font-mono text-xs" style={{ color: TEXT_MUTED }}>{l.nextActionDue ? fmt(l.nextActionDue) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {view === "leads" && selectedLead && (
          <LeadDetail
            lead={selectedLead}
            account={accountById(selectedLead.accountId)}
            contact={contactById(selectedLead.contactId)}
            history={leadHistory(selectedLead.id)}
            interactions={interactions.filter((i) => i.leadId === selectedLead.id).sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt))}
            agentTasks={agentTasks.filter((t) => t.leadId === selectedLead.id)}
            onBack={() => setSelectedLeadId(null)}
            onChangeStage={(s) => changeStage(selectedLead, s)}
            onReopen={() => reopenLead(selectedLead)}
            onAddInteraction={(type, channel, summary) => addInteraction(selectedLead.id, selectedLead.contactId, type, channel, summary)}
            onRunAgent={(type) => runAgent(selectedLead, type)}
            showDraftForm={showDraftForm}
            setShowDraftForm={setShowDraftForm}
            draftGoal={draftGoal}
            setDraftGoal={setDraftGoal}
            onGenerateDraft={() => generateDraft(selectedLead)}
            onApproveDraft={approveDraft}
            onDiscardDraft={discardDraft}
          />
        )}
      </main>

      {showNewLead && <NewLeadModal onClose={() => setShowNewLead(false)} onCreate={createLead} />}
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-xl p-6 ${className}`} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
      <div className="text-xs font-medium" style={{ color: TEXT_FAINT }}>{label}</div>
      <div className="font-display text-2xl font-semibold mt-1" style={{ color: TEXT }}>{value}</div>
      {sub && <div className="text-[11px] mt-0.5" style={{ color: TEXT_FAINT }}>{sub}</div>}
    </div>
  );
}

function LeadDetail({
  lead, account, contact, history, interactions, agentTasks, onBack, onChangeStage, onReopen,
  onAddInteraction, onRunAgent, showDraftForm, setShowDraftForm, draftGoal, setDraftGoal,
  onGenerateDraft, onApproveDraft, onDiscardDraft,
}) {
  const [newType, setNewType] = useState("note");
  const [newChannel, setNewChannel] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const daysOpen = lead.stage === "Customer" || lead.stage === "Lost"
    ? daysBetween(lead.createdAt, lead.closedAt)
    : daysBetween(lead.createdAt, "2026-07-28");

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <button onClick={onBack} className="text-sm flex items-center gap-1 mb-4 hover:opacity-80" style={{ color: TEXT_MUTED }}>
        ← All leads
      </button>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Building2 size={18} style={{ color: TEXT_FAINT }} />
            <h1 className="font-display text-2xl font-semibold" style={{ color: TEXT }}>{account.name}</h1>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-sm" style={{ color: TEXT_MUTED }}>
            <span className="flex items-center gap-1"><User size={13} /> {contact.name} · {contact.role}</span>
            <span>·</span>
            <span>{account.source}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-xs" style={{ color: TEXT_FAINT }}>{daysOpen} days {lead.stage === "Customer" ? "to close" : lead.stage === "Lost" ? "before lost" : "open"}</div>
        </div>
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between mb-5">
          <div className="text-sm font-semibold" style={{ color: TEXT }}>Stage</div>
          {lead.stage === "Lost" ? (
            <button
              onClick={onReopen}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md"
              style={{ backgroundColor: ACCENT, color: "#04141A", boxShadow: `0 0 12px ${ACCENT}55` }}
            >
              <RotateCcw size={13} /> Reopen lead
            </button>
          ) : (
            <select
              value={lead.stage}
              onChange={(e) => onChangeStage(e.target.value)}
              className="text-sm rounded-md px-2.5 py-1.5"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }}
            >
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              <option value="Lost">Lost</option>
            </select>
          )}
        </div>
        <StageRail currentStage={lead.stage === "Lost" ? lead.preLostStage : lead.stage} isLost={lead.stage === "Lost"} />
        {lead.stage === "Lost" && (
          <div className="mt-4 text-sm px-3 py-2 rounded-md" style={{ backgroundColor: STAGE_COLOR.Lost + "1a", color: STAGE_COLOR.Lost }}>
            Lost from <strong>{lead.preLostStage}</strong> — {lead.lostReason}. History below is preserved.
          </div>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="col-span-2 space-y-4">
          <Card>
            <div className="text-sm font-semibold mb-4" style={{ color: TEXT }}>Add to timeline</div>
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
              onClick={() => { onAddInteraction(newType, newChannel, newSummary); setNewSummary(""); setNewChannel(""); }}
              className="mt-2 text-sm font-medium px-3 py-1.5 rounded-md"
              style={{ backgroundColor: ACCENT, color: "#04141A" }}
            >
              Log entry
            </button>
          </Card>

          <div className="space-y-3">
            {interactions.map((i) => (
              <Card key={i.id} className="!p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold capitalize flex items-center gap-1.5" style={{ color: TEXT }}>
                    {i.type === "message" && <PenLine size={12} />}
                    {i.type === "meeting" && <Clock3 size={12} />}
                    {i.type === "note" && <span className="inline-block w-[12px] h-[12px] rounded-sm border border-current" />}
                    {i.type}{i.channel ? ` · ${i.channel}` : ""}
                  </span>
                  <span className="font-mono text-[11px]" style={{ color: TEXT_FAINT }}>{fmt(i.occurredAt)}</span>
                </div>
                <p className="text-sm" style={{ color: TEXT_MUTED }}>{i.summary}</p>
              </Card>
            ))}
            {interactions.length === 0 && <div className="text-sm px-1" style={{ color: TEXT_FAINT }}>No activity logged yet.</div>}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="!p-5">
            <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: TEXT_FAINT }}>Next action</div>
            <div className="text-sm font-medium" style={{ color: TEXT }}>{lead.nextAction}</div>
            {lead.nextActionDue && <div className="font-mono text-xs mt-1" style={{ color: RUST }}>due {fmt(lead.nextActionDue)}</div>}
          </Card>

          <Card className="!p-5">
            <div className="text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-1.5" style={{ color: TEXT_FAINT }}>
              <Sparkles size={12} style={{ color: ACCENT }} /> Agents
            </div>
            <div className="space-y-2">
              <button onClick={() => onRunAgent("research")} className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-md hover:bg-white/[0.03]" style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}>
                <Search size={14} /> Research company
              </button>
              <button onClick={() => onRunAgent("contact_lookup")} className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-md hover:bg-white/[0.03]" style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}>
                <UserSearch size={14} /> Look up contact
              </button>
              <button onClick={() => setShowDraftForm(!showDraftForm)} className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-md hover:bg-white/[0.03]" style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}>
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
                <button onClick={onGenerateDraft} className="text-sm font-medium px-3 py-1.5 rounded-md w-full" style={{ backgroundColor: ACCENT, color: "#04141A" }}>
                  Generate draft
                </button>
              </div>
            )}
            <div className="text-[11px] mt-3 leading-relaxed" style={{ color: TEXT_FAINT }}>
              Research and contact lookups log automatically. Anything that goes out to the prospect always needs your approval below.
            </div>
          </Card>

          {agentTasks.filter((t) => t.status === "pending_approval").length > 0 && (
            <Card className="!p-5" style={{ borderColor: RUST + "55" }}>
              <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: RUST }}>Pending your approval</div>
              {agentTasks.filter((t) => t.status === "pending_approval").map((t) => (
                <div key={t.id} className="mb-3 last:mb-0">
                  <p className="text-sm rounded-md p-3 mb-2" style={{ backgroundColor: SURFACE_2, color: TEXT_MUTED }}>{t.output}</p>
                  <div className="flex gap-2">
                    <button onClick={() => onApproveDraft(t)} className="flex-1 flex items-center justify-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md" style={{ backgroundColor: ACCENT, color: "#04141A" }}>
                      <Check size={12} /> Approve & send
                    </button>
                    <button onClick={() => onDiscardDraft(t)} className="flex items-center justify-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md" style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}>
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

function NewLeadModal({ onClose, onCreate }) {
  const [accountName, setAccountName] = useState("");
  const [industry, setIndustry] = useState("");
  const [source, setSource] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="rounded-xl w-full max-w-md p-6" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold" style={{ color: TEXT }}>New lead</h2>
          <button onClick={onClose}><X size={18} style={{ color: TEXT_FAINT }} /></button>
        </div>
        <div className="space-y-3">
          <Field label="Company">
            <input value={accountName} onChange={(e) => setAccountName(e.target.value)} className="w-full text-sm rounded-md px-3 py-2" style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }} />
          </Field>
          <Field label="Industry">
            <input value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full text-sm rounded-md px-3 py-2" style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }} />
          </Field>
          <Field label="How we met">
            <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. referral, conference, inbound" className="w-full text-sm rounded-md px-3 py-2" style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }} />
          </Field>
          <Field label="Contact name">
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full text-sm rounded-md px-3 py-2" style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }} />
          </Field>
          <Field label="Contact role">
            <input value={contactRole} onChange={(e) => setContactRole(e.target.value)} className="w-full text-sm rounded-md px-3 py-2" style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }} />
          </Field>
        </div>
        <button
          disabled={!accountName || !contactName}
          onClick={() => onCreate({ accountName, industry, source, contactName, contactRole })}
          className="mt-5 w-full text-sm font-medium px-3 py-2 rounded-md disabled:opacity-40"
          style={{ backgroundColor: ACCENT, color: "#04141A" }}
        >
          Create lead
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium mb-1 block" style={{ color: TEXT_MUTED }}>{label}</label>
      {children}
    </div>
  );
}
