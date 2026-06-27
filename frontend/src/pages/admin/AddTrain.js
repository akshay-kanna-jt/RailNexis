import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import API from "../../services/api";
import { useEffect } from "react";

function AddTrain() {

  const [trainName, setTrainName] = useState("");
  const [trainNumber, setTrainNumber] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [stations, setStations] = useState([]);
  const [allStations, setAllStations] = useState([]);
  const [coaches, setCoaches] = useState([
    {
      coachName: "",
      classType: "",
      totalSeats: ""
    }
  ]);
  // const [trainStations, setTrainStations]

  const addStation = () => {
    setStations([
      ...stations,
      { name: "", arrivalTime: "", departureTime: "", distance: "" }
    ]);
  };

  const addCoach = () => {

  setCoaches([
    ...coaches,
    {
      coachName: "",
      classType: "",
      totalSeats: ""
    }
  ]);

};

const removeCoach = (index) => {
  const updated = coaches.filter(
    (_, i) => i !== index
  );
  setCoaches(updated);

};

  const handleStationChange = (index, field, value) => {
    const updated = [...stations];
    updated[index][field] = value;
    setStations(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(
!trainName ||
!trainNumber ||
!totalSeats
){
alert("Fill all train details");
return;
}

if(stations.length === 0){
alert("Add at least one station");
return;
}

if(coaches.length === 0){
alert("Add at least one coach");
return;
}

    const formattedCoaches = coaches.map((coach) => ({
     ...coach,
      availableSeats: Number(coach.totalSeats)
    }));

    try {
      await API.post("/trains/add", {
        trainName,
        trainNumber,
        totalSeats,
        stations,
        coaches: formattedCoaches
      });

      alert("Train added successfully");
    } catch (error) {
      alert("Failed to add train");
    }
  };
  useEffect(() => {
    const fetchStations = async () => {
        try {
            const res = await API.get("/stations");
            setAllStations(res.data);
        } catch (err) {
            console.log("Error fetching stations");
        }
    };

    fetchStations();
    }, []);

  const removeStation = (index) => {

    // 🔥 Prevent deleting all stations
    if (stations.length === 1) {
      alert("At least one station is required");
      return;
    }

    const updatedStations = stations.filter((_, i) => i !== index);

    setStations(updatedStations);
  };

  const inputStyle = {
  padding: "10px",
  margin: "5px",
  borderRadius: "6px",
  border: "1px solid #ccc"
};

  return (
    <div>
      <Navbar />

      <div style={{ padding: "40px" }}>
        <h2 style={{ marginBottom: "20px" }}>Add Train 🚆</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="Train Name"
            value={trainName}
            onChange={(e) => setTrainName(e.target.value)}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Train Number"
            maxLength="5"
            value={trainNumber}
            onChange={(e) => setTrainNumber(e.target.value)}
            style={inputStyle}
          />

          <input
            type="number"
            placeholder="Total Seats"
            value={totalSeats}
            onChange={(e) => setTotalSeats(e.target.value)}
            style={inputStyle}
          />

          <h3>Stations</h3>

          {stations.map((s, index) => (
            <div key={index} style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px",
              background: "#f9f9f9"
            }}>
                <h4 style={{ marginBottom: "10px", color: "#1e3a8a" }}>
                  Station {index + 1}
                  </h4>
                <select
                    onChange={(e) =>
                        handleStationChange(index, "station", e.target.value)
                    }
                >
                    <option value="">Select Station</option>
                    {allStations.map((st) => (
                        <option key={st._id} value={st._id}>
                            {st.name}
                        </option>
                    ))}
                </select>
              <input
                placeholder="Arrival"
                onChange={(e) =>
                  handleStationChange(index, "arrivalTime", e.target.value)
                }
                style={inputStyle}
              />
              <input
                placeholder="Departure"
                onChange={(e) =>
                  handleStationChange(index, "departureTime", e.target.value)
                }
                style={inputStyle}
              />
              <input
                placeholder="Distance"
                onChange={(e) =>
                  handleStationChange(index, "distance", e.target.value)
                }
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => removeStation(index)}
                style={{
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginTop: "10px",
                  display : "block"
                }}
              >
                Delete Station
              </button>
            </div>
          ))}

          <button style={{
  padding: "10px",
  borderRadius: "5px",
  background: "#1e3a8a",
  color: "white",
  border: "none",
  cursor: "pointer"
}}
          type="button" onClick={addStation}>
            + Add Station
          </button>

          <br />

          <h3 style={{ marginTop: "30px" }}>
  Coaches
</h3>

{coaches.map((coach, index) => (

  <div
    key={index}
    style={{
      border: "1px solid #ccc",
      padding: "15px",
      marginBottom: "10px",
      borderRadius: "8px"
    }}
  >

    <input
      type="text"
      placeholder="Coach Name (S1, B1...)"

      value={coach.coachName}

      onChange={(e) => {

        const updated = [...coaches];

        updated[index].coachName =
          e.target.value;

        setCoaches(updated);

      }}
      style={inputStyle}
    />

    <select
      value={coach.classType}
      style={inputStyle}

      onChange={(e) => {

        const updated = [...coaches];

        updated[index].classType =
          e.target.value;

        setCoaches(updated);

      }}
    >

      <option value="">
        Select Class
      </option>

      <option value="SL">
        Sleeper
      </option>

      <option value="3A">
        AC 3 Tier
      </option>

      <option value="2A">
        AC 2 Tier
      </option>

      <option value="1A">
        AC First Class
      </option>

    </select>

    <input
      type="number"
      placeholder="Total Seats"

      value={coach.totalSeats}

      onChange={(e) => {

        const updated = [...coaches];

        updated[index].totalSeats =
          e.target.value;

        setCoaches(updated);

      }}
      style={inputStyle}
    />

    <button
      type="button"
      style={inputStyle}

      onClick={() => removeCoach(index)}
    >
      Remove
    </button>

  </div>

))}

<button
  style={{
  padding: "10px",
  borderRadius: "5px",
  background: "#1e3a8a",
  color: "white",
  border: "none",
  cursor: "pointer"
}}>
  + Add Coach
</button>

<br />

<div
style={{
background:"#eef2ff",
padding:"15px",
borderRadius:"10px",
marginTop:"20px"
}}
>

<h4>Train Summary</h4>

<p>
Stations:
{stations.length}
</p>

<p>
Coaches:
{coaches.length}
</p>

<p>
Total Seats:
{totalSeats}
</p>

</div>

<br/>

          <button style={{
  padding: "10px",
  borderRadius: "5px",
  background: "#1e3a8a",
  color: "white",
  border: "none",
  cursor: "pointer"
}}
          type="submit">
            Create Train
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddTrain;