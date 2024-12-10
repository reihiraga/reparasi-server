const allowedOrigins = require("./allowedOrigins");

const corsOptions = {
  origin: (origin, callback) => {
    // jika originnya termasuk whitelist, maka diperbolehkan
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);

      // jika tidak, maka dilarang untuk melakukan request
    } else {
      callback(
        new Error("Not allowed by Cross-Origin Resource Sharing (CORS)")
      );
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
