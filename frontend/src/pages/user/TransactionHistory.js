import React,{
useEffect,
useState
} from "react";

import Navbar from "../../components/Navbar";

function TransactionHistory(){

const user =
JSON.parse(
localStorage.getItem("user")
);

const userId =
user?._id;

const [transactions,
setTransactions] =
useState([]);

useEffect(()=>{
const stored =
JSON.parse(
localStorage.getItem(
`transactions_${userId}`
)
) || [];
setTransactions(stored);
},[userId]);

return(

<div>

<Navbar/>

<div style={styles.container}>

<h2>
📜 Transaction History
</h2>

<div style={styles.summaryRow}>

<div style={styles.summaryCard}>
<h4>Total Transactions</h4>
<p>{transactions.length}</p>
</div>

<div style={styles.summaryCard}>
<h4>Successful</h4>
<p>
{
transactions.filter(
t=>t.paymentStatus==="SUCCESS"
).length
}
</p>
</div>

<div style={styles.summaryCard}>
<h4>Total Amount</h4>
<p>
₹ {
transactions.reduce(
(sum,t)=>
sum+Number(t.amount),
0
)
}
</p>
</div>

</div>


{
transactions.length === 0 && (

<p
style={{
textAlign:"center",
marginTop:"30px",
fontWeight:"bold"
}}
>
No Transactions Found
</p>

)
}

<table style={styles.table}>

<thead>

<tr>

<th>ID</th>
<th>Method</th>
<th>Amount</th>
<th>Status</th>
<th>Date</th>

</tr>

</thead>


<tbody>

{transactions.map(
(txn,index)=>(

<tr key={index}>

<td>
{txn.transactionId}
</td>

<td>
{txn.paymentMethod}
</td>

<td>
₹ {txn.amount}
</td>

<td>

<span
style={{

color:

txn.paymentStatus ===
"SUCCESS"

? "green"

: "red",

fontWeight:"bold"

}}
>

{txn.paymentStatus}

</span>

</td>

<td>
{txn.paymentDate}
</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

);

}

const styles={

container:{
padding:"40px"
},

table:{
width:"100%",
borderCollapse:"collapse",
marginTop:"20px"
},
summaryRow:{
display:"flex",
gap:"15px",
marginBottom:"20px",
flexWrap:"wrap"
},

summaryCard:{
background:"#1e3a8a",
color:"white",
padding:"20px",
borderRadius:"10px",
minWidth:"220px",
textAlign:"center"
},

};

export default TransactionHistory;