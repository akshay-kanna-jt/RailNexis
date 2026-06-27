const mongoose = require("mongoose");


const bookingSchema = new mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  train: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Train",
    required: true
  },
  
  travelClass: {
    type: String,
    required: true
  },
  quota: {
    type: String,
    default: "General"
  },

  passengers: [
    {
      name: {
        type: String,
        required: true
      },
      age: {
        type: Number,
        required: true
      },
      gender: {
        type: String,
        required: true
      },
      berthPreference: {
        type: String,
        default: "No Preference"
      },
      coachAssigned: {
        type: String,
        default: "N/A"
      },
      seatNumber: {
        type: Number,
        default: 0
      },

      allocatedBerth: {
        type: String,
        default: "N/A"
      }
    }
  ],

  fromStation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station",
    required: true
  },

  toStation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station",
    required: true
  },

  journeyDate: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: [
      "CONFIRMED",
      "RAC",
      "WAITING",
      "CANCELLED"
    ],
    default: "CONFIRMED"
  },

  racPosition: {
    type: Number,
    default: null
  },

  waitingPosition: {
    type: Number,
    default: null
  },

  pnrNumber: {
    type: String,
    unique: true
  },

  cancelledAt: {
    type: Date
  },

  notification: {
    type: String,
    default: ""
  },

  notificationType: {
    type: String,
    default: ""
  }

},
{
  timestamps: true
}
);

module.exports = mongoose.model("Booking", bookingSchema);