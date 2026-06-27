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

function AdminOccupancy() {

  const [occupancy, setOccupancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate,setSelectedDate] = useState("");
  const [routeLimit,setRouteLimit] = useState(10);
   const [trainLimit,setTrainLimit] = useState(10);

  useEffect(() => {
    fetchOccupancy();
  }, []);

  const fetchOccupancy = async () => {
    try {

      const res =
        await API.get("/occupancy");

      setOccupancy(res.data.data);

    } catch (err) {

      console.log(err);
      alert("Failed to load occupancy data");

    } finally {

      setLoading(false);

    }
  };

  if (loading) {
    return <p>Loading Occupancy Dashboard...</p>;
  }

  const summary = occupancy.summary;
 
  // const topTrain = summary.mostOccupiedTrain;

const topCoach =
  occupancy.coachWise.length > 0
    ? [...occupancy.coachWise]
        .sort(
          (a,b)=>
            b.bookedSeats -
            a.bookedSeats
        )[0]
    : null;

const topRoute =
  occupancy.routeWise.length > 0
    ? [...occupancy.routeWise]
        .sort(
          (a,b)=>
            b.bookings -
            a.bookings
        )[0]
    : null;

const activeTrains =
  occupancy.trainWise.filter(
    train =>
      train.occupiedSeats > 0
  ).length;

  const filteredDateWise =
selectedDate
? occupancy.dateWise.filter(
(d)=>
new Date(d._id)
.toISOString()
.split("T")[0]
=== selectedDate
)
: occupancy.dateWise;

  const pieData = [
    {
      name: "Confirmed",
      value: summary.confirmedCount
    },
    {
      name: "RAC",
      value: summary.racCount
    },
    {
      name: "Waiting",
      value: summary.waitingCount
    },
    {
      name: "Cancelled",
      value: summary.cancelledCount
    }
  ];

  const COLORS = [
    "#16a34a",
    "#f59e0b",
    "#dc2626",
    "#6b7280"
  ];

  return (
    <div>

      <Navbar />

      <div style={styles.container}>

        <h1>
          🚆 Occupancy Dashboard
        </h1>
        <div
style={{
display:"inline-block",
padding:"8px 15px",
borderRadius:"20px",
fontWeight:"bold",
marginBottom:"15px",
background:
summary.occupancyPercentage > 80
? "#fee2e2"
: summary.occupancyPercentage > 50
? "#fef3c7"
: "#dcfce7"
}}
>

{
summary.occupancyPercentage > 80
? "🔴 High Demand Network"

: summary.occupancyPercentage > 50
? "🟠 Moderate Load"

: "🟢 Healthy Capacity"
}

</div>

        <p>
          Real-time train occupancy monitoring
        </p>

        {/* SUMMARY CARDS */}

        <div style={styles.grid}>

          <div style={styles.card}>
            <h3>Occupancy %</h3>
            <p>{summary.occupancyPercentage}%</p>
          </div>

          <div style={styles.card}>
            <h3>Confirmed</h3>
            <p>{summary.confirmedCount}</p>
          </div>

          <div style={styles.card}>
            <h3>RAC</h3>
            <p>{summary.racCount}</p>
          </div>

          <div style={styles.card}>
            <h3>Waiting</h3>
            <p>{summary.waitingCount}</p>
          </div>

          <div style={styles.card}>
            <h3>Cancelled</h3>
            <p>{summary.cancelledCount}</p>
          </div>

          <div style={styles.card}>
            <h3>Seat Utilization</h3>
            <p>
              {summary.seatUtilization}%
              </p>
</div>

<div style={styles.card}>
<h3>
💰 Revenue
</h3>

<p>
₹ {summary.totalRevenue || 0}
</p>
</div>

<div style={styles.card}>
  <h3>🔥 Most Occupied Train</h3>

  <p>
    {
      summary.mostOccupiedTrain
        ?.trainName
    }
  </p>

  <small>
    {
      summary.mostOccupiedTrain
        ?.occupancyPercentage
    }%
  </small>
</div>

<div style={styles.card}>
  <h3>🟢 Least Occupied Train</h3>

  <p>
    {
      summary.leastOccupiedTrain
        ?.trainName
    }
  </p>

  <small>
    {
      summary.leastOccupiedTrain
        ?.occupancyPercentage
    }%
  </small>
</div>

<div style={styles.card}>
  <h3>System Health</h3>

  <p
    style={{
      color:
        summary.occupancyPercentage > 80
          ? "red"
          : summary.occupancyPercentage > 50
          ? "orange"
          : "green"
    }}
  >
    {
      summary.occupancyPercentage > 80
        ? "High Demand"
        : summary.occupancyPercentage > 50
        ? "Moderate Load"
        : "Healthy Capacity"
    }
  </p>
</div>

<div style={styles.card}>
  <h3>🚆 Active Trains</h3>

  <p>
    {activeTrains}
  </p>
</div>

<div style={styles.card}>
  <h3>🏆 Top Coach</h3>

  <p>
    {topCoach?.coach}
  </p>

  <small>
    {topCoach?.bookedSeats} Seats
  </small>
</div>

<div style={styles.card}>
  <h3>📍 Top Route</h3>

  <p>
    {topRoute?.route}
  </p>

  <small>
    {topRoute?.bookings} Bookings
  </small>
</div>

        </div>

        {/* PIE CHART */}

        <div style={styles.chartBox}>

          <h2>
            Booking Status Distribution
          </h2>

          <PieChart width={450} height={350}>

            <Pie
              data={pieData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label
            >

              {pieData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}

            </Pie>

            <Tooltip />
            <Legend />

          </PieChart>

        </div>

        {/* TRAIN OCCUPANCY */}

        <div style={styles.section}>

<h2>
🏆 Train Occupancy Ranking
</h2>

<table style={styles.table}>

<thead>

<tr>

<th style={styles.th}>Rank</th>
<th style={styles.th}>Train</th>
<th style={styles.th}>Occupancy %</th>

</tr>

</thead>

<tbody>

{[...occupancy.trainWise]

.sort(
(a,b)=>
parseFloat(
b.occupancyPercentage
)
-
parseFloat(
a.occupancyPercentage
)
)

.slice(0,5)

.map(
(train,index)=>(
<tr key={index}>

<td style={styles.td}>
#{index+1}
</td>

<td style={styles.td}>
{train.trainName}
</td>

<td style={styles.td}>
{train.occupancyPercentage}%
</td>

</tr>
)
)}

</tbody>

</table>

</div>

        <div style={styles.section}>

          <h2>
            🚆 Train Wise Occupancy
          </h2>

          <table style={styles.table}>

            <thead>

              <tr>

                <th style={styles.th}>Train</th>
                <th style={styles.th}>No</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Occupied</th>
                <th style={styles.th}>Available</th>
                <th style={styles.th}>Occupancy</th>

              </tr>

            </thead>

            <tbody>

              {occupancy.trainWise
.slice(0,trainLimit).map((train, index) => (

                <tr key={index}>

                  <td style={styles.td}>{train.trainName}</td>
                  <td style={styles.td}>{train.trainNumber}</td>
                  <td style={styles.td}>{train.totalSeats}</td>
                  <td style={styles.td}>{train.occupiedSeats}</td>
                  <td style={styles.td}>{train.availableSeats}</td>

                  <td style={styles.td}>

                    <div
                      style={{
                        width: "150px",
                        background: "#ddd",
                        borderRadius: "10px"
                      }}
                    >

                      <div
                        style={{
                          width:
                            `${train.occupancyPercentage}%`,
                          background: "#16a34a",
                          color: "white",
                          textAlign: "center",
                          borderRadius: "10px"
                        }}
                      >

                        {train.occupancyPercentage}%

                      </div>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        <div
style={{
marginTop:"15px",
textAlign:"center"
}}
>

{trainLimit <
occupancy.trainWise.length && (

<button
onClick={()=>
setTrainLimit(
prev=>prev+10
)
}
style={styles.showBtn}
>
Show More
</button>

)}

{trainLimit > 10 && (

<button
onClick={()=>
setTrainLimit(
10
)
}
style={styles.showBtn}
>
Show Less
</button>

)}

</div>

        {/* DATE WISE */}
        <div
style={{
marginBottom:"20px"
}}
>

<input
type="date"
value={selectedDate}
onChange={(e)=>
setSelectedDate(
e.target.value
)
}
style={{
padding:"10px",
borderRadius:"8px",
border:"1px solid #ccc"
}}
/>

</div>

        <div style={styles.section}>

  <h2>
    📅 Date Wise Bookings
  </h2>

  <BarChart
    width={700}
    height={300}
    data={
      filteredDateWise.filter(
        (d)=>d._id
      )
    }
  >

    <CartesianGrid strokeDasharray="3 3" />

    <XAxis
      dataKey="_id"
      tickFormatter={(date)=>
        new Date(date)
        .toLocaleDateString()
      }
    />

    <YAxis />

    <Tooltip />

    <Bar
      dataKey="bookings"
      fill="#1e3a8a"
    />

  </BarChart>

  {
    selectedDate &&
    filteredDateWise.length === 0 && (

      <p
        style={{
          marginTop:"15px",
          color:"red",
          fontWeight:"bold",
          textAlign:"center"
        }}
      >
        No bookings found for selected date
      </p>

    )
  }

</div>

<div style={styles.section}>

<h2>
🏆 Top Booking Dates
</h2>

<table style={styles.table}>

<thead>

<tr>
<th style={styles.th}>Date</th>
<th style={styles.th}>Bookings</th>
</tr>

</thead>

<tbody>

{[...occupancy.dateWise]

.sort(
(a,b)=>
b.bookings-a.bookings
)

.slice(0,5)

.map((date,index)=>(

<tr key={index}>

<td style={styles.td}>
{
new Date(date._id)
.toLocaleDateString()
}
</td>

<td style={styles.td}>
{date.bookings}
</td>

</tr>

))}

</tbody>

</table>

</div>

<div style={styles.section}>

<h2>
📈 Booking Trend
</h2>

<BarChart
width={700}
height={300}
data={
occupancy.dateWise
}
>

<CartesianGrid
strokeDasharray="3 3"
/>

<XAxis
dataKey="_id"
tickFormatter={(date)=>
new Date(date)
.toLocaleDateString()
}
/>

<YAxis/>

<Tooltip/>

<Bar
dataKey="bookings"
fill="#16a34a"
/>

</BarChart>

</div>

        {/* COACH WISE */}
        <div style={styles.section}>
          <h2>
            🚃 Coach Wise Occupancy
          </h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Coach</th>
                <th style={styles.th}>Booked Seats</th>
              </tr>
            </thead>
            <tbody>
              {occupancy.coachWise.map((coach, index) => (
                <tr key={index}>
                  <td style={styles.td}>{coach.coach}</td>
                  <td style={styles.td}>{coach.bookedSeats}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

<div style={styles.section}>

<h2>
🚆 Class Wise Occupancy
</h2>

<table style={styles.table}>

<thead>

<tr>
<th style={styles.th}>Class</th>
<th style={styles.th}>Bookings</th>
</tr>

</thead>

<tbody>

{occupancy.classWise?.map(
(cls,index)=>(

<tr key={index}>

<td style={styles.td}>{cls.class}</td>

<td style={styles.td}>{cls.bookings}</td>

</tr>

))
}

</tbody>

</table>

</div>

        {/* ROUTE WISE */}
        <div style={styles.section}>
          <h2>
            📍 Route Analysis
          </h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Route</th>
                <th style={styles.th}>Bookings</th>
              </tr>
            </thead>
            <tbody>
              {occupancy.routeWise
.filter(
route =>
!route.route.includes("undefined")
)
.slice(0,routeLimit)
.map((route,index)=>(
                <tr key={index}>
                  <td style={styles.td}>{route.route}</td>
                  <td style={styles.td}>{route.bookings}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
style={{
marginTop:"15px",
textAlign:"center"
}}
>

{routeLimit <
occupancy.routeWise.length && (

<button
onClick={()=>
setRouteLimit(
prev=>prev+10
)
}
style={styles.showBtn}
>
Show More
</button>

)}

{routeLimit > 10 && (

<button
onClick={()=>
setRouteLimit(
10
)
}
style={styles.showBtn}
>
Show Less
</button>

)}

</div>
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
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "20px",
    marginTop: "20px"
  },
  card: {
    background: "#f9fafb",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.1)"
  },
  chartBox: {
    marginTop: "40px",
    display: "flex",
    justifyContent: "center"
  },
  section: {
    marginTop: "50px"
  },
  table:{
width:"100%",
borderCollapse:"collapse",
marginTop:"15px",
tableLayout:"fixed"
},
th:{
padding:"12px",
background:"#1e3a8a",
color:"white",
border:"1px solid #ddd"
},

td:{
padding:"10px",
border:"1px solid #ddd",
textAlign:"center"
},
  showBtn:{
padding:"10px 20px",
margin:"5px",
background:"#1e3a8a",
color:"white",
border:"none",
borderRadius:"8px",
cursor:"pointer",
fontWeight:"bold"
}
};

export default AdminOccupancy;
