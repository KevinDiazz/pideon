export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return next({ status: 403, message: "Acceso denegado" });
    }
    next();
  };
};
