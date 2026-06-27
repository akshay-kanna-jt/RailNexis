  const mongoose = require("mongoose");

  const stationSchema =
    new mongoose.Schema({

      name: {
        type: String,
        required: true,
      },

      code: {
        type: String,
        required: true,
        unique: true,
      },

      latitude: {
        type: Number
      },

      longitude: {
        type: Number
      }

    }, { timestamps: true });

  module.exports =
    mongoose.model(
      "Station",
      stationSchema
    );