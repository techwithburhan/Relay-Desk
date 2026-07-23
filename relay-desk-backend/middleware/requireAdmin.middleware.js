// Blocks non-admins. Must run AFTER requireAuth.
export function requireAdmin(req, res, next) {
  if (req.agent?.role !== 'admin') {
    return res.status(403).json({ message: 'Only an admin can perform this action.' });
  }
  next();
}
