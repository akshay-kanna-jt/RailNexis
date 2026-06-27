import React,{
  useEffect,
  useState
} from "react";

import {
  useLocation
} from "react-router-dom";

import Navbar from "../../components/Navbar";
import API from "../../services/api";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

const stationIcon = new L.Icon({

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize:[25,41],

  iconAnchor:[12,41],

  popupAnchor:[1,-34],

  shadowSize:[41,41]

});

const trainIcon = new L.Icon({

  iconUrl:
    "https://img.icons8.com/color/96/train.png",

  iconSize:[45,45],

  iconAnchor:[22,45],

  popupAnchor:[0,-40]

});

function RailwayMap() {

  const location =
    useLocation();

  const [stations,setStations] =
    useState([]);

  const [trains,setTrains] =
    useState([]);

  const [activeTrain,setActiveTrain] =
    useState(

      location.state?.trainData || null

    );

  useEffect(() => {

    fetchStations();

    fetchTrains();

  }, []);

  const fetchStations = async () => {

    try {

      const res =
        await API.get("/stations");

      setStations(
        Array.isArray(res.data)
          ? res.data
          : []
      );

    } catch(err) {

      console.log(err);

    }

  };

  const fetchTrains = async () => {

    try {

      const res =
        await API.get("/trains");

      setTrains(
        Array.isArray(res.data)
          ? res.data
          : []
      );

    } catch(err) {

      console.log(err);

    }

  };

  const routeStations =
    activeTrain?.route || 
    activeTrain?.stations ||
    [];

  const enrichedStations =

  routeStations

    .filter(
      (route) => route.station
    )

    .map((route) => {

      // CASE 1:
      // station already populated object

      if(
        typeof route.station ===
        "object"
      ) {

        return {

          station:
            route.station.name,

          latitude:
            route.station.latitude,

          longitude:
            route.station.longitude,

          isCurrent:
            route.isCurrent

        };

      }

      // CASE 2:
      // station is string

      const matchedStation =
        stations.find(

          (s) =>

            s.name &&
            route.station &&
            typeof route.station ===
            "string" &&

            s.name.toLowerCase() ===
            route.station.toLowerCase()

        );

      return {

        station:
          route.station,

        latitude:
          matchedStation?.latitude,

        longitude:
          matchedStation?.longitude,

        isCurrent:
          route.isCurrent

      };

    });

  const routePositions =

    enrichedStations

      .filter(

        (s) =>

          s.latitude &&
          s.longitude

      )

      .map((s) => [

        Number(s.latitude),

        Number(s.longitude)

      ]);

  const currentStation =

    routeStations.find(
      (s) => s.isCurrent
    )?.station;

  return (

    <div>

      <Navbar />

      <div style={styles.container}>

        <h2>
          India Railway Route Map 🇮🇳
        </h2>

        <select

          onChange={(e) => {

            const train =
              trains.find(

                (t) =>
                  t._id ===
                  e.target.value

              );

            setActiveTrain(train);

// future ready
console.log(
"Selected Train:",
train.trainName
);

          }}

          value={activeTrain?._id || ""}

          style={styles.select}
        >

          <option value="">
            Select Train
          </option>

          {trains.map((train) => (

            <option
              key={train._id}
              value={train._id}
            >

              {train.trainName}

            </option>

          ))}

        </select>

        {activeTrain && (

          <div style={styles.infoCard}>
            <div style={styles.statsRow}>

<div style={styles.statCard}>
<h4>🚉 Stations</h4>
<p>{routeStations.length}</p>
</div>

<div style={styles.statCard}>
<h4>📍 Current</h4>
<p>{currentStation || "N/A"}</p>
</div>

<div style={styles.statCard}>
<h4>🚆 Train No</h4>
<p>{activeTrain.trainNumber}</p>
</div>

</div>

            <h3>
              🚆 {activeTrain.trainName}
            </h3>

            <p>

              Current Station:
              {" "}

              <b>
                {currentStation}
              </b>

            </p>

          </div>

        )}

        <MapContainer
          center={[22.9734,78.6569]}
          zoom={5}
          style={styles.map}
        >

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'

            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Polyline
            positions={routePositions}

            pathOptions={{
              color:"red",
              weight:5
            }}
          />

          {enrichedStations.map((station,index) => {

            if(
              !station.latitude ||
              !station.longitude
            ) {
              return null;
            }

            return (

              <Marker
                key={index}

                position={[
                  Number(station.latitude),
                  Number(station.longitude)
                ]}

                icon={

                  station.station ===
                  currentStation

                    ? trainIcon

                    : stationIcon

                }
              >

                <Popup>

<h4>
🚉 {station.station}
</h4>

<p>
Train:
{activeTrain?.trainName}
</p>

<p>
{
station.station === currentStation
? "🟢 Current Location"
: "📍 Route Station"
}
</p>

</Popup>

              </Marker>

            );

          })}

        </MapContainer>

      </div>

    </div>

  );

}

const styles = {

  container:{
    padding:"20px"
  },

  select:{
    padding:"10px",
    marginBottom:"20px",
    width:"300px",
    borderRadius:"8px",
    border:"1px solid #ccc",
    fontSize:"16px"
  },

  infoCard:{
    background:"#1e3a8a",
    color:"white",
    padding:"15px",
    borderRadius:"10px",
    marginBottom:"20px",
    width:"350px"
  },

  map:{
    height:"90vh",
    minHeight:"700px",
    width:"100%",
    borderRadius:"10px"
  },
  statsRow:{
display:"flex",
gap:"15px",
marginBottom:"20px",
flexWrap:"wrap"
},

statCard:{
background:"white",
padding:"15px",
borderRadius:"10px",
boxShadow:"0 2px 8px rgba(0,0,0,0.1)",
minWidth:"180px",
textAlign:"center"
},

};

export default RailwayMap;