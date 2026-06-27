import React from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";

function Dashboard() {

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const navigate = useNavigate();

  return (
    <div>

      <Navbar />

      <div style={{ padding: "40px" }}>

        {/* 🔥 Title */}
        <h1 style={{ textAlign: "center" }}>RailNexis 🚆</h1>
        <p style={{ textAlign: "center", color: "gray" }}>
          Intelligent Railway Reservation & Delay Prediction System
        </p>

        {/* 🔥 Welcome */}
        <h2 style={{ marginTop: "30px" }}>
          Welcome, {user.name || "User"} 👋
        </h2>

        {/* 🔥 MAIN ACTION */}
        <div style={styles.searchBox}
          onClick={() => navigate("/search")}
        >
          <h3>🔍 Search Trains</h3>
          <p>Find trains between stations and book tickets easily</p>
        </div>

        {/* 🔥 FEATURES */}
        <div style={styles.container}>

          <div style={styles.card}
            onClick={() => navigate("/bookings")}
          >
            <h3>🎟 My Bookings</h3>
            <p>View and manage your train bookings</p>
          </div>

          <div style={styles.card}
            onClick={() => navigate("/status")}
          >
            <h3>📊 Train Status</h3>
            <p>Check live train status and delays</p>
          </div>

          <div style={styles.card}
            onClick={() => navigate("/railway-map")}
          >
            <h3>🗺 Railway Map</h3>
            <p>View railway routes and station information</p>
          </div>

        </div>

      </div>

    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: "20px",
    marginTop: "30px"
  },
  card: {
    flex: 1,
    background: "#1e3a8a",
    color: "white",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    cursor: "pointer",
  },
  searchBox: {
    marginTop: "30px",
    padding: "20px",
    background: "#f3f4f6",
    borderRadius: "10px",
    textAlign: "center",
    cursor: "pointer",
  },
  
};

export default Dashboard;