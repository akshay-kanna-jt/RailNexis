import React, {
  useState
} from "react";
import {
  useNavigate
} from "react-router-dom";
import Navbar from "../../components/Navbar";
import API from "../../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function TrainStatus() {

  const [trainNumber, setTrainNumber] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getTrainStatus = async () => {
  try {
    setLoading(true);
    const res = await API.get(`/trains/status/${trainNumber}`);
    setStatus(res.data);
  } catch (error) {
    alert("Train not found");
  } finally {
    setLoading(false);
  }
};

  const chartData =
  status?.route?.map((s) => ({
    station: 
      s.station,
    delay:
      s.predictedDelay
  })) || [];

  const maxDelay =
  Math.max(
    ...chartData.map(
      (d) => d.delay
    ),
    0
  );

const avgDelay =
  chartData.length
    ? Math.floor(
        chartData.reduce(
          (a,b) =>
            a+b.delay,
          0
        ) / chartData.length
      )
    : 0;
const riskLevel =
  maxDelay < 10
    ? "Low"
    : maxDelay <= 30
    ? "Medium"
    : "High";

const recommendation =
  riskLevel === "High"
    ? "Expect major delay. Alternative planning recommended."
    : riskLevel === "Medium"
    ? "Moderate delays expected during journey."
    : "Train is operating normally.";

const firstDelay =
  chartData[0]?.delay || 0;
const lastDelay =
  chartData[
    chartData.length - 1
  ]?.delay || 0;

const delayTrend =
  lastDelay > firstDelay
    ? "Increasing"
    : lastDelay < firstDelay
    ? "Recovering"
    : "Stable";

const trendMessage =
  delayTrend === "Increasing"
    ? "📈 Delay expected to increase further."
    : delayTrend === "Recovering"
    ? "📉 Train is recovering lost time."
    : "➡ Delay trend is stable.";

const currentIndex =

  status?.route?.findIndex(
    (s) => s.isCurrent
  ) || 0;

const totalStations =

  status?.route?.length || 1;

const progressPercent =

  Math.floor(
    (
      currentIndex /
      (totalStations - 1)
    ) * 100
  );

  return (
    <div>
      <Navbar />
      <div style={{ padding: "40px" }}>
        <h2 style={{ marginBottom: "20px" }}>Where Is My Train 🚆</h2>
        <input
          type="text"
          placeholder="Enter Train Number"
          value={trainNumber}
          onChange={(e) => setTrainNumber(e.target.value)}
        />
        <button onClick={getTrainStatus}
        style={{
            marginLeft: "10px",
            padding: "8px 16px",
            background: "#1e3a8a",
            color: "white",
            border: "none",
            borderRadius: "5px",
        }}
        >
          Check Status
        </button>
        {
loading && (
<p
style={{
marginTop:"10px",
fontWeight:"bold",
color:"#1e3a8a"
}}
>
🔄 Loading Train Status...
</p>
)
}
    
        {status && (
          <div style={{ marginTop: "20px" }}>
            <div style={styles.statsContainer}>

<div style={styles.statsCard}>
<h3>🚆 Current Station</h3>
<p>
{
status.route.find(
s => s.isCurrent
)?.station || "N/A"
}
</p>
</div>

<div style={styles.statsCard}>
<h3>⏰ ETA</h3>
<p>
{
status.nextStationETA || "N/A"
}
</p>
</div>

<div style={styles.statsCard}>
<h3>📊 Max Delay</h3>
<p>
{maxDelay} mins
</p>
</div>

<div style={styles.statsCard}>
<h3>⚠ Risk Level</h3>
<p>
{riskLevel}
</p>
</div>

</div>
            <div style={styles.routeContainer}>
              {status?.route?.map((s, index) => (
                <div
                  key={index}
                  style={styles.progressWrapper}
                >
                  <div
                    style={{
                      ...styles.stationDot,
                      background:
                        s.isCurrent
                          ? "green"
                          : s.delayAtStation > 0
                          ? "orange"
                          : "#1e3a8a"
                    }}
                  />
                  <span
                    style={{
                      fontWeight:
                        s.isCurrent
                          ? "bold"
                          : "normal"
                    }}
                  >
                    {s.station}
                  </span>
                  {index !==
                    status.route.length - 1 && (
                    <div style={styles.line} />
                  )}
                </div>
              ))}
            </div>
            <div style={{
                background: "#1e3a8a",
                color: "white",
                padding: "15px",
                borderRadius: "10px",
                marginTop: "20px"
            }}>
                <h3>{status.trainName}</h3>
                <p>Total Stations: {status.route.length}</p>
                <p>
                    Current Status: {
                        status.route.some(s => s.delayAtStation > 0)
                            ? "Running Late"
                            : "On Time"
                    }
                </p> 
                <p>
  🌦 Current Weather:
  {" "}
  <b>
    {status.currentWeather}
  </b>
</p>
<p>

  ⚠ Weather Impact:
  {" "}

  <b>

    {

      status.currentWeather ===
      "Clear"

        ? "Minimal delay expected"

        : status.currentWeather ===
          "Rain"

        ? "Moderate delay possible"

        : status.currentWeather ===
          "Fog"

        ? "Visibility delay risk"

        : status.currentWeather ===
          "Thunderstorm"

        ? "Heavy operational delays"

        : "Weather conditions being monitored"

    }

  </b>

</p>
                <p>
  🚆 Running:
  {" "}
  <b>
    {status.runningBetween}
  </b>
</p>
<p>
  ⏰ ETA:
  {" "}
  <b>
    {status.nextStationETA || "N/A"}
  </b>
</p>   
            </div>

            <div
  style={{

    marginTop: "25px",

    background: "white",

    padding: "20px",

    borderRadius: "12px"

  }}
>

  <h3>
    🚆 Journey Progress
  </h3>

  <div
    style={{

      width: "100%",

      height: "20px",

      background: "#d1d5db",

      borderRadius: "10px",

      overflow: "hidden",

      marginTop: "15px"

    }}
  >

    <div
      style={{

        width:
          `${progressPercent}%`,

        height: "100%",

        background:
          "#16a34a",

        transition:
          "0.5s"

      }}
    />

  </div>

  <p
    style={{
      marginTop: "10px"
    }}
  >

    {progressPercent}% Journey Completed

  </p>

</div>

            <p style={{ marginTop: "20px", fontStyle: "bold" }}>
                Current Station: {
                    status.route.find(s => s.isCurrent)?.station || "N/A"
                }
            </p>

            <div
style={{
display:"flex",
gap:"20px",
marginTop:"25px",
fontWeight:"bold"
}}
>

<span>
🟢 Current Station
</span>

<span>
🟠 Delayed
</span>

<span>
🔵 Upcoming
</span>

</div>
            <div style={styles.tableContainer}>
            <table
style={{
marginTop:"20px",
width:"100%",
borderCollapse:"separate",
borderSpacing:"0",
fontSize:"15px"
}}
>

            <thead style={{
background:"#1e3a8a",
color:"white",
padding:"15px",
fontWeight:"bold",
position:"sticky",
top:0,
zIndex:10,
fontSize:"14px"
}}>
                <tr>
                    <th style={{padding:"16px",textAlign:"center",background:"#1e3a8a",color:"white",fontWeight:"600"}}>Station</th>
                    <th style={{padding:"16px",textAlign:"center",background:"#1e3a8a",color:"white",fontWeight:"600"}}>Distance (km)</th>
                    <th style={{padding:"16px",textAlign:"center",background:"#1e3a8a",color:"white",fontWeight:"600"}}>Delay (mins)</th>
                    <th style={{padding:"16px",textAlign:"center",background:"#1e3a8a",color:"white",fontWeight:"600"}}>Sch Arr</th>
                    <th style={{padding:"16px",textAlign:"center",background:"#1e3a8a",color:"white",fontWeight:"600"}}>Act Arr</th>
                    <th style={{padding:"16px",textAlign:"center",background:"#1e3a8a",color:"white",fontWeight:"600"}}>Sch Dep</th>
                    <th style={{padding:"16px",textAlign:"center",background:"#1e3a8a",color:"white",fontWeight:"600"}}>Act Dep</th>
                    <th style={{padding:"16px",textAlign:"center",background:"#1e3a8a",color:"white",fontWeight:"600"}}>Status</th>
                    <th style={{padding:"16px",textAlign:"center",background:"#1e3a8a",color:"white",fontWeight:"600"}}>Reason</th>
                    <th style={{padding:"16px",textAlign:"center",background:"#1e3a8a",color:"white",fontWeight:"600"}}>AI Prediction</th>
                    <th style={{padding:"16px",textAlign:"center",background:"#1e3a8a",color:"white",fontWeight:"600"}}>AI Reason</th>
                    <th style={{padding:"16px",textAlign:"center",background:"#1e3a8a",color:"white",fontWeight:"600"}}>Risk Level</th>
                </tr>
            </thead>
            <tbody>
{
status?.route?.map((s,index)=>(
<tr
key={index}
style={{
background:
s.isCurrent
? "#dcfce7"
: index % 2 === 0
? "#ffffff"
: "#f8fafc",

fontWeight:
s.isCurrent
? "bold"
: "normal",

borderLeft:
s.isCurrent
? "5px solid #16a34a"
: ""
}}
>

<td style={{
padding:"16px",
textAlign:"left",
borderBottom:"1px solid #e5e7eb"
}}>
{s.station}
</td>

<td style={{
padding:"16px",
textAlign:"center",
borderBottom:"1px solid #e5e7eb"
}}>
{s.distance} km
</td>

<td style={{
padding:"16px",
textAlign:"center",
fontWeight:"bold",
color:
s.delayAtStation <= 5
? "green"
: s.delayAtStation <= 15
? "orange"
: "red",
borderBottom:"1px solid #e5e7eb"
}}>
{s.delayAtStation} mins
</td>

<td style={{padding:"16px",textAlign:"center",borderBottom:"1px solid #e5e7eb"}}>
{s.scheduledArrival}
</td>

<td style={{
padding:"16px",
textAlign:"center",
color:"red",
borderBottom:"1px solid #e5e7eb"
}}>
{s.actualArrival}
</td>

<td style={{padding:"16px",textAlign:"center",borderBottom:"1px solid #e5e7eb"}}>
{s.scheduledDeparture}
</td>

<td style={{
padding:"16px",
textAlign:"center",
color:"red",
borderBottom:"1px solid #e5e7eb"
}}>
{s.actualDeparture}
</td>

<td style={{
padding:"16px",
textAlign:"center",
borderBottom:"1px solid #e5e7eb"
}}>
<span
style={{
padding:"8px 14px",
borderRadius:"20px",
fontWeight:"bold",
background:
s.delayAtStation > 0
? "#fee2e2"
: "#dcfce7",
color:
s.delayAtStation > 0
? "red"
: "green"
}}
>
{
s.delayAtStation > 0
? "🔴 Delayed"
: "🟢 On Time"
}
</span>
</td>

<td style={{
padding:"16px",
textAlign:"center",
borderBottom:"1px solid #e5e7eb"
}}>
{s.reason}
</td>

<td style={{
padding:"16px",
textAlign:"center",
borderBottom:"1px solid #e5e7eb"
}}>
<span
style={{
background:"#f3e8ff",
color:"#7c3aed",
padding:"8px 14px",
borderRadius:"20px",
fontWeight:"bold"
}}
>
{s.predictedDelay} mins
</span>
</td>

<td style={{
padding:"16px",
textAlign:"center",
borderBottom:"1px solid #e5e7eb"
}}>
<span style={{ padding: "6px 12px", borderRadius: "8px", background: s.predictionReason === "Clear" ? "#16a34a" : s.predictionReason === "Rain" ? "#2563eb" : s.predictionReason === "Heavy Rain" ? "#1e40af" : s.predictionReason === "Fog" ? "#6b7280" : "#dc2626", color: "white", fontWeight: "bold" }} > { s.predictionReason === "Clear" ? "☀ Clear" : s.predictionReason === "Rain" ? "🌧 Rain" : s.predictionReason === "Heavy Rain" ? "⛈ Heavy Rain" : s.predictionReason === "Fog" ? "🌫 Fog" : "⚡ Storm" } </span>
</td>

<td style={{
padding:"16px",
textAlign:"center",
borderBottom:"1px solid #e5e7eb"
}}>
<span
style={{
padding:"8px 14px",
borderRadius:"20px",
color:"white",
fontWeight:"bold",
background:
s.predictedDelay < 10
? "green"
: s.predictedDelay < 25
? "orange"
: "red"
}}
>
{
s.predictedDelay < 10
? "Low"
: s.predictedDelay < 25
? "Medium"
: "High"
}
</span>
</td>

</tr>
))
}
</tbody>
            </table>
            </div>
            <div
  style={{
    marginTop: "40px",
    background: "white",
    padding: "20px",
    borderRadius: "10px"
  }}
>
  <h3>
    📊 AI Delay Analytics
  </h3>
  <ResponsiveContainer
    width="100%"
    height={300}
  >
    <LineChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="station" />
      <YAxis />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="delay"
        stroke="#7c3aed"
        strokeWidth={3}
      />
    </LineChart>
  </ResponsiveContainer>
</div>
<div
  style={{
    marginTop: "30px",
    background: "#111827",
    color: "white",
    padding: "25px",
    borderRadius: "12px"
  }}
>
  <h3>
    🧠 AI Journey Summary
  </h3>
  <button
style={styles.notifyBtn}

onClick={()=>{

const notification = {

id: Date.now(),

type:"delay",

message:
`🚆 ${status.trainName} is delayed by ${maxDelay} minutes`,

time:
new Date().toLocaleString(),
read:false
};

const oldNotifications = JSON.parse(
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
alert(
"Delay notification added"
);
}}
>
🔔 Notify Delay
</button>
  <p>
    🚆 Maximum Delay:
    {" "}
    <b>{maxDelay} mins</b>
  </p>

  <p>
    📊 Average Delay:
    {" "}
    <b>{avgDelay} mins</b>
  </p>

  <p>
    ⚠ Risk Level:
    {" "}
    <b>{riskLevel}</b>
  </p>
  <p>
    🤖 Recommendation:
    {" "}
    <b>{recommendation}</b>
  </p>
  <p>
  📊 Delay Trend:
  {" "}
  <b>
    {delayTrend}
  </b>
</p>

<p>
  {trendMessage}
</p>
</div>
            <button
              onClick={() => {
                const currentStation =
                  status.route.find(
                    (s) => s.isCurrent
                    )?.station;
                  
                    navigate("/railway-map", {
                  state: {
                    currentStation,
                    trainData: status
                  }
                });
              }}
              style={styles.mapButton}
            >
              View On Map 🗺️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  routeContainer: {
  marginTop: "20px",
  padding: "10px",
  background: "#f3f4f6",
  borderRadius: "8px",
  fontSize: "16px"
},
routeItem: {
  marginRight: "5px"
}, 
progressWrapper: {
  display: "flex",
  alignItems: "center",
  marginBottom: "12px",
  flexWrap: "wrap"
},
stationDot: {
  width: "16px",
  height: "16px",
  borderRadius: "50%",
  marginRight: "10px"
},
line: {
  width: "50px",
  height: "3px",
  background: "#ccc",
  margin: "0 10px"
},
mapButton: {
  marginTop: "20px",
  padding: "12px 20px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px"
},
notifyBtn:{
marginTop:"15px",
padding:"10px 16px",
background:"orange",
color:"white",
border:"none",
borderRadius:"8px",
cursor:"pointer",
fontWeight:"bold"
},

statsContainer:{
display:"grid",
gridTemplateColumns:
"repeat(auto-fit,minmax(220px,1fr))",
gap:"20px",
marginBottom:"20px"
},

statsCard:{
background:"white",
padding:"20px",
borderRadius:"12px",
boxShadow:
"0 4px 12px rgba(0,0,0,0.1)",
textAlign:"center"
},
tableContainer:{
marginTop:"20px",
background:"white",
borderRadius:"15px",
overflow:"hidden",
boxShadow:
"0 4px 15px rgba(0,0,0,0.1)"
},
}

export default TrainStatus;