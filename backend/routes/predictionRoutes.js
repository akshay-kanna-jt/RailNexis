const express = require("express");
const router = express.Router();

const { predictDelay } = require("../controllers/predictionController");

router.post("/predict-delay", predictDelay);

module.exports = router;