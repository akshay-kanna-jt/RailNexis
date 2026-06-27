const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("../config/db");
const Station = require("../models/Station");
const Train = require("../models/Train");
const trainData = require("./trainData");

const getStationId = async (code) => {
  const station = await Station.findOne({ code });

  if (!station) {
    throw new Error(
      `Station not found: ${code}`
    );
  }

  return station._id;
};

const createCoachSet = (
  sleeperCount,
  ac3Count,
  ac2Count
) => {

  const coaches = [];

  for (let i = 1; i <= sleeperCount; i++) {
    coaches.push({
      coachName: `S${i}`,
      classType: "SL",
      totalSeats: 80,
      availableSeats: 80
    });
  }

  for (let i = 1; i <= ac3Count; i++) {
    coaches.push({
      coachName: `B${i}`,
      classType: "3A",
      totalSeats: 64,
      availableSeats: 64
    });
  }

  for (let i = 1; i <= ac2Count; i++) {
    coaches.push({
      coachName: `A${i}`,
      classType: "2A",
      totalSeats: 48,
      availableSeats: 48
    });
  }
  return coaches;
};

const seedTrains = async () => {
  try {
    await connectDB();
    for (const train of trainData) {
      const exists =
        await Train.findOne({
          trainNumber: train.trainNumber
        });

      if (exists) {
        console.log(
          `${train.trainName} already exists`
        );
        continue;
      }
      const route = [];
      let distance = 0;
      for (let i = 0; i < train.routeCodes.length; i++) {
        const station =
          await Station.findOne({
            code: train.routeCodes[i]
          });

        if (!station) {
          console.log(
            `Missing Station: ${train.routeCodes[i]}`
          );
          continue;
        }
        route.push({
          station: station._id,
          arrivalTime:
            i === 0
              ? "00:00"
              : `${String(
                  (6 + i) % 24
                ).padStart(2, "0")}:00`,
          departureTime:
            `${String(
              (6 + i) % 24
            ).padStart(2, "0")}:05`,
          distance,
          order: i + 1
        });
        distance += 120;
      }

      const coaches =
        createCoachSet(
          train.coachConfig.sleeper,
          train.coachConfig.ac3,
          train.coachConfig.ac2
        );

      const totalSeats =
        coaches.reduce(
          (sum, coach) =>
            sum + coach.totalSeats,
          0
        );

      await Train.create({
        trainNumber:
          train.trainNumber,
        trainName:
          train.trainName,
        stations: route,
        coaches,
        totalSeats,
        availableSeats:
          totalSeats,
        racLimit: 50,
        waitingLimit: 100
      });
      console.log(
        `${train.trainName} Added ✅`
      );
    }
    console.log(
      "Premium Train Seeding Completed ✅"
    );
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
seedTrains();
