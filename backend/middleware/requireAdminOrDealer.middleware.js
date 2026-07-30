// Blocks the 'client' role. Must run AFTER requireAuth.
// Used for actions both Admin and Dealer should be able to do
// (e.g. changing ticket status/remark), but a Client should not.
export function requireAdminOrDealer(req, res, next) {
  if (req.agent?.role === 'client') {
    return res.status(403).json({ message: 'Only an admin or dealer can perform this action.' });
  }
  next();
}
