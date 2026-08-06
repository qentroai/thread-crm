import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ACCENT, ACCENT_DIM, BG, BORDER, SURFACE, SURFACE_2, TEXT, TEXT_FAINT, TEXT_MUTED } from "../lib/constants";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) setError(error.message);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{ backgroundColor: BG, fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.08]"
          style={{ background: "radial-gradient(circle, #22D3EE, transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #22D3EE, transparent 70%)" }}
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm rounded-xl p-7"
        style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle at 35% 30%, #5EEAF5, ${ACCENT_DIM})`,
              boxShadow: `0 0 12px ${ACCENT}66`,
            }}
          >
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
          <div className="font-display font-semibold text-lg tracking-tight" style={{ color: TEXT }}>
            Thread
          </div>
        </div>
        <div className="text-[11px] mb-6" style={{ color: TEXT_FAINT }}>
          private CRM — sign in to continue
        </div>

        <label className="text-xs font-medium mb-1 block" style={{ color: TEXT_MUTED }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          className="w-full text-sm rounded-md px-3 py-2 mb-3"
          style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }}
        />

        <label className="text-xs font-medium mb-1 block" style={{ color: TEXT_MUTED }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full text-sm rounded-md px-3 py-2 mb-4"
          style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }}
        />

        {error && (
          <div className="text-xs mb-3 px-3 py-2 rounded-md" style={{ backgroundColor: "#E8674A1a", color: "#E8674A" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full text-sm font-medium px-3 py-2 rounded-md disabled:opacity-50"
          style={{ backgroundColor: ACCENT, color: "#04141A", boxShadow: `0 0 16px ${ACCENT}55` }}
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>

        <div className="text-[11px] mt-4 leading-relaxed" style={{ color: TEXT_FAINT }}>
          This is a single-user app. Create your account from the Supabase dashboard
          (Authentication → Users → Add user) — see the README.
        </div>
      </form>
    </div>
  );
}
