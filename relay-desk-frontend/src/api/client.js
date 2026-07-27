const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.code = data.code;
    err.status = res.status;
    throw err;
  }
  return data;
}

// ---------- Auth ----------
export function login(email, password) {
  return request('/auth/login', { method: 'POST', body: { email, password } });
}
export function logout(token) {
  return request('/auth/logout', { method: 'POST', token });
}
export function getMe(token) {
  return request('/auth/me', { token });
}
export function forgotPassword(email) {
  return request('/auth/forgot-password', { method: 'POST', body: { email } });
}
export function resetPassword(resetToken, password) {
  return request('/auth/reset-password', { method: 'POST', body: { token: resetToken, password } });
}

// ---------- Tickets ----------
export function getTickets(token, params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(`/tickets${qs ? `?${qs}` : ''}`, { token });
}
export function getTicket(token, ticketNumber) {
  return request(`/tickets/${ticketNumber}`, { token });
}
export function updateTicketStatus(token, ticketNumber, updates) {
  return request(`/tickets/${ticketNumber}`, { method: 'PATCH', token, body: updates });
}
export function createTicket(token, payload) {
  return request('/tickets', { method: 'POST', token, body: payload });
}
export function deleteTicket(token, ticketNumber) {
  return request(`/tickets/${ticketNumber}`, { method: 'DELETE', token });
}

// ---------- Customers / Agents ----------
export function getCustomers(token) {
  return request('/customers', { token });
}
export function getAgentWorkload(token) {
  return request('/agents/workload', { token });
}

// ---------- Reports ----------
export function getStats(token) {
  return request('/reports/stats', { token });
}
export function getPriorityVolume(token) {
  return request('/reports/priority-volume', { token });
}
export function getTicketsByBranch(token) {
  return request('/reports/tickets-by-branch', { token });
}
export function getTrend(token) {
  return request('/reports/trend', { token });
}

// ---------- Knowledge Base ----------
export function getArticles(token) {
  return request('/knowledge-base', { token });
}
export function getArticle(token, id) {
  return request(`/knowledge-base/${id}`, { token });
}
export function createArticle(token, payload) {
  return request('/knowledge-base', { method: 'POST', token, body: payload });
}
export function updateArticle(token, id, payload) {
  return request(`/knowledge-base/${id}`, { method: 'PUT', token, body: payload });
}
export function deleteArticle(token, id) {
  return request(`/knowledge-base/${id}`, { method: 'DELETE', token });
}

// ---------- Users / Agents (full admin management) ----------
export function getAgents(token) {
  return request('/agents', { token });
}
export function createAgent(token, payload) {
  return request('/agents', { method: 'POST', token, body: payload });
}
export function updateAgent(token, id, payload) {
  return request(`/agents/${id}`, { method: 'PUT', token, body: payload });
}
export function setStatusPermission(token, id, canChangeStatus) {
  return request(`/agents/${id}/status-permission`, { method: 'PATCH', token, body: { canChangeStatus } });
}
export function deleteAgent(token, id) {
  return request(`/agents/${id}`, { method: 'DELETE', token });
}
export function getDealers(token) {
  return request('/agents/dealers', { token });
}
export function createDealer(token, payload) {
  return request('/agents/dealers', { method: 'POST', token, body: payload });
}
export function setDealerAccess(token, id, active) {
  return request(`/agents/${id}/access`, { method: 'PATCH', token, body: { active } });
}
export function resetAgentPassword(token, id) {
  return request(`/agents/${id}/reset-password`, { method: 'POST', token });
}

// ---------- Downloads ----------
export function getDownloads(token) {
  return request('/downloads', { token });
}
export function getAllDownloadsAdmin(token) {
  return request('/downloads/admin', { token });
}
export function createDownload(token, payload) {
  return request('/downloads', { method: 'POST', token, body: payload });
}
export function updateDownload(token, id, payload) {
  return request(`/downloads/${id}`, { method: 'PUT', token, body: payload });
}
export function deleteDownload(token, id) {
  return request(`/downloads/${id}`, { method: 'DELETE', token });
}

// ---------- Login slides ----------
export function getSlides() {
  return request('/slides');
}
export function getAllSlidesAdmin(token) {
  return request('/slides/admin', { token });
}
export function createSlide(token, payload) {
  return request('/slides', { method: 'POST', token, body: payload });
}
export function updateSlide(token, id, payload) {
  return request(`/slides/${id}`, { method: 'PUT', token, body: payload });
}
export function deleteSlide(token, id) {
  return request(`/slides/${id}`, { method: 'DELETE', token });
}
export function reorderSlides(token, order) {
  return request('/slides/reorder', { method: 'PUT', token, body: { order } });
}

// ---------- License ----------
export function getLicenseStatus() {
  return request('/license/status');
}
export function activateLicense(licenseKey) {
  return request('/license/activate', { method: 'POST', body: { licenseKey } });
}
export function getLicenses(token) {
  return request('/license', { token });
}
export function generateLicense(token, validityDays = 30) {
  return request('/license/generate', { method: 'POST', token, body: { validityDays } });
}
export function revokeLicense(token, id) {
  return request(`/license/${id}/revoke`, { method: 'POST', token });
}

// ---------- Access logs ----------
export function getLogs(token, params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(`/logs${qs ? `?${qs}` : ''}`, { token });
}
export function deleteLog(token, id) {
  return request(`/logs/${id}`, { method: 'DELETE', token });
}
export function deleteLogs(token, ids) {
  return request('/logs', { method: 'DELETE', token, body: { ids } });
}
export function deleteAllLogs(token) {
  return request('/logs/all', { method: 'DELETE', token });
}

// ---------- Departments ----------
export function getDepartments(token) {
  return request('/departments', { token });
}

// ---------- Branches ----------
export function getBranches(token) {
  return request('/branches', { token });
}
export function createBranch(token, payload) {
  return request('/branches', { method: 'POST', token, body: payload });
}
export function updateBranch(token, id, payload) {
  return request(`/branches/${id}`, { method: 'PUT', token, body: payload });
}
export function deleteBranch(token, id) {
  return request(`/branches/${id}`, { method: 'DELETE', token });
}

// ---------- Ticket Transfers ----------
export function requestTicketTransfer(token, ticketNumber, toDepartmentId) {
  return request(`/tickets/${ticketNumber}/transfer`, { method: 'POST', token, body: { toDepartmentId } });
}
export function getPendingTransfers(token) {
  return request('/transfers/pending', { token });
}
export function acceptTransfer(token, id) {
  return request(`/transfers/${id}/accept`, { method: 'POST', token });
}
export function rejectTransfer(token, id) {
  return request(`/transfers/${id}/reject`, { method: 'POST', token });
}

// ---------- Settings ----------
export function getSettings(token) {
  return request('/settings', { token });
}
export function updateSettings(token, updates) {
  return request('/settings', { method: 'PUT', token, body: updates });
}
