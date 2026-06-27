import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

function AdminBookings() {

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await API.get("/bookings/all");
        console.log("API Response:", res.data);

        setBookings(res.data.data || res.data);

      } catch (err) {
        console.log("Error fetching bookings");
      } finally {
        setLoading(false); // ✅ FIXED
      }
    };

    fetchBookings();
  }, []);

  // 🔥 FILTER LOGIC
  const filteredBookings =
bookings.filter(
(b)=>

b.train?.trainName
?.toLowerCase()
.includes(search.toLowerCase())

||

b.pnrNumber
?.includes(search)
);

  return (
    <div>
      <Navbar />

      <div style={{ padding: "40px" }}>

        <h2 style={{ marginBottom: "20px" }}>All Bookings 📊</h2>
        <div style={styles.summaryGrid}>

<div style={styles.summaryCard}>
<h3>Total</h3>
<p>{bookings.length}</p>
</div>

<div style={styles.summaryCard}>
<h3>Confirmed</h3>
<p>
{
bookings.filter(
b => b.status === "CONFIRMED"
).length
}
</p>
</div>

<div style={styles.summaryCard}>
<h3>Cancelled</h3>
<p>
{
bookings.filter(
b => b.status === "CANCELLED"
).length
}
</p>
</div>

<div style={styles.summaryCard}>
<h3>RAC / Waiting</h3>
<p>
{
bookings.filter(
b =>
b.status === "RAC" ||
b.status === "WAITING"
).length
}
</p>
</div>

</div>

        {/* 🔥 SEARCH BAR */}
        <input
          type="text"
          placeholder="Search by train name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            marginBottom: "20px",
            padding: "10px",
            width: "300px",
            borderRadius: "5px",
            border: "1px solid #ccc"
          }}
        />

        {loading ? (
          <p>Loading...</p>
        ) : filteredBookings.length === 0 ? (
          <p>No bookings available</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px"
            }}
          >
            <thead style={{
position:"sticky",
top:0,
zIndex:100,
background:"#1e3a8a"
}}>
              <tr>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Train</th>
                <th style={styles.th}>PNR</th>
                <th style={styles.th}>Class</th>
                <th style={styles.th}>Quota</th>
                <th style={styles.th}>Passengers</th>
                <th style={styles.th}>Seats</th>
                <th style={styles.th}>Journey Date</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b._id}>

                  <td style={styles.td}>
                    {b.user?.name || "N/A"}
                  </td>

                  <td style={styles.td}>
                    {b.train?.trainName || "N/A"}
                  </td>

                  <td style={styles.td}>
                    {b.pnrNumber || "N/A"}
                  </td>

                  <td style={styles.td}>
                    {b.travelClass || "N/A"}
                  </td>
                  
                  <td style={styles.td}>
                    {b.quota || "General"}
                  </td>

                  {/* 🔥 PASSENGERS */}
                  <td style={{ ...styles.td, textAlign: "left" }}>
                    {b.passengers && b.passengers.length > 0 ? (
                      b.passengers.map((p, i) => (
                        <div key={i}>
{p.name}
<br/>
Coach: {p.coachAssigned}
<br/>
Seat: {p.seatNumber}
<br/>
Berth: {p.allocatedBerth}
<hr/>
</div>
                      ))
                    ) : (
                      "No passengers"
                    )}
                  </td>

                  {/* 🔥 SEATS */}
                  <td style={styles.td}>
                    {b.passengers?.length || 0}
                  </td>
                  <td style={styles.td}>
                    {b.journeyDate
                    ? new Date(b.journeyDate).toLocaleDateString()
                    : "N/A"}
                  </td>

                  {/* 🔥 STATUS */}
                  <td style={styles.td}>

<span
style={{
padding:"6px 12px",
borderRadius:"20px",
fontWeight:"bold",
color:"white",
background:
b.status === "CONFIRMED"
? "green"
: b.status === "RAC"
? "orange"
: b.status === "WAITING"
? "red"
: "gray"
}}
>

{b.status}

</span>

</td>

                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}

export default AdminBookings;

// 🔥 STYLES
const styles = {
  th: {
    background: "#1e3a8a",
    color: "white",
    padding: "10px",
    border: "1px solid #ccc"
  },
  td: {
    border: "1px solid #ccc",
    padding: "10px",
    textAlign: "center"
  },
  summaryGrid:{
display:"grid",
gridTemplateColumns:
"repeat(4,1fr)",
gap:"20px",
marginBottom:"25px"
},

summaryCard:{
background:
"linear-gradient(135deg,#1e3a8a,#111827)",
color:"white",
padding:"20px",
borderRadius:"12px",
textAlign:"center",
fontWeight:"bold"
},
};