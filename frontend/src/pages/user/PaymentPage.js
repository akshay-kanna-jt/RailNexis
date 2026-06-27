import React,{
useState
} from "react";

import Navbar from "../../components/Navbar";

import {
useLocation,
useNavigate
} from "react-router-dom";

function PaymentPage(){

const location =
useLocation();

const navigate =
useNavigate();

const bookingData =
location.state;

const [paymentMethod,
setPaymentMethod] =
useState("");

const getTicketPrice = () => {

const distance =
bookingData?.train?.route?.length
? bookingData.train.route.length * 120
: 0;

const classType =
bookingData?.travelClass;

let farePerKm = 0;

if(classType === "SL")
farePerKm = 0.6;

else if(classType === "3A")
farePerKm = 1.2;

else if(classType === "2A")
farePerKm = 1.8;

return Math.round(
distance *
farePerKm *
bookingData?.passengers?.length
);

};

const amount =
getTicketPrice();

const handlePayment=()=>{

if(!paymentMethod){

alert(
"Select payment method"
);

return;

}
console.log(
"PAYMENT PAGE DATA",
bookingData
);

navigate(
"/payment-success",
{
state:{
bookingData,
paymentMethod,
amount
}
}
);

};

return(

<div>

<Navbar/>

<div style={styles.container}>

<h2>
💳 Payment Gateway
</h2>

<div style={styles.card}>

<h3>
Train:
{
bookingData?.train
?.trainName
}
</h3>

<p>
Passengers:
{
bookingData?.passengers
?.length
}
</p>

<p>
Amount:
₹ {amount}
</p>
<p>
Class:
<b>
{bookingData?.travelClass}
</b>
</p>

<p>
Quota:
<b>
{bookingData?.quota}
</b>
</p>

<p>
Journey Date:
<b>
{
new Date(
bookingData?.journeyDate
).toLocaleDateString()
}
</b>
</p>

<h3>
Select Payment Method
</h3>

<select
value={paymentMethod}
onChange={(e)=>
setPaymentMethod(
e.target.value
)
}
style={styles.select}
>

<option value="">
Select
</option>

<option value="UPI">
UPI
</option>

<option value="Card">
Credit/Debit Card
</option>

<option value="NetBanking">
Net Banking
</option>

<option value="Wallet">
Wallet
</option>

</select>

{
paymentMethod ===
"UPI" && (
<div style={styles.upiBox}>

<h3>
Select UPI App
</h3>

<div style={styles.upiApps}>

<button style={styles.upiBtn}>
🟢 GPay
</button>

<button style={styles.upiBtn}>
🟣 PhonePe
</button>

<button style={styles.upiBtn}>
🔵 Paytm
</button>

</div>

<input
type="text"
placeholder="Enter UPI ID"
style={styles.select}
/>

<div style={styles.qrBox}>

<img
src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=RailNexisPayment"
alt="QR"
style={styles.qrImage}
/>
<p>
🔳 Scan & Pay
</p>
</div>

</div>
)
}

<div style={styles.securityBox}>
🔒 Secure Payment Gateway
<br/>
Your transaction is
encrypted and protected.
</div>

<button
onClick={handlePayment}
style={styles.button}
>

Proceed Payment

</button>

</div>

</div>

</div>

);

}

const styles={

container:{
padding:"40px"
},

card:{
maxWidth:"500px",
margin:"auto",
padding:"30px",
borderRadius:"12px",
background:"#f9fafb",
boxShadow:
"0 2px 10px rgba(0,0,0,0.1)"
},

select:{
width:"100%",
padding:"10px",
marginTop:"20px"
},

button:{
marginTop:"20px",
padding:"12px",
width:"100%",
background:"#1e3a8a",
color:"white",
border:"none",
borderRadius:"8px",
cursor:"pointer"
},
upiBox:{
marginTop:"20px"
},

upiApps:{
display:"flex",
gap:"10px",
marginTop:"10px"
},

upiBtn:{
padding:"10px 20px",
border:"none",
borderRadius:"8px",
background:"#e0e7ff",
cursor:"pointer"
},
qrBox:{
marginTop:"20px",
textAlign:"center"
},

qrImage:{
width:"180px",
height:"180px",
borderRadius:"10px",
border:"1px solid #ccc"
},

securityBox:{
marginTop:"20px",
padding:"15px",
background:"#eef2ff",
borderRadius:"10px",
textAlign:"center",
border:"1px solid #1e3a8a"
},

};

export default PaymentPage;