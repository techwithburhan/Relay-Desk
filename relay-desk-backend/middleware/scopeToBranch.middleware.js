// Attaches req.branchFilter and req.customerFilter — controllers use these
// to decide how much a request should be restricted:
//   - admin  → no restriction, sees everything
//   - dealer → restricted to their own branch_id
//   - client → restricted to their own customer_id (only their own tickets)
//
// Must run AFTER requireAuth, since it reads req.agent set by that middleware.
export function scopeToBranch(req, res, next) {
  const { role, branchId, customerId } = req.agent;

  req.branchFilter = null;
  req.customerFilter = null;

  if (role === 'admin') {
    // no restriction
  } else if (role === 'dealer') {
    if (!branchId) {
      return res.status(403).json({ message: 'Dealer account has no branch assigned.' });
    }
    req.branchFilter = branchId;
  } else if (role === 'client') {
    if (!customerId) {
      return res.status(403).json({ message: 'Client account has no linked customer record.' });
    }
    req.customerFilter = customerId;
  }

  next();
}
