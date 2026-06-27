import React,{ useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

function AdminDashboard() {

  const navigate = useNavigate();
  const [trains,setTrains]= useState([]); 
  const [bookings,setBookings]= useState([]);
  const user = JSON.parse(
    localStorage.getItem("user")
  ) || {};

  useEffect(()=>{
fetchData();
},[]);

const fetchData=async()=>{
try{
const trainRes = await API.get("/trains");

setTrains(
  Array.isArray(trainRes.data)
    ? trainRes.data
    : []
);

const bookingRes = await API.get("/bookings/all");

setBookings(
  Array.isArray(bookingRes.data)
    ? bookingRes.data
    : []
);

}catch(err){
console.log(err);
}
};

const delayedTrains=
Math.floor(
trains.length/2
);

  return (
    <div>

      <Navbar />

      <div style={{ padding: "40px" }}>

        <h1>
Admin Panel ⚙️
</h1>

<h3
style={{
marginTop:"10px",
color:"#1e3a8a"
}}
>
Welcome,
{user.name || "Admin"} 👋
</h3>

<p>
Manage trains, stations and bookings
</p>

        <div style={styles.statsGrid}>

<div style={styles.statsCard}>
<h3>🚆 Total Trains</h3>
<p>{trains.length}</p>
</div>

<div style={styles.statsCard}>
<h3>🎟 Total Bookings</h3>
<p>{bookings.length}</p>
</div>

<div style={styles.statsCard}>
<h3>🟢 Running Trains</h3>
<p>{trains.length}</p>
</div>

<div style={styles.statsCard}>
<h3>🔴 Delayed Trains</h3>
<p>{delayedTrains}</p>
</div>

</div>

        <div style={styles.container}>

          <div style={styles.card} onClick={() => navigate("/admin/add-train")}>
            <h3>🚆 Add Train</h3>
            <p>Create new trains and routes</p>
          </div>

          <div style={styles.card} onClick={() => navigate("/admin/add-station")}>
            <h3>📍 Add Station</h3>
            <p>Add new railway stations</p>
          </div>

          <div style={styles.card} onClick={() => navigate("/admin/bookings")}>
            <h3>📊 View Bookings</h3>
            <p>Monitor all user bookings</p>
          </div>

          <div style={styles.card} onClick={() => navigate("/admin-trains")}>
            <h3>🚆 View Trains</h3>
            <p>Manage existing trains and routes</p>
          </div>

          <div style={styles.card} onClick={() => navigate("/admin/analytics")}>
            <h3>📈 View Analytics</h3>
            <p>View detailed analytics and reports</p>
          </div>

          <div style={styles.card} onClick={() => navigate("/admin/occupancy")}>
            <h3>🚆 Occupancy Dashboard</h3>
            <p> Train, Coach, Route and Date Wise Occupancy</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  statsGrid:{
display:"grid",
gridTemplateColumns:
"repeat(4,1fr)",
gap:"20px",
marginTop:"30px",
marginBottom:"30px"
},

statsCard:{
background:
"linear-gradient(135deg,#1e3a8a,#111827)",
color:"white",
padding:"25px",
borderRadius:"15px",
textAlign:"center",
fontSize:"20px",
fontWeight:"bold",
boxShadow:
"0 6px 15px rgba(0,0,0,0.2)"
},

  container: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginTop: "30px"
  },

  card: {
    background: "#1e3a8a",
    color: "white",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
  }
};

export default AdminDashboard;