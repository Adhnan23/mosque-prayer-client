import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import Sample from "../pages/Sample";
import PrayerTimesTestPage from "../pages/Prayer";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/sample" element={<Sample />} />
      <Route path="/prayer" element={<PrayerTimesTestPage />} />
    </Routes>
  );
}
