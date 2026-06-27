const Train = require("../models/Train");

// Add Train
const addTrain = async (req, res) => {

  try {

    const {
      trainName,
      trainNumber,
      source,
      destination,
      departureTime,
      arrivalTime,
      totalSeats
    } = req.body;

    const train = await Train.create({
      trainName,
      trainNumber,
      source,
      destination,
      departureTime,
      arrivalTime,
      totalSeats,
      availableSeats: totalSeats
    });

    res.status(201).json({
      message: "Train added successfully",
      train
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

// Get All Trains
const getAllTrains = async (req, res) => {

  try {

    const trains = await Train.find();

    res.status(200).json(trains);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

// Search trains by source and destination
const searchTrains = async (req, res) => {

  try {

    const { source, destination } = req.query;

    const trains = await Train.find({
      source: source,
      destination: destination
    });

    res.status(200).json(trains);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

// Get train by ID
const getTrainById = async (req, res) => {

  try {

    const train = await Train.findById(req.params.id);

    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    res.status(200).json(train);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

const getTrainStatus = async (req, res) => {
  try {
    const train =
      await Train.findOne({
        trainNumber:
          req.params.trainNumber
      }).populate("stations.station");
    if (!train) {
      return res.status(404).json({
        message: "Train not found"
      });
    }

    const route = train.stations.map((station, index) => {
        const delay =
          Math.floor(
            Math.random() * 30
          );

        // AI Delay Prediction
        const aiPrediction =
          Math.floor(
            Math.random() * 40
          );

        const aiReasonOptions = [
          "Heavy Rain",
          "Signal Congestion",
          "Track Maintenance",
          "Engine Inspection",
          "Platform Delay",
          "Fog Conditions"
        ];

        const aiReason =
          aiReasonOptions[
            Math.floor(
              Math.random() *
              aiReasonOptions.length
            )
          ];

        return {
          station:
            station.station?.name,
          distance:
            station.distance,
          scheduledArrival:
            station.arrivalTime,
          actualArrival:
            station.arrivalTime,
          scheduledDeparture:
            station.departureTime,
          actualDeparture:
            station.departureTime,
          delayAtStation:
            delay,
          reason:
            delay > 10
              ? "Signal Delay"
              : "On Time",
          isCurrent:
            index === 2,

          // AI Prediction
          predictedDelay:
            aiPrediction,
          predictionReason:
            aiReason
        };
      });

    res.status(200).json({
      _id: train._id,
      trainName:
        train.trainName,
      trainNumber:
        train.trainNumber,
      route
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = { addTrain, getAllTrains, searchTrains, getTrainById, getTrainStatus };