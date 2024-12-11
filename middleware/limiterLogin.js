const rateLimit = require("express-rate-limit");
const { logEvents } = require("./logger");

const limiterLogin = rateLimit({
  windowMs: 90 * 1000,
  max: 3,
  message: {
    message:
      "Anda sudah mencoba lebih dari 3x, silahkan tunggu beberapa saat lagi sebelum mencoba kembali.",
  },
  handler: (req, res, next, options) => {
    logEvents(
      `Terlalu banyak request! ${options.message.message}\t${req.method}\t${req.url}`,
      "errLog.log"
    );
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = limiterLogin;
