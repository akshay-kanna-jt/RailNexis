const express = require("express");
const router = express.Router();

const { getDashboardStats } = require("../controllers/adminController");
const Booking = require("../models/Booking");
const Train = require("../models/Train");

router.get("/stats", getDashboardStats);

router.get("/analytics", async (req, res) => {

  try {

    // 🔥 Total bookings
    const totalBookings =
      await Booking.countDocuments();

    // 🔥 Confirmed
    const confirmedBookings =
      await Booking.countDocuments({
        status: "CONFIRMED"
      });

    // 🔥 RAC
    const racBookings =
      await Booking.countDocuments({
        status: "RAC"
      });

    // 🔥 Waiting
    const waitingBookings =
      await Booking.countDocuments({
        status: "WAITING"
      });

    // 🔥 Cancelled
    const cancelledBookings =
      await Booking.countDocuments({
        status: "CANCELLED"
      });

    // 🔥 Revenue estimate
    const revenue =
      confirmedBookings * 500;
    
    // ======================
// OCCUPANCY
// ======================

const trains =
await Train.find();

const totalSeats =
trains.reduce(
(sum, train) =>
sum + train.totalSeats,
0
);

const availableSeats =
trains.reduce(
(sum, train) =>
sum + train.availableSeats,
0
);

const occupiedSeats =
totalSeats -
availableSeats;

const occupancyPercentage =
totalSeats > 0
? (
(occupiedSeats /
totalSeats) * 100
).toFixed(2)
: 0;

// ======================
// MOST BOOKED TRAIN
// ======================

const trainBookings =
await Booking.aggregate([
{
$group:{
_id:"$train",
count:{ $sum:1 }
}
},
{
$sort:{
count:-1
}
},
{
$limit:1
}
]);

let mostBookedTrain =
"N/A";

if(trainBookings.length > 0){

const train =
await Train.findById(
trainBookings[0]._id
);

if(train){

mostBookedTrain =
train.trainName;

}

}

// ======================
// RECENT BOOKINGS
// ======================

const recentBookings =
await Booking.find()
.populate(
"train",
"trainName"
)
.sort({
createdAt:-1
})
.limit(5);

// ======================
// BOOKING TREND
// ======================

const bookingTrend =
await Booking.aggregate([

{
$match:{
journeyDate:{
$ne:null
}
}
},

{
$group:{
_id:"$journeyDate",
bookings:{
$sum:1
}
}
},

{
$sort:{
_id:1
}
}

]);

    // 🔥 Send response
    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        confirmedBookings,
        racBookings,
        waitingBookings,
        cancelledBookings,
        revenue,
        occupancyPercentage,
        seatUtilization: occupancyPercentage,
        mostBookedTrain,
        recentBookings,
        bookingTrend
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message:
        "Something went wrong",
      error: err.message
    });
  }
});

module.exports = router;