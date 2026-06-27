const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("../config/db");
const Train = require("../models/Train");

const premiumTrains = [
  "12841", // Coromandel
  "12621", // Tamil Nadu
  "12627", // Karnataka
  "12625", // Kerala
  "12615", // Grand Trunk
  "22691", // Bengaluru Rajdhani
  "12431", // Trivandrum Rajdhani
  "12007", // Mysuru Shatabdi
  "20607", // Mysuru Vande Bharat
  "20703"  // Secunderabad Vande Bharat
];

const seedCoachOccupancy = async () => {

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

      let totalAvailable = 0;

      train.coaches.forEach(coach => {

        let available = coach.totalSeats;

        if(coach.classType === "SL"){

          available =
            Math.floor(
              coach.totalSeats *
              (Math.random() * 0.10 + 0.05)
            );

        }

        else if(coach.classType === "3A"){

          available =
            Math.floor(
              coach.totalSeats *
              (Math.random() * 0.15 + 0.15)
            );

        }

        else if(coach.classType === "2A"){

          available =
            Math.floor(
              coach.totalSeats *
              (Math.random() * 0.20 + 0.25)
            );

        }

        coach.availableSeats =
          available;

        totalAvailable += available;

      });

      train.availableSeats =
        totalAvailable;

      await train.save();

      console.log(
        `${train.trainName}`
      );

      console.log(
        `Available Seats: ${totalAvailable}`
      );

      console.log(
        "----------------------"
      );

    }

    console.log(
      "Coach Occupancy Updated ✅"
    );

    process.exit();

  } catch(err){

    console.error(err);
    process.exit(1);

  }

};

seedCoachOccupancy();