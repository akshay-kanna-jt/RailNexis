const mongoose = require("mongoose");

const trainSchema = new mongoose.Schema({

  trainNumber: {
    type: String,
    required: true,
    unique: true,
  },

  trainName: {
    type: String,
    required: true,
  },

  // ✅ ROUTE SYSTEM
  stations: [
    {
      station: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Station",
      },

      arrivalTime: String,

      departureTime: String,

      distance: Number,

      order: Number,
    }
  ],

  totalSeats: {
    type: Number,
    default: 100
  },
  availableSeats: {
  type: Number,
  default: 100
},

racLimit: {
  type: Number,
  default: 20
},

racCount: {
  type: Number,
  default: 0
},

waitingLimit: {
  type: Number,
  default: 30
},

waitingCount: {
  type: Number,
  default: 0
},

  // ✅ PHASE 2 — COACH SYSTEM
  coaches: [
    {
      coachName: {
        type: String
      },

      classType: {
        type: String
      },

      totalSeats: {
        type: Number,
        default: 0
      },

      availableSeats: {
        type: Number,
        default: 0
      }
    }
  ],

}, { timestamps: true });

module.exports = mongoose.model("Train", trainSchema);