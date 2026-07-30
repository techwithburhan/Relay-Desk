// Attaches req.branchFilter, req.departmentFilter, and req.customerFilter —
// controllers use these to decide how much a request should be restricted:
//   - admin  → no restriction, sees everything
//   - dealer → restricted to their own branch_id AND/OR their department_id
//              (a "Branch Dealer" has a branch, a "Department User" like
//              Accounts/IT has a department — either or both can be set)
//   - client → restricted to their own customer_id (only their own tickets)
//
// Must run AFTER requireAuth, since it reads req.agent set by that middleware.
export function scopeToBranch(req, res, next) {
  const { role, branchId, departmentId, customerId } = req.agent;

  req.branchFilter = null;
  req.departmentFilter = null;
  req.customerFilter = null;

  if (role === 'admin') {
    // no restriction
  } else if (role === 'dealer') {
    if (!branchId && !departmentId) {
      return res.status(403).json({ message: 'This account has no branch or department assigned. Contact your administrator.' });
    }
    req.branchFilter = branchId || null;
    req.departmentFilter = departmentId || null;
  } else if (role === 'client') {
    if (!customerId) {
      return res.status(403).json({ message: 'Client account has no linked customer record.' });
    }
    req.customerFilter = customerId;
  }

  next();
}
