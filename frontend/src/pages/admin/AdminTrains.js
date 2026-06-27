import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

function AdminTrains() {

  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,setSearch] = useState("");

  useEffect(() => {

    const fetchTrains = async () => {

      try {

        const res = await API.get("/trains");

        setTrains(res.data);

      } catch (err) {

        console.log("Error fetching trains");

      } finally {

        setLoading(false);

      }

    };

    fetchTrains();

  }, []);
  const filteredTrains =
trains.filter(
(t)=>

t.trainName
?.toLowerCase()
.includes(
search.toLowerCase()
)

||

t.trainNumber
?.includes(search)
);

  return (

    <div>

      <Navbar />

      <div style={{ padding: "40px" }}>

        <h2 style={{ marginBottom: "20px" }}>
          All Trains 🚆
        </h2>
        <input
type="text"
placeholder="Search Train Name..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
style={{
padding:"10px",
width:"300px",
borderRadius:"8px",
border:"1px solid #ccc",
marginBottom:"20px"
}}
/>


        <div style={styles.summaryGrid}>

<div style={styles.summaryCard}>
<h3>Total Trains</h3>
<p>{trains.length}</p>
</div>

<div style={styles.summaryCard}>
<h3>Total Seats</h3>
<p>
{
trains.reduce(
(sum,t)=>
sum + (t.totalSeats || 0),
0
)
}
</p>
</div>

<div style={styles.summaryCard}>
<h3>Available Seats</h3>
<p>
{
trains.reduce(
(sum,t)=>
sum + (t.availableSeats || 0),
0
)
}
</p>
</div>

<div style={styles.summaryCard}>
<h3>Routes</h3>
<p>{trains.length}</p>
</div>

</div>

        {loading ? (

          <p>Loading trains...</p>

        ) : trains.length === 0 ? (

          <p>No trains available</p>

        ) : (

          <div>

            {filteredTrains.map((train, index) => (

              <div
                key={train._id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                  padding: "20px",
                  marginBottom: "20px",
                  background: "#f9fafb"
                }}
              >

                <h3 style={{ color: "#1e3a8a" }}>
                  {index + 1}. {train.trainName}
                </h3>

                <p>
                  <strong>Train Number:</strong> {train.trainNumber}
                </p>

                <p>
                  <strong>Total Seats:</strong>{" "}
                  {train.totalSeats || "N/A"}
                </p>

                <p>
                  <strong>Available Seats:</strong>{" "}
                  {train.availableSeats || 0}
                </p>
                <h4
style={{
marginTop:"15px"
}}
>
Coach Availability
</h4>

<div
style={{
display:"flex",
flexWrap:"wrap",
gap:"10px",
marginTop:"10px"
}}
>

{
train.coaches?.map(
(coach,index)=>(

<div
key={index}
style={{
background:"#dbeafe",
padding:"10px",
borderRadius:"8px",
minWidth:"120px"
}}
>

<b>
{coach.coachName}
</b>

<br/>

{coach.classType}

<br/>

Seats:
{" "}
{coach.availableSeats}

</div>

))
}

</div>

                <h4 style={{ marginTop: "15px" }}>
                  Route:
                </h4>

                <div style={styles.routeContainer}>

                  {train.stations
                    ?.filter((s) => s.station)
                    .map((s, i) => (

                      <span
                        key={i}
                        style={styles.routeItem}
                      >

                        {s.station.name}

                        {i !== train.stations.length - 1 && " → "}

                      </span>

                    ))}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

}

const styles = {

  routeContainer: {
    marginTop: "10px",
    padding: "10px",
    background: "#eef2ff",
    borderRadius: "8px",
    lineHeight: "30px"
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

  routeItem: {
    marginRight: "5px",
    fontWeight: "500"
  }

};

export default AdminTrains;