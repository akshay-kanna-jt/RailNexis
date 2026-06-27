const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("../config/db");
const Train = require("../models/Train");

const premiumTrains = [
  "12841", // Coromandel
  "12621", // Tamil Nadu Express
  "12627", // Karnataka Express
  "12625", // Kerala Express
  "12615", // Grand Trunk Express
  "22691", // Bengaluru Rajdhani
  "12431", // Trivandrum Rajdhani
  "12007", // Mysuru Shatabdi
  "20607", // Mysuru Vande Bharat
  "20703"  // Secunderabad Vande Bharat
];

const seedOccupancy = async () => {

  try {

    await connectDB();

    for(const trainNumber of premiumTrains){

      const train =
        await Train.findOne({ trainNumber });

      if(!train){
        console.log(
          `Train Not Found: ${trainNumber}`
        );
        continue;
      }

      const occupancy =
        Math.floor(
          85 + Math.random() * 10
        );

      const occupiedSeats =
        Math.floor(
          train.totalSeats *
          occupancy / 100
        );

      train.availableSeats =
        train.totalSeats -
        occupiedSeats;

      await train.save();

      console.log(
        `${train.trainName}`
      );

      console.log(
        `Occupancy: ${occupancy}%`
      );

      console.log(
        `Available Seats: ${train.availableSeats}`
      );

      console.log(
        "-------------------"
      );
    }

    console.log(
      "Occupancy Seeding Completed ✅"
    );

    process.exit();

  } catch(err){

    console.error(err);
    process.exit(1);

  }

};

seedOccupancy();