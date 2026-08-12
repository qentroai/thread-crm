import React, { useState } from "react";
import { Plus, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ExportData from "./ExportData";
import { ACCENT, ACCENT_DIM, BORDER, TEXT, TEXT_FAINT, TEXT_MUTED } from "../lib/constants";

function Logo() {
  return (
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
  );
}

function NavLinks({ view, setView, onNewLead, onNavigate }) {
  function go(v) {
    setView(v);
    onNavigate?.();
  }

  function newLead() {
    onNewLead();
    onNavigate?.();
  }

  return (
    <>
      <nav className="flex-1 px-3 py-4 space-y-1">
        <button
          onClick={() => go("dashboard")}
          className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors"
          style={view === "dashboard" ? { backgroundColor: ACCENT + "1a", color: ACCENT } : { color: TEXT_MUTED }}
        >
          Dashboard
        </button>
        <button
          onClick={() => go("leads")}
          className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors"
          style={view === "leads" ? { backgroundColor: ACCENT + "1a", color: ACCENT } : { color: TEXT_MUTED }}
        >
          Leads
        </button>
      </nav>
      <div className="px-3 pb-3">
        <button
          onClick={newLead}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: ACCENT, color: "#04141A", boxShadow: `0 0 16px ${ACCENT}55` }}
        >
          <Plus size={15} /> New lead
        </button>
      </div>
    </>
  );
}

function AccountFooter({ onSignOut }) {
  const { session } = useAuth();
  return (
    <div className="px-3 pb-4 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
      <ExportData />
      <div className="text-[11px] truncate mb-2" style={{ color: TEXT_FAINT }} title={session?.user?.email}>
        {session?.user?.email}
      </div>
      <button
        onClick={onSignOut}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors hover:bg-white/[0.03]"
        style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}
      >
        <LogOut size={12} /> Sign out
      </button>
    </div>
  );
}

export default function Sidebar({ view, setView, onNewLead }) {
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-56 flex-shrink-0 flex-col relative z-10"
        style={{ backgroundColor: "#050810", borderRight: `1px solid ${BORDER}` }}
      >
        <div className="px-5 py-6" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <Logo />
          <div className="text-[11px] mt-1" style={{ color: TEXT_FAINT }}>
            private CRM
          </div>
        </div>
        <NavLinks view={view} setView={setView} onNewLead={onNewLead} />
        <AccountFooter onSignOut={() => signOut()} />
      </aside>

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14"
        style={{ backgroundColor: "#050810", borderBottom: `1px solid ${BORDER}` }}
      >
        <Logo />
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu size={22} style={{ color: TEXT_MUTED }} />
        </button>
      </div>

      {/* Mobile slide-in menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-64 flex flex-col" style={{ backgroundColor: "#050810", borderRight: `1px solid ${BORDER}` }}>
            <div className="px-5 py-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <Logo />
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X size={18} style={{ color: TEXT_FAINT }} />
              </button>
            </div>
            <NavLinks view={view} setView={setView} onNewLead={onNewLead} onNavigate={() => setMobileOpen(false)} />
            <AccountFooter
              onSignOut={() => {
                signOut();
                setMobileOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
