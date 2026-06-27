module.exports = [

{
  trainNumber: "12841",
  trainName: "Coromandel Express",
  demandTier: "VERY_HIGH",

  primaryRoutes: [
    "HWH-BBS",
    "BBS-VSKP",
    "VSKP-BZA",
    "BZA-MAS"
  ],

  dailyDemand: {
    normal: {
      SL: 70,
      "3A": 25,
      "2A": 10
    },
    weekend: {
      SL: 95,
      "3A": 35,
      "2A": 15
    },
    festival: {
      SL: 130,
      "3A": 45,
      "2A": 20
    }
  }
},

{
  trainNumber: "12621",
  trainName: "Tamil Nadu Express",
  demandTier: "VERY_HIGH",

  primaryRoutes: [
    "MAS-BZA",
    "BZA-SC",
    "SC-NGP",
    "NGP-NDLS"
  ],

  dailyDemand: {
    normal: {
      SL: 60,
      "3A": 20,
      "2A": 10
    },
    weekend: {
      SL: 85,
      "3A": 30,
      "2A": 15
    },
    festival: {
      SL: 120,
      "3A": 40,
      "2A": 20
    }
  }
},

{
  trainNumber: "12627",
  trainName: "Karnataka Express",
  demandTier: "VERY_HIGH",

  primaryRoutes: [
    "SBC-PUNE",
    "PUNE-BPL",
    "BPL-AGC",
    "AGC-NDLS"
  ],

  dailyDemand: {
    normal: {
      SL: 65,
      "3A": 22,
      "2A": 10
    },
    weekend: {
      SL: 90,
      "3A": 32,
      "2A": 15
    },
    festival: {
      SL: 130,
      "3A": 45,
      "2A": 20
    }
  }
},

{
  trainNumber: "12625",
  trainName: "Kerala Express",
  demandTier: "VERY_HIGH",

  primaryRoutes: [
    "ERS-MAS",
    "MAS-BPL",
    "BPL-NDLS"
  ],

  dailyDemand: {
    normal: {
      SL: 55,
      "3A": 18,
      "2A": 8
    },
    weekend: {
      SL: 80,
      "3A": 28,
      "2A": 12
    },
    festival: {
      SL: 120,
      "3A": 40,
      "2A": 18
    }
  }
},

{
  trainNumber: "12615",
  trainName: "Grand Trunk Express",
  demandTier: "VERY_HIGH",

  primaryRoutes: [
    "NDLS-AGC",
    "AGC-BPL",
    "BPL-NGP",
    "NGP-SC",
    "SC-MAS"
  ],

  dailyDemand: {
    normal: {
      SL: 60,
      "3A": 20,
      "2A": 10
    },
    weekend: {
      SL: 90,
      "3A": 30,
      "2A": 15
    },
    festival: {
      SL: 130,
      "3A": 45,
      "2A": 20
    }
  }
},

{
  trainNumber: "22691",
  trainName: "Bengaluru Rajdhani",
  demandTier: "HIGH",

  primaryRoutes: [
    "SBC-NDLS"
  ],

  dailyDemand: {
    normal: {
      SL: 25,
      "3A": 35,
      "2A": 20
    },
    weekend: {
      SL: 35,
      "3A": 45,
      "2A": 25
    },
    festival: {
      SL: 50,
      "3A": 60,
      "2A": 35
    }
  }
},

{
  trainNumber: "12431",
  trainName: "Trivandrum Rajdhani",
  demandTier: "HIGH",

  primaryRoutes: [
    "TVC-NDLS"
  ],

  dailyDemand: {
    normal: {
      SL: 20,
      "3A": 30,
      "2A": 18
    },
    weekend: {
      SL: 30,
      "3A": 40,
      "2A": 25
    },
    festival: {
      SL: 45,
      "3A": 55,
      "2A": 35
    }
  }
},

{
  trainNumber: "20607",
  trainName: "Mysuru Vande Bharat",
  demandTier: "HIGH",

  primaryRoutes: [
    "MYS-SBC",
    "SBC-MAS"
  ],

  dailyDemand: {
    normal: {
      SL: 0,
      "3A": 40,
      "2A": 25
    },
    weekend: {
      SL: 0,
      "3A": 55,
      "2A": 35
    },
    festival: {
      SL: 0,
      "3A": 70,
      "2A": 45
    }
  }
},

{
  trainNumber: "20703",
  trainName: "Secunderabad Vande Bharat",
  demandTier: "HIGH",

  primaryRoutes: [
    "SC-VSKP"
  ],

  dailyDemand: {
    normal: {
      SL: 0,
      "3A": 35,
      "2A": 20
    },
    weekend: {
      SL: 0,
      "3A": 50,
      "2A": 30
    },
    festival: {
      SL: 0,
      "3A": 65,
      "2A": 40
    }
  }
},

{
  trainNumber: "12007",
  trainName: "Mysuru Shatabdi",
  demandTier: "HIGH",

  primaryRoutes: [
    "MYS-SBC",
    "SBC-MAS"
  ],

  dailyDemand: {
    normal: {
      SL: 0,
      "3A": 30,
      "2A": 18
    },
    weekend: {
      SL: 0,
      "3A": 45,
      "2A": 25
    },
    festival: {
      SL: 0,
      "3A": 60,
      "2A": 35
    }
  }
}

];