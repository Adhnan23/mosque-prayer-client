import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import IkamahTestPage from "../pages/Ikamah";
import PrayerTimesTestPage from "../pages/Prayer";
import LanguagesTestPage from "../pages/Language";
import NoticeTestPage from "../pages/Notice";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/language" element={<LanguagesTestPage />} />
      <Route path="/prayer" element={<PrayerTimesTestPage />} />
      <Route path="/ikamah" element={<IkamahTestPage />} />
      <Route path="/notice" element={<NoticeTestPage />} />
    </Routes>
  );
}
