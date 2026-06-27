import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

function AddStation() {

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(
      !name.trim() ||
      !code.trim()
    ){
      alert("Fill all fields");
      return;
    }

    try {
      await API.post("/stations/add", {
        name,
        code
      });

      alert("Station added successfully");

      setName("");
      setCode("");

    } catch (error) {
      alert("Failed to add station");
    }
  };

  const inputStyle = {
    padding:"10px",
    width:"300px",
    borderRadius:"6px",
    border:"1px solid #ccc"
  };

  return (
    <div>
      <Navbar />

      <div style={{ padding: "40px" }}>
        <h2
style={{
marginBottom:"20px",
color:"#1e3a8a"
}}
>
📍 Add Railway Station
</h2>

<p
style={{
color:"gray",
marginBottom:"25px"
}}
>
Create and manage railway stations for the RailNexis network.
</p>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="Station Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />

          <br /><br />

          <input
            type="text"
            placeholder="Station Code (e.g. SBC)"
            value={code}
            onChange={(e) =>
              setCode(
                e.target.value.toUpperCase()
              )
            }
            required
            style={inputStyle}
          />

          <br /><br />

          <button 
          style={{
  padding: "10px",
  borderRadius: "5px",
  background: "#1e3a8a",
  color: "white",
  border: "none",
  cursor: "pointer"
}}
          type="submit">
            Add Station
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddStation;