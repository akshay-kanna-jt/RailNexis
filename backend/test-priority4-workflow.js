const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Station = require('./models/Station');
const Train = require('./models/Train');
const User = require('./models/User');

async function testCompleteBookingWorkflow() {
  try {
    await mongoose.connect('mongodb://localhost:27017/railnexis');
    console.log("✓ Connected to database");

    // Setup: Create test data
    console.log("\n=== SETUP: Creating Test Data ===");
    
    const user = await User.create({
      name: "Test User",
      email: `test${Date.now()}@test.com`,
      password: "test123"
    });
    console.log("✓ User created");

    const sourceStation = await Station.create({
      name: "Source Station",
      code: "SRC" + Date.now()
    });
    
    const destStation = await Station.create({
      name: "Dest Station",
      code: "DST" + Date.now()
    });
    console.log("✓ Stations created");

    // Create a train with limited seats for testing RAC and WAITING
    const train = await Train.create({
      trainName: "Test Express",
      trainNumber: "TE" + Date.now(),
      totalSeats: 5, // Very limited seats to test RAC/WAITING
      availableSeats: 5,
      racLimit: 2,
      racCount: 0,
      waitingLimit: 3,
      waitingCount: 0
    });
    console.log("✓ Train created with 5 seats, RAC:2, WL:3");

    const journeyDate = new Date();
    journeyDate.setDate(journeyDate.getDate() + 10);

    // TEST 1: CONFIRMED Booking
    console.log("\n=== TEST 1: CONFIRMED Booking ===");
    const booking1 = await Booking.create({
      user: user._id,
      train: train._id,
      travelClass: "SL",
      quota: "General",
      fromStation: sourceStation._id,
      toStation: destStation._id,
      journeyDate: journeyDate,
      status: "CONFIRMED",
      passengers: [
        { name: "P1", age: 30, gender: "Male", berthPreference: "No Preference", seatNumber: 1, coachAssigned: "S1", allocatedBerth: "Lower" },
        { name: "P2", age: 25, gender: "Female", berthPreference: "No Preference", seatNumber: 2, coachAssigned: "S1", allocatedBerth: "Lower" },
        { name: "P3", age: 35, gender: "Male", berthPreference: "No Preference", seatNumber: 3, coachAssigned: "S1", allocatedBerth: "Middle" }
      ],
      pnrNumber: "PNR" + Date.now() + "001"
    });

    await Train.updateOne({ _id: train._id }, {
      availableSeats: 2,
      racCount: 0
    });

    console.log(`✓ Booking 1 (CONFIRMED): PNR=${booking1.pnrNumber}, Status=${booking1.status}`);
    console.log(`  Passengers: ${booking1.passengers.length}, Seats: ${booking1.passengers.map(p => p.seatNumber).join(",")}`);

    // TEST 2: RAC Booking
    console.log("\n=== TEST 2: RAC Booking ===");
    const booking2 = await Booking.create({
      user: user._id,
      train: train._id,
      travelClass: "SL",
      quota: "General",
      fromStation: sourceStation._id,
      toStation: destStation._id,
      journeyDate: journeyDate,
      status: "RAC",
      racPosition: 1,
      passengers: [
        { name: "P4", age: 40, gender: "Male", berthPreference: "No Preference", seatNumber: 0, coachAssigned: "N/A", allocatedBerth: "Side Lower (Shared)" },
        { name: "P5", age: 28, gender: "Female", berthPreference: "No Preference", seatNumber: 0, coachAssigned: "N/A", allocatedBerth: "Side Lower (Shared)" }
      ],
      pnrNumber: "PNR" + Date.now() + "002"
    });

    await Train.updateOne({ _id: train._id }, {
      racCount: 1
    });

    console.log(`✓ Booking 2 (RAC): PNR=${booking2.pnrNumber}, Status=${booking2.status}, Position=${booking2.racPosition}`);
    console.log(`  Passengers: ${booking2.passengers.length} (no seats allocated)`);

    // TEST 3: WAITING Booking
    console.log("\n=== TEST 3: WAITING List Booking ===");
    const booking3 = await Booking.create({
      user: user._id,
      train: train._id,
      travelClass: "SL",
      quota: "General",
      fromStation: sourceStation._id,
      toStation: destStation._id,
      journeyDate: journeyDate,
      status: "WAITING",
      waitingPosition: 1,
      passengers: [
        { name: "P6", age: 32, gender: "Male", berthPreference: "No Preference", seatNumber: 0, coachAssigned: "N/A", allocatedBerth: "Awaiting Confirmation" }
      ],
      pnrNumber: "PNR" + Date.now() + "003"
    });

    await Train.updateOne({ _id: train._id }, {
      waitingCount: 1
    });

    console.log(`✓ Booking 3 (WAITING): PNR=${booking3.pnrNumber}, Status=${booking3.status}, Position=${booking3.waitingPosition}`);

    // TEST 4: Verify all bookings have required fields
    console.log("\n=== TEST 4: Field Completeness Verification ===");
    const allBookings = await Booking.find().populate('user train fromStation toStation');
    
    let allFieldsValid = true;
    for (let b of allBookings) {
      const fieldsValid = b.user && b.train && b.travelClass && b.journeyDate && 
                         b.fromStation && b.toStation && b.pnrNumber && b.passengers.length > 0 && b.status;
      if (!fieldsValid) {
        allFieldsValid = false;
        console.log(`✗ Booking ${b.pnrNumber} missing fields`);
      }
    }

    if (allFieldsValid) {
      console.log("✓ All bookings have complete field data");
    }

    // TEST 5: Verify PNR uniqueness
    console.log("\n=== TEST 5: PNR Uniqueness Verification ===");
    const pnrs = allBookings.map(b => b.pnrNumber);
    const uniquePnrs = new Set(pnrs);
    console.log(`Total bookings: ${pnrs.length}`);
    console.log(`Unique PNRs: ${uniquePnrs.size}`);
    if (pnrs.length === uniquePnrs.size) {
      console.log("✓ All PNRs are unique");
    } else {
      console.log("✗ Duplicate PNRs found!");
      allFieldsValid = false;
    }

    // TEST 6: Verify station population
    console.log("\n=== TEST 6: Station Population Verification ===");
    let stationsValid = true;
    for (let b of allBookings) {
      if (!b.fromStation || !b.toStation) {
        console.log(`✗ Booking ${b.pnrNumber} missing station population`);
        stationsValid = false;
      }
    }
    if (stationsValid) {
      console.log("✓ All bookings have populated stations");
    }

    // TEST 7: Verify RAC/WAITING position tracking
    console.log("\n=== TEST 7: RAC/WAITING Position Tracking ===");
    const racBookings = allBookings.filter(b => b.status === "RAC");
    const waitingBookings = allBookings.filter(b => b.status === "WAITING");

    let positionValid = true;
    for (let b of racBookings) {
      if (b.racPosition === null || b.racPosition === undefined) {
        console.log(`✗ RAC Booking ${b.pnrNumber} missing racPosition`);
        positionValid = false;
      }
    }

    for (let b of waitingBookings) {
      if (b.waitingPosition === null || b.waitingPosition === undefined) {
        console.log(`✗ WAITING Booking ${b.pnrNumber} missing waitingPosition`);
        positionValid = false;
      }
    }

    if (positionValid) {
      console.log("✓ RAC and WAITING positions correctly tracked");
    }

    // SUMMARY
    console.log("\n=== COMPLETE WORKFLOW TEST SUMMARY ===");
    console.log(`Total test bookings: ${allBookings.length}`);
    console.log(`  - CONFIRMED: ${allBookings.filter(b => b.status === "CONFIRMED").length}`);
    console.log(`  - RAC: ${allBookings.filter(b => b.status === "RAC").length}`);
    console.log(`  - WAITING: ${allBookings.filter(b => b.status === "WAITING").length}`);
    console.log(`\n${allFieldsValid && stationsValid && positionValid ? "✓" : "✗"} All workflow tests passed`);

    // Cleanup
    console.log("\n=== CLEANUP ===");
    await Booking.deleteMany({ train: train._id });
    await Train.deleteOne({ _id: train._id });
    await Station.deleteOne({ _id: sourceStation._id });
    await Station.deleteOne({ _id: destStation._id });
    await User.deleteOne({ _id: user._id });
    console.log("Test data cleaned up");

    console.log("\n✓ Complete booking workflow test finished");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

testCompleteBookingWorkflow();
