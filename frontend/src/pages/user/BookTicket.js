import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";


function BookTicket() {

  const location = useLocation();
  const navigate = useNavigate();
  const train = location.state?.train;
  const journeyDate = location.state?.journeyDate;
  const fromStation = location.state?.fromStation;
  const toStation = location.state?.toStation;

  const [selectedClass, setSelectedClass] = useState("");
  const [quota, setQuota] = useState("General");
  const [showForm, setShowForm] = useState(false);

  const [passengers, setPassengers] = useState([
    {
      name: "",
      age: "",
      gender: "",
      berthPreference: ""
    }
  ]);

  const user = JSON.parse(localStorage.getItem("user"));

  const smartSuggestion =
selectedClass === "SL"
? "Best for budget travel"
: selectedClass === "3A"
? "Best balance of comfort and price"
: selectedClass === "2A"
? "Comfortable long-distance journey"
: selectedClass === "1A"
? "Premium luxury experience"
: "Select class for recommendation";

  useEffect(() => {

    setSelectedClass("");
    setShowForm(false);

    setPassengers([
      {
        name: "",
        age: "",
        gender: "",
        berthPreference: ""
      }
    ]);

  }, [train]);

  if (!train) {

return(

<div>

<Navbar/>

<div style={{
padding:"40px"
}}>

<h2>
⚠ No Train Selected
</h2>

<p>
Please search and select
a train first.
</p>

</div>

</div>

);

}

  // 🔥 PRICE LOGIC
  const getPrice = (cls) => {
  const distance =
train.route?.length
? train.route.length * 120
: 0;
  switch (cls) {

    case "SL":
      return Math.round(
        distance * 0.6
      );

    case "3A":
      return Math.round(
        distance * 1.2
      );

    case "2A":
      return Math.round(
        distance * 1.8
      );

    default:
      return 0;

  }
};

  // 🔥 HANDLE PASSENGER INPUT
  const handlePassengerChange = (index, field, value) => {

    const updated = [...passengers];

    updated[index][field] = value;

    setPassengers(updated);
  };

  // 🔥 ADD PASSENGER
  const addPassenger = () => {

    if (passengers.length >= 6) {
      alert("Maximum 6 passengers allowed");
      return;
    }

    setPassengers([
      ...passengers,
      {
        name: "",
        age: "",
        gender: "",
        berthPreference: ""
      }
    ]);
  };

  // 🔥 REMOVE PASSENGER
  const removePassenger = (index) => {

    const updated = passengers.filter((_, i) => i !== index);

    setPassengers(updated);
  };

  // 🔥 FINAL BOOKING FUNCTION
  const handleBooking = async () => {

    if (!user || !user._id) {
      alert("Please login first");
      return;
    }

    if (!selectedClass) {
      alert("Please select class");
      return;
    }

    for (let p of passengers) {

      if (!p.name || !p.age || !p.gender) {
        alert("Fill all passenger details");
        return;
      }
    }
    console.log(train);

    navigate(
"/payment",
{
state:{

train,

passengers,

journeyDate,

travelClass: selectedClass,

quota,

fromStation,

toStation,

}
}
);

      
  };

  return (

    <div>

      <Navbar />

      <div style={{ padding: "40px" }}>

        {/* 🔥 TRAIN HEADER */}

        <div style={styles.trainCard}>

  {/* TRAIN NAME */}

  <h2 style={{ marginBottom: "25px" }}>
    {train.trainName} ({train.trainNumber})
  </h2>

  {/* TOP SECTION */}

  <div style={styles.topRow}>

    {/* FROM */}

    <div>

      <h1 style={styles.timeText}>
        {train.route?.[0]?.departureTime || "N/A"}
      </h1>

      <h3>
        {train.route?.[0]?.stationName || "N/A"}
      </h3>

    </div>

    {/* CENTER */}

    <div style={{ textAlign: "center" }}>

      <h3>
🚆 Journey
</h3>

<p>
{
train.route?.length
? train.route.length * 120
: 0
}
KM
</p>

<p>
Approx.
{
(train.route?.length || 0) * 1.5
}
Hours
</p>

    </div>

    {/* TO */}

    <div style={{ textAlign: "right" }}>

      <h1 style={styles.timeText}>
        {
          train.route?.[
            train.route.length - 1
          ]?.arrivalTime || "N/A"
        }
      </h1>

      <h3>
        {
          train.route?.[
            train.route.length - 1
          ]?.stationName || "N/A"
        }
      </h3>

    </div>

  </div>

  {/* EXTRA INFO */}

  <div style={styles.infoRow}>

    <p>
      <strong>Journey Date:</strong>{" "}
      {
        journeyDate
          ? new Date(journeyDate).toLocaleDateString()
          : "N/A"
      }
    </p>

    <p>
      <strong>Available Seats:</strong>{" "}
      {train.availableSeats || 0}
    </p>

  </div>

</div>

        {/* 🔥 CLASS */}

        <h3>Select Class</h3>

        {/* 🔥 QUOTA */}

        <h3 style={{ marginTop: "20px" }}>
          Select Quota
        </h3>

        <select
          value={quota}
          onChange={(e) => setQuota(e.target.value)}
          style={{
            padding: "10px",
            marginTop: "10px",
            marginBottom: "10px"
          }}
        >

          <option value="General">
            General
          </option>

          <option value="Tatkal">
            Tatkal
          </option>

          <option value="Premium Tatkal">
            Premium Tatkal
          </option>

          <option value="Ladies">
            Ladies
          </option>

          <option value="Senior Citizen">
            Senior Citizen
          </option>

          <option value="Duty Pass">
            Duty Pass
          </option>

        </select>

        {/* 🔥 CLASS BUTTONS */}

        <div style={{ display: "flex", gap: "10px" }}>

          {["SL", "3A", "2A"].map((cls) => (

            <button
              key={cls}

              style={
                selectedClass === cls
                  ? styles.activeBtn
                  : styles.classBtn
              }

              onClick={() => {

                setSelectedClass(cls);

                setShowForm(false);
              }}
            >
              {cls}
            </button>

          ))}

        </div>

        <div style={styles.aiBox}>

<h3>
🤖 AI Travel Recommendation
</h3>

<p>
✅ Recommended Class:
<b> {selectedClass || "Not Selected"}</b>
</p>

<p>
✅ Suggested Coach:
<b>
Least Crowded Coach Available
</b>
</p>

<p>
✅ Smart Tip:
{smartSuggestion}
</p>

</div>

        {/* 🔥 AVAILABILITY */}

        {selectedClass && (

          <div style={styles.availabilityBox}>

            <h3>
{
selectedClass === "SL"
? "🛏 Sleeper (SL)"

: selectedClass === "3A"
? "❄ AC 3 Tier (3A)"

: "⭐ AC 2 Tier (2A)"
}
</h3>

            <p>
              <b>Status:</b>{" "}
              <span
  style={{
    color:
      train.availableSeats > 0
        ? "green"
        : train.racCount < train.racLimit
        ? "orange"
        : train.waitingCount < train.waitingLimit
        ? "red"
        : "black"
  }}
>
{
  train.availableSeats > 0
    ? "AVAILABLE"
    : train.racCount < train.racLimit
    ? "RAC AVAILABLE"
    : train.waitingCount < train.waitingLimit
    ? "WL AVAILABLE"
    : "NOT AVAILABLE"
}
</span>
            </p>
            <p>

<b>
Available Seats:
</b>

{" "}

{
train.availableSeats
}

</p>

<p>

<b>
RAC Remaining:
</b>

{" "}

{
train.racLimit -
train.racCount
}

</p>

<p>

<b>
WL Remaining:
</b>

{" "}

{
train.waitingLimit -
train.waitingCount
}

</p>

            <p>
              Price: ₹ {getPrice(selectedClass)}
            </p>

            <button
              style={styles.bookNowBtn}
              onClick={() => setShowForm(true)}
            >
              Continue Booking
            </button>

          </div>
        )}

        {/* 🔥 PASSENGER FORM */}

        {showForm && (

          <div style={{ marginTop: "20px" }}>

            <h3>Passenger Details</h3>

            {passengers.map((p, index) => (

              <div
                key={index}
                style={styles.passengerBox}
              >

                <p>
                  Passenger {index + 1}
                </p>

                {passengers.length > 1 && (

                  <button
                    onClick={() => removePassenger(index)}
                  >
                    Remove
                  </button>

                )}

                <input
                  placeholder="Name"
                  value={p.name}

                  onChange={(e) =>
                    handlePassengerChange(
                      index,
                      "name",
                      e.target.value
                    )
                  }
                />

                <input
                  type="number"
                  placeholder="Age"
                  value={p.age}

                  onChange={(e) =>
                    handlePassengerChange(
                      index,
                      "age",
                      e.target.value
                    )
                  }
                />

                <select
                  value={p.gender}

                  onChange={(e) =>
                    handlePassengerChange(
                      index,
                      "gender",
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Gender
                  </option>

                  <option>
                    Male
                  </option>

                  <option>
                    Female
                  </option>

                  <option>
                    Other
                  </option>

                </select>

                <select
                  value={p.berthPreference}

                  onChange={(e) =>
                    handlePassengerChange(
                      index,
                      "berthPreference",
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Berth
                  </option>

                  <option>
                    Lower
                  </option>

                  <option>
                    Middle
                  </option>

                  <option>
                    Upper
                  </option>

                  <option>
                    Side Lower
                  </option>

                  <option>
                    Side Upper
                  </option>

                  <option>
                    No Preference
                  </option>

                </select>

              </div>
            ))}

            <button onClick={addPassenger}>
              + Add Passenger
            </button>

            <br />
            <br />

            <button
              style={styles.confirmBtn}
              onClick={handleBooking}
            >
              Confirm Booking
            </button>

          </div>
        )}

      </div>

    </div>
  );
}

const styles = {

  trainCard:{
    background:"#ffffff",
    padding:"30px",
    borderRadius:"18px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    marginBottom:"30px"
  },

topRow: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px"
},

timeText: {
  fontSize: "36px",
  fontWeight: "bold"
},

infoRow: {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "20px",
  fontWeight: "bold"
},

  classBtn: {
    padding: "10px",
    background: "#eee"
  },

  activeBtn: {
    padding: "10px",
    background: "#1e3a8a",
    color: "white"
  },
  aiBox:{
marginTop:"20px",
padding:"20px",
background:"#eef2ff",
borderRadius:"12px",
borderLeft:"6px solid #1e3a8a"
},

  availabilityBox: {
    marginTop: "20px",
    padding: "20px",
    border: "1px solid #ccc"
  },

  bookNowBtn: {
    background:"#ff6b00",
color:"white",
padding:"12px 25px",
border:"none",
borderRadius:"8px",
cursor:"pointer",
fontWeight:"bold"
  },

  confirmBtn: {
    background: "green",
    color: "white",
    padding: "10px"
  },

  passengerBox: {
    marginBottom:"15px",
    padding:"20px",
    borderRadius:"12px",
    background:"#f8fafc",
    border:"1px solid #e5e7eb"
  }
};

export default BookTicket;