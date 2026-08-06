import React from "react";
import { Plus, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ACCENT, ACCENT_DIM, BORDER, TEXT, TEXT_FAINT, TEXT_MUTED } from "../lib/constants";

export default function Sidebar({ view, setView, onNewLead }) {
  const { session, signOut } = useAuth();

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col relative z-10" style={{ backgroundColor: "#050810", borderRight: `1px solid ${BORDER}` }}>
      <div className="px-5 py-6" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: `radial-gradient(circle at 35% 30%, #5EEAF5, ${ACCENT_DIM})`, boxShadow: `0 0 12px ${ACCENT}66` }}
          >
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
          <div className="font-display font-semibold text-lg tracking-tight" style={{ color: TEXT }}>
            Thread
          </div>
        </div>
        <div className="text-[11px] mt-1" style={{ color: TEXT_FAINT }}>
          private CRM
        </div>
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
          onClick={() => setView("leads")}
          className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors"
          style={view === "leads" ? { backgroundColor: ACCENT + "1a", color: ACCENT } : { color: TEXT_MUTED }}
        >
          Leads
        </button>
      </nav>
      <div className="px-3 pb-3">
        <button
          onClick={onNewLead}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: ACCENT, color: "#04141A", boxShadow: `0 0 16px ${ACCENT}55` }}
        >
          <Plus size={15} /> New lead
        </button>
      </div>
      <div className="px-3 pb-4 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="text-[11px] truncate mb-2" style={{ color: TEXT_FAINT }} title={session?.user?.email}>
          {session?.user?.email}
        </div>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors hover:bg-white/[0.03]"
          style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}
        >
          <LogOut size={12} /> Sign out
        </button>
      </div>
    </aside>
  );
}
