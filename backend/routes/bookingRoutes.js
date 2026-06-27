const express = require("express");
const router = express.Router();

const Train = require("../models/Train");
const Booking = require("../models/Booking");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const { auditBookingEngine } = require("../controllers/bookingController");

// 🔥 ONLY ONE /book ROUTE (no duplicate)
router.post("/book", async (req, res) => {
  try {
    const {
      user,
      train,
      passengers,
      travelClass,
      fromStation,
      toStation,
      journeyDate,
      quota
    } = req.body;

    // 🔥 Passenger validation
    if (!passengers || passengers.length === 0) {
      return res.status(400).json({
        message: "At least 1 passenger required"
      });
    }
    const seatsRequested = passengers.length;

    // 🔥 Max passenger validation
    if (passengers.length > 6) {
      return res.status(400).json({
        message: "Maximum 6 passengers allowed"
      });
    }

    // 🔥 Class validation
    if (!travelClass) {
      return res.status(400).json({
        message: "Please select class"
      });
    }
    // 🔥 Required fields validation
    if (
      !user ||
      !train ||
      !passengers ||
      !fromStation ||
      !toStation ||
      !journeyDate
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }
    console.log("Booking request:", {
      user,
      train,
      fromStation,
      toStation,
      seatsRequested
    });

    // ✅ Get train
    const trainData = await Train.findById(train)
      .populate("stations.station");

    if (!trainData) {
      return res.status(404).json({
        message: "Train not found"
      });
    }
    // 🔥 Find matching coach
    const availableCoaches =
trainData.coaches.filter(
(coach)=>

coach.classType ===
travelClass &&

coach.availableSeats >=
seatsRequested
);

availableCoaches.sort(
(a,b)=>

b.availableSeats -
a.availableSeats
);

const matchingCoach =
availableCoaches[0];

    // ❌ No coach available
    if (!matchingCoach) {
      return res.status(400).json({
        success: false,
        message: "No seats available in selected class"
      });
    }

    // 🔥 Find stations
    const from = trainData.stations.find(
      (s) =>
        s.station &&
        s.station._id.toString() === fromStation
    );

    const to = trainData.stations.find(
      (s) =>
        s.station &&
        s.station._id.toString() === toStation
    );

    // ❌ Invalid stations
    if (!from || !to) {
      return res.status(400).json({
        message: "Invalid station selection"
      });
    }

    // ❌ Same station validation
    if (fromStation === toStation) {
      return res.status(400).json({
        message:
          "From and To stations cannot be the same"
      });
    }

    // 🔥 Existing bookings
    const existingBookings = await Booking.find({
      train: train,
      journeyDate: journeyDate,
      status: "CONFIRMED"
    });

    let seatsAlreadyBooked = 0;
    existingBookings.forEach((b) => {
      seatsAlreadyBooked +=
        b.passengers.length;
    });
    const totalSeats =
      trainData.totalSeats;
    const availableSeats =
      totalSeats - seatsAlreadyBooked;

    // ❌ Seat availability validation
    let bookingStatus = "CONFIRMED";

    // 🔥 RAC & WL LIMITS
    const racLimit = 10;
    const waitingLimit = 20;
    // 🔥 CONFIRMED
    if (availableSeats >= seatsRequested) {
      bookingStatus = "CONFIRMED";
    }
    // 🔥 RAC
    else if (
      availableSeats + racLimit >= seatsRequested
    ) {
      bookingStatus = "RAC";
    }
    // 🔥 WAITING
    else if (
      availableSeats +
      racLimit +
      waitingLimit >= seatsRequested
    ) {
      bookingStatus = "WAITING";
    }
    // ❌ FULL
    else {
      return res.status(400).json({
        success: false,
        message:
          "No tickets available"
      });
    }

    const berthPattern = [
      "Lower",
      "Middle",
      "Upper",
      "Lower",
      "Middle",
      "Upper",
      "Side Lower",
      "Side Upper"
    ];

const bookedSeats =
  matchingCoach.totalSeats -
  matchingCoach.availableSeats;
const familyStartSeat =
bookedSeats + 1;

const updatedPassengers = passengers.map(
(p,index)=>{

const seatNumber =
familyStartSeat + index;

let allocatedBerth =
berthPattern[
(seatNumber - 1) % 8
];

if(p.age >= 60){
allocatedBerth =
"Lower";
}

if(
p.gender === "Female" &&
allocatedBerth === "Side Upper"
){
allocatedBerth =
"Middle";
}

if(
p.gender === "Female" &&
p.age >= 60
){
allocatedBerth =
"Lower";
}

return{
...p,
coachAssigned:
matchingCoach.coachName,
seatNumber,
allocatedBerth

};
}
);
    // 🔥 Reduce coach seats
    matchingCoach.availableSeats -=
      passengers.length;

    // 🔥 Save updated train
    await trainData.save();

    // 🔥 Generate booking reference
    const pnrNumber =
      Math.floor(
        1000000000 +
    Math.random() * 9000000000
  ).toString();

    // 🔥 Save booking
    const newBooking = new Booking({
      pnrNumber,
      user,
      train,
      travelClass,
      quota,
      passengers: updatedPassengers,
      seatsBooked: passengers.length,
      fromStation,
      toStation,
      journeyDate,
      status: bookingStatus,
    });

    await newBooking.save();

    // ✅ Success response
    res.status(201).json({
      success: true,
      message: "Booking successful",

      data: {
        booking: {
          id: newBooking._id,
          pnrNumber:
            newBooking.pnrNumber,
          passengers:
            newBooking.passengers
        },
        coachInfo: {
          coachAssigned:
            matchingCoach.coachName,
          remainingCoachSeats:
            matchingCoach.availableSeats
        },
        seatsInfo: {
          totalSeats,
          alreadyBooked:
            seatsAlreadyBooked,
          availableSeats
        }
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message
    });
  }
});

router.get("/all", async (req, res) => {
  try {

    const bookings = await Booking.find()
      .populate("train")
      .populate("user");
    
      console.log("Bookings:", bookings);

    res.status(200).json(bookings);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔥 Get bookings by user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await Booking.find({ user: userId })
      .populate("train")
      .populate("fromStation")
      .populate("toStation")
      .sort({ createdAt: -1 });

    // 🔥 Separate bookings
    const activeBookings = bookings.filter(b => b.status !== "CANCELLED");
    const now = new Date();

    const cancelledBookings = bookings.filter(b => {
      if (b.status !== "CANCELLED") return false;

      if (!b.cancelledAt) return false;

      const diffDays = (now - new Date(b.cancelledAt)) / (1000 * 60 * 60 * 24);

      return diffDays <= 30;
    });

    // ✅ CREATE summary properly
    const summary = {
      totalBookings: bookings.length,
      active: activeBookings.length,
      cancelled: cancelledBookings.length
    };

    res.json({
      success: true,
      data: {
        summary,
        activeBookings,
        cancelledBookings
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message
    });
  }
});

router.put("/cancel/:id", async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 🔥 Update status instead of deleting
    booking.status = "CANCELLED";
    booking.cancelledAt = new Date();
    // 🔥 Restore seats
    const train = await Train.findById(booking.train);
    if (train) {
      // 🔥 Restore coach seats
      booking.passengers.forEach((p) => {
        const coach =
          train.coaches.find(
            (c) =>
              c.coachName ===
              p.coachAssigned
          );
        if (coach) {
          coach.availableSeats += 1;
        }
      });
      await train.save();
    }
    await booking.save({validateBeforeSave: false});

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking
    });

  } catch (err) {
    console.log("CANCEL ERROR:", err);    
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId)
      .populate("train")
      .populate("fromStation")
      .populate("toStation")
      .populate("user");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({
      success: true,
      data: {
      pnrNumber: booking.pnrNumber,
      bookingId: booking._id,
      passengers: booking.passengers,
      seatsBooked: booking.passengers.length,
      journeyDate: booking.journeyDate,
      status: booking.status,

      train: {
        trainNumber: booking.train.trainNumber,
        trainName: booking.train.trainName
      },

      fromStation: {
        name: booking.fromStation.name,
        code: booking.fromStation.code
      },

      toStation: {
        name: booking.toStation.name,
        code: booking.toStation.code
      },

      user: {
        name: booking.user?.name || "N/A",
        email: booking.user?.email || "N/A"
      }
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message
    });
  }
});

router.get("/pnr/:pnrNumber", async (req, res) => {
  try {
    const { pnrNumber } = req.params;

    // 🔥 Find booking by PNR
    const booking = await Booking.findOne({
      pnrNumber
    })
    .populate("train")
    .populate("user")
    .populate("fromStation")
    .populate("toStation");

    // ❌ Booking not found
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "PNR not found"
      });
    }

    // ✅ Success
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message
    });
  }
});

router.get( "/ticket/:pnrNumber", async (req, res) => {
    try {
      const { pnrNumber } =
        req.params;
      // 🔥 Find booking
      const booking =
        await Booking.findOne({
          pnrNumber
        })
        .populate("train")
        .populate("fromStation")
        .populate("toStation");

      // ❌ Not found
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Ticket not found"
        });
      }
      // 🔥 Create PDF
      const doc =
        new PDFDocument();
      // 🔥 Response headers
      res.setHeader(
        "Content-Type",
        "application/pdf"
      );
      res.setHeader(
        "Content-Disposition",

        `attachment; filename=ticket-${pnrNumber}.pdf`
      );
      doc.pipe(res);

      const qrData = `
      PNR: ${booking.pnrNumber}
      Train: ${booking.train?.trainName}
      Journey: ${new Date(
        booking.journeyDate
      ).toLocaleDateString()}
      Status: ${booking.status}
`     ;

const qrImage = await QRCode.toDataURL(qrData);

      // 🔥 Title
      doc
        .fontSize(22)
        .text(
          "RailNexis E-Ticket",
          {
            align: "center"
          }
        );
      doc.moveDown();
      doc.fontSize(14).text("QR Verification", {
        align: "center"
      });
      doc.image(
        qrImage,
        230,
        doc.y,
        {
          fit: [150, 150],
          align: "center"
        }
      );
      // 🔥 Train info
      doc
        .fontSize(14)
        .text(
          `Train: ${booking.train?.trainName}`
        );
      doc.text(
        `PNR Number: ${booking.pnrNumber}`
      );
      doc.text(
        `Journey Date: ${
          new Date(
            booking.journeyDate
          ).toLocaleDateString()
        }`
      );
      doc.text(
        `Status: ${booking.status}`
      );
      doc.moveDown();
      // 🔥 Passenger Details
      doc
        .fontSize(16)
        .text("Passengers");
      doc.moveDown();
      booking.passengers.forEach(
        (p, index) => {
          doc
            .fontSize(12)
            .text(
              `${index + 1}. ${p.name}`
            );
          doc.text(
            `Coach: ${p.coachAssigned}`
          );
          doc.text(
            `Seat: ${p.seatNumber}`
          );
          doc.text(
            `Berth: ${p.allocatedBerth}`
          );
          doc.moveDown();
        }
      );
      // 🔥 Footer
      doc.moveDown();
      doc
        .fontSize(10)
        .text(
          "Thank you for booking with RailNexis",
          {
            align: "center"
          }
        );

      // 🔥 End PDF
      doc.end();
    } catch (err) {
      res.status(500).json({
        success: false,
        message:
          "Something went wrong",
        error: err.message
      });
    }
  }
);
// ===== PRIORITY 4: BOOKING ENGINE AUDIT ENDPOINT =====
router.get("/audit/engine", auditBookingEngine);
module.exports = router;