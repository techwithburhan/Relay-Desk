// Matches the backend's tickets.status ENUM exactly:
// 'Open','Assigned','In Progress','Pending','Resolved','Closed','Reopened'
export const STATUS_OPTIONS = ['Open', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed', 'Reopened'];

export const statusClass = {
  Open: 'status-open',
  Assigned: 'status-assigned',
  'In Progress': 'status-progress',
  Pending: 'status-pending',
  Resolved: 'status-resolved',
  Closed: 'status-closed',
  Reopened: 'status-reopened',
};
