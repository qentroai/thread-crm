import * as XLSX from "xlsx";
import { supabase } from "./supabaseClient";

// RLS scopes every one of these queries to the logged-in user already —
// no owner_id filtering needed client-side.
const EXPORT_TABLES = [
  { key: "accounts", table: "accounts", sheetName: "Accounts" },
  { key: "contacts", table: "contacts", sheetName: "Contacts" },
  { key: "leads", table: "leads", sheetName: "Leads" },
  { key: "stage_history", table: "stage_history", sheetName: "Stage History" },
  { key: "interactions", table: "interactions", sheetName: "Interactions" },
  { key: "agent_tasks", table: "agent_tasks", sheetName: "Agent Tasks" },
];

export async function fetchAllUserData() {
  const results = await Promise.all(
    EXPORT_TABLES.map(({ table }) => supabase.from(table).select("*"))
  );

  const data = {};
  results.forEach(({ data: rows, error }, i) => {
    if (error) throw error;
    data[EXPORT_TABLES[i].key] = rows;
  });
  return data;
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadAsJSON(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  triggerDownload(blob, `thread-crm-export-${dateStamp()}.json`);
}

export function downloadAsXLSX(data) {
  const workbook = XLSX.utils.book_new();
  EXPORT_TABLES.forEach(({ key, sheetName }) => {
    const sheet = XLSX.utils.json_to_sheet(data[key] || []);
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  });
  XLSX.writeFile(workbook, `thread-crm-export-${dateStamp()}.xlsx`);
}
