import React, { useState } from "react";
import { X } from "lucide-react";
import { Field } from "./ui";
import { ACCENT, BORDER, SURFACE, SURFACE_2, TEXT, TEXT_FAINT } from "../lib/constants";

export default function NewLeadModal({ onClose, onCreate }) {
  const [accountName, setAccountName] = useState("");
  const [industry, setIndustry] = useState("");
  const [source, setSource] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleCreate() {
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({ accountName, industry, source, contactName, contactRole });
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="rounded-xl w-full max-w-md p-6" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold" style={{ color: TEXT }}>
            New lead
          </h2>
          <button onClick={onClose}>
            <X size={18} style={{ color: TEXT_FAINT }} />
          </button>
        </div>
        <div className="space-y-3">
          <Field label="Company">
            <input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full text-sm rounded-md px-3 py-2"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }}
            />
          </Field>
          <Field label="Industry">
            <input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full text-sm rounded-md px-3 py-2"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }}
            />
          </Field>
          <Field label="How we met">
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. referral, conference, inbound"
              className="w-full text-sm rounded-md px-3 py-2"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }}
            />
          </Field>
          <Field label="Contact name">
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full text-sm rounded-md px-3 py-2"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }}
            />
          </Field>
          <Field label="Contact role">
            <input
              value={contactRole}
              onChange={(e) => setContactRole(e.target.value)}
              className="w-full text-sm rounded-md px-3 py-2"
              style={{ border: `1px solid ${BORDER}`, backgroundColor: SURFACE_2, color: TEXT }}
            />
          </Field>
        </div>

        {error && (
          <div className="mt-3 text-xs px-3 py-2 rounded-md" style={{ backgroundColor: "#E8674A1a", color: "#E8674A" }}>
            {error}
          </div>
        )}

        <button
          disabled={!accountName || !contactName || submitting}
          onClick={handleCreate}
          className="mt-5 w-full text-sm font-medium px-3 py-2 rounded-md disabled:opacity-40"
          style={{ backgroundColor: ACCENT, color: "#04141A" }}
        >
          {submitting ? "Creating…" : "Create lead"}
        </button>
      </div>
    </div>
  );
}
