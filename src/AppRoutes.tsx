
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Vendors from "./pages/Vendors";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import VendorServicePage from "./pages/VendorServicePage";
import OtpVerification from "./pages/OtpVerification";
import BookingCalendar from "./pages/BookingCalendar";
import AdminBookingCalendar from "./pages/AdminBookingCalendar";
import ServicePostingPage from "./pages/ServicePostingPage";
import BookingTracker from "./pages/BookingTracker";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/vendor/:vendorId" element={<VendorServicePage />} />
        <Route path="/vendor/:vendorId/service/:serviceId" element={<VendorServicePage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<OtpVerification />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vendor-dashboard" element={<VendorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/booking-calendar" element={<BookingCalendar />} />
        <Route path="/admin/booking-calendar" element={<AdminBookingCalendar />} />
        <Route path="/post-service" element={<ServicePostingPage />} />
        <Route path="/admin/users" element={<AdminDashboard />} />
        <Route path="/admin/verification" element={<AdminDashboard />} />
        <Route path="/booking/:bookingId" element={<BookingTracker />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
