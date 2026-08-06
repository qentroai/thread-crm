import React from "react";
import { Card, StagePill } from "./ui";
import { BORDER, TEXT, TEXT_FAINT, TEXT_MUTED, fmt } from "../lib/constants";

export default function LeadsList({ leads, accountCount, onSelectLead }) {
  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <h1 className="font-display text-2xl font-semibold" style={{ color: TEXT }}>
        Leads
      </h1>
      <p className="text-sm mt-1" style={{ color: TEXT_MUTED }}>
        {leads.length} total across {accountCount} accounts
      </p>
      <Card className="mt-6 !p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER}` }} className="text-left text-xs uppercase tracking-wide">
              <th className="px-5 py-3 font-medium" style={{ color: TEXT_FAINT }}>
                Account
              </th>
              <th className="px-5 py-3 font-medium" style={{ color: TEXT_FAINT }}>
                Contact
              </th>
              <th className="px-5 py-3 font-medium" style={{ color: TEXT_FAINT }}>
                Stage
              </th>
              <th className="px-5 py-3 font-medium" style={{ color: TEXT_FAINT }}>
                Next action
              </th>
              <th className="px-5 py-3 font-medium" style={{ color: TEXT_FAINT }}>
                Due
              </th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr
                key={l.id}
                onClick={() => onSelectLead(l.id)}
                className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                style={{ borderBottom: `1px solid ${BORDER}` }}
              >
                <td className="px-5 py-3.5">
                  <div className="font-medium" style={{ color: TEXT }}>
                    {l.account.name}
                  </div>
                  <div className="text-xs" style={{ color: TEXT_FAINT }}>
                    {l.account.industry}
                  </div>
                </td>
                <td className="px-5 py-3.5" style={{ color: TEXT }}>
                  {l.contact ? l.contact.name : "—"}
                </td>
                <td className="px-5 py-3.5">
                  <StagePill stage={l.stage} />
                </td>
                <td className="px-5 py-3.5" style={{ color: TEXT_MUTED }}>
                  {l.next_action || "—"}
                </td>
                <td className="px-5 py-3.5 font-mono text-xs" style={{ color: TEXT_MUTED }}>
                  {l.next_action_due ? fmt(l.next_action_due) : "—"}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-sm" style={{ color: TEXT_FAINT }}>
                  No leads yet — create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
