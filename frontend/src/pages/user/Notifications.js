import React ,{ useState }from "react";

import Navbar from "../../components/Navbar";

function Notifications(){

const user =
JSON.parse(
localStorage.getItem("user")
);
const userId =
user?._id;

const [notifications,setNotifications] =
useState(
JSON.parse(
localStorage.getItem(
`notifications_${userId}`
)
) || []
);

const markAsRead=(index)=>{
const updated=[...notifications];
updated[index].read=true;
setNotifications(updated);

localStorage.setItem(
`notifications_${userId}`,
JSON.stringify(updated)
);

};

return(

<div>

<Navbar/>

<div style={styles.container}>

<h2>
📢 Smart Notifications
</h2>
<button
onClick={()=>{
localStorage.removeItem(
`notifications_${userId}`
);

setNotifications([]);
}}
style={{
padding:"8px 15px",
background:"red",
color:"white",
border:"none",
borderRadius:"8px",
cursor:"pointer"
}}
>
🗑 Clear All
</button>

{notifications.map(
(notification,index)=>(

<div
key={index}
style={{
...styles.card,
borderLeft:

notification.type ===
"delay"
? "6px solid orange"

: notification.type ===
"platform"
? "6px solid blue"

: notification.type ===
"booking"

? "6px solid green"
: "6px solid red",

opacity:
notification.read
? 0.6
: 1,
}}
>

<p>
{notification.message}
</p>
<small
style={{
color:"gray"
}}
>

{notification.time}

</small>
<br/>

<button
onClick={()=>
markAsRead(index)
}
style={{

marginTop:"10px",
padding:"6px 12px",
border:"none",
borderRadius:"6px",
background:"#1e3a8a",
color:"white",
cursor:"pointer"

}}
>

Mark as Read

</button>

</div>

))}

</div>

</div>

);

}

const styles={

container:{
padding:"40px"
},

card:{
background:"#f3f4f6",
padding:"20px",
borderRadius:"10px",
marginTop:"20px",
boxShadow:
"0 2px 8px rgba(0,0,0,0.1)"
}

};

export default Notifications;