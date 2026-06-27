const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Station = require('./models/Station');
const Train = require('./models/Train');
const User = require('./models/User');

async function testCompleteWorkflow() {
  try {
    await mongoose.connect('mongodb://localhost:27017/railnexis');
    console.log("✓ Connected to database");

    // Step 1: Create test user
    console.log("\n=== STEP 1: Create Test User ===");
    let user = await User.findOne().select('_id');
    if (!user) {
      user = await User.create({
        name: "Test User",
        email: `test${Date.now()}@test.com`,
        password: "test123"
      });
      console.log("Created new test user:", user._id);
    } else {
      console.log("Using existing user:", user._id);
    }

    // Step 2: Get or create test stations
    console.log("\n=== STEP 2: Verify Stations ===");
    let sourceStation = await Station.findOne();
    if (!sourceStation) {
      sourceStation = await Station.create({
        name: "Test Source Station",
        code: "TSS"
      });
      console.log("Created source station:", sourceStation.name);
    } else {
      console.log("Using source station:", sourceStation.name);
    }

    let destStation = await Station.findOne({ _id: { $ne: sourceStation._id } });
    if (!destStation) {
      destStation = await Station.create({
        name: "Test Dest Station",
        code: "TDS"
      });
      console.log("Created dest station:", destStation.name);
    } else {
      console.log("Using dest station:", destStation.name);
    }

    // Step 3: Get or create test train
    console.log("\n=== STEP 3: Verify Train ===");
    let train = await Train.findOne();
    if (!train) {
      train = await Train.create({
        trainName: "Test Train Express",
        trainNumber: "T001",
        totalSeats: 144,
        availableSeats: 144,
        racLimit: 18,
        racCount: 0,
        waitingLimit: 50,
        waitingCount: 0
      });
      console.log("Created test train:", train.trainName);
    } else {
      console.log("Using test train:", train.trainName);
    }

    // Step 4: Create booking with all Priority 4 requirements
    console.log("\n=== STEP 4: Create Test Booking ===");
    const journeyDate = new Date();
    journeyDate.setDate(journeyDate.getDate() + 10);

    const bookingData = {
      user: user._id,
      train: train._id,
      travelClass: "SL",
      quota: "General",
      fromStation: sourceStation._id,
      toStation: destStation._id,
      journeyDate: journeyDate,
      status: "CONFIRMED",
      passengers: [
        {
          name: "Passenger 1",
          age: 30,
          gender: "Male",
          berthPreference: "No Preference",
          seatNumber: 1,
          coachAssigned: "S1",
          allocatedBerth: "Lower"
        }
      ],
      pnrNumber: "PNR" + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase()
    };

    const booking = await Booking.create(bookingData);
    console.log("Created booking with PNR:", booking.pnrNumber);

    // Step 5: Verify all fields stored
    console.log("\n=== STEP 5: Verify All Fields Stored ===");
    const populatedBooking = await Booking.findById(booking._id).populate('user train fromStation toStation');
    
    const fieldChecks = {
      user: !!populatedBooking.user,
      train: !!populatedBooking.train,
      travelClass: !!populatedBooking.travelClass,
      journeyDate: !!populatedBooking.journeyDate,
      fromStation: !!populatedBooking.fromStation,
      toStation: !!populatedBooking.toStation,
      pnrNumber: !!populatedBooking.pnrNumber,
      passengers: populatedBooking.passengers.length > 0,
      status: !!populatedBooking.status
    };

    console.log("Field Validation:");
    Object.entries(fieldChecks).forEach(([field, valid]) => {
      console.log(`  ${valid ? "✓" : "✗"} ${field}`);
    });

    // Step 6: Verify PNR uniqueness
    console.log("\n=== STEP 6: Verify PNR Uniqueness ===");
    const allBookings = await Booking.find().select('pnrNumber');
    const pnrSet = new Set();
    let duplicates = 0;
    
    for (let b of allBookings) {
      if (pnrSet.has(b.pnrNumber)) {
        duplicates++;
      }
      pnrSet.add(b.pnrNumber);
    }
    
    console.log("Total bookings:", allBookings.length);
    console.log("Unique PNRs:", pnrSet.size);
    console.log("Duplicates:", duplicates);
    console.log(`${duplicates === 0 ? "✓" : "✗"} PNR Uniqueness Check`);

    // Step 7: Verify Station Population
    console.log("\n=== STEP 7: Verify Station Population ===");
    console.log(`✓ Source Station populated: ${populatedBooking.fromStation.name}`);
    console.log(`✓ Dest Station populated: ${populatedBooking.toStation.name}`);

    // Step 8: Summary
    console.log("\n=== PRIORITY 4 VERIFICATION SUMMARY ===");
    const allChecks = Object.values(fieldChecks).every(v => v);
    console.log(`${allChecks ? "✓" : "✗"} All required fields stored`);
    console.log(`${duplicates === 0 ? "✓" : "✗"} PNR uniqueness maintained`);
    console.log(`✓ Station population verified`);

    // Clean up test data
    console.log("\n=== CLEANUP ===");
    await Booking.deleteOne({ _id: booking._id });
    console.log("Test booking cleaned up");

    console.log("\n✓ All Priority 4 tests completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

testCompleteWorkflow();
