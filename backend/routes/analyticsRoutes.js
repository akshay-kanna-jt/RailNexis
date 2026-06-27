const express = require("express");
const router = express.Router();

const {
  getBookingAnalytics,
  getOccupancyAnalytics,
  getRevenueAnalytics,
  getDemandAnalytics,
  getRouteAnalytics,
  getDashboard
} = require("../controllers/analyticsController");

// ===== PRIORITY 5: ANALYTICS ROUTES =====

// 1️⃣ Booking Analytics Endpoint
// GET /api/analytics/bookings?days=30
router.get("/bookings", getBookingAnalytics);

// 2️⃣ Occupancy Analytics Endpoint
// GET /api/analytics/occupancy
router.get("/occupancy", getOccupancyAnalytics);

// 3️⃣ Revenue Analytics Endpoint
// GET /api/analytics/revenue?days=30
router.get("/revenue", getRevenueAnalytics);

// 4️⃣ Demand Analytics Endpoint
// GET /api/analytics/demand
router.get("/demand", getDemandAnalytics);

// 5️⃣ Route Analytics Endpoint
// GET /api/analytics/routes
router.get("/routes", getRouteAnalytics);

// 6️⃣ Dashboard Endpoint - Comprehensive overview
// GET /api/analytics/dashboard?days=30
router.get("/dashboard", getDashboard);

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    message: "Analytics API is running",
    version: "1.0",
    endpoints: [
      "/analytics/bookings?days=30",
      "/analytics/occupancy",
      "/analytics/revenue?days=30",
      "/analytics/demand",
      "/analytics/routes",
      "/analytics/dashboard?days=30"
    ]
  });
});

module.exports = router;
