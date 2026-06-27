const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("../config/db");
const Station = require("../models/Station");

const stations = [

  // Karnataka
  { name: "KSR Bengaluru", code: "SBC" },
  { name: "Yesvantpur Junction", code: "YPR" },
  { name: "Mysuru Junction", code: "MYS" },
  { name: "Tumakuru", code: "TK" },
  { name: "Davangere", code: "DVG" },
  { name: "Hubballi Junction", code: "UBL" },
  { name: "Belagavi", code: "BGM" },
  { name: "Hassan Junction", code: "HAS" },
  { name: "Sakleshpur", code: "SKLR" },
  { name: "Mangaluru Junction", code: "MAJN" },
  { name: "Udupi Junction", code: "UD"},

  // Kerala
  { name: "Kasaragod", code: "KGQ" },
  { name: "Kannur", code: "CAN" },
  { name: "Kozhikode", code: "CLT" },
  { name: "Shoranur Junction", code: "SRR" },
  { name: "Thrissur", code: "TCR" },
  { name: "Ernakulam Junction", code: "ERS" },
  { name: "Kottayam", code: "KTYM" },
  { name: "Kollam Junction", code: "QLN" },
  { name: "Thiruvananthapuram Central", code: "TVC" },

  // Tamil Nadu
  { name: "Chennai Central", code: "MAS" },
  { name: "Chennai Egmore", code: "MS" },
  { name: "Katpadi Junction", code: "KPD" },
  { name: "Salem Junction", code: "SA" },
  { name: "Erode Junction", code: "ED" },
  { name: "Coimbatore Junction", code: "CBE" },
  { name: "Madurai Junction", code: "MDU" },
  { name: "Tirunelveli Junction", code: "TEN" },

  // Andhra Pradesh
  { name: "Vijayawada Junction", code: "BZA" },
  { name: "Visakhapatnam", code: "VSKP" },
  { name: "Rajahmundry", code: "RJY" },
  { name: "Guntur Junction", code: "GNT" },
  { name: "Nellore", code: "NLR" },
  { name: "Tirupati", code: "TPTY" },

  // Telangana
  { name: "Hyderabad Deccan", code: "HYB" },
  { name: "Secunderabad Junction", code: "SC" },
  { name: "Warangal", code: "WL" },
  { name: "Kazipet Junction", code: "KZJ" },

  // Odisha
  { name: "Bhubaneswar", code: "BBS" },
  { name: "Cuttack", code: "CTC" },
  { name: "Puri", code: "PURI" },
  { name: "Khurda Road Junction", code: "KUR" },

  // West Bengal
  { name: "Howrah Junction", code: "HWH" },
  { name: "Sealdah", code: "SDAH" },
  { name: "Kolkata Terminal", code: "KOAA" },
  { name: "Asansol Junction", code: "ASN" },

  // Maharashtra
  { name: "Mumbai CSMT", code: "CSMT" },
  { name: "Mumbai Central", code: "MMCT" },
  { name: "Pune Junction", code: "PUNE" },

  // Gujarat
  { name: "Ahmedabad Junction", code: "ADI" },
  { name: "Surat", code: "ST" },
  { name: "Vadodara Junction", code: "BRC" },

  //North India
  { name: "New Delhi", code: "NDLS" },
{ name: "Hazrat Nizamuddin", code: "NZM" },
{ name: "Anand Vihar Terminal", code: "ANVT" },
{ name: "Old Delhi", code: "DLI" },
{ name: "Lucknow Charbagh", code: "LKO" },
{ name: "Kanpur Central", code: "CNB" },
{ name: "Varanasi Junction", code: "BSB" },
{ name: "Prayagraj Junction", code: "PRYJ" },
{ name: "Patna Junction", code: "PNBE" },
{ name: "Gaya Junction", code: "GAYA" },
{ name: "Agra Cantt", code: "AGC" },
{ name: "Jaipur Junction", code: "JP" },
{ name: "Jodhpur Junction", code: "JU" },
{ name: "Ajmer Junction", code: "AII" },
{ name: "Chandigarh", code: "CDG" },
{ name: "Jammu Tawi", code: "JAT"},
{ name: "Ludhiana Junction", code: "LDH"},
{ name: "Pt. Deen Dayal Upadhyaya Junction", code: "DDU"},

//Central India
{ name: "Nagpur Junction", code: "NGP" },
{ name: "Bhopal Junction", code: "BPL" },
{ name: "Jabalpur Junction", code: "JBP" },
{ name: "Indore Junction", code: "INDB" },
{ name: "Itarsi Junction", code: "ET" },
{ name: "Gwalior Junction", code: "GWL" },
{ name: "Ujjain Junction", code: "UJN" },
{ name: "Raipur Junction", code: "R" },
{ name: "Bilaspur Junction", code: "BSP" },
{ name: "Durg Junction", code: "DURG" },
{name: "Eluru", code: "EE"},

//East India
{ name: "Durgapur", code: "DGR" },
{ name: "Malda Town", code: "MLDT" },
{ name: "New Jalpaiguri", code: "NJP" },
{ name: "Kharagpur Junction", code: "KGP" },
{ name: "Balasore", code: "BLS" },
{ name: "Brahmapur", code: "BAM" },
{ name: "Balugaon", code: "BALU" },
{ name: "Rourkela", code: "ROU" },
{ name: "Tatanagar Junction", code: "TATA" },
{ name: "Ranchi", code: "RNC" },
{ name: "Dhanbad Junction", code: "DHN" },
{ name: "Bokaro Steel City", code: "BKSC" },
{ name: "Guwahati", code: "GHY" },
{ name: "Kamakhya", code: "KYQ" },
{ name: "Silchar", code: "SCL" },

//West India
{ name: "Rajkot Junction", code: "RJT" },
{ name: "Udaipur City", code: "UDZ" },
{ name: "Bhavnagar Terminus", code: "BVC" },
{ name: "Jamnagar", code: "JAM" },
{ name: "Porbandar", code: "PBR" },
{ name: "Bikaner Junction", code: "BKN" },
{ name: "Kota Junction", code: "KOTA" },
{ name: "Bandra Terminus", code: "BDTS" },
{ name: "Lokmanya Tilak Terminus", code: "LTT" },
{ name: "Panvel", code: "PNVL" },

//NorthEast
{ name: "Agartala", code: "AGTL" },
{ name: "Dimapur", code: "DMV" },
{ name: "Naharlagun", code: "NHLN" },
{ name: "Dibrugarh", code: "DBRG" },
{ name: "Lumding Junction", code: "LMG" },
];

const seedStations = async () => {
  try {
    await connectDB();
    for (const station of stations) {
      const exists =
        await Station.findOne({
          code: station.code
        });

      if (!exists) {
        await Station.create(station);
        console.log(
          `Added: ${station.name}`
        );
      } else {
        console.log(
          `Skipped: ${station.name}`
        );
      }
    }
    console.log(
      "Station Seeding Completed ✅"
    );
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedStations();