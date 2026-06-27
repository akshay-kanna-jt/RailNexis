import React from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";

function Profile() {

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />

      <div style={styles.container}>

        <div style={styles.profileHeader}>

<div style={styles.avatar}>
👤
</div>

<h2>
{user.name}
</h2>

<p>
{user.email}
</p>

</div>

        <div style={styles.card}>

          <div style={styles.infoRow}>
<div style={styles.infoCard}>
<h4>👤 Name</h4>
<p>{user.name || "N/A"}</p>
</div>

<div style={styles.infoCard}>
<h4>📧 Email</h4>
<p>{user.email || "N/A"}</p>
</div>

<div style={styles.infoCard}>
<h4>🛡 Role</h4>
<p>{user.role || "user"}</p>
</div>

<div style={styles.infoCard}>
<h4>📅 Joined</h4>
<p>
{
user.createdAt
? new Date(user.createdAt).toLocaleDateString()
: "N/A"
}
</p>
</div>
</div>
<div style={styles.statsRow}>

<div
style={styles.statCard}
onClick={()=>navigate("/bookings")}
>
<h4>🎫 My Bookings</h4>
<p>View All Tickets</p>
</div>

<div
style={styles.statCard}
onClick={()=>navigate("/transactions")}
>
<h4>💳 Transactions</h4>
<p>Payment History</p>
</div>

<div
style={styles.statCard}
onClick={()=>navigate("/notifications")}
>
<h4>🔔 Notifications</h4>
<p>View Updates</p>
</div>

</div>

        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    textAlign: "center"
  },
  title: {
    marginBottom: "20px"
  },
  card: {
    margin: "auto",
    width: "300px",
    padding: "20px",
    borderRadius: "10px",
    background: "#f3f4f6",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    textAlign: "left"
  },
  profileHeader:{
textAlign:"center",
marginBottom:"25px"
},

avatar:{
width:"100px",
height:"100px",
borderRadius:"50%",
background:"#1e3a8a",
color:"white",
fontSize:"40px",
display:"flex",
alignItems:"center",
justifyContent:"center",
margin:"auto"
},

infoRow:{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
gap:"15px"
},

infoCard:{
background:"#ffffff",
padding:"15px",
borderRadius:"10px",
boxShadow:"0 2px 8px rgba(0,0,0,0.1)"
},

statsRow:{
display:"flex",
gap:"15px",
marginTop:"25px",
justifyContent:"center",
flexWrap:"wrap"
},

statCard:{
background:"#1e3a8a",
color:"white",
padding:"20px",
borderRadius:"10px",
width:"220px",
textAlign:"center",
cursor:"pointer",
transition:"0.3s"
},
};

export default Profile;