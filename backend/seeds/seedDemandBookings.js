const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("../config/db");

const User = require("../models/User");
const Train = require("../models/Train");
const Booking = require("../models/Booking");

const demandMatrix = require("./demandMatrix");

const passengerNames = [
  "Akash","Rahul","Arjun","Priya","Sneha",
  "Kiran","Vikram","Anjali","Pooja","Rohit",
  "Meera","Divya","Nikhil","Sandeep","Kavya",
  "Shiva","Hari","Bala","Ishanth","Deepak"
];

const berthTypes = [
  "Lower",
  "Middle",
  "Upper",
  "Side Lower",
  "Side Upper"
];

const randomItem = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];

const generatePNR = () =>
  Math.floor(
    1000000000 +
    Math.random() * 9000000000
  ).toString();

const createPassengers = (
  count,
  travelClass
) => {

  const passengers = [];

  let coachAssigned = "S1";

  if (travelClass === "3A")
    coachAssigned = "B1";

  if (travelClass === "2A")
    coachAssigned = "A1";

  for (let i = 0; i < count; i++) {

    passengers.push({
      name: randomItem(passengerNames),
      age: Math.floor(Math.random() * 50) + 18,
      gender:
        Math.random() > 0.5
          ? "Male"
          : "Female",
      berthPreference:
        randomItem(berthTypes),
      coachAssigned,
      seatNumber:
        Math.floor(Math.random() * 72) + 1,
      allocatedBerth:
        randomItem(berthTypes)
    });

  }

  return passengers;
};

const seedDemandBookings = async () => {

  try {

    await connectDB();

    const users =
      await User.find();

    const trains =
      await Train.find();

    let bookingCount = 0;

    for (let day = 1; day <= 30; day++) {

      const journeyDate =
        new Date();

      journeyDate.setDate(
        journeyDate.getDate() + day
      );

      for (const demand of demandMatrix) {

        const train =
          trains.find(
            t =>
              t.trainNumber ===
              demand.trainNumber
          );

        if (!train) continue;

        const isWeekend =
          journeyDate.getDay() === 0 ||
          journeyDate.getDay() === 6;

        const demandType =
          isWeekend
            ? "weekend"
            : "normal";

        const dailyDemand =
          demand.dailyDemand[
            demandType
          ];

        const classes = [
          { type: "SL", seats: dailyDemand.SL },
          { type: "3A", seats: dailyDemand["3A"] },
          { type: "2A", seats: dailyDemand["2A"] }
        ];

        for (const cls of classes) {

          let remaining =
            cls.seats;

          while (remaining > 0) {

            const passengerCount =
              Math.min(
                remaining,
                Math.floor(
                  Math.random() * 4
                ) + 1
              );

            const fromIndex =
              Math.floor(
                Math.random() *
                (train.stations.length - 1)
              );

            const toIndex =
              fromIndex + 1;

            await Booking.create({

              user:
                randomItem(users)._id,

              train: train._id,

              travelClass:
                cls.type,

              quota: "General",

              passengers:
                createPassengers(
                  passengerCount,
                  cls.type
                ),

              fromStation:
                train.stations[
                  fromIndex
                ].station,

              toStation:
                train.stations[
                  toIndex
                ].station,

              journeyDate,

              status:
                "CONFIRMED",

              pnrNumber:
                generatePNR()

            });

            bookingCount++;

            remaining -=
              passengerCount;

          }

        }

      }

    }

    console.log(
      `${bookingCount} Demand Bookings Added ✅`
    );

    process.exit();

  } catch (err) {

    console.error(err);

    process.exit(1);

  }

};

seedDemandBookings();