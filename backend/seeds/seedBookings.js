const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("../config/db");

const User = require("../models/User");
const Train = require("../models/Train");
const Booking = require("../models/Booking");

const passengerNames = [
  "Akash","Rahul","Arjun","Priya","Sneha",
  "Kiran","Vikram","Anjali","Pooja","Rohit",
  "Meera","Divya","Nikhil","Sandeep","Kavya",
  "Shiva","Hari","Bala","ishanth","Deepak",
  "Raj","Harsha","Rudra","Suraj","Joyston",
  "Ithihas","Dhanush","Pratham","Santhoji","Shujan",
  "Pratheek","Shreya","Shreyas","vinith","Aarthik",
  "Karthik","Nishanth","Riya","Maya","Divya"
];

const berthTypes = [
  "Lower",
  "Middle",
  "Upper",
  "Side Lower",
  "Side Upper"
];

const premiumTrainNumbers = [
  "12621",
  "12627",
  "12625",
  "12841",
  "12615",
  "22691",
  "12431",
  "12007",
  "20607",
  "20703"
];
const randomItem = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];

const randomDate = () => {

  const today = new Date();

  const past =
    new Date(
      today.getTime() -
      Math.floor(Math.random() * 60) *
      24 * 60 * 60 * 1000
    );

  return past;
};

const generatePNR = () => {

  return Math.floor(
    1000000000 +
    Math.random() * 9000000000
  ).toString();

};
const seedBookings = async () => {

  try {

    await connectDB();

    const users =
      await User.find();

    const trains =
      await Train.find({
        trainNumber: {
          $in: premiumTrainNumbers
        }
      });

    let bookingCount = 0;
    for (let i = 0; i < 200; i++) {

  const user =
    randomItem(users);

  const train =
    randomItem(trains);

  if (
    !train.stations ||
    train.stations.length < 2
  ) {
    continue;
  }

  const fromIndex =
    Math.floor(
      Math.random() *
      (train.stations.length - 1)
    );

  const toIndex =
    fromIndex +
    1 +
    Math.floor(
      Math.random() *
      (train.stations.length -
        fromIndex -
        1)
    );

  const fromStation =
    train.stations[fromIndex].station;

  const toStation =
    train.stations[toIndex].station;
      const classes = [
    "SL",
    "3A",
    "2A"
  ];

  const travelClass =
    randomItem(classes);

  const passengerCount =
    Math.floor(
      Math.random() * 4
    ) + 1;

  const passengers = [];
    for (
    let p = 0;
    p < passengerCount;
    p++
  ) {

    let coachAssigned = "S1";

    if (
      travelClass === "3A"
    ) {
      coachAssigned = "B1";
    }

    if (
      travelClass === "2A"
    ) {
      coachAssigned = "A1";
    }

    passengers.push({

      name:
        randomItem(
          passengerNames
        ),

      age:
        Math.floor(
          Math.random() * 45
        ) + 18,

      gender:
        Math.random() > 0.5
          ? "Male"
          : "Female",

      berthPreference:
        randomItem(
          berthTypes
        ),

      coachAssigned,

      seatNumber:
        Math.floor(
          Math.random() * 72
        ) + 1,

      allocatedBerth:
        randomItem(
          berthTypes
        )

    });

  }
    const status =
    Math.random() < 0.15
      ? "CANCELLED"
      : "CONFIRMED";

  await Booking.create({

    user: user._id,

    train: train._id,

    travelClass,

    quota: "General",

    passengers,

    fromStation,

    toStation,

    journeyDate:
      randomDate(),

    status,

    pnrNumber:
      generatePNR()

  });

  bookingCount++;

}
console.log(
  `${bookingCount} Historical Bookings Added ✅`
);

process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedBookings();