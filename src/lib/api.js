import { supabase } from "./supabaseClient";

// ---------- reads ----------

export async function fetchAccounts() {
  const { data, error } = await supabase.from("accounts").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function fetchContacts() {
  const { data, error } = await supabase.from("contacts").select("*");
  if (error) throw error;
  return data;
}

export async function fetchLeads() {
  const { data, error } = await supabase
    .from("leads")
    .select("*, account:accounts(*), contact:contacts(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchStageHistory() {
  const { data, error } = await supabase
    .from("stage_history")
    .select("*")
    .order("changed_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchLeadHistory(leadId) {
  const { data, error } = await supabase
    .from("stage_history")
    .select("*")
    .eq("lead_id", leadId)
    .order("changed_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchInteractions(leadId) {
  const { data, error } = await supabase
    .from("interactions")
    .select("*")
    .eq("lead_id", leadId)
    .order("occurred_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchAgentTasks(leadId) {
  const { data, error } = await supabase
    .from("agent_tasks")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// ---------- writes ----------

export async function createLead({ accountName, industry, source, contactName, contactRole }) {
  const { data: account, error: accErr } = await supabase
    .from("accounts")
    .insert({ name: accountName, industry: industry || null, source: source || null })
    .select()
    .single();
  if (accErr) throw accErr;

  const { data: contact, error: contactErr } = await supabase
    .from("contacts")
    .insert({ account_id: account.id, name: contactName, role: contactRole || null })
    .select()
    .single();
  if (contactErr) throw contactErr;

  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .insert({
      account_id: account.id,
      contact_id: contact.id,
      stage: "New",
      next_action: "First outreach",
      next_action_due: null,
    })
    .select()
    .single();
  if (leadErr) throw leadErr;

  const { error: histErr } = await supabase
    .from("stage_history")
    .insert({ lead_id: lead.id, from_stage: null, to_stage: "New" });
  if (histErr) throw histErr;

  return lead;
}

export async function changeStage(lead, newStage, lostReason) {
  const patch = { stage: newStage };

  if (newStage === "Lost") {
    patch.pre_lost_stage = lead.stage;
    patch.lost_reason = lostReason || "Not specified";
    patch.closed_at = new Date().toISOString();
  } else if (newStage === "Customer") {
    patch.closed_at = new Date().toISOString();
  }

  const { error: updErr } = await supabase.from("leads").update(patch).eq("id", lead.id);
  if (updErr) throw updErr;

  const { error: histErr } = await supabase
    .from("stage_history")
    .insert({ lead_id: lead.id, from_stage: lead.stage, to_stage: newStage });
  if (histErr) throw histErr;
}

export async function reopenLead(lead) {
  const back = lead.pre_lost_stage || "Contacted";

  const { error: updErr } = await supabase
    .from("leads")
    .update({ stage: back, closed_at: null, lost_reason: null })
    .eq("id", lead.id);
  if (updErr) throw updErr;

  const { error: histErr } = await supabase
    .from("stage_history")
    .insert({ lead_id: lead.id, from_stage: "Lost", to_stage: back });
  if (histErr) throw histErr;
}

export async function addInteraction(leadId, contactId, type, channel, summary) {
  const { data, error } = await supabase
    .from("interactions")
    .insert({
      lead_id: leadId,
      contact_id: contactId || null,
      type,
      channel: channel || null,
      summary,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Research + contact lookup log directly as a "note" interaction. Output is
// mocked for now — this is the seam where real AI calls get wired in later.
export async function runResearchAgent(lead) {
  const summary = `Research brief for ${lead.account.name}${
    lead.account.industry ? ` (${lead.account.industry})` : ""
  }: [PLACEHOLDER — mocked output]. In production this agent would search the web and summarize company size, recent news, and likely priorities.`;
  return addInteraction(lead.id, null, "note", "Agent — research", summary);
}

export async function runContactLookupAgent(lead) {
  const summary = `Contact lookup for ${lead.contact.name}: [PLACEHOLDER — mocked output]. In production this agent would confirm role, LinkedIn, and best contact channel.`;
  return addInteraction(lead.id, lead.contact.id, "note", "Agent — contact lookup", summary);
}

// Draft a message: writes to agent_tasks as pending_approval only. Nothing is
// ever logged as a sent interaction until an explicit Approve action.
export async function generateDraft(lead, goal) {
  const firstName = lead.contact.name.split(" ")[0];
  const output = `Hi ${firstName} — following up on where things stand. ${
    goal || "Wanted to check in and see if now's a good time to continue the conversation."
  } Let me know what works.`;

  const { data, error } = await supabase
    .from("agent_tasks")
    .insert({
      lead_id: lead.id,
      agent_type: "message_draft",
      input: goal || null,
      output,
      status: "pending_approval",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function approveDraft(task, lead) {
  await addInteraction(lead.id, lead.contact_id, "message", "Email", task.output);
  const { error } = await supabase
    .from("agent_tasks")
    .update({ status: "approved" })
    .eq("id", task.id);
  if (error) throw error;
}

export async function discardDraft(task) {
  const { error } = await supabase
    .from("agent_tasks")
    .update({ status: "discarded" })
    .eq("id", task.id);
  if (error) throw error;
}
