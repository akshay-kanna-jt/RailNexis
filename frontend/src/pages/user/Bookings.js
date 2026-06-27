import React, { useEffect, useState } from "react";
import API from "../../services/api";
import Navbar from "../../components/Navbar";

function Bookings() {

  const [summary, setSummary] = useState({});
  const [activeBookings, setActiveBookings] = useState([]);
  const [cancelledBookings, setCancelledBookings] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  useEffect(() => {

    const fetchBookings = async () => {

      try {

        const res = await API.get(`/bookings/user/${userId}`);
        console.log(res.data);

        setSummary(res.data.data.summary);
        setActiveBookings(res.data.data.activeBookings);
        setCancelledBookings(res.data.data.cancelledBookings);

      } catch (error) {
        console.log("Error fetching bookings");
      }

    };

    if (userId) {
      fetchBookings();
    }

  }, [userId]);

  const cancelTicket = async (bookingId) => {

    try {
      await API.put(`/bookings/cancel/${bookingId}`);
      alert("Ticket cancelled");
      const notification = {

id: Date.now(),

type:"cancel",

message:
"❌ Your ticket has been cancelled successfully.",

time:
new Date().toLocaleString(),

read:false

};

const oldNotifications =

JSON.parse(
localStorage.getItem(
"notifications"
)
) || [];

oldNotifications.unshift(
notification
);

const user =
JSON.parse(
localStorage.getItem("user")
);

localStorage.setItem(
`notifications_${user._id}`,
JSON.stringify(oldNotifications)
);
      window.location.reload();
    } catch (error) {
      alert("Cancellation failed");
    }

  };

  return (
    <div>

      <Navbar />

      {/* 🔥 SUMMARY CARDS */}
      <div style={styles.summaryContainer}>

  <div style={styles.summaryCard}>
    <h1>📖</h1>
    <h3>Total Bookings</h3>
    <p>{summary.totalBookings || 0}</p>
  </div>

  <div style={styles.summaryCard}>
    <h1>🎫</h1>
    <h3>Active Tickets</h3>
    <p>{summary.active || 0}</p>
  </div>

  <div style={styles.summaryCard}>
    <h1>❌</h1>
    <h3>Cancelled</h3>
    <p>{summary.cancelled || 0}</p>
  </div>

</div>

      <div style={{ padding: "40px" }}>

        <h2 style={{ marginBottom: "20px" }}>My Bookings</h2>

        {/* 🔥 ACTIVE BOOKINGS */}
        <table style={styles.table}>

          <thead>
            <tr>
              <th style={styles.th}>Train</th>
              <th style={styles.th}>PNR</th>
              <th style={styles.th}>Class</th>
              <th style={styles.th}>Quota</th>
              <th style={styles.th}>Passengers</th>
              <th style={styles.th}>Seats</th>
              <th style={styles.th}>Journey Date</th> 
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Ticket</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>

          <tbody>

            {activeBookings.length === 0 && (
              <tr>
                <td colSpan="4">No active bookings</td>
              </tr>
            )}

            {activeBookings.map((booking) => (

              <tr key={booking._id}>

                <td style={styles.td}>{booking.train?.trainName}</td>
                
                <td style={styles.td}>
                  {booking.pnrNumber}
                </td>

                <td style={styles.td}>
                  {booking.travelClass || "N/A"}     {/* 🔥 CLASS */}
                </td>
                <td style={styles.td}>
                  {booking.quota || "General"}
                </td>

                {/* 🔥 PASSENGERS DISPLAY */}
                <td style={{ ...styles.td, textAlign: "left" }}>
                  {booking.passengers?.map((p, i) => (
                    <div key={i}>
  {p.name} ({p.age}) - {p.gender}
  <br />
  Coach: {p.coachAssigned || "N/A"}
  {" | "}
  Seat: {p.seatNumber || "N/A"}
  {" | "}
  Berth: {p.allocatedBerth || "N/A"}
</div>
                  ))}
                </td>

                {/* 🔥 SEATS = passengers.length */}
                <td style={styles.td}>
                  {booking.passengers?.length || 0}
                </td>

                <td style={styles.td}>
                  {booking.journeyDate
                    ? new Date(booking.journeyDate).toLocaleDateString()
                    : "N/A"}   {/* 🔥 DATE */}
                </td>

                <td style={styles.td}>

<span
style={{
padding:"6px 12px",
borderRadius:"20px",
fontWeight:"bold",
background:
booking.status === "CONFIRMED"
? "#dcfce7"
: booking.status === "RAC"
? "#fef3c7"
: "#fee2e2",
color:
booking.status === "CONFIRMED"
? "green"
: booking.status === "RAC"
? "orange"
: "red"
}}
>

{booking.status}

</span>

</td>

                <td style={styles.td}>
                  <a
                    href={`http://localhost:5000/api/bookings/ticket/${booking.pnrNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: "#1e3a8a",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: "5px",
                      textDecoration: "none"
                    }}
                  >
                    Download Ticket
                  </a>
                </td>

                <td style={styles.td}>
                  <button
                    style={styles.cancelBtn}
                    onClick={() => cancelTicket(booking._id)}
                  >
                    Cancel Ticket
                  </button>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {/* 🔥 CANCELLED BOOKINGS */}
        <h2 style={{ marginTop: "40px" }}>Cancelled Bookings</h2>

        <table style={styles.table}>

          <thead>
            <tr>
              <th style={styles.th}>Train</th>
              <th style={styles.th}>PNR</th>
              <th style={styles.th}>Class</th>
              <th style={styles.th}>Quota</th>
              <th style={styles.th}>Passengers</th>
              <th style={styles.th}>Seats</th>
              <th style={styles.th}>Journey Date</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Cancelled Date</th>
            </tr>
          </thead>

          <tbody>

            {cancelledBookings.length === 0 && (
              <tr>
                <td colSpan="6">No cancelled bookings</td>
              </tr>
            )}

            {cancelledBookings.map((booking) => (

              <tr key={booking._id}>

                <td style={styles.td}>{booking.train?.trainName}</td>

                <td style={styles.td}>
                  {booking.pnrNumber}
                </td>

                <td style={styles.td}>
                  {booking.travelClass || "N/A"}
                </td>
                
                <td style={styles.td}>
                  {booking.quota || "General"}
                </td>

                <td style={{ ...styles.td, textAlign: "left" }}>
                  {booking.passengers?.map((p, i) => (
                    <div key={i}>
                      {p.name}
                      {" | "}
                      Coach: {p.coachAssigned || "N/A"}
                      {" | "}
                      Seat: {p.seatNumber || "N/A"}
                      {" | "}
                      Berth: {p.allocatedBerth || "N/A"}
                      </div>
                    ))}
                </td>

                <td style={styles.td}>
                  {booking.passengers?.length || 0}
                </td>

                <td style={styles.td}>
                  {booking.journeyDate
                    ? new Date(booking.journeyDate).toLocaleDateString()
                    : "N/A"}   {/* 🔥 ADD */}
                </td>
                <td style={styles.td}>

<span
style={{
padding:"6px 12px",
borderRadius:"20px",
fontWeight:"bold",
background:
booking.status === "CONFIRMED"
? "#dcfce7"
: booking.status === "RAC"
? "#fef3c7"
: "#fee2e2",
color:
booking.status === "CONFIRMED"
? "green"
: booking.status === "RAC"
? "orange"
: "red"
}}
>

{booking.status}

</span>

</td>

                <td style={styles.td}>
                  {booking.cancelledAt
                    ? new Date(booking.cancelledAt).toLocaleDateString()
                    : "N/A"}   {/* 🔥 FIX */}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

        <h2 style={{marginTop:"50px"}}>
Travel History
</h2>

<table style={styles.table}>

<thead>
<tr>

<th style={styles.th}>Train</th>
<th style={styles.th}>PNR</th>
<th style={styles.th}>Journey Date</th>
<th style={styles.th}>Class</th>
<th style={styles.th}>Passengers</th>
<th style={styles.th}>Status</th>

</tr>
</thead>

<tbody>

{
activeBookings
.filter(
booking =>
new Date(
booking.journeyDate
) < new Date()
)
.map((booking)=>(

<tr key={booking._id}>

<td style={styles.td}>
{booking.train?.trainName}
</td>

<td style={styles.td}>
{booking.pnrNumber}
</td>

<td style={styles.td}>
{
new Date(
booking.journeyDate
).toLocaleDateString()
}
</td>

<td style={styles.td}>
{booking.travelClass}
</td>

<td style={styles.td}>
{booking.passengers?.length}
</td>

<td style={styles.td}>
✅ COMPLETED
</td>

</tr>

))
}

</tbody>

</table>        

      </div>

    </div>
  );
}

export default Bookings;

// 🔥 STYLES
const styles = {
  card: {
    flex: 1,
    padding: "20px",
    background: "#1e3a8a",
    color: "white",
    borderRadius: "10px",
    textAlign: "center",
    fontSize: "18px",
    fontWeight: "bold"
  },
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
  cancelBtn: {
    background: "red",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "5px",
    cursor: "pointer"
  },
  summaryContainer:{
display:"flex",
gap:"20px",
margin:"20px"
},

summaryCard:{
flex:1,
padding:"25px",
background:"white",
borderRadius:"15px",
boxShadow:"0 4px 15px rgba(0,0,0,0.1)",
textAlign:"center",
transition:"0.3s"
},
};