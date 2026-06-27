import React, { useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import API from "../../services/api";
import jsPDF from "jspdf";

import {
useLocation,
useNavigate
} from "react-router-dom";

function PaymentSuccess(){

const location = useLocation();

const navigate = useNavigate();

const [createdBooking, setCreatedBooking] = useState(null);


const {
bookingData,
paymentMethod,
amount
} = location.state || {};

const paymentStatus =
Math.random() > 0.2
? "SUCCESS"
: "FAILED";

const bookingCreated = useRef(false);

useEffect(() => {
  if (
    paymentStatus === "SUCCESS" &&
    !bookingCreated.current
  ) {
    bookingCreated.current = true;
    createBooking();
  }
// eslint-disable-next-line
}, []);

const transactionId =
"TXN" +
Date.now();

const paymentDate = new Date().toLocaleString();

const createBooking =
async()=>{

try{

const userId =
localStorage.getItem(
"userId"
);

console.log("BOOKING DATA CHECK", {

userId,

trainId:
bookingData?.train?._id,

travelClass:
bookingData?.travelClass,

quota:
bookingData?.quota,

fromStation:
bookingData?.fromStation,

toStation:
bookingData?.toStation,

journeyDate:
bookingData?.journeyDate,

passengers:
bookingData?.passengers

});

const res =
await API.post(
"/bookings/book",
{

user:
userId,

train:
bookingData?.train?._id,

passengers:
bookingData?.passengers,

travelClass:
bookingData?.travelClass,

quota:
bookingData?.quota,

fromStation:
bookingData?.fromStation,

toStation:
bookingData?.toStation,

journeyDate:
bookingData?.journeyDate

}
);

setCreatedBooking(
res.data.booking
);

console.log(
"BOOKING SUCCESS",
res.data
);

}catch(err){

console.log(
"BOOKING ERROR FULL",
err
);

console.log(
"BACKEND RESPONSE",
JSON.stringify(
err.response?.data,
null,
2
)
);

console.log(
"MESSAGE",
err.message
);

}

};

const transactionData = {
    transactionId,
    paymentMethod,
    amount,
    paymentStatus,
    paymentDate
}

const notification = {

id: Date.now(),

title:
"Booking Successful",

message:
`Your ticket for ${
bookingData?.train
?.trainName
} has been booked successfully.`,

time:
new Date().toLocaleString(),

type:"booking",

};

const emailMessage =
`
RailNexis Booking Confirmation
Transaction ID:
${transactionId}
Payment Status:
${paymentStatus}
Amount:
₹ ${amount}
Train:
${bookingData?.train?.trainName}
Thank you for booking with RailNexis.
`;

const downloadReceipt = ()=>{
const doc = new jsPDF();
doc.setFontSize(20);
doc.text(
"RailNexis Payment Receipt",
20,
20
);

doc.setFontSize(12);

doc.text(
`Transaction ID: ${transactionId}`,
20,
40
);

doc.text(
`Payment Method: ${paymentMethod}`,
20,
50
);

doc.text(
`Amount: ₹ ${amount}`,
20,
60
);

doc.text(
`Status: ${paymentStatus}`,
20,
70
);

doc.text(
`Date: ${paymentDate}`,
20,
80
);

doc.text(
`Train: ${
bookingData?.train
?.trainName
}`,
20,
90
);

doc.save(
"RailNexis_Receipt.pdf"
);
};

const user =
JSON.parse(
localStorage.getItem("user")
);

const oldTransactions =
JSON.parse(
localStorage.getItem(
`transactions_${user._id}`
)
) || [];

if(
!oldTransactions.find(
(t)=>
t.transactionId ===
transactionId
)
){
oldTransactions.push(
transactionData
);

const user =
JSON.parse(
localStorage.getItem("user")
);

localStorage.setItem(
`transactions_${user._id}`,
JSON.stringify(oldTransactions)
);

const userId =
user?._id;

const oldNotifications =
JSON.parse(
localStorage.getItem(
`notifications_${userId}`
)
) || [];

oldNotifications.unshift(
notification
);

localStorage.setItem(
`transactions_${user._id}`,
JSON.stringify(oldTransactions)
);

}

return(

<div>

<Navbar/>

<div style={styles.container}>

<div style={styles.card}>

<h2>

{paymentStatus ===
"SUCCESS"

? "✅ Payment Successful"

: "❌ Payment Failed"}

</h2>

<p>

<strong>
Transaction ID:
</strong>

{" "}

{transactionId}

</p>

<p>

<strong>
Payment Method:
</strong>

{" "}

{paymentMethod}

</p>

<p>

<strong>
Amount Paid:
</strong>

₹ {amount}

</p>
<p>
    <strong>
        Payment Date:
    </strong>
    {" "}
    {paymentDate}
</p>
<p>
    <strong>
        Receipt Status:
    </strong>
    {" "}
    {paymentStatus === "SUCCESS" ? "Generated" : "Not Generated"}
</p>


<p>

<strong>
Train:
</strong>

{" "}

{
bookingData?.train
?.trainName
}

</p>

<p>

<strong>
Passengers:
</strong>

{" "}

{
bookingData?.passengers?.length
}

</p>
{
createdBooking && (

<div
style={{
marginTop:"15px",
padding:"15px",
background:"#dcfce7",
borderRadius:"10px"
}}
>

<h3>
🎫 Ticket Generated
</h3>

<p>
<b>PNR:</b>
{" "}
{createdBooking.pnrNumber}
</p>

<p>
<b>Status:</b>
{" "}
{createdBooking.status}
</p>

</div>

)
}
<div style={styles.receiptBox}>
<h3>
🧾 Payment Receipt
</h3>
<p>
{
paymentStatus === "SUCCESS"
? "Transaction Successful"
: "Transaction Failed"
}
</p>
<p>
Please carry valid ID proof
during journey.
</p>
</div>

<div style={styles.emailBox}>
<h3>
📧 Email Receipt
</h3>

<textarea
value={emailMessage}
readOnly
style={styles.emailText}
/>
<p>
✅ Receipt sent successfully
(simulated)
</p>
</div>

<button
style={styles.button}
onClick={downloadReceipt}
disabled={
paymentStatus !==
"SUCCESS"
}
>
Download Receipt PDF
</button>

<button
style={styles.button}

onClick={()=>
navigate("/bookings")
}
>

Go To My Bookings

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
"0 2px 10px rgba(0,0,0,0.1)",
textAlign:"center"
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
receiptBox:{
marginTop:"20px",
padding:"20px",
border:"1px dashed #1e3a8a",
borderRadius:"10px",
background:"#eef2ff"
},
emailBox:{
marginTop:"20px",
padding:"20px",
background:"#f3f4f6",
borderRadius:"10px"
},

emailText:{
width:"100%",
height:"180px",
marginTop:"10px",
padding:"10px",
borderRadius:"8px"
},

};

export default PaymentSuccess;