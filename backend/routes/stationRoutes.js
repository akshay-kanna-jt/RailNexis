const express = require("express");
const router = express.Router();
const Station = require("../models/Station");

// ✅ Add Station
router.post("/add", async (req, res) => {
  try {
    const { name, code } = req.body;

    const station = await Station.create({
      name,
      code
    });

    res.status(201).json(station);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get All Stations
router.get("/", async (req, res) => {
  try {
    const stations = await Station.find();
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const stations =
      await Station.find();

    res.status(200).json({
      success: true,
      data: stations
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message:
        "Failed to fetch stations",
      error: err.message
    });
  }
});
module.exports = router;