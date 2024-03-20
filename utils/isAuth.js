import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// middleware to check if user is authenticated
async function isAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    req.user = user;
    console.log("User", req.user);
    next();
  });
}
export default isAuth;
