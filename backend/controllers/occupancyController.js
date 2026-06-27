const Booking = require("../models/Booking");
const Train = require("../models/Train");

const getOccupancyData = async (req, res) => {
  try {

    // =========================
    // SUMMARY
    // =========================

    const trains = await Train.find();

    const totalSeats = trains.reduce(
      (sum, train) => sum + train.totalSeats,
      0
    );

    const availableSeats = trains.reduce(
      (sum, train) => sum + train.availableSeats,
      0
    );

    const occupiedSeats =
      totalSeats - availableSeats;

    const occupancyPercentage =
      totalSeats > 0
        ? ((occupiedSeats / totalSeats) * 100).toFixed(2)
        : 0;

    const confirmedCount =
      await Booking.countDocuments({
        status: "CONFIRMED"
      });

    const racCount =
      await Booking.countDocuments({
        status: { $regex: "RAC" }
      });

    const waitingCount =
      await Booking.countDocuments({
        status: { $regex: "WL|WAITING" }
      });

    const cancelledCount =
      await Booking.countDocuments({
        status: "CANCELLED"
      });

    // =========================
    // TRAIN WISE
    // =========================

    const trainWise = trains.map((train) => {

      const occupied =
        train.totalSeats -
        train.availableSeats;

      return {

        trainName:
          train.trainName,

        trainNumber:
          train.trainNumber,

        totalSeats:
          train.totalSeats,

        occupiedSeats:
          occupied,

        availableSeats:
          train.availableSeats,

        occupancyPercentage:
          train.totalSeats > 0
            ? (
                (occupied /
                  train.totalSeats) *
                100
              ).toFixed(2)
            : 0

      };

    });

    // =========================
    // DATE WISE
    // =========================

    const dateWise =
      await Booking.aggregate([
        {
          $group: {
            _id: "$journeyDate",
            bookings: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            _id: 1
          }
        }
      ]);

    // =========================
    // ROUTE WISE
    // =========================

    const routeBookings =
      await Booking.find()
        .populate(
          "fromStation",
          "name"
        )
        .populate(
          "toStation",
          "name"
        );

    const routeMap = {};

    routeBookings.forEach(
      (booking) => {

        const routeKey =
          `${booking.fromStation?.name}
           → 
           ${booking.toStation?.name}`;

        if (!routeMap[routeKey]) {

          routeMap[routeKey] = 0;

        }

        routeMap[routeKey]++;

      }
    );

    const routeWise =
      Object.entries(routeMap).map(
        ([route, count]) => ({
          route,
          bookings: count
        })
      );

    // =========================
    // COACH WISE
    // =========================

    const coachMap = {};

    routeBookings.forEach(
      (booking) => {

        booking.passengers.forEach(
          (passenger) => {

            const coach =
              passenger.coachAssigned;

            if (!coachMap[coach]) {

              coachMap[coach] = 0;

            }

            coachMap[coach]++;

          }
        );

      }
    );

    const coachWise =
      Object.entries(coachMap).map(
        ([coach, count]) => ({
          coach,
          bookedSeats: count
        })
      );

    // =========================

    res.status(200).json({

      success: true,

      data: {
        summary: {

  totalSeats,

  availableSeats,

  occupiedSeats,

  occupancyPercentage,

  confirmedCount,

  racCount,

  waitingCount,

  cancelledCount,

  seatUtilization:
    occupancyPercentage,

  mostOccupiedTrain:
    trainWise.length > 0
      ? [...trainWise].sort(
          (a, b) =>
            parseFloat(
              b.occupancyPercentage
            ) -
            parseFloat(
              a.occupancyPercentage
            )
        )[0]
      : null,

  leastOccupiedTrain:
    trainWise.length > 0
      ? [...trainWise].sort(
          (a, b) =>
            parseFloat(
              a.occupancyPercentage
            ) -
            parseFloat(
              b.occupancyPercentage
            )
        )[0]
      : null

},
        trainWise,
        dateWise,
        routeWise,
        coachWise
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getOccupancyData
};