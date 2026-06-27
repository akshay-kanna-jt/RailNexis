const express = require("express");

const router = express.Router();

const {
  getOccupancyData
} = require("../controllers/occupancyController");

router.get("/", getOccupancyData);

module.exports = router;