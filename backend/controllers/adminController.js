const User = require("../models/User");
const Train = require("../models/Train");
const Booking = require("../models/Booking");

const getDashboardStats = async (req, res) => {

  try {

    const totalUsers = await User.countDocuments();
    const totalTrains = await Train.countDocuments();
    const totalBookings = await Booking.countDocuments();

    res.json({
      totalUsers,
      totalTrains,
      totalBookings
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

module.exports = { getDashboardStats };