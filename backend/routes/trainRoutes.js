const express = require("express");
const router = express.Router();
const Train = require("../models/Train");
const Station = require("../models/Station");
// const axios = require("axios");

// ✅ Add Train (with stations)
router.post("/add", async (req, res) => {
  try {
    const train = new Train(req.body);
    await train.save();
    res.status(201).json(train);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const trains = await Train.find()
      .populate("stations.station"); // 🔥 IMPORTANT

    res.json(trains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/search", async (req, res) => { 
  try {
    const { source, destination } = req.query;

    const trains = await Train.find().populate("stations.station");

    const result = [];

    trains.forEach(train => {

      const stationIds = train.stations
        .map(s => s.station?._id?.toString())
        .filter(Boolean);

      const sourceIndex = stationIds.indexOf(source);
      const destIndex = stationIds.indexOf(destination);

      // ✅ VALID CHECK
      if (sourceIndex === -1 || destIndex === -1) return;

      if (sourceIndex < destIndex) {

        // ✅ slice route using index
        const route = train.stations
          .slice(sourceIndex, destIndex + 1)
          .map(s => ({
            _id: s.station._id,
            stationName: s.station.name,
            code: s.station.code,
            arrivalTime: s.arrivalTime,
            departureTime: s.departureTime
          }));

        const slSeats =
  train.coaches
    ?.filter(
      c => c.classType === "SL"
    )
    .reduce(
      (sum, c) =>
        sum + c.availableSeats,
      0
    ) || 0;

const ac3Seats =
  train.coaches
    ?.filter(
      c => c.classType === "3A"
    )
    .reduce(
      (sum, c) =>
        sum + c.availableSeats,
      0
    ) || 0;

const ac2Seats =
  train.coaches
    ?.filter(
      c => c.classType === "2A"
    )
    .reduce(
      (sum, c) =>
        sum + c.availableSeats,
      0
    ) || 0;

result.push({

  _id: train._id,

  trainNumber:
    train.trainNumber,

  trainName:
    train.trainName,

  route,

  availableSeats:
    train.availableSeats || 0,

  classAvailability: {

    SL: slSeats,

    "3A": ac3Seats,

    "2A": ac2Seats

  },

  racCount:
    train.racCount || 0,

  racLimit:
    train.racLimit || 0,

  waitingCount:
    train.waitingCount || 0,

  waitingLimit:
    train.waitingLimit || 0

});
      }

    });

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/status/:trainNumber", async (req, res) => {
  try {
    const { trainNumber } = req.params;

    // ✅ Find train
    const train = await Train.findOne({ trainNumber })
      .populate("stations.station");

    if (!train) {
      return res.status(404).json({ success: false, message: "Train not found" });
    }
    train.stations = train.stations.filter(
      (s) => s.station
    );
    // ✅ SORT stations properly
    const stations = [...train.stations].sort((a, b) => a.order - b.order);
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // helper function
    const toMinutes = (time) => {
      if (!time) return null;
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    let currentIndex = -1;
    let runningBetween = "";
    let nextStationETA = "";

    let cumulativeDelay = 0;

    const addDelayToTime = (time, delay) => {
      if (!time) return null;
      const [h, m] = time.split(":").map(Number);
      const d = new Date();
      d.setHours(h, m);
      d.setMinutes(d.getMinutes() + delay);
      return d.getHours() * 60 + d.getMinutes();
    };

    let tempDelay = 0;
for (let i = 0; i < stations.length; i++) {

  const distance = stations[i].distance || 0;

  // same delay logic
  let disturbance = 0;
  if (distance < 100) disturbance = Math.floor(Math.random() * 3);
  else if (distance < 300) disturbance = Math.floor(Math.random() * 5);
  else disturbance = Math.floor(Math.random() * 8);

  if (Math.random() < 0.3) disturbance -= 2;

  tempDelay += disturbance;
  if (tempDelay < 0) tempDelay = 0;

  const arr = addDelayToTime(stations[i].arrivalTime, tempDelay);
  const dep = addDelayToTime(stations[i].departureTime, tempDelay);

  if(arr!==null&&dep!==null){
  // train stopped at station
  if(currentTime>=arr&&currentTime<=dep){
    currentIndex=i;
    runningBetween=
      `Stopped at ${stations[i].station.name}`;
    break;
  }

  // train moving between stations
  if(i<stations.length-1){
    const nextArr=
      addDelayToTime(
        stations[i+1].arrivalTime,
        tempDelay
      );
    if(
      currentTime>dep &&
      currentTime<nextArr
    ){
      currentIndex=i;
      runningBetween=
        `${stations[i].station.name} → ${stations[i+1].station.name}`;
      nextStationETA=
        stations[i+1].arrivalTime;
      break;
    }
  }
}
}
    if (
      stations.length > 0 &&
      currentIndex === -1 &&
      currentTime < toMinutes(stations[0].arrivalTime)
    ){
      currentIndex = 0;
    }

    if (
      stations.length > 0 &&
      currentIndex === -1 &&
      currentTime > toMinutes(stations[stations.length - 1].departureTime)
    ){
      currentIndex = stations.length - 1;
    }

    let liveWeather = "Clear";

    const route = stations.map((s, index) => {
      const isCurrent = index === currentIndex;

      // ✅ DISTANCE FIX
      const distance = s.distance || 0;
      // ✅ dynamic delay
      let disturbance = 0;
      // 🔥 AI-like logic
      if (distance < 100) {
        disturbance = Math.floor(Math.random() * 3); // small delay
      } else if (distance < 300) {
        disturbance = Math.floor(Math.random() * 5); // medium
      } else {
        disturbance = Math.floor(Math.random() * 8); // large
      }
      // occasional recovery
      if (Math.random() < 0.3) {
        disturbance -= 2;
      }
      cumulativeDelay += disturbance;
      if (cumulativeDelay < 0) cumulativeDelay = 0;

      let scheduledArrival = s.arrivalTime || "N/A";
      let scheduledDeparture = s.departureTime || "N/A";

      let actualArrival = "N/A";
      let actualDeparture = "N/A";

      if (s.arrivalTime) {
        const arr = new Date(`1970-01-01T${s.arrivalTime}`);
        arr.setMinutes(arr.getMinutes() + cumulativeDelay);
        actualArrival = arr.toTimeString().slice(0, 5);
      }

      if (s.departureTime) {
        const dep = new Date(`1970-01-01T${s.departureTime}`);
        dep.setMinutes(dep.getMinutes() + cumulativeDelay);
        actualDeparture = dep.toTimeString().slice(0, 5);
      }

      let reason = "On Time";

      if (cumulativeDelay > 10) {
        reason = "Heavy traffic";
      } else if (cumulativeDelay > 5) {
        reason = "Signal delay";
      } else if (cumulativeDelay > 2) {
        reason = "Minor congestion";
      }

      console.log("Station:", s.station.name, "Distance:", s.distance);
      const weatherOptions = [
  {
    weather: "Clear",
    extraDelay: 0
  },
  {
    weather: "Rain",
    extraDelay: 10
  },
  {
    weather: "Heavy Rain",
    extraDelay: 20
  },
  {
    weather: "Fog",
    extraDelay: 15
  },
  {
    weather: "Storm",
    extraDelay: 25
  }
];

const selectedWeather =
  weatherOptions[
    Math.floor(
      Math.random() *
      weatherOptions.length
    )
  ];

const aiDelay =
  cumulativeDelay +
  selectedWeather.extraDelay;

// try {
//   const weatherRes =
//     await axios.get(
//       `https://api.openweathermap.org/data/2.5/weather?q=${s.station.name},IN&appid=3db7bc7bfd6489246bb9a471f4285fb9`
//     );
//   liveWeather =
//     weatherRes.data.weather[0].main;
// } catch(err) {
//   liveWeather = "Clear";
// }
return {
  station: s.station.name,
  distance,
  delayAtStation:
    cumulativeDelay,
  reason,
  scheduledArrival,
  actualArrival,
  scheduledDeparture,
  actualDeparture,
  predictedDelay:
  cumulativeDelay +
  Math.floor(
    Math.random() * 10
  ),

predictionReason:
  [
    "Clear",
    "Rain",
    "Fog",
    "Storm"
  ][
    Math.floor(
      Math.random() * 4
    )
  ],
  isCurrent
};
      
    });

    res.json({
      trainName: train.trainName,
      route,
      runningBetween,
      nextStationETA,
      currentWeather:
    [
      "Clear",
      "Rain",
      "Fog",
      "Storm"
    ][
      Math.floor(
        Math.random() * 4
      )
    ],
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/add", async (req, res) => {
  try {

    const { trainName, trainNumber, totalSeats, stations } = req.body;

    const formattedStations = stations.map((s, index) => ({
      station: s.station, // for now (we improve later)
      arrivalTime: s.arrivalTime,
      departureTime: s.departureTime,
      distance: Number(s.distance),
      order: index + 1
    }));

    const newTrain = await Train.create({
      trainName,
      trainNumber,
      totalSeats,
      availableSeats: totalSeats,
      stations: formattedStations
    });

    res.status(201).json(newTrain);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update Train Route
router.put("/update-route/:trainNumber", async (req, res) => {

  try {

    const { trainNumber } = req.params;
    const { routeCodes } = req.body;

    const train =
      await Train.findOne({ trainNumber });

    if (!train) {
      return res.status(404).json({
        success: false,
        message: "Train not found"
      });
    }

    const stations = [];

    let distance = 0;

    for (let i = 0; i < routeCodes.length; i++) {

      const station =
        await Station.findOne({
          code: routeCodes[i]
        });

      if (!station) {
        return res.status(400).json({
          success: false,
          message: `Station ${routeCodes[i]} not found`
        });
      }

      stations.push({
        station: station._id,
        arrivalTime:
          i === 0
            ? "00:00"
            : `${String((6 + i) % 24).padStart(2, "0")}:00`,
        departureTime:
          `${String((6 + i) % 24).padStart(2, "0")}:05`,
        distance,
        order: i + 1
      });

      distance += 120;
    }

    train.stations = stations;

    await train.save();

    res.status(200).json({
      success: true,
      message: "Route updated successfully",
      train
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

});

module.exports = router;