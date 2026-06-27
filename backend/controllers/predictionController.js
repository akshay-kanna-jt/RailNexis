const { PythonShell } = require("python-shell");
const path = require("path");
const Train = require("../models/Train");

const predictDelay = async (req, res) => {
  try {
    const { trainNumber } = req.body;
    const train = await Train.findOne({ trainNumber });

    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    const arrivalTime = train.arrivalTime;

    let options = {
      args: [trainNumber],
      pythonOptions: ["-u"]   // important: forces Python to return output immediately
    };

    const scriptPath = path.join(__dirname, "../../ai/predict_delay.py");

    PythonShell.run(scriptPath, options).then(results => {

      const delay = parseInt(results[0]);
      // Example arrival time (later we will fetch from DB)

      const [hour, minute] = arrivalTime.split(":").map(Number);

      let totalMinutes = hour * 60 + minute + delay;

      const newHour = Math.floor(totalMinutes / 60);
      const newMinute = totalMinutes % 60;

      const expectedArrival =
        String(newHour).padStart(2, "0") +
        ":" +
        String(newMinute).padStart(2, "0");

      res.json({
        trainNumber: trainNumber,
        predictedDelayMinutes: delay,
        expectedArrivalTime: expectedArrival
      });

    }).catch(err => {
      res.status(500).json({ error: err.message });
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { predictDelay };