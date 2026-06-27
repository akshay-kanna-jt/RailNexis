const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Station = require('./models/Station');

async function testStationPopulation() {
  try {
    await mongoose.connect('mongodb://localhost:27017/railnexis');
    console.log("✓ Connected to database");

    // Test 1: Get a booking and check station population
    console.log("\n=== TEST 1: Station Population ===");
    const booking = await Booking.findOne().populate('fromStation toStation');
    
    if (booking) {
      console.log("Booking found:");
      console.log("  - Has fromStation:", !!booking.fromStation);
      console.log("  - Has toStation:", !!booking.toStation);
      if (booking.fromStation) {
        console.log("  - Source Station:", booking.fromStation.name, `(${booking.fromStation.code})`);
      }
      if (booking.toStation) {
        console.log("  - Dest Station:", booking.toStation.name, `(${booking.toStation.code})`);
      }
    } else {
      console.log("No bookings found in database");
    }

    // Test 2: Check PNR uniqueness
    console.log("\n=== TEST 2: PNR Uniqueness ===");
    const allBookings = await Booking.find().select('pnrNumber');
    const pnrSet = new Set();
    let duplicates = 0;
    
    for (let b of allBookings) {
      if (pnrSet.has(b.pnrNumber)) {
        duplicates++;
        console.log("⚠ Duplicate PNR:", b.pnrNumber);
      }
      pnrSet.add(b.pnrNumber);
    }
    
    console.log("Total bookings:", allBookings.length);
    console.log("Unique PNRs:", pnrSet.size);
    console.log("Duplicates:", duplicates);
    console.log("Status:", duplicates === 0 ? "✓ All PNRs unique" : "✗ Duplicates found");

    // Test 3: Verify schema consistency
    console.log("\n=== TEST 3: Schema Consistency ===");
    const sampleBookings = await Booking.find().limit(5).populate('user train fromStation toStation');
    
    for (let i = 0; i < sampleBookings.length; i++) {
      const b = sampleBookings[i];
      console.log(`\nBooking ${i + 1}:`);
      console.log("  - user:", !!b.user);
      console.log("  - train:", !!b.train);
      console.log("  - travelClass:", b.travelClass);
      console.log("  - journeyDate:", b.journeyDate ? b.journeyDate.toDateString() : "null");
      console.log("  - fromStation:", b.fromStation ? b.fromStation.name : "null");
      console.log("  - toStation:", b.toStation ? b.toStation.name : "null");
      console.log("  - pnrNumber:", b.pnrNumber);
      console.log("  - status:", b.status);
      console.log("  - passengers:", b.passengers.length);
      
      if (b.status === "RAC" && b.racPosition === null) {
        console.log("  ⚠ RAC booking missing racPosition!");
      }
      if (b.status === "WAITING" && b.waitingPosition === null) {
        console.log("  ⚠ WAITING booking missing waitingPosition!");
      }
    }

    console.log("\n✓ Tests completed");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

testStationPopulation();
