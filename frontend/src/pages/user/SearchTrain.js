import React, { useEffect, useState } from "react";
import API from "../../services/api";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";

function SearchTrain() {

  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const navigate = useNavigate();
  const [journeyDate, setJourneyDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [sourceName, setSourceName] = useState("");
  const [destinationName, setDestinationName] = useState("");

  // 🔥 Fetch Stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await API.get("/stations");
        setStations(res.data);
      } catch (err) {
        console.log("Error fetching stations");
      }
    };
    fetchStations();
  }, []);

  // 🔥 Search Trains
  const searchTrains = async () => {
  if (!journeyDate) {
    alert("Please select journey date");
    return;
  }
  setLoading(true);
  try {
    const res = await API.get(
      `/trains/search?source=${source}&destination=${destination}`
    );
    setTrains(res.data);
  } catch (err) {
    alert("Search failed");
  } finally {
    setLoading(false);
  }
};

  // 🔥 Book Ticket
  // const bookTicket = async (trainId) => {
  //   if (!user || !user._id) {
  //     alert("Please login first");
  //     return;
  //   }
  //   if (!selectedClass) {
  //     alert("Please select train class");
  //     return;
  //   }
  //   // Validate passengers
  //   for (let p of passengers) {
  //     if (!p.name || !p.age || !p.gender) {
  //       alert("Please fill all passenger details");
  //       return;
  //     }
  //   }
  //   try {
  //     const res = await API.post("/bookings/book", {
  //       user: user._id,
  //       train: trainId,
  //       passengers,
  //       travelClass: selectedClass,
  //       fromStation: source,
  //       toStation: destination,
  //       journeyDate: new Date()
  //     });

  //     alert("✅ Booking Successful!");
  //     // Reset passengers
  //     setPassengers([
  //       { name: "", age: "", gender: "", berthPreference: "" }
  //     ]);
  //   } catch (error) {
  //     alert(error.response?.data?.message || "Booking failed");
  //   }
  // };

  // 🔥 Delay Prediction
  // const predictDelay = async (trainNumber) => {
  //   try {
  //     const res = await API.post("/predict/predict-delay", {
  //       trainNumber: trainNumber
  //     });

  //     alert(
  //       "Predicted Delay: " +
  //       res.data.predictedDelayMinutes +
  //       " mins\nExpected Arrival: " +
  //       res.data.expectedArrivalTime
  //     );

  //   } catch (error) {
  //     alert("Prediction failed");
  //   }
  // };

  return (
    <div>
      <Navbar />

      <div style={{ padding: "40px" }}>

        <h2 style={{ marginBottom: "20px" }}>Search Trains</h2>
        <div style={styles.searchCard}>

  <input
    list="sourceStations"
    placeholder="🔍 Enter Source Station"
    value={sourceName}
    onChange={(e) => {

      setSourceName(e.target.value);

      const selectedStation = stations.find(
        (s) => s.name === e.target.value
      );

      if (selectedStation) {
        setSource(selectedStation._id);
      }

    }}
    style={styles.searchInput}
  />

  <datalist id="sourceStations">
    {stations.map((s) => (
      <option
        key={s._id}
        value={s.name}
      />
    ))}
  </datalist>

  <button
    onClick={() => {

      const tempId = source;
      const tempName = sourceName;

      setSource(destination);
      setSourceName(destinationName);

      setDestination(tempId);
      setDestinationName(tempName);

    }}
    style={styles.swapBtn}
  >
    ⇄
  </button>

  <input
    list="destinationStations"
    placeholder="📍 Enter Destination Station"
    value={destinationName}
    onChange={(e) => {

      setDestinationName(e.target.value);

      const selectedStation = stations.find(
        (s) => s.name === e.target.value
      );

      if (selectedStation) {
        setDestination(selectedStation._id);
      }

    }}
    style={styles.searchInput}
  />

  <datalist id="destinationStations">
    {stations.map((s) => (
      <option
        key={s._id}
        value={s.name}
      />
    ))}
  </datalist>

  <input
    type="date"
    value={journeyDate}
    onChange={(e) => setJourneyDate(e.target.value)}
    style={{
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #ccc"
    }}
  />

  <button
    style={styles.searchBtn}
    onClick={searchTrains}
  >
    🔍 Search Trains
  </button>

</div>

{
  source &&
  destination &&
  journeyDate && (

    <div style={styles.summaryBar}>
      🚆 Journey Selected | {journeyDate}
    </div>

  )
}

        {/* 🔥 TRAIN TABLE */}
        {
loading && (
<div style={styles.loadingBox}>
🔄 Searching Trains...
</div>

)
}
{
trains.length > 0 && (
<h3>
🚆 {trains.length} Trains Found
</h3>
)
}

        <div style={styles.trainContainer}>

{trains.map((train) => {
  const slAvailable = train.classAvailability?.SL || 0;
  const threeaAvailable = train.classAvailability?.['3A'] || 0;
  const twoaAvailable = train.classAvailability?.['2A'] || 0;
  const racAvailable = train.racLimit - train.racCount;
  const wlAvailable = train.waitingLimit - train.waitingCount;
  
  // const getAvailabilityStatus = (available) => {
  //   if (available > 0) return { type: "AVAILABLE", count: available, color: "#22c55e" };
  //   if (racAvailable > 0) return { type: "RAC", count: racAvailable, color: "#f97316" };
  //   if (wlAvailable > 0) return { type: "WL", count: wlAvailable, color: "#ef4444" };
  //   return { type: "NOT AVAILABLE", count: 0, color: "#d1d5db" };
  // };

  const depTime = train.route?.[0]?.departureTime || "N/A";
  const arrTime = train.route?.[train.route.length - 1]?.arrivalTime || "N/A";
  const fromStation = train.route?.[0]?.stationName || "N/A";
  const toStation = train.route?.[train.route.length - 1]?.stationName || "N/A";
  const distance = train.route?.length ? train.route.length * 120 : 0;

  return (
<div
  key={train._id}
  style={styles.trainCard}
>

{/* TRAIN HEADER */}
<div style={styles.trainHeader}>
  <div style={styles.trainInfo}>
    <h3 style={styles.trainName}>{train.trainName}</h3>
    <p style={styles.trainNumber}>({train.trainNumber})</p>
  </div>
  <div style={styles.runningDays}>
    <span>Runs On:</span>
    <div style={styles.days}>M T W T F S S</div>
  </div>
</div>

{/* JOURNEY SECTION */}
<div style={styles.journeySection}>
  <div style={styles.journeyPoint}>
    <div style={styles.time}>{depTime}</div>
    <div style={styles.station}>{fromStation}</div>
  </div>
  
  <div style={styles.journeyArrow}>↓</div>
  
  <div style={styles.journeyPoint}>
    <div style={styles.time}>{arrTime}</div>
    <div style={styles.station}>{toStation}</div>
  </div>
</div>

{/* DURATION & DISTANCE */}
<div style={styles.metaInfo}>
  <span>Distance: {distance} KM</span>
</div>

{/* AVAILABILITY & FARE SECTION */}
<div style={styles.availabilitySection}>
  
  {/* CLASS AVAILABILITY CARDS */}
  <div style={styles.classesContainer}>
    
    {/* SL CLASS */}
    <div style={styles.availabilityCard}>
      <div style={styles.className}>🛏 Sleeper (SL)</div>
      <div style={{
        ...styles.availabilityBadge,
        backgroundColor: slAvailable > 0 ? "#22c55e" : (racAvailable > 0 ? "#f97316" : "#ef4444")
      }}>
        {slAvailable > 0 ? `AVAILABLE-${String(slAvailable).padStart(3, '0')}` : (racAvailable > 0 ? `RAC-${String(racAvailable).padStart(2, '0')}` : `WL-${String(wlAvailable).padStart(2, '0')}`)}
      </div>
      <div style={styles.fare}>₹500</div>
    </div>

    {/* 3A CLASS */}
    <div style={styles.availabilityCard}>
      <div style={styles.className}>❄️ AC 3 Tier (3A)</div>
      <div style={{
        ...styles.availabilityBadge,
        backgroundColor: threeaAvailable > 0 ? "#22c55e" : (racAvailable > 0 ? "#f97316" : "#ef4444")
      }}>
        {threeaAvailable > 0 ? `AVAILABLE-${String(threeaAvailable).padStart(3, '0')}` : (racAvailable > 0 ? `RAC-${String(racAvailable).padStart(2, '0')}` : `WL-${String(wlAvailable).padStart(2, '0')}`)}
      </div>
      <div style={styles.fare}>₹1000</div>
    </div>

    {/* 2A CLASS */}
    <div style={styles.availabilityCard}>
      <div style={styles.className}>⭐ AC 2 Tier (2A)</div>
      <div style={{
        ...styles.availabilityBadge,
        backgroundColor: twoaAvailable > 0 ? "#22c55e" : (racAvailable > 0 ? "#f97316" : "#ef4444")
      }}>
        {twoaAvailable > 0 ? `AVAILABLE-${String(twoaAvailable).padStart(3, '0')}` : (racAvailable > 0 ? `RAC-${String(racAvailable).padStart(2, '0')}` : `WL-${String(wlAvailable).padStart(2, '0')}`)}
      </div>
      <div style={styles.fare}>₹1500</div>
    </div>

  </div>

</div>

{/* ACTION BUTTONS */}
<div style={styles.buttonsSection}>
  <button
    style={styles.bookBtn}
    onClick={() => {
      navigate(
        "/book",
        {
          state:{
            train,
            journeyDate,
            fromStation:source,
            toStation:destination
          }
        }
      );
    }}
  >
    Book Ticket
  </button>

  {/* <button
    style={styles.predictBtn}
    onClick={() =>
      predictDelay(train.trainNumber)
    }
  >
    Predict Delay
  </button> */}
</div>

</div>
  );
})}

</div>
{
!loading &&
trains.length === 0 && (

<div style={styles.noTrain}>

<h2>🚉 No Trains Found</h2>

<p>
Try another route
</p>

</div>

)
}

      </div>
    </div>
  );
}

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px"
  },
  th: {
    border: "1px solid #ccc",
    padding: "10px",
    background: "#1e3a8a",
    color: "white"
  },
  td: {
    border: "1px solid #ccc",
    padding: "10px",
    textAlign: "center"
  },
  passengerBox: {
    marginBottom: "10px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px"
  },
  searchInput: {
  padding: "12px",
  width: "250px",
  marginRight: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc"
},
searchCard: {
  background: "#ffffff",
  padding: "25px",
  borderRadius: "15px",
  boxShadow:
    "0 4px 15px rgba(0,0,0,0.1)",
  marginBottom: "30px",
  display: "flex",
  gap: "15px",
  alignItems: "center",
  flexWrap: "wrap"
},
searchBtn:{
  background:"#ff6b00",
  color:"white",
  padding:"12px 25px",
  border:"none",
  borderRadius:"8px",
  cursor:"pointer",
  fontWeight:"bold",
  fontSize:"16px"
},

trainCard:{
background:"#fff",
padding:"25px",
borderRadius:"12px",
boxShadow:"0 2px 12px rgba(0,0,0,0.08)",
marginBottom:"20px",
border:"1px solid #e5e7eb"
},
trainHeader:{
display:"flex",
justifyContent:"space-between",
alignItems:"flex-start",
marginBottom:"20px",
paddingBottom:"15px",
borderBottom:"2px solid #f3f4f6"
},
trainInfo:{
flex:1
},
trainName:{
margin:"0 0 5px 0",
fontSize:"18px",
fontWeight:"bold",
color:"#1f2937"
},
trainNumber:{
margin:"0",
fontSize:"14px",
color:"#6b7280"
},
runningDays:{
textAlign:"right",
fontSize:"12px",
color:"#6b7280"
},
days:{
fontSize:"11px",
letterSpacing:"2px",
marginTop:"5px",
fontWeight:"500",
color:"#1f2937"
},
journeySection:{
display:"flex",
flexDirection:"column",
gap:"0",
marginBottom:"15px",
padding:"15px",
backgroundColor:"#f9fafb",
borderRadius:"8px"
},
journeyPoint:{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
padding:"10px 0"
},
time:{
fontSize:"16px",
fontWeight:"bold",
color:"#1f2937",
minWidth:"60px"
},
station:{
flex:1,
marginLeft:"15px",
fontSize:"14px",
color:"#4b5563"
},
journeyArrow:{
textAlign:"center",
fontSize:"18px",
color:"#6b7280",
padding:"5px 0",
fontWeight:"bold"
},
metaInfo:{
fontSize:"13px",
color:"#6b7280",
marginBottom:"15px",
padding:"0 15px"
},
availabilitySection:{
marginBottom:"15px"
},
classesContainer:{
display:"grid",
gridTemplateColumns:"repeat(3, 1fr)",
gap:"12px"
},
availabilityCard:{
padding:"15px",
border:"1px solid #e5e7eb",
borderRadius:"8px",
backgroundColor:"#fafbfc",
textAlign:"center",
transition:"all 0.3s ease",
cursor:"pointer",
"&:hover":{
boxShadow:"0 4px 12px rgba(0,0,0,0.1)"
}
},

className:{
fontSize:"13px",
fontWeight:"600",
color:"#1f2937",
marginBottom:"8px"
},

availabilityBadge:{
padding:"8px 12px",
borderRadius:"6px",
fontSize:"12px",
fontWeight:"bold",
color:"white",
marginBottom:"8px",
display:"inline-block"
},

fare:{
fontSize:"13px",
fontWeight:"bold",
color:"#059669"
},

buttonsSection:{
display:"flex",
gap:"10px",
marginTop:"20px",
paddingTop:"15px",
borderTop:"1px solid #e5e7eb"
},

bookBtn:{
flex:1,
background:"linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
color:"white",
padding:"12px 24px",
border:"none",
borderRadius:"8px",
cursor:"pointer",
fontWeight:"bold",
fontSize:"14px",
transition:"all 0.3s ease",
boxShadow:"0 2px 8px rgba(37, 99, 235, 0.3)"
},

predictBtn:{
flex:1,
background:"linear-gradient(135deg, #1e3a8a 0%, #172554 100%)",
color:"white",
padding:"12px 24px",
border:"none",
borderRadius:"8px",
cursor:"pointer",
fontWeight:"bold",
fontSize:"14px",
transition:"all 0.3s ease",
boxShadow:"0 2px 8px rgba(30, 58, 138, 0.3)"
},

trainContainer:{
display:"grid",
gridTemplateColumns:"1fr",
gap:"20px",
maxWidth:"900px"
},
swapBtn:{
padding:"12px",
borderRadius:"50%",
border:"none",
background:"#1e3a8a",
color:"white",
cursor:"pointer",
fontWeight:"bold"
},
loadingBox:{
textAlign:"center",
padding:"20px",
fontWeight:"bold",
color:"#1e3a8a"
},
noTrain:{
textAlign:"center",
padding:"50px",
background:"#fff",
borderRadius:"12px",
marginTop:"20px"
},
};

export default SearchTrain;