const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("../config/db");
const Train = require("../models/Train");

const peakDemandSeeder = async () => {
  try {

    await connectDB();

    const updates = [

      {
        trainNumber: "12621", // Tamil Nadu
        availableSeats: 0,
        racCount: 45,
        waitingCount: 80
      },

      {
        trainNumber: "12841", // Coromandel
        availableSeats: 0,
        racCount: 50,
        waitingCount: 95
      },

      {
        trainNumber: "12627", // Karnataka
        availableSeats: 0,
        racCount: 35,
        waitingCount: 60
      },

      {
        trainNumber: "12625", // Kerala
        availableSeats: 10,
        racCount: 25,
        waitingCount: 40
      },

      {
        trainNumber: "22691", // Bengaluru Rajdhani
        availableSeats: 5,
        racCount: 15,
        waitingCount: 20
      }

    ];

    for (const item of updates) {

      const train =
        await Train.findOne({
          trainNumber: item.trainNumber
        });

      if (!train) {
        console.log(
          `Train not found: ${item.trainNumber}`
        );
        continue;
      }

      train.availableSeats =
        item.availableSeats;

      train.racCount =
        item.racCount;

      train.waitingCount =
        item.waitingCount;

      await train.save();

      console.log(
        `${train.trainName} Updated ✅`
      );
    }

    console.log(
      "Peak Demand Simulation Completed ✅"
    );

    process.exit();

  } catch (err) {

    console.error(err);
    process.exit(1);

  }
};

peakDemandSeeder();