import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import IkamahTestPage from "../pages/Ikamah";
import PrayerTimesTestPage from "../pages/Prayer";
import LanguagesTestPage from "../pages/Language";
import NoticeTestPage from "../pages/Notice";
import RamadanTestPage from "../pages/Ramadan";
import SettingsTestPage from "../pages/Settings";
import TranslationsTestPage from "../pages/Translations";
import MainLayout from "../layouts";
import PrayerDisplayTV from "../pages/Display";
import NotFoundPage from "../pages/NotFound";
import PrayerDisplayTV2 from "../pages/DisplayV2";
import PrayerDisplaySimpleTV from "../pages/DisplayV3";
import PrayerDisplaySimpleTVV4 from "../pages/DisplayV4";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/languages" element={<LanguagesTestPage />} />
        <Route path="/prayer" element={<PrayerTimesTestPage />} />
        <Route path="/ikamah" element={<IkamahTestPage />} />
        <Route path="/notice" element={<NoticeTestPage />} />
        <Route path="/ramadan" element={<RamadanTestPage />} />
        <Route path="/settings" element={<SettingsTestPage />} />
        <Route path="/translations" element={<TranslationsTestPage />} />
      </Route>
      <Route path="/display" element={<PrayerDisplayTV />} />
      <Route path="/displayv2" element={<PrayerDisplayTV2 />} />
      <Route path="/displayv3" element={<PrayerDisplaySimpleTV />} />
      <Route path="/displayv4" element={<PrayerDisplaySimpleTVV4 />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
