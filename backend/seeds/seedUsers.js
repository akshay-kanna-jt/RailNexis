const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/User");

const users = [];

const firstNames = [
  "Akshay","Rahul","Arjun","Vikram","Kiran",
  "Rohit","Aditya","Nikhil","Praveen","Sandeep",
  "Priya","Sneha","Anjali","Pooja","Divya",
  "Neha","Aishwarya","Kavya","Meera","Nandini"
];

const lastNames = [
  "Sharma","Patel","Nair","Menon","Reddy",
  "Kumar","Gupta","Joshi","Rao","Singh",
  "Shetty","Bhat","Das","Verma","Mishra"
];

for(let i = 1; i <= 100; i++) {

  const first =
    firstNames[
      Math.floor(
        Math.random() * firstNames.length
      )
    ];

  const last =
    lastNames[
      Math.floor(
        Math.random() * lastNames.length
      )
    ];

  users.push({
    name: `${first} ${last}`,
    email: `user${i}@railnexis.com`,
    password: "123456",
    role: "user"
  });

}

const seedUsers = async () => {

  try {

    await connectDB();

    for(const user of users){

      const exists =
        await User.findOne({
          email: user.email
        });

      if(exists){
        continue;
      }

      await User.create(user);
    }

    console.log(
      "100 Users Seeded Successfully ✅"
    );

    process.exit();

  } catch(err){

    console.error(err);
    process.exit(1);

  }

};

seedUsers();