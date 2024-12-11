const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // validasi inputan
  if (!username || !password) {
    return res.status(400).json({ message: "Username/password tidak lengkap" });
  }

  const findUser = await User.findOne({ username }).exec();

  // validasi user ada dan masih active
  if (!findUser || !findUser.active) {
    return res.status(401).json({ message: "Tidak terotorisasi" });
  }

  const match = await bcrypt.compare(password, findUser.password);

  // validasi kecocokan pwd
  if (!match) {
    return res.status(401).json({ message: "Username/password salah" });
  }

  const accessToken = jwt.sign(
    {
      infoUser: {
        username: findUser.username,
        roles: findUser.roles,
        active: findUser.active,
      },
    },
    process.env.SECRET_TOKEN,
    {
      expiresIn: "30m",
    }
  );

  const refreshToken = jwt.sign(
    { username: findUser.username },
    process.env.REFRESH_SECRET_TOKEN,
    { expiresIn: "7d" }
  );

  res.cookie("jwt_sign_in", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
});

const refresh = (req, res) => {
  // extraksi cookie
  const cookie = req.cookies;

  // validasi jwt_sign_in itu ada atau engga dalam cookie
  if (!cookie?.jwt_sign_in) {
    return res.status(401).json({ message: "Tidak terotorisasi" });
  }

  const refreshToken = cookie.jwt_sign_in;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_SECRET_TOKEN,
    asyncHandler(async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });

      const findUser = await User.findOne({
        username: decoded.username,
      }).exec();

      if (!findUser) {
        return res.status(401).json({ message: "Tidak terotorisasi" });
      }

      const accessToken = jwt.sign(
        {
          infoUser: {
            username: findUser.username,
            roles: findUser.roles,
            active: findUser.active,
          },
        },
        process.env.SECRET_TOKEN,
        {
          expiresIn: "30m",
        }
      );

      res.json({ accessToken });
    })
  );
};

const logout = (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.jwt_sign_in) {
    return res.sendStatus(204);
  }

  res.clearCookie("jwt_sign_in", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  res.json({ message: "cookie berhasil dihapus" });
};

module.exports = { login, refresh, logout };
