import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/user/Dashboard";
import SearchTrain from "./pages/user/SearchTrain";
import Bookings from "./pages/user/Bookings";
import TrainStatus from "./pages/user/TrainStatus";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddTrain from "./pages/admin/AddTrain";
import AddStation from "./pages/admin/AddStation";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminTrains from "./pages/admin/AdminTrains";
import Profile from "./pages/user/Profile";
import BookTicket from "./pages/user/BookTicket";
import PnrStatus from "./pages/user/PnrStatus";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import RailwayMap from "./pages/user/RailwayMap";
import PaymentPage from "./pages/user/PaymentPage";
import PaymentSuccess from "./pages/user/PaymentSuccess";
import TransactionHistory from "./pages/user/TransactionHistory";
import Notifications from "./pages/user/Notifications";
import AdminOccupancy from "./pages/admin/AdminOccupancy";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<SearchTrain />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/status" element={<TrainStatus />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/add-train" element={<AddTrain />} />
        <Route path="/admin/add-station" element={<AddStation />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin-trains" element={<AdminTrains />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/book" element={<BookTicket/>} />
        <Route path="/pnr-status" element={<PnrStatus />}/>
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/railway-map" element={<RailwayMap />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/transactions" element={<TransactionHistory />} />
        <Route path="/notifications" element={<Notifications/>} />
        <Route path= "/admin/occupancy" element={<AdminOccupancy />}/>
      </Routes>
    </Router>
  );
}

export default App;