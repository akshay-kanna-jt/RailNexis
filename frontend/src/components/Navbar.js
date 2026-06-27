import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Navbar() {

  const location = useLocation();
  const navigate = useNavigate();
  const user =
JSON.parse(
localStorage.getItem("user")
);

const unreadNotifications =

JSON.parse(
localStorage.getItem(
`notifications_${user?._id}`
)
)?.filter(
(n)=>!n.read
).length || 0;
  const isAdmin = location.pathname.startsWith("/admin");

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "http://localhost:3000";
  };

  const navStyle = {
    background: "#1e3a8a",
    padding: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 1000
  };

  const linkContainer = {
    display: "flex",
    gap: "20px",
    alignItems: "center"
  };

  const linkStyle = {
    color: "white",
    textDecoration: "none",
    fontWeight: "bold"
  };

  const logoutBtn = {
    padding: "6px 12px",
    background: "red",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold"
  };

  return (
    <div style={navStyle}>

      {/* 🔥 LEFT SIDE */}
      <div style={{ color: "white", fontWeight: "bold" }}>
        {isAdmin ? "Admin Panel ⚙️" : "RailNexis 🚆"}
      </div>

      {/* 🔥 RIGHT SIDE */}
      <div style={linkContainer}>

        {isAdmin ? (
          <>
            {/* ADMIN NAVBAR */}
            <Link style={linkStyle} to="/admin">Dashboard</Link>
            <Link style={linkStyle} to="/admin/add-train">Add Train</Link>
            <Link style={linkStyle} to="/admin/add-station">Add Station</Link>
            <Link style={linkStyle} to="/admin-trains">Trains</Link>
            <Link style={linkStyle} to="/admin/bookings">Bookings</Link>
            <Link style={linkStyle} to="/admin/occupancy">Occupancy</Link>
            <Link style={linkStyle} to="/admin/analytics">Analytics</Link>
            <Link style={linkStyle} to="/dashboard">User Panel</Link>
          </>
        ) : (
          <>
            {/* USER NAVBAR */}
            <Link style={linkStyle} to="/dashboard">Dashboard</Link>
            <Link style={linkStyle} to="/search">Search Trains</Link>
            <Link style={linkStyle} to="/bookings">My Bookings</Link>
            <Link style={linkStyle} to="/status">Train Status</Link>
            <Link style={linkStyle} to="/railway-map">Railway Map</Link>
            <Link style={linkStyle} to="/pnr-status">PNR Status</Link>
            <Link style={linkStyle} to="/transactions">Transaction History</Link>
            <Link style={linkStyle} to="/profile">Profile</Link>
            {/* <Link style={linkStyle} to="/admin">Admin</Link> */}
          </>
        )}
        <button
onClick={()=>
navigate("/notifications")
}
style={{
background:"white",
color:"#1e3a8a",
border:"none",
padding:"8px 12px",
borderRadius:"8px",
fontWeight:"bold",
cursor:"pointer"
}}
>

🔔 Notifications
{unreadNotifications}

</button>
        {/* 🔥 LOGOUT (COMMON) */}
        <button onClick={handleLogout} style={logoutBtn}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;