const Booking = require("../models/Booking");
const Train = require("../models/Train");

// Book Ticket
const bookTicket = async (req, res) => {

  try {

    const {
      userId,
      trainId,
      passengers,
      quota,
      travelClass
    } = req.body;

    // ===== PRIORITY 4: BOOKING ENGINE AUDIT - INPUT VALIDATION =====

    console.log("BOOKING REQUEST - PRIORITY 4 AUDIT", {
      userId,
      trainId,
      travelClass,
      quota,
      passengerCount: passengers?.length,
      fromStation: req.body.fromStation,
      toStation: req.body.toStation,
      journeyDate: req.body.journeyDate
    });

    // PRIORITY 4: Validate required fields
    if (!userId) {
      return res.status(400).json({
        message: "User ID is required"
      });
    }

    if (!trainId) {
      return res.status(400).json({
        message: "Train ID is required"
      });
    }

    // PRIORITY 4: Validate journey date
    if (!req.body.journeyDate) {
      return res.status(400).json({
        message: "Journey date is required"
      });
    }

    const journeyDate = new Date(req.body.journeyDate);
    if (isNaN(journeyDate.getTime())) {
      return res.status(400).json({
        message: "Invalid journey date format"
      });
    }

    // PRIORITY 4: Validate source station
    if (!req.body.fromStation) {
      return res.status(400).json({
        message: "Source station (fromStation) is required"
      });
    }

    // PRIORITY 4: Validate destination station
    if (!req.body.toStation) {
      return res.status(400).json({
        message: "Destination station (toStation) is required"
      });
    }

    // PRIORITY 4: Validate passenger data
    if (!passengers || passengers.length === 0) {
      return res.status(400).json({
        message: "At least one passenger required"
      });
    }

    // Validate each passenger has required fields
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name) {
        return res.status(400).json({
          message: `Passenger ${i + 1}: Name is required`
        });
      }
      if (!p.age || p.age < 0) {
        return res.status(400).json({
          message: `Passenger ${i + 1}: Valid age is required`
        });
      }
      if (!p.gender) {
        return res.status(400).json({
          message: `Passenger ${i + 1}: Gender is required`
        });
      }
    }

    // Validate travel class (PRIORITY 3: Prevent invalid classes)
    const validClasses = ["SL", "3A", "2A"];
    if (!validClasses.includes(travelClass)) {
      return res.status(400).json({
        message: `Invalid travel class. Supported classes: ${validClasses.join(", ")}`
      });
    }

    // Find Train
    const train = await Train.findById(trainId);

    if (!train) {
      return res.status(404).json({
        message: "Train not found"
      });
    }

    // PRIORITY 4: Import Station model for validation
    const Station = require("../models/Station");

    // PRIORITY 4: Validate source station exists
    const sourceStation = await Station.findById(req.body.fromStation);
    if (!sourceStation) {
      return res.status(404).json({
        message: "Source station not found"
      });
    }

    // PRIORITY 4: Validate destination station exists
    const destStation = await Station.findById(req.body.toStation);
    if (!destStation) {
      return res.status(404).json({
        message: "Destination station not found"
      });
    }

    // PRIORITY 4: Validate source and destination are different
    if (req.body.fromStation.toString() === req.body.toStation.toString()) {
      return res.status(400).json({
        message: "Source and destination stations must be different"
      });
    }

    console.log("PRIORITY 4 VALIDATION PASSED:", {
      userValidated: true,
      trainValidated: true,
      journeyDateValidated: true,
      sourceStationValidated: sourceStation.name,
      destStationValidated: destStation.name,
      passengersValidated: passengers.length,
      travelClassValidated: travelClass
    });

    // ===== PRIORITY 3: CLASS-WISE COACH FILTERING =====

    // Find Selected Class Coaches ONLY (Prevent cross-class allocation)
    const classCoaches = train.coaches.filter(
      coach => coach.classType === travelClass
    );

    if (classCoaches.length === 0) {
      return res.status(400).json({
        message: `No coaches available for ${travelClass} class on this train`
      });
    }

    // Log class coaches for debugging
    console.log(`CLASS COACHES FOR ${travelClass}:`, {
      count: classCoaches.length,
      coaches: classCoaches.map(c => ({ name: c.coachName, available: c.availableSeats }))
    });

    // Calculate class-wise available seats
    const classAvailableSeats = classCoaches.reduce(
      (sum, coach) => sum + coach.availableSeats,
      0
    );

    console.log(`CLASS AVAILABILITY CHECK:`, {
      travelClass,
      totalClassSeats: classCoaches.reduce((sum, c) => sum + c.totalSeats, 0),
      availableSeats: classAvailableSeats,
      requestedSeats: passengers.length
    });

    let bookingStatus = "CONFIRMED";
    let racPosition = null;
    let waitingPosition = null;
    let seatAllocationData = [];
    let coachAllocationMap = {}; // Priority 3: Track coach-wise allocation

    // ===== PRIORITY 3: CLASS-WISE SEAT ALLOCATION =====

    // STEP 1: Check class-wise seat availability
    if (classAvailableSeats >= passengers.length) {
      
      bookingStatus = "CONFIRMED";
      
      console.log("SEAT STATUS: CONFIRMED - Allocating seats from class coaches");
      
      // PRIORITY 3: Allocate seats ONLY from selected class coaches
      let remainingPassengers = passengers.length;
      
      for (let coach of classCoaches) {
        if (remainingPassengers <= 0) break;

        const deduct = Math.min(
          coach.availableSeats,
          remainingPassengers
        );

        if (deduct > 0) {
          // Initialize coach allocation map
          if (!coachAllocationMap[coach.coachName]) {
            coachAllocationMap[coach.coachName] = {
              className: coach.classType,
              seatsAllocated: 0,
              seatsList: []
            };
          }

          // PRIORITY 3: Calculate correct seat numbers for this coach
          // Seat numbers start from (totalSeats - availableSeats + 1)
          const firstSeatInCoach = coach.totalSeats - coach.availableSeats + 1;

          // Record seat allocation for each passenger
          for (let i = 0; i < deduct; i++) {
            const seatNumber = firstSeatInCoach + i;
            
            seatAllocationData.push({
              coachName: coach.coachName,
              classType: coach.classType,
              seatNumber: seatNumber
            });

            // Track in coach allocation map
            coachAllocationMap[coach.coachName].seatsAllocated += 1;
            coachAllocationMap[coach.coachName].seatsList.push(seatNumber);
          }

          // PRIORITY 3: Deduct from coach availableSeats (synchronization)
          coach.availableSeats -= deduct;
          remainingPassengers -= deduct;

          console.log(`COACH ${coach.coachName} ALLOCATION:`, {
            classType: coach.classType,
            seatsAllocated: deduct,
            availableAfter: coach.availableSeats,
            totalInCoach: coach.totalSeats
          });
        }
      }

      // PRIORITY 3: Deduct from train total (synchronization)
      train.availableSeats -= passengers.length;

      console.log("ALLOCATION SUMMARY:", {
        travelClass,
        totalPassengers: passengers.length,
        coachesUsed: Object.keys(coachAllocationMap),
        trainSeatsAfter: train.availableSeats
      });

    }

    // STEP 2: Check RAC availability
    else if (train.racCount < train.racLimit) {
      
      bookingStatus = "RAC";
      racPosition = train.racCount + 1;
      train.racCount += 1;

      console.log("SEAT STATUS: RAC - No seats in selected class, reserved against cancellation", {
        racPosition,
        racLimit: train.racLimit
      });

    }

    // STEP 3: Check WAITING LIST availability
    else if (train.waitingCount < train.waitingLimit) {
      
      bookingStatus = "WAITING";
      waitingPosition = train.waitingCount + 1;
      train.waitingCount += 1;

      console.log("SEAT STATUS: WAITING - RAC full, added to waiting list", {
        waitingPosition,
        waitingLimit: train.waitingLimit
      });

    }

    // STEP 4: No seats available
    else {
      return res.status(400).json({
        message: "No tickets available (confirmed, RAC, or waiting list full)"
      });
    }

    // ===== PRIORITY 3: CLASS-WISE PASSENGER DATA PREPARATION =====

    // Prepare passenger data based on booking status
    const passengersData = passengers.map((p, index) => {
      const passengerData = {
        name: p.name,
        age: p.age,
        gender: p.gender,
        berthPreference: p.berthPreference || "No Preference",
        seatNumber: 0,
        coachAssigned: "N/A",
        allocatedBerth: "N/A"
      };

      // Only allocate actual seats for CONFIRMED bookings (PRIORITY 3: Class-specific)
      if (bookingStatus === "CONFIRMED" && seatAllocationData[index]) {
        const allocation = seatAllocationData[index];
        
        // PRIORITY 3: Ensure coach is from the selected class
        if (allocation.classType !== travelClass) {
          throw new Error(`Cross-class allocation detected: ${allocation.classType} != ${travelClass}`);
        }

        passengerData.coachAssigned = allocation.coachName;
        passengerData.seatNumber = allocation.seatNumber;
        
        // Assign berth based on preferences
        if (p.age >= 60) {
          passengerData.allocatedBerth = "Lower";
        } else if (p.gender === "Female") {
          passengerData.allocatedBerth = "Lower";
        } else {
          passengerData.allocatedBerth = p.berthPreference || "Middle";
        }
      } else if (bookingStatus === "RAC") {
        // RAC bookings get tentative berth assignment (no seat allocated)
        passengerData.allocatedBerth = "Side Lower (Shared)";
      } else if (bookingStatus === "WAITING") {
        // Waiting list bookings have no berth assignment
        passengerData.allocatedBerth = "Awaiting Confirmation";
      }

      return passengerData;
    });

    // ===== PRIORITY 4: PNR GENERATION WITH UNIQUENESS CHECK =====

    let pnrNumber;
    let pnrExists = true;
    let attempts = 0;
    const maxAttempts = 5;

    // Keep generating PNR until unique one is created
    while (pnrExists && attempts < maxAttempts) {
      pnrNumber = "PNR" + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
      
      const existingPnr = await Booking.findOne({ pnrNumber });
      if (!existingPnr) {
        pnrExists = false;
        console.log("PRIORITY 4 PNR GENERATION:", {
          pnrNumber,
          unique: true,
          attempts: attempts + 1
        });
      }
      attempts++;
    }

    if (pnrExists) {
      return res.status(500).json({
        message: "Failed to generate unique PNR after multiple attempts"
      });
    }

    // ===== PRIORITY 4: CREATE BOOKING WITH ALL VALIDATED FIELDS =====

    const booking = await Booking.create({
      user: userId,
      train: trainId,
      travelClass, // PRIORITY 3: Store class for future validation
      quota: quota || "General",
      fromStation: req.body.fromStation, // PRIORITY 4: Validated
      toStation: req.body.toStation, // PRIORITY 4: Validated
      journeyDate: journeyDate, // PRIORITY 4: Validated and stored
      status: bookingStatus,
      racPosition: racPosition,
      waitingPosition: waitingPosition,
      pnrNumber: pnrNumber, // PRIORITY 4: Unique PNR
      passengers: passengersData
    });

    // Verify booking was created with all fields
    console.log("PRIORITY 4 BOOKING VERIFICATION:", {
      bookingCreated: true,
      bookingId: booking._id,
      userStored: booking.user ? true : false,
      trainStored: booking.train ? true : false,
      travelClassStored: booking.travelClass ? true : false,
      journeyDateStored: booking.journeyDate ? true : false,
      sourceStationStored: booking.fromStation ? true : false,
      destStationStored: booking.toStation ? true : false,
      pnrGenerated: booking.pnrNumber ? true : false,
      passengersCount: booking.passengers.length,
      bookingStatusStored: booking.status
    });

    await train.save();

    console.log("BOOKING CREATED", {
      bookingId: booking._id,
      status: booking.status,
      travelClass: booking.travelClass,
      journeyDate: booking.journeyDate,
      fromStation: booking.fromStation,
      toStation: booking.toStation,
      pnr: booking.pnrNumber,
      racPosition: booking.racPosition,
      waitingPosition: booking.waitingPosition,
      coachAllocation: coachAllocationMap
    });

    res.status(201).json({
      message: "Ticket booked successfully",
      booking: {
        ...booking.toObject(),
        statusDisplay: bookingStatus === "RAC" 
          ? `RAC ${racPosition}` 
          : bookingStatus === "WAITING"
          ? `WL ${waitingPosition}`
          : bookingStatus,
        classAllocationSummary: bookingStatus === "CONFIRMED" ? coachAllocationMap : null
      }
    });

  } catch (error) {
    console.error("BOOKING ERROR:", error);
    res.status(500).json({
      message: error.message
    });
  }

};

// Get User Bookings
const getUserBookings = async (req, res) => {

  try {

    const { userId } =
      req.params;

    const bookings =
      await Booking.find({

        user: userId

      }).populate("train");

    res.status(200).json(
      bookings
    );

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

// Cancel Booking
const cancelBooking = async (req, res) => {

  try {

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        message: "Booking is already cancelled"
      });
    }

    // Find Train
    const train = await Train.findById(booking.train);

    if (!train) {
      return res.status(500).json({
        message: "Train not found"
      });
    }

    // Store original status before cancelling
    const originalStatus = booking.status;

    // STEP 1: Cancel the booking
    booking.status = "CANCELLED";
    booking.cancelledAt = new Date();
    await booking.save();

    console.log("BOOKING CANCELLED:", {
      bookingId: booking._id,
      previousStatus: originalStatus
    });

    // ===== PRIORITY 2: UPGRADE CHAIN =====

    // STEP 2: If CONFIRMED booking was cancelled, restore seats
    if (originalStatus === "CONFIRMED") {
      
      // ===== PRIORITY 3: RESTORE TO CORRECT COACH =====
      console.log("SEAT RESTORATION (Priority 3 - Class-wise):", {
        travelClass: booking.travelClass,
        passengersToRestore: booking.passengers.length,
        coachesInvolved: [...new Set(booking.passengers.map(p => p.coachAssigned))]
      });

      // Group passengers by coach to restore to correct coach
      const coachRestoreMap = {};
      
      for (let passenger of booking.passengers) {
        const coach = passenger.coachAssigned;
        if (coach && coach !== "N/A") {
          if (!coachRestoreMap[coach]) {
            coachRestoreMap[coach] = 0;
          }
          coachRestoreMap[coach]++;
        }
      }

      // Restore seats to the CORRECT coaches (Priority 3)
      for (let coachName in coachRestoreMap) {
        const seatsToRestore = coachRestoreMap[coachName];
        
        // Find the specific coach
        const targetCoach = train.coaches.find(c => c.coachName === coachName);
        
        if (targetCoach) {
          targetCoach.availableSeats += seatsToRestore;
          
          console.log("COACH SEAT RESTORATION:", {
            coachName: coachName,
            classType: targetCoach.classType,
            seatsRestored: seatsToRestore,
            availableAfter: targetCoach.availableSeats
          });
        }
      }

      train.availableSeats += booking.passengers.length;

      console.log("TOTAL TRAIN SEATS RESTORED:", {
        seatsRestored: booking.passengers.length,
        trainAvailableAfter: train.availableSeats
      });

      // STEP 3: Promote oldest RAC to CONFIRMED (triggered by CONFIRMED cancellation)
      if (train.racCount > 0) {

        const oldestRac = await Booking.findOne({
          train: booking.train,
          status: "RAC"
        }).sort({ createdAt: 1 });

        if (oldestRac) {

          console.log("PROMOTING RAC TO CONFIRMED:", {
            racBookingId: oldestRac._id,
            racPosition: oldestRac.racPosition,
            travelClass: oldestRac.travelClass
          });

          // ===== PRIORITY 3: CLASS-WISE COACH ALLOCATION FOR RAC UPGRADE =====
          
          // Get ONLY class-wise coaches to prevent cross-class allocation
          const racClassCoaches = train.coaches.filter(
            coach => coach.classType === oldestRac.travelClass
          );

          console.log(`RAC UPGRADE - CLASS COACHES (${oldestRac.travelClass}):`, {
            count: racClassCoaches.length,
            coaches: racClassCoaches.map(c => ({ name: c.coachName, available: c.availableSeats }))
          });

          let remainingPassengers = oldestRac.passengers.length;
          const seatAllocationData = [];
          const coachAllocationMap = {};

          for (let coach of racClassCoaches) {
            if (remainingPassengers <= 0) break;

            const deduct = Math.min(
              coach.availableSeats,
              remainingPassengers
            );

            if (deduct > 0) {
              if (!coachAllocationMap[coach.coachName]) {
                coachAllocationMap[coach.coachName] = {
                  classType: coach.classType,
                  seatsAllocated: 0
                };
              }

              // ===== PRIORITY 3: CORRECT SEAT NUMBER CALCULATION =====
              const firstSeatInCoach = coach.totalSeats - coach.availableSeats + 1;

              for (let i = 0; i < deduct; i++) {
                const seatNumber = firstSeatInCoach + i;
                
                seatAllocationData.push({
                  coachName: coach.coachName,
                  seatNumber: seatNumber,
                  classType: coach.classType
                });

                coachAllocationMap[coach.coachName].seatsAllocated += 1;
              }

              coach.availableSeats -= deduct;
              remainingPassengers -= deduct;

              console.log(`COACH ${coach.coachName} (RAC UPGRADE):`, {
                classType: coach.classType,
                seatsAllocated: deduct,
                availableAfter: coach.availableSeats
              });
            }
          }

          train.availableSeats -= oldestRac.passengers.length;

          // Update RAC booking to CONFIRMED with seat allocations
          oldestRac.status = "CONFIRMED";
          oldestRac.racPosition = null;

          oldestRac.passengers = oldestRac.passengers.map((p, index) => {
            const updated = { ...p.toObject ? p.toObject() : p };
            
            if (seatAllocationData[index]) {
              // ===== PRIORITY 3: VALIDATION - Ensure class match =====
              if (seatAllocationData[index].classType !== oldestRac.travelClass) {
                throw new Error(`Cross-class allocation on RAC upgrade: ${seatAllocationData[index].classType} != ${oldestRac.travelClass}`);
              }

              updated.coachAssigned = seatAllocationData[index].coachName;
              updated.seatNumber = seatAllocationData[index].seatNumber;
            }

            if (p.age >= 60) {
              updated.allocatedBerth = "Lower";
            } else if (p.gender === "Female") {
              updated.allocatedBerth = "Lower";
            } else {
              updated.allocatedBerth = p.berthPreference || "Middle";
            }

            return updated;
          });

          oldestRac.notification = "🎉 Your RAC ticket has been upgraded to CONFIRMED!";
          oldestRac.notificationType = "upgrade";

          await oldestRac.save();

          train.racCount -= 1;

          // STEP 4: Promote oldest WL to RAC (cascading upgrade)
          if (train.waitingCount > 0) {

            const oldestWl = await Booking.findOne({
              train: booking.train,
              status: "WAITING"
            }).sort({ createdAt: 1 });

            if (oldestWl) {

              console.log("PROMOTING WL TO RAC (from CONFIRMED cancel):", {
                wlBookingId: oldestWl._id,
                wlPosition: oldestWl.waitingPosition
              });

              oldestWl.status = "RAC";
              oldestWl.waitingPosition = null;
              oldestWl.racPosition = train.racCount + 1;

              oldestWl.passengers = oldestWl.passengers.map(p => {
                const updated = { ...p.toObject ? p.toObject() : p };
                updated.allocatedBerth = "Side Lower (Shared)";
                return updated;
              });

              oldestWl.notification = "📝 Your waiting list ticket has been moved to RAC!";
              oldestWl.notificationType = "upgrade";

              await oldestWl.save();

              train.racCount += 1;
              train.waitingCount -= 1;

              // STEP 5: Recalculate all remaining WL positions
              const allWaitingBookings = await Booking.find({
                train: booking.train,
                status: "WAITING"
              }).sort({ createdAt: 1 });

              for (let i = 0; i < allWaitingBookings.length; i++) {
                allWaitingBookings[i].waitingPosition = i + 1;
                await allWaitingBookings[i].save();
              }
            }
          }
        }
      }
    }

    // STEP 6: If RAC booking was cancelled, promote WL to RAC
    else if (originalStatus === "RAC") {

      console.log("RAC BOOKING CANCELLED, checking for WL promotion:", {
        racPosition: booking.racPosition
      });

      if (train.waitingCount > 0) {

        const oldestWl = await Booking.findOne({
          train: booking.train,
          status: "WAITING"
        }).sort({ createdAt: 1 });

        if (oldestWl) {

          console.log("PROMOTING WL TO RAC (from RAC cancel):", {
            wlBookingId: oldestWl._id,
            wlPosition: oldestWl.waitingPosition
          });

          oldestWl.status = "RAC";
          oldestWl.waitingPosition = null;
          oldestWl.racPosition = booking.racPosition; // Take the position of cancelled RAC

          oldestWl.passengers = oldestWl.passengers.map(p => {
            const updated = { ...p.toObject ? p.toObject() : p };
            updated.allocatedBerth = "Side Lower (Shared)";
            return updated;
          });

          oldestWl.notification = "📝 Your waiting list ticket has been moved to RAC!";
          oldestWl.notificationType = "upgrade";

          await oldestWl.save();

          train.waitingCount -= 1;

          // STEP 7: Recalculate RAC positions (shift down higher positions)
          const allRacBookings = await Booking.find({
            train: booking.train,
            status: "RAC"
          }).sort({ racPosition: 1 });

          let positionCounter = 1;
          for (let racBooking of allRacBookings) {
            if (racBooking.racPosition > booking.racPosition) {
              racBooking.racPosition = positionCounter;
              await racBooking.save();
              positionCounter++;
            }
          }

          // STEP 8: Recalculate WL positions
          const allWaitingBookings = await Booking.find({
            train: booking.train,
            status: "WAITING"
          }).sort({ createdAt: 1 });

          for (let i = 0; i < allWaitingBookings.length; i++) {
            allWaitingBookings[i].waitingPosition = i + 1;
            await allWaitingBookings[i].save();
          }
        } else {
          // No WL to promote, but still need to recalculate RAC positions
          const allRacBookings = await Booking.find({
            train: booking.train,
            status: "RAC"
          }).sort({ racPosition: 1 });

          let positionCounter = 1;
          for (let racBooking of allRacBookings) {
            if (racBooking.racPosition > booking.racPosition) {
              racBooking.racPosition = positionCounter;
              await racBooking.save();
              positionCounter++;
            }
          }
        }
      }
    }

    // STEP 9: If WAITING list booking was cancelled, recalculate WL positions
    else if (originalStatus === "WAITING") {

      console.log("WAITING BOOKING CANCELLED, recalculating WL positions:", {
        wlPosition: booking.waitingPosition
      });

      // Recalculate WL positions
      const allWaitingBookings = await Booking.find({
        train: booking.train,
        status: "WAITING"
      }).sort({ createdAt: 1 });

      for (let i = 0; i < allWaitingBookings.length; i++) {
        allWaitingBookings[i].waitingPosition = i + 1;
        await allWaitingBookings[i].save();
      }
    }

    await train.save();

    res.status(200).json({
      message: "Booking cancelled successfully and queue updated"
    });

  } catch (error) {
    console.error("CANCEL BOOKING ERROR:", error);
    res.status(500).json({
      message: error.message
    });
  }

};

// ===== PRIORITY 4: BOOKING ENGINE AUDIT =====

// Verify booking schema and controller consistency
const auditBookingEngine = async (req, res) => {

  try {

    console.log("PRIORITY 4: BOOKING ENGINE AUDIT STARTED");

    // Get all bookings
    const allBookings = await Booking.find({}).populate("user train fromStation toStation");

    const auditResults = {
      totalBookings: allBookings.length,
      passed: 0,
      failed: 0,
      issues: [],
      fieldValidation: {
        userStored: 0,
        trainStored: 0,
        travelClassStored: 0,
        journeyDateStored: 0,
        sourceStationStored: 0,
        destStationStored: 0,
        pnrGenerated: 0,
        passengersStored: 0,
        statusStored: 0
      }
    };

    // Audit each booking
    for (let booking of allBookings) {
      let bookingValid = true;

      // PRIORITY 4: Check user
      if (!booking.user) {
        auditResults.issues.push({
          bookingId: booking._id,
          issue: "User not stored"
        });
        bookingValid = false;
      } else {
        auditResults.fieldValidation.userStored++;
      }

      // PRIORITY 4: Check train
      if (!booking.train) {
        auditResults.issues.push({
          bookingId: booking._id,
          issue: "Train not stored"
        });
        bookingValid = false;
      } else {
        auditResults.fieldValidation.trainStored++;
      }

      // PRIORITY 4: Check travel class
      if (!booking.travelClass || !["SL", "3A", "2A"].includes(booking.travelClass)) {
        auditResults.issues.push({
          bookingId: booking._id,
          issue: "Travel class not stored or invalid",
          value: booking.travelClass
        });
        bookingValid = false;
      } else {
        auditResults.fieldValidation.travelClassStored++;
      }

      // PRIORITY 4: Check journey date
      if (!booking.journeyDate) {
        auditResults.issues.push({
          bookingId: booking._id,
          issue: "Journey date not stored"
        });
        bookingValid = false;
      } else {
        auditResults.fieldValidation.journeyDateStored++;
      }

      // PRIORITY 4: Check source station
      if (!booking.fromStation) {
        auditResults.issues.push({
          bookingId: booking._id,
          issue: "Source station (fromStation) not stored"
        });
        bookingValid = false;
      } else {
        auditResults.fieldValidation.sourceStationStored++;
      }

      // PRIORITY 4: Check destination station
      if (!booking.toStation) {
        auditResults.issues.push({
          bookingId: booking._id,
          issue: "Destination station (toStation) not stored"
        });
        bookingValid = false;
      } else {
        auditResults.fieldValidation.destStationStored++;
      }

      // PRIORITY 4: Check PNR
      if (!booking.pnrNumber) {
        auditResults.issues.push({
          bookingId: booking._id,
          issue: "PNR not generated"
        });
        bookingValid = false;
      } else {
        auditResults.fieldValidation.pnrGenerated++;
      }

      // PRIORITY 4: Check passengers
      if (!booking.passengers || booking.passengers.length === 0) {
        auditResults.issues.push({
          bookingId: booking._id,
          issue: "Passenger data not stored"
        });
        bookingValid = false;
      } else {
        auditResults.fieldValidation.passengersStored++;

        // Verify each passenger has required fields
        for (let i = 0; i < booking.passengers.length; i++) {
          const p = booking.passengers[i];
          if (!p.name || !p.age || !p.gender) {
            auditResults.issues.push({
              bookingId: booking._id,
              passengerIndex: i,
              issue: "Passenger missing required fields"
            });
            bookingValid = false;
          }
        }
      }

      // PRIORITY 4: Check booking status
      if (!booking.status || !["CONFIRMED", "RAC", "WAITING", "CANCELLED"].includes(booking.status)) {
        auditResults.issues.push({
          bookingId: booking._id,
          issue: "Booking status not stored or invalid",
          value: booking.status
        });
        bookingValid = false;
      } else {
        auditResults.fieldValidation.statusStored++;
      }

      // PRIORITY 4: Check schema-controller consistency
      if (booking.status === "RAC" && booking.racPosition === null) {
        auditResults.issues.push({
          bookingId: booking._id,
          issue: "RAC booking missing racPosition"
        });
        bookingValid = false;
      }

      if (booking.status === "WAITING" && booking.waitingPosition === null) {
        auditResults.issues.push({
          bookingId: booking._id,
          issue: "WAITING booking missing waitingPosition"
        });
        bookingValid = false;
      }

      if (bookingValid) {
        auditResults.passed++;
      } else {
        auditResults.failed++;
      }
    }

    // Calculate compliance
    auditResults.compliancePercentage = allBookings.length > 0 
      ? ((auditResults.passed / allBookings.length) * 100).toFixed(2)
      : 100;

    console.log("PRIORITY 4: BOOKING ENGINE AUDIT COMPLETED", auditResults);

    res.status(200).json({
      message: "Booking engine audit completed",
      audit: auditResults
    });

  } catch (error) {
    console.error("AUDIT ERROR:", error);
    res.status(500).json({
      message: error.message
    });
  }

};

module.exports = { bookTicket, getUserBookings, cancelBooking, auditBookingEngine };