import React, { useState } from "react";
import { Download } from "lucide-react";
import { fetchAllUserData, downloadAsJSON, downloadAsXLSX } from "../lib/export";
import { BORDER, TEXT_FAINT, TEXT_MUTED } from "../lib/constants";

export default function ExportData() {
  const [busyFormat, setBusyFormat] = useState(null); // "json" | "xlsx" | null
  const [error, setError] = useState(null);

  async function handleExport(format) {
    setBusyFormat(format);
    setError(null);
    try {
      const data = await fetchAllUserData();
      if (format === "json") downloadAsJSON(data);
      else downloadAsXLSX(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyFormat(null);
    }
  }

  return (
    <div className="mb-3">
      <div className="text-[11px] font-medium mb-1.5 flex items-center gap-1.5" style={{ color: TEXT_FAINT }}>
        <Download size={11} /> Export my data
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={() => handleExport("json")}
          disabled={busyFormat !== null}
          className="flex-1 text-xs px-2 py-1.5 rounded-md transition-colors hover:bg-white/[0.03] disabled:opacity-50"
          style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}
        >
          {busyFormat === "json" ? "Exporting…" : "JSON"}
        </button>
        <button
          onClick={() => handleExport("xlsx")}
          disabled={busyFormat !== null}
          className="flex-1 text-xs px-2 py-1.5 rounded-md transition-colors hover:bg-white/[0.03] disabled:opacity-50"
          style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}
        >
          {busyFormat === "xlsx" ? "Exporting…" : "Excel"}
        </button>
      </div>
      {error && (
        <div className="text-[11px] mt-1.5 px-2 py-1.5 rounded-md" style={{ backgroundColor: "#E8674A1a", color: "#E8674A" }}>
          {error}
        </div>
      )}
    </div>
  );
}
