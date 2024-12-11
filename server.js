require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const { logger, logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConnection");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 8080;

connectDB();

app.use(logger);

app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

app.use("/", express.static(path.join(__dirname, "/public")));

app.use("/", require("./routes/root"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/tickets", require("./routes/ticketRoutes"));

// * --> Wildcard, untuk meng-handle error 404
app.all("*", (req, res) => {
  res.status(404);
  // jika req-nya berasal dari browser atau sejenisnya
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));

    // jika req-nya berasal dari POSTMAN dkk
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });

    // jika req berasal selain dari browser maupun postman
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

// hal yang akan dilakukan jika koneksi DB berhasil, sifatnya sekali
mongoose.connection.once("open", () => {
  console.log("Berhasil konek ke MongoDB");
  app.listen(PORT, () => console.log(`server berjalan pada port ${PORT}`));
});

// error handler jika koneksi DB gagal, sifatnya berulang
mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoDBErrLog.log"
  );
});
