export const workspaceLinks = [
  {
    to: '/dashboard',
    label: 'Overview',
    end: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </svg>
    ),
  },
  {
    to: '/tickets',
    label: 'Tickets',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18" />
      </svg>
    ),
  },
  {
    to: '/customers',
    label: 'Customers',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="8" r="3.2" />
        <path d="M2.5 20c1-3.6 3.7-5.5 6.5-5.5s5.5 1.9 6.5 5.5" />
        <circle cx="17.5" cy="8.5" r="2.4" />
        <path d="M15.8 14.8c2 .3 3.7 1.9 4.4 4.6" />
      </svg>
    ),
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19V5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
        <path d="M9 13h6M9 17h6M9 9h2" />
      </svg>
    ),
  },
  {
    to: '/knowledge-base',
    label: 'Knowledge Base',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
        <path d="M3 12l9 4.5 9-4.5M3 16.5 12 21l9-4.5" />
      </svg>
    ),
  },
  {
    to: '/downloads',
    label: 'Downloads',
    roles: ['admin', 'dealer', 'client'], // point 9/10: Software Download visible to dealer + client (admin too, for management)
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      </svg>
    ),
  },
  {
    to: '/transfers',
    label: 'Pending Transfers',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 16V4M7 4l-3 3M7 4l3 3M17 8v12M17 20l3-3M17 20l-3-3" />
      </svg>
    ),
  },
];

// Some workspace links only make sense for certain roles (e.g. a "client"
// login shouldn't see the internal Customers directory). If a link has no
// `roles` array, it's shown to everyone.
export function visibleWorkspaceLinks(role) {
  return workspaceLinks.filter((link) => {
    if (link.to === '/customers' || link.to === '/reports' || link.to === '/transfers') {
      return role === 'admin' || role === 'dealer';
    }
    if (!link.roles) return true;
    return link.roles.includes(role);
  });
}

export const adminLinks = [
  {
    to: '/admin/downloads',
    label: 'Downloads Management',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      </svg>
    ),
  },
  {
    to: '/admin/slides',
    label: 'Login Slider',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 15 5-5 4 4 5-6 4 4" />
      </svg>
    ),
  },
  {
    to: '/admin/license',
    label: 'License Management',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 9h18M8 15h4" />
      </svg>
    ),
  },
  {
    to: '/admin/dealers',
    label: 'Dealer Mapping',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="8" r="3.2" />
        <path d="M2.5 20c1-3.6 3.7-5.5 6.5-5.5s5.5 1.9 6.5 5.5" />
        <path d="M17 8h4M19 6v4" />
      </svg>
    ),
  },
  {
    to: '/admin/users',
    label: 'User Management',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c1.5-4.5 5-6.5 8-6.5s6.5 2 8 6.5" />
      </svg>
    ),
  },
  {
    to: '/admin/branches',
    label: 'Branch Management',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M15 9h.01M15 13h.01" />
      </svg>
    ),
  },
  {
    to: '/logs',
    label: 'Access Logs',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
];

export const systemLinks = [
  {
    to: '/settings',
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1Z" />
      </svg>
    ),
  },
];
