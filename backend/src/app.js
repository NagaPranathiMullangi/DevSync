const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const http = require("http");
require("dotenv").config();

const connectDB = require("./config/database");
const initializeSocket = require("./utils/socket");

const app = express();
// ✅ Serve images from src/uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/payment/webhook", bodyParser.raw({ type: "application/json" }));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routers
app.use("/", require("./routes/auth"));
app.use("/", require("./routes/profile"));
app.use("/", require("./routes/request"));
app.use("/", require("./routes/user"));
app.use("/", require("./routes/payment"));
app.use("/", require("./routes/chat"));
app.use("/",require("./routes/premiumRouter"))

// Server + socket setup
const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    server.listen(process.env.PORT || 7777, () =>
      console.log("✅ Server running on port 7777")
    );
  })
  .catch((err) => console.error("❌ DB Connection Error:", err));
