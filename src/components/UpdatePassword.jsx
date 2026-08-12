import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ACCENT, ACCENT_DIM, BG, BORDER, SURFACE, SURFACE_2, TEXT, TEXT_FAINT, TEXT_MUTED } from "../lib/constants";

export default function UpdatePassword({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) setError(error.message);
    else setSuccess(true);
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

      <div className="relative z-10 w-full max-w-sm rounded-xl p-7" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
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
          set a new password
        </div>

        {success ? (
          <>
            <div className="text-sm mb-4 px-3 py-2 rounded-md" style={{ backgroundColor: ACCENT + "1a", color: ACCENT }}>
              Password updated.
            </div>
            <button
              onClick={onDone}
              className="w-full text-sm font-medium px-3 py-2 rounded-md"
              style={{ backgroundColor: ACCENT, color: "#04141A", boxShadow: `0 0 16px ${ACCENT}55` }}
            >
              Continue to Thread
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="text-xs font-medium mb-1 block" style={{ color: TEXT_MUTED }}>
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoFocus
              className="w-full text-sm rounded-md px-3 py-2 mb-3"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }}
            />

            <label className="text-xs font-medium mb-1 block" style={{ color: TEXT_MUTED }}>
              Confirm password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
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
              {submitting ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
