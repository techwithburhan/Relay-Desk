// Shared sample ticket data.
// Note: `id` is stored WITHOUT the leading "#" so it's safe to use directly
// in a URL (e.g. /tickets/T-98051). Display it with a "#" prefix in the UI.

const tickets = [
  {
    id: 'T-98051',
    subject: 'Login issue after password reset',
    requester: 'Alex R.',
    priority: 'High',
    status: 'In Progress',
    assigned: 'John D.',
    created: '10 min ago',
    createdAt: 'Jul 13, 2026 · 11:42 AM',
    updatedAt: 'Jul 13, 2026 · 11:58 AM',
    description: 'Customer reset their password via the email link but is now stuck on the login screen with a "session expired" error on every attempt.',
    comments: [
      { author: 'Alex R.', time: '11:42 AM', text: 'I reset my password like the email said, but I still can\'t log in. It just says "session expired" every time.' },
      { author: 'John D.', time: '11:50 AM', text: 'Thanks for flagging this — checking your account now, can you tell me which browser you\'re using?' },
      { author: 'Alex R.', time: '11:58 AM', text: 'Using Chrome on Windows, same issue on incognito mode too.' },
    ],
  },
  {
    id: 'T-98050',
    subject: 'Feature request — dark mode',
    requester: 'Sarah T.',
    priority: 'Medium',
    status: 'Open',
    assigned: 'Unassigned',
    created: '1 hr ago',
    createdAt: 'Jul 13, 2026 · 10:55 AM',
    updatedAt: 'Jul 13, 2026 · 10:55 AM',
    description: 'Customer is requesting a dark mode option for the dashboard, citing eye strain during long night shifts.',
    comments: [
      { author: 'Sarah T.', time: '10:55 AM', text: 'Would love a dark mode option — our team works night shifts and the bright screen is rough after a while.' },
    ],
  },
  {
    id: 'T-98049',
    subject: 'Billing error on renewal invoice',
    requester: 'Maria G.',
    priority: 'Urgent',
    status: 'Resolved',
    assigned: 'Lisa M.',
    created: '3 hrs ago',
    createdAt: 'Jul 13, 2026 · 8:40 AM',
    updatedAt: 'Jul 13, 2026 · 11:20 AM',
    description: 'Customer was charged twice for their annual renewal. Needs a refund for the duplicate charge.',
    comments: [
      { author: 'Maria G.', time: '8:40 AM', text: 'I was charged twice on my card for the annual renewal, can someone look into this?' },
      { author: 'Lisa M.', time: '9:10 AM', text: 'Sorry about that! I can see the duplicate charge — processing a refund now.' },
      { author: 'Lisa M.', time: '11:20 AM', text: 'Refund has been issued, should reflect on your statement in 3-5 business days.' },
    ],
  },
  {
    id: 'T-98048',
    subject: 'Data export stuck at 90%',
    requester: 'Devon K.',
    priority: 'Urgent',
    status: 'Resolved',
    assigned: 'Oihn D.',
    created: '14 min ago',
    createdAt: 'Jul 13, 2026 · 11:38 AM',
    updatedAt: 'Jul 13, 2026 · 11:50 AM',
    description: 'Large CSV export job repeatedly stalls at 90% completion, requiring a manual retry.',
    comments: [
      { author: 'Devon K.', time: '11:38 AM', text: 'My export job keeps freezing at 90%, tried 3 times now.' },
      { author: 'Oihn D.', time: '11:50 AM', text: 'Found the issue — a timeout on large exports. Re-ran it manually and your file is ready to download.' },
    ],
  },
  {
    id: 'T-98047',
    subject: 'Feature request — bulk tagging',
    requester: 'Alex R.',
    priority: 'Medium',
    status: 'In Progress',
    assigned: 'Unassigned',
    created: '18 min ago',
    createdAt: 'Jul 13, 2026 · 11:34 AM',
    updatedAt: 'Jul 13, 2026 · 11:34 AM',
    description: 'Customer wants the ability to apply tags to multiple tickets at once instead of one at a time.',
    comments: [
      { author: 'Alex R.', time: '11:34 AM', text: 'Tagging tickets one by one is slow — any chance of a bulk tag option?' },
    ],
  },
  {
    id: 'T-98046',
    subject: 'Cannot upload attachments',
    requester: 'Priya N.',
    priority: 'High',
    status: 'Open',
    assigned: 'John D.',
    created: '22 min ago',
    createdAt: 'Jul 13, 2026 · 11:30 AM',
    updatedAt: 'Jul 13, 2026 · 11:30 AM',
    description: 'File attachments over 5MB fail silently when uploaded through the ticket reply box.',
    comments: [
      { author: 'Priya N.', time: '11:30 AM', text: 'Tried attaching a screenshot to my reply and it just doesn\'t upload, no error either.' },
    ],
  },
  {
    id: 'T-98045',
    subject: 'API rate limit clarification',
    requester: 'Devon K.',
    priority: 'Low',
    status: 'Resolved',
    assigned: 'Lisa M.',
    created: '1 hr ago',
    createdAt: 'Jul 13, 2026 · 10:20 AM',
    updatedAt: 'Jul 13, 2026 · 10:45 AM',
    description: 'Customer asked for clarification on the current API rate limit tier for their plan.',
    comments: [
      { author: 'Devon K.', time: '10:20 AM', text: 'What\'s the current API rate limit on the Pro plan?' },
      { author: 'Lisa M.', time: '10:45 AM', text: 'Pro plan is capped at 600 requests/minute — let me know if you need it raised.' },
    ],
  },
  {
    id: 'T-98044',
    subject: 'Mobile app crashes on launch',
    requester: 'Sarah T.',
    priority: 'Urgent',
    status: 'In Progress',
    assigned: 'Mike P.',
    created: '2 hrs ago',
    createdAt: 'Jul 13, 2026 · 9:50 AM',
    updatedAt: 'Jul 13, 2026 · 11:05 AM',
    description: 'App crashes immediately on launch for some Android users after the latest update.',
    comments: [
      { author: 'Sarah T.', time: '9:50 AM', text: 'App crashes the second I open it since updating this morning.' },
      { author: 'Mike P.', time: '11:05 AM', text: 'Reproduced on our end, looks like an Android-only regression. Fix is in progress.' },
    ],
  },
];

export default tickets;

export function getTicketById(id) {
  return tickets.find((t) => t.id === id);
}
