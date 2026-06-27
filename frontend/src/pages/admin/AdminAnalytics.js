import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

import {
PieChart,
Pie,
Cell,
Tooltip,
Legend,
BarChart,
Bar,
XAxis,
YAxis,
CartesianGrid
} from "recharts";

function AdminAnalytics() {

  const [analytics, setAnalytics] =
    useState(null);

  const [loading, setLoading] =
    useState(true);
  const [recentBookings, 
    setRecentBookings] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {

    try {

      const res = await API.get(
        "/admin/analytics"
      );

      setAnalytics(res.data.data);
      setRecentBookings(
        res.data.data.recentBookings || []
      );

    } catch (err) {

      console.log(err);

      alert("Failed to load analytics");

    } finally {

      setLoading(false);

    }

  };

  // ✅ Chart Data
  const chartData = [
    {
      name: "Confirmed",
      value: analytics?.confirmedBookings || 0
    },
    {
      name: "RAC",
      value: analytics?.racBookings || 0
    },
    {
      name: "Waiting",
      value: analytics?.waitingBookings || 0
    },
    {
      name: "Cancelled",
      value: analytics?.cancelledBookings || 0
    }
  ];

  const COLORS = [
    "#16a34a",
    "#f59e0b",
    "#dc2626",
    "#6b7280"
  ];

  const trendData =
analytics?.bookingTrend?.map(
(item)=>({

date:
new Date(item._id)
.toLocaleDateString(),

bookings:
item.bookings

})
) || [];

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>

      <Navbar />

      <div style={styles.container}>

        <h2>
          RailNexis Analytics Dashboard
        </h2>
        <p
style={{
color:"gray",
marginBottom:"20px"
}}
>

Real-time booking, revenue,
occupancy and demand analytics.

</p>

        <div style={styles.grid}>

          <div style={styles.card}>
            <h3>Total Bookings</h3>
            <p>{analytics.totalBookings}</p>
          </div>

          <div style={styles.card}>
            <h3>Confirmed</h3>
            <p style={{ color: "green" }}>
              {analytics.confirmedBookings}
            </p>
          </div>

          <div style={styles.card}>
            <h3>RAC</h3>
            <p style={{ color: "orange" }}>
              {analytics.racBookings}
            </p>
          </div>

          <div style={styles.card}>
<h3>
Train Occupancy
</h3>

<p style={{
fontSize:"28px",
fontWeight:"bold",
color:"#1e3a8a"
}}>
{
analytics?.occupancyPercentage
}%
</p>

<p>
{
analytics?.totalBookings > 20
? "🔥 High Demand"
: analytics?.totalBookings > 10
? "⚡ Moderate Crowd"
: "✅ Low Crowd"
}
</p>
</div>

<div style={styles.card}>

<h3>
🚆 Most Booked Train
</h3>

<p style={{
fontSize:"22px",
fontWeight:"bold",
color:"#1e3a8a"
}}>
{
analytics?.mostBookedTrain
}
</p>

<p>
🔥 Most Preferred Train
</p>
</div>

<div style={styles.card}>

<h3>
💰 Revenue Analytics
</h3>

<p style={{
fontSize:"26px",
fontWeight:"bold",
color:"green"
}}>

₹ {
analytics?.revenue || 0
}

</p>

<p>
{
analytics?.revenue > 5000

? "🚀 Strong Revenue Growth"

: analytics?.revenue > 2000

? "📈 Moderate Revenue Growth"

: "⚡ Revenue Improving"
}
</p>

</div>

<div style={styles.card}>

<h3>
🛡 System Health
</h3>

<p
style={{
fontSize:"24px",
fontWeight:"bold",
color:
analytics?.cancelledBookings < 5
? "green"
: "red"
}}
>

{
analytics?.cancelledBookings < 5
? "Healthy"
: "Attention Required"
}

</p>

</div>

<div style={styles.card}>

<h3>
🎯 Seat Utilization
</h3>

<p style={{
fontSize:"28px",
fontWeight:"bold",
color:"#1e3a8a"
}}>
{
analytics?.seatUtilization
}%
</p>

<p>
Real Occupancy Usage
</p>

</div>

          <div style={styles.card}>
            <h3>Waiting</h3>
            <p style={{ color: "red" }}>
              {analytics.waitingBookings}
            </p>
          </div>

          <div style={styles.card}>
            <h3>Cancelled</h3>
            <p style={{ color: "gray" }}>
              {analytics.cancelledBookings}
            </p>
          </div>

          {/* <div style={styles.card}>
            <h3>Revenue</h3>
            <p>₹ {analytics.revenue}</p>
          </div> */}

        </div>

        <div style={styles.insightBox}>

<h3>
🤖 AI Booking Insights
</h3>

<div style={styles.insightCard}>

<p>
📅 Best Booking Day:
<b> Friday</b>
</p>

<p>
🚆 Lowest Crowd:
<b> Tuesday Morning</b>
</p>

<p>
💡 Smart Suggestion:
Book 3A class for best
comfort-price balance.
</p>

</div>

</div>

        {/* ✅ Pie Chart */}

        <div style={styles.chartContainer}>

          <h3>
            Booking Status Overview
          </h3>

          <PieChart width={400} height={350}>

            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="value"
              label
            >

              {chartData.map((entry, index) => (

                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index]}
                />

              ))}

            </Pie>

            <Tooltip />
            <Legend />

          </PieChart>
          <h3 style={{
marginTop:"40px"
}}>
📈 Weekly Booking Trends
</h3>

<BarChart
width={500}
height={300}
data={trendData}
>

<CartesianGrid strokeDasharray="3 3" />

<XAxis dataKey="date" />

<YAxis />

<Tooltip />

<Bar
dataKey="bookings"
fill="#1e3a8a"
/>

</BarChart>

        </div>
        <div style={styles.tableContainer}>

<h3>
Recent Bookings
</h3>

<table style={styles.table}>

<thead>

<tr>

<th style={styles.th}>PNR</th>
<th style={styles.th}>Train</th>
<th style={styles.th}>Status</th>

</tr>

</thead>

<tbody>

{recentBookings
.slice(0,10)
.map(
(booking,index)=>(

<tr key={index}>

<td style={styles.td}>
{booking.pnrNumber}
</td>

<td style={styles.td}>
{
booking.train
?.trainName
}
</td>

<td style={styles.td}>
<span
style={{
fontWeight:"bold",
color:
booking.status === "CONFIRMED"
? "green"
: booking.status === "RAC"
? "orange"
: booking.status === "WAITING"
? "red"
: "gray"
}}
>
{booking.status}
</span>
</td>

</tr>

))}

</tbody>

</table>

</div>

      </div>

    </div>
  );
}

const styles = {

  container: {
    padding: "40px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "30px"
  },

  card: {
    border: "1px solid #ccc",
    borderRadius: "10px",
    padding: "25px",
    background: "#f9fafb",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.1)"
  },

  chartContainer: {
    marginTop: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.1)"
  },
  insightBox:{
marginTop:"40px"
},

insightCard:{
padding:"20px",
background:"#eef2ff",
borderRadius:"12px",
borderLeft:"6px solid #1e3a8a",
lineHeight:"2"
},


  tableContainer:{
marginTop:"40px",
background:"#fff",
padding:"20px",
borderRadius:"10px",
boxShadow:
"0 2px 8px rgba(0,0,0,0.1)"
},

table:{
width:"100%",
borderCollapse:"collapse",
marginTop:"20px"
},
th:{
background:"#1e3a8a",
color:"white",
padding:"12px",
border:"1px solid #ddd"
},

td:{
padding:"10px",
border:"1px solid #ddd",
textAlign:"center"
},

};

export default AdminAnalytics;