const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./config/db");
const User = require("./models/User");
const userRoutes = require("./routes/userRoutes");
const trainRoutes = require("./routes/trainRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const stationRoutes = require("./routes/stationRoutes");
const occupancyRoutes = require("./routes/occupancyRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/trains", trainRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/predict", predictionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/occupancy", occupancyRoutes);
app.use("/api/analytics", analyticsRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("RailNexis Backend Running 🚆");
});

app.get("/create-user", async (req, res) => {

  const user = new User({
    name: "Akshay",
    email: "akshay@test.com",
    password: "123456"
  });

  await user.save();

  res.send("Test user created in MongoDB ✅");

});

// Connect database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});