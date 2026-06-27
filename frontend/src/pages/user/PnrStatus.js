import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

function PnrStatus() {

  const [pnr, setPnr] = useState("");

  const [booking, setBooking] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const checkPnr = async () => {

    if (!pnr) {

      alert("Enter PNR Number");

      return;
    }

    try {

      setLoading(true);

      const res = await API.get(
        `/bookings/pnr/${pnr}`
      );

      setBooking(res.data.data);

    } catch (err) {

      alert("PNR not found");

      setBooking(null);

    } finally {

      setLoading(false);

    }

  };

const journeyDate =
  booking?.journeyDate
    ? new Date(
        booking.journeyDate
      )
    : null;

const today = new Date();

const diffTime = journeyDate
    ? journeyDate - today
    : 0;

const daysLeft =
  Math.ceil(
    diffTime /
    (1000 * 60 * 60 * 24)
  );

const boardingStatus =
  daysLeft > 1
    ? "Boarding Yet To Start"
    : daysLeft === 1
    ? "Boarding Soon"
    : "Train Departed";

const chartStatus =
  daysLeft > 1
    ? "Chart Not Prepared"
    : "Chart Prepared";

let confirmationPrediction =
"100% Confirmed";
if(
booking?.status?.includes(
"RAC"
)
){
confirmationPrediction =
"99% Chance Confirmed";
}

else if(
booking?.status?.includes(
"WL"
)
){

const wlNumber =
parseInt(
booking.status
.replace("WL","")
.trim()
);

if(wlNumber <= 2){
confirmationPrediction =
"95% Chance Confirmed";
}

else if(wlNumber <= 5){
confirmationPrediction =
"80% Chance Confirmed";
}

else if(wlNumber <= 10){
confirmationPrediction =
"60% Chance Confirmed";
}

else{
confirmationPrediction =
"Low Chance of Confirmation";
}
}

const advisory =
  daysLeft > 1
    ? "Keep luggage ready for travel."
    : daysLeft === 1
    ? "Reach station 30 mins early."
    : "Journey completed.";

  return (

    <div>

      <Navbar />

      <div style={{ padding: "40px" }}>

        <h2>
PNR Status
</h2>

<div style={styles.searchCard}>

<input
type="text"
placeholder="Enter PNR Number"
value={pnr}
onChange={(e)=>setPnr(e.target.value)}
style={{
padding:"12px",
width:"300px",
borderRadius:"8px",
border:"1px solid #ccc"
}}
/>

<button
onClick={checkPnr}
style={{
padding:"12px 20px",
background:"#1e3a8a",
color:"white",
border:"none",
borderRadius:"8px",
cursor:"pointer"
}}
>
🔍 Check PNR
</button>

</div>

        {loading && (
          <p>Loading...</p>
        )}

        {booking && (

          <div style={styles.card}>

            <div style={styles.statsRow}>

<div style={styles.statCard}>
<h4>🎫 PNR</h4>
<p>{booking.pnrNumber}</p>
</div>

<div style={styles.statCard}>
<h4>📋 Status</h4>
<p>{booking.status}</p>
</div>

<div style={styles.statCard}>
<h4>📅 Journey</h4>
<p>
{
new Date(
booking.journeyDate
).toLocaleDateString()
}
</p>
</div>

</div>

            <h3>
              {booking.train?.trainName}
            </h3>

            <p>
              <strong>PNR:</strong>{" "}
              {booking.pnrNumber}
            </p>

            <p>

<strong>Status:</strong>

<span
style={{
marginLeft:"10px",
padding:"6px 12px",
borderRadius:"20px",
fontWeight:"bold",
background:
booking.status.includes("CONFIRMED")
? "#dcfce7"
: booking.status.includes("RAC")
? "#fef3c7"
: "#fee2e2",

color:
booking.status.includes("CONFIRMED")
? "green"
: booking.status.includes("RAC")
? "orange"
: "red"
}}
>

{booking.status}

</span>

</p>
            <p>
              <strong>
                🤖 AI Prediction:
              </strong>
              {" "}
              {confirmationPrediction}
            </p>

            <p>
              <strong>Journey Date:</strong>{" "}
              {
                booking.journeyDate
                  ? new Date(
                      booking.journeyDate
                    ).toLocaleDateString()
                  : "N/A"
              }
            </p>

            {/* <p>
              <strong>
                🚆 Coach Position:
              </strong>
              {" "}
              S3 - Near Engine
            </p>

            <p>
              <strong>
                🛤 Platform:
              </strong>
              {" "}
              4
            </p> */}

            <p>
              <strong>
                🚉 Boarding Status:
              </strong>
              {" "}
              {boardingStatus}
            </p>

            <p>
              <strong>
                🎯 Confirmation Prediction:
              </strong>
              {" "}
              {confirmationPrediction}
            </p>

            <p>
              <strong>
                📋 Chart Status:
              </strong>
              {" "}
              {chartStatus}
            </p>

            <p>
              <strong>
                🧠 Travel Advisory:
              </strong>
              {" "}
              {advisory}
            </p>

            <h4>
              Passengers
            </h4>

            
            {booking.passengers?.map(
              (p, index) => (

                <div
                  key={index}
                  style={styles.passengerCard}
                >

                  {p.name}
                  {" | "}

                  Coach:
                  {p.coachAssigned}

                  {" | "}

                  Seat:
                  {p.seatNumber}

                  {" | "}

                  Berth:
                  {p.allocatedBerth}

                </div>

              )
            )}

            <a
href={`http://localhost:5000/api/bookings/ticket/${booking.pnrNumber}`}
target="_blank"
rel="noreferrer"
style={{
display:"inline-block",
marginTop:"20px",
padding:"10px 20px",
background:"#1e3a8a",
color:"white",
borderRadius:"8px",
textDecoration:"none",
fontWeight:"bold"
}}
>
⬇ Download Ticket
</a>

          </div>

        )}

      </div>

    </div>

  );

}

const styles = {

  card: {
    border: "1px solid #ccc",
    padding: "20px",
    marginTop: "30px",
    borderRadius: "10px"
  },

  passenger: {
    padding: "10px",
    borderBottom: "1px solid #eee"
  },
  statsRow:{
display:"flex",
gap:"15px",
marginBottom:"20px",
flexWrap:"wrap"
},
searchCard:{
display:"flex",
gap:"10px",
background:"white",
padding:"20px",
borderRadius:"15px",
boxShadow:"0 4px 12px rgba(0,0,0,0.1)",
marginTop:"20px",
marginBottom:"20px"
},

statCard:{
background:"#f8fafc",
padding:"15px",
borderRadius:"10px",
minWidth:"180px",
textAlign:"center"
},
passengerCard:{
padding:"15px",
marginTop:"10px",
background:"#f8fafc",
borderRadius:"10px",
borderLeft:"5px solid #1e3a8a"
},

};

export default PnrStatus;