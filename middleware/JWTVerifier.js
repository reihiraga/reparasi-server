const jwt = require("jsonwebtoken");

const JWTVerifier = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "tidak terotorisasi" });
  }

  //  auth header  = 'Bearer accessToken'
  // split => ["Bearer", "accessToken"]
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Forbidden" });

    req.username = decoded.infoUser.username;
    req.roles = decoded.infoUser.roles;
    next();
  });
};

module.exports = JWTVerifier;
