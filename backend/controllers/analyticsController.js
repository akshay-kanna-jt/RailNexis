const Booking = require("../models/Booking");
const Train = require("../models/Train");
const Station = require("../models/Station");

// ===== PRIORITY 5: ANALYTICS APIS =====

// 1️⃣ BOOKING ANALYTICS - Get overall booking statistics
const getBookingAnalytics = async (req, res) => {
  try {
    // Get date range from query params (default: last 30 days)
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // STEP 1: Total bookings count by status
    const bookingStats = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // STEP 2: Convert to readable format
    const statsByStatus = {};
    let totalBookings = 0;

    bookingStats.forEach(stat => {
      statsByStatus[stat._id] = stat.count;
      totalBookings += stat.count;
    });

    // STEP 3: Calculate conversion rate (CONFIRMED / Total)
    const confirmedBookings = statsByStatus["CONFIRMED"] || 0;
    const conversionRate = totalBookings > 0 ? ((confirmedBookings / totalBookings) * 100).toFixed(2) : 0;

    // STEP 4: RAC to CONFIRMED upgrade count
    const racUpgrades = await Booking.countDocuments({
      status: "CONFIRMED",
      racPosition: { $ne: null },
      createdAt: { $gte: startDate }
    });

    // STEP 5: WL to RAC/CONFIRMED conversion
    const wlConversions = await Booking.countDocuments({
      status: { $in: ["CONFIRMED", "RAC"] },
      waitingPosition: { $ne: null },
      createdAt: { $gte: startDate }
    });

    console.log("📊 BOOKING ANALYTICS RETRIEVED", {
      totalBookings,
      conversionRate,
      statsByStatus
    });

    res.status(200).json({
      message: "Booking analytics retrieved successfully",
      analytics: {
        period: `Last ${days} days`,
        totalBookings,
        byStatus: {
          CONFIRMED: statsByStatus["CONFIRMED"] || 0,
          RAC: statsByStatus["RAC"] || 0,
          WAITING: statsByStatus["WAITING"] || 0,
          CANCELLED: statsByStatus["CANCELLED"] || 0
        },
        conversionRate: `${conversionRate}%`,
        racUpgrades,
        wlConversions,
        metrics: {
          racConversionRate: totalBookings > 0 ? ((racUpgrades / totalBookings) * 100).toFixed(2) : 0,
          wlConversionRate: totalBookings > 0 ? ((wlConversions / totalBookings) * 100).toFixed(2) : 0
        }
      }
    });

  } catch (error) {
    console.error("BOOKING ANALYTICS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// 2️⃣ OCCUPANCY ANALYTICS - Get seat availability and occupancy rates
const getOccupancyAnalytics = async (req, res) => {
  try {
    // STEP 1: Get all trains with their coaches
    const trains = await Train.find({}).select("trainName totalSeats availableSeats coaches");

    // STEP 2: For each train, calculate occupancy by class
    const occupancyData = [];

    for (let train of trains) {
      const trainBookings = await Booking.countDocuments({
        train: train._id,
        status: "CONFIRMED"
      });

      const classOccupancy = {};
      let totalOccupancy = 0;

      if (train.coaches && train.coaches.length > 0) {
        // Group coaches by class and calculate occupancy
        const classCounts = {};

        train.coaches.forEach(coach => {
          if (!classCounts[coach.classType]) {
            classCounts[coach.classType] = {
              totalSeats: 0,
              occupiedSeats: 0
            };
          }
          classCounts[coach.classType].totalSeats += coach.totalSeats;
          classCounts[coach.classType].occupiedSeats += coach.totalSeats - coach.availableSeats;
        });

        // Calculate occupancy percentage per class
        Object.keys(classCounts).forEach(className => {
          const classData = classCounts[className];
          const occupancyPercent = classData.totalSeats > 0 
            ? ((classData.occupiedSeats / classData.totalSeats) * 100).toFixed(2)
            : 0;

          classOccupancy[className] = {
            totalSeats: classData.totalSeats,
            occupiedSeats: classData.occupiedSeats,
            availableSeats: classData.totalSeats - classData.occupiedSeats,
            occupancyPercent: `${occupancyPercent}%`
          };

          totalOccupancy += classData.occupiedSeats;
        });
      }

      const overallOccupancyPercent = train.totalSeats > 0
        ? ((totalOccupancy / train.totalSeats) * 100).toFixed(2)
        : 0;

      occupancyData.push({
        trainName: train.trainName,
        trainId: train._id,
        totalSeats: train.totalSeats,
        occupiedSeats: totalOccupancy,
        availableSeats: train.availableSeats,
        overallOccupancyPercent: `${overallOccupancyPercent}%`,
        byClass: classOccupancy
      });
    }

    console.log("📊 OCCUPANCY ANALYTICS RETRIEVED", {
      trainsAnalyzed: occupancyData.length
    });

    res.status(200).json({
      message: "Occupancy analytics retrieved successfully",
      analytics: {
        totalTrainsAnalyzed: occupancyData.length,
        trains: occupancyData
      }
    });

  } catch (error) {
    console.error("OCCUPANCY ANALYTICS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// 3️⃣ REVENUE ANALYTICS - Get revenue metrics
const getRevenueAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // STEP 1: Count confirmed bookings (assuming each booking is one full ticket)
    const confirmedBookings = await Booking.find({
      status: "CONFIRMED",
      createdAt: { $gte: startDate }
    }).select("passengers travelClass");

    // STEP 2: Calculate revenue by class (assuming pricing structure)
    const classPrice = {
      "SL": 500,    // Sleeper
      "3A": 1000,   // AC 3-Tier
      "2A": 1500    // AC 2-Tier
    };

    let totalRevenue = 0;
    const revenueByClass = {};

    confirmedBookings.forEach(booking => {
      const passengerCount = booking.passengers ? booking.passengers.length : 0;
      const classPrice_val = classPrice[booking.travelClass] || 500;
      const bookingRevenue = passengerCount * classPrice_val;

      totalRevenue += bookingRevenue;

      if (!revenueByClass[booking.travelClass]) {
        revenueByClass[booking.travelClass] = {
          bookings: 0,
          totalRevenue: 0,
          avgPassengersPerBooking: 0
        };
      }

      revenueByClass[booking.travelClass].bookings += 1;
      revenueByClass[booking.travelClass].totalRevenue += bookingRevenue;
    });

    // STEP 3: Calculate revenue lost due to cancellations
    const cancelledBookings = await Booking.find({
      status: "CANCELLED",
      createdAt: { $gte: startDate }
    }).select("passengers travelClass");

    let lostRevenue = 0;

    cancelledBookings.forEach(booking => {
      const passengerCount = booking.passengers ? booking.passengers.length : 0;
      const classPrice_val = classPrice[booking.travelClass] || 500;
      lostRevenue += passengerCount * classPrice_val;
    });

    // STEP 4: Average revenue per booking
    const avgRevenuePerBooking = confirmedBookings.length > 0 
      ? (totalRevenue / confirmedBookings.length).toFixed(2)
      : 0;

    console.log("💰 REVENUE ANALYTICS RETRIEVED", {
      totalRevenue,
      lostRevenue,
      confirmedBookings: confirmedBookings.length
    });

    res.status(200).json({
      message: "Revenue analytics retrieved successfully",
      analytics: {
        period: `Last ${days} days`,
        totalRevenue: `₹${totalRevenue}`,
        lostRevenueDueToCancellations: `₹${lostRevenue}`,
        confirmedBookings: confirmedBookings.length,
        cancelledBookings: cancelledBookings.length,
        avgRevenuePerBooking: `₹${avgRevenuePerBooking}`,
        byClass: revenueByClass,
        potentialRevenue: `₹${totalRevenue + lostRevenue}`
      }
    });

  } catch (error) {
    console.error("REVENUE ANALYTICS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// 4️⃣ DEMAND ANALYTICS - Get peak hours, peak days, demand trends
const getDemandAnalytics = async (req, res) => {
  try {
    // STEP 1: Peak hours analysis
    const peakHours = await Booking.aggregate([
      {
        $group: {
          _id: { $hour: "$createdAt" },
          bookings: { $sum: 1 }
        }
      },
      {
        $sort: { bookings: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // STEP 2: Peak days analysis
    const peakDays = await Booking.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          bookings: { $sum: 1 }
        }
      },
      {
        $sort: { bookings: -1 }
      }
    ]);

    // Convert day numbers to names
    const dayNames = ["", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const peakDaysFormatted = peakDays.map(day => ({
      day: dayNames[day._id],
      bookings: day.bookings
    }));

    // STEP 3: Class-wise demand
    const classDemand = await Booking.aggregate([
      {
        $group: {
          _id: "$travelClass",
          bookings: { $sum: 1 },
          passengers: { $sum: { $size: "$passengers" } }
        }
      },
      {
        $sort: { bookings: -1 }
      }
    ]);

    // STEP 4: Daily booking trend (last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const dailyTrend = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          bookings: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    console.log("📈 DEMAND ANALYTICS RETRIEVED", {
      peakHours: peakHours.length,
      peakDays: peakDaysFormatted.length
    });

    res.status(200).json({
      message: "Demand analytics retrieved successfully",
      analytics: {
        peakHours: peakHours.map(h => ({
          hour: `${h._id}:00 - ${h._id}:59`,
          bookings: h.bookings
        })),
        peakDays: peakDaysFormatted,
        classDemand: classDemand,
        dailyTrend: dailyTrend,
        insights: {
          highestDemandDay: peakDaysFormatted[0] ? peakDaysFormatted[0].day : "N/A",
          mostPopularClass: classDemand[0] ? classDemand[0]._id : "N/A",
          totalDemandLast7Days: dailyTrend.reduce((sum, d) => sum + d.bookings, 0)
        }
      }
    });

  } catch (error) {
    console.error("DEMAND ANALYTICS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// 5️⃣ ROUTE ANALYTICS - Get performance by route
const getRouteAnalytics = async (req, res) => {
  try {
    // STEP 1: Get all unique routes (fromStation -> toStation)
    const routes = await Booking.aggregate([
      {
        $group: {
          _id: {
            from: "$fromStation",
            to: "$toStation"
          },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "CONFIRMED"] }, 1, 0] }
          },
          racBookings: {
            $sum: { $cond: [{ $eq: ["$status", "RAC"] }, 1, 0] }
          },
          waitingBookings: {
            $sum: { $cond: [{ $eq: ["$status", "WAITING"] }, 1, 0] }
          },
          totalBookings: { $sum: 1 },
          totalPassengers: { $sum: { $size: "$passengers" } }
        }
      },
      {
        $sort: { totalBookings: -1 }
      }
    ]);

    // STEP 2: Populate station names
    const enrichedRoutes = [];

    for (let route of routes) {
      const fromStation = await Station.findById(route._id.from);
      const toStation = await Station.findById(route._id.to);

      const loadFactor = route.totalPassengers > 0 ? (route.confirmedBookings / route.totalPassengers * 100).toFixed(2) : 0;

      enrichedRoutes.push({
        from: fromStation ? fromStation.name : "Unknown",
        to: toStation ? toStation.name : "Unknown",
        confirmedBookings: route.confirmedBookings,
        racBookings: route.racBookings,
        waitingBookings: route.waitingBookings,
        totalBookings: route.totalBookings,
        totalPassengers: route.totalPassengers,
        loadFactor: `${loadFactor}%`,
        occupancyRate: route.totalPassengers > 0 ? ((route.confirmedBookings / route.totalPassengers) * 100).toFixed(2) : 0
      });
    }

    // STEP 3: Top 10 most popular routes
    const topRoutes = enrichedRoutes.slice(0, 10);

    console.log("🛤️ ROUTE ANALYTICS RETRIEVED", {
      totalRoutesAnalyzed: enrichedRoutes.length,
      topRoutesCount: topRoutes.length
    });

    res.status(200).json({
      message: "Route analytics retrieved successfully",
      analytics: {
        totalRoutesAnalyzed: enrichedRoutes.length,
        allRoutes: enrichedRoutes,
        topRoutes: topRoutes,
        metrics: {
          totalRouteBookings: enrichedRoutes.reduce((sum, r) => sum + r.totalBookings, 0),
          totalRoutePassengers: enrichedRoutes.reduce((sum, r) => sum + r.totalPassengers, 0)
        }
      }
    });

  } catch (error) {
    console.error("ROUTE ANALYTICS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// 6️⃣ DASHBOARD - Comprehensive overview combining all analytics
const getDashboard = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all analytics data in parallel
    const [bookingStats, occupancyStats, topRoutes] = await Promise.all([
      Booking.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Train.aggregate([
        {
          $group: {
            _id: null,
            totalTrainSeats: { $sum: "$totalSeats" },
            totalAvailableSeats: { $sum: "$availableSeats" }
          }
        }
      ]),
      Booking.aggregate([
        {
          $group: {
            _id: { from: "$fromStation", to: "$toStation" },
            bookings: { $sum: 1 }
          }
        },
        { $sort: { bookings: -1 } },
        { $limit: 5 }
      ])
    ]);

    // Calculate key metrics
    const statsByStatus = {};
    let totalBookings = 0;
    bookingStats.forEach(s => {
      statsByStatus[s._id] = s.count;
      totalBookings += s.count;
    });

    const occupancy = occupancyStats[0] || {};
    const occupancyRate = occupancy.totalTrainSeats > 0
      ? (((occupancy.totalTrainSeats - occupancy.totalAvailableSeats) / occupancy.totalTrainSeats) * 100).toFixed(2)
      : 0;

    console.log("📊 DASHBOARD DATA RETRIEVED", {
      totalBookings,
      occupancyRate
    });

    res.status(200).json({
      message: "Dashboard retrieved successfully",
      dashboard: {
        period: `Last ${days} days`,
        keMetrics: {
          totalBookings,
          confirmedBookings: statsByStatus["CONFIRMED"] || 0,
          racBookings: statsByStatus["RAC"] || 0,
          waitingBookings: statsByStatus["WAITING"] || 0,
          cancelledBookings: statsByStatus["CANCELLED"] || 0,
          conversionRate: totalBookings > 0 ? (((statsByStatus["CONFIRMED"] || 0) / totalBookings) * 100).toFixed(2) : 0
        },
        occupancy: {
          totalTrainSeats: occupancy.totalTrainSeats || 0,
          occupiedSeats: (occupancy.totalTrainSeats || 0) - (occupancy.totalAvailableSeats || 0),
          availableSeats: occupancy.totalAvailableSeats || 0,
          occupancyRate: `${occupancyRate}%`
        },
        topRoutes: topRoutes.length,
        status: "Active"
      }
    });

  } catch (error) {
    console.error("DASHBOARD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBookingAnalytics,
  getOccupancyAnalytics,
  getRevenueAnalytics,
  getDemandAnalytics,
  getRouteAnalytics,
  getDashboard
};
