import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  try {
    const { token } = req.cookies;

    // 🔐 Token missing
    if (!token) {
      return res.status(401).json({ message: "Not logged in" });
    }

    // 🔐 Token verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    next();

  } catch (error) {
    // 🔐 Token invalid / expired
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default isAuth;
