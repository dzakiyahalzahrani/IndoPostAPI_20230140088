module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "Unauthorized" });

  const token = auth.split(" ")[1];
  if (token !== "ADMIN123") return res.status(403).json({ message: "Forbidden" });

  next();
};
