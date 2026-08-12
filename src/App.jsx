import React, { useCallback, useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import UpdatePassword from "./components/UpdatePassword";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import LeadsList from "./components/LeadsList";
import LeadDetail from "./components/LeadDetail";
import NewLeadModal from "./components/NewLeadModal";
import { BG, TEXT_MUTED } from "./lib/constants";
import * as api from "./lib/api";

function CrmApp() {
  const [leads, setLeads] = useState([]);
  const [stageHistory, setStageHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [view, setView] = useState("dashboard");
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [showNewLead, setShowNewLead] = useState(false);

  const refetch = useCallback(async () => {
    const [leadsData, historyData] = await Promise.all([api.fetchLeads(), api.fetchStageHistory()]);
    setLeads(leadsData);
    setStageHistory(historyData);
  }, []);

  useEffect(() => {
    setLoading(true);
    refetch()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [refetch]);

  function selectLead(id) {
    setSelectedLeadId(id);
    setView("leads");
  }

  async function handleChangeStage(lead, newStage) {
    let reason;
    if (newStage === "Lost") {
      reason = window.prompt("Why was this lead lost? (optional)") || "Not specified";
    }
    try {
      await api.changeStage(lead, newStage, reason);
      await refetch();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleReopen(lead) {
    try {
      await api.reopenLead(lead);
      await refetch();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleCreateLead(payload) {
    const lead = await api.createLead(payload);
    await refetch();
    setShowNewLead(false);
    setSelectedLeadId(lead.id);
    setView("leads");
  }

  const selectedLead = leads.find((l) => l.id === selectedLeadId);
  const accountCount = new Set(leads.map((l) => l.account_id)).size;

  return (
    <div className="min-h-screen flex relative" style={{ backgroundColor: BG, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        ::selection { background: #22D3EE44; }
      `}</style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, #22D3EE, transparent 70%)" }} />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #22D3EE, transparent 70%)" }} />
      </div>

      <Sidebar
        view={view}
        setView={(v) => {
          setView(v);
          setSelectedLeadId(null);
        }}
        onNewLead={() => setShowNewLead(true)}
      />

      <main className="flex-1 overflow-auto relative z-10 pt-14 md:pt-0">
        {loading && (
          <div className="max-w-5xl mx-auto px-8 py-8 text-sm" style={{ color: TEXT_MUTED }}>
            Loading…
          </div>
        )}

        {!loading && error && (
          <div className="max-w-5xl mx-auto px-8 py-8 text-sm" style={{ color: "#E8674A" }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {view === "dashboard" && <Dashboard leads={leads} stageHistory={stageHistory} onSelectLead={selectLead} />}

            {view === "leads" && !selectedLead && (
              <LeadsList leads={leads} accountCount={accountCount} onSelectLead={selectLead} />
            )}

            {view === "leads" && selectedLead && (
              <LeadDetail
                lead={selectedLead}
                history={stageHistory.filter((h) => h.lead_id === selectedLead.id)}
                onBack={() => setSelectedLeadId(null)}
                onChangeStage={(s) => handleChangeStage(selectedLead, s)}
                onReopen={() => handleReopen(selectedLead)}
              />
            )}
          </>
        )}
      </main>

      {showNewLead && <NewLeadModal onClose={() => setShowNewLead(false)} onCreate={handleCreateLead} />}
    </div>
  );
}

function Gate() {
  const { session, loading, isPasswordRecovery, clearPasswordRecovery } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG, color: TEXT_MUTED }}>
        Loading…
      </div>
    );
  }

  if (isPasswordRecovery) {
    return <UpdatePassword onDone={clearPasswordRecovery} />;
  }

  return session ? <CrmApp /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
