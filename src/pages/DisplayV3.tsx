import { useState, useEffect, useMemo } from "react";
import moment from "moment-hijri";
import {
  useSettings,
  usePrayerTimes,
  useIkamah,
  useNotice,
  useTranslations,
  useRamadan,
} from "../hooks";
import type { TimeFormat, LanguageCode } from "../api/types";

// --- Types ---
interface TimelineItem {
  id: string;
  time: string | undefined;
  iq: string | null | undefined;
}

const PrayerDisplaySimpleTV = () => {
  // --- Data Fetching ---
  const { data: settings } = useSettings.get(20000);
  const timeFormat = (settings?.time_format as TimeFormat) || 24;

  const { data: today } = usePrayerTimes.today(timeFormat);
  const { data: ikamah } = useIkamah.time(timeFormat);
  const { data: notices } = useNotice.get(true);
  const { data: allTranslations } = useTranslations.get();
  const { data: ramadan } = useRamadan.get(timeFormat);

  const [now, setNow] = useState(moment());

  // --- Clock Ticker ---
  useEffect(() => {
    const timer = setInterval(() => setNow(moment()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Language Data ---
  const langData: Record<LanguageCode, { days: string[]; months: string[] }> = {
    en: {
      days: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      months: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
    },
    ta: {
      days: [
        "ஞாயிறு",
        "திங்கள்",
        "செவ்வாய்",
        "புதன்",
        "வியாழன்",
        "வெள்ளி",
        "சனி",
      ],
      months: [
        "ஜனவரி",
        "பிப்ரவரி",
        "மார்ச்",
        "ஏப்ரல்",
        "மே",
        "ஜூன்",
        "ஜூலை",
        "ஆகஸ்ட்",
        "செப்டம்பர்",
        "அக்டோபர்",
        "நவம்பர்",
        "டிசம்பர்",
      ],
    },
    si: {
      days: [
        "ඉරිදා",
        "සඳුදා",
        "අඟහරුවාදා",
        "බදාදා",
        "බ්‍රහස්පතින්දා",
        "සිකුරාදා",
        "සෙනසුරාදා",
      ],
      months: [
        "ජනවාරි",
        "පෙබරවාරි",
        "මාර්තු",
        "අප්‍රේල්",
        "මැයි",
        "ජූනි",
        "ජූලි",
        "අගෝස්තු",
        "සැප්තැම්බර්",
        "ඔක්තෝබර්",
        "නොවැම්බර්",
        "දෙසැම්බර්",
      ],
    },
  };

  const currentLang = (settings?.language_code as LanguageCode) || "en";
  const displayDay = langData[currentLang]?.days[now.day()] || "";
  const displayMonth = langData[currentLang]?.months[now.month()] || "";

  const t = (cat: string, key: string): string => {
    return (
      allTranslations?.find(
        (i) =>
          i.language_code === settings?.language_code &&
          i.category === cat &&
          i.key === key,
      )?.value || key
    );
  };

  // --- Timeline Logic ---
  const parseToToday = (timeStr: string | undefined) => {
    if (!timeStr) return null;
    const m = moment(timeStr, ["hh:mm A", "HH:mm"]);
    return moment().set({
      hour: m.hour(),
      minute: m.minute(),
      second: 0,
      millisecond: 0,
    });
  };

  const isFriday = now.day() === 5;

  const timeline = useMemo<TimelineItem[]>(() => {
    if (!today || !ikamah) return [];
    const list: TimelineItem[] = [
      { id: "fajr", time: today.fajr, iq: ikamah.fajr },
      { id: "sunrise", time: today.sunrise, iq: null },
      {
        id: isFriday ? "jummah" : "dhuhr",
        time: isFriday ? ikamah.jummah : today.dhuhr,
        iq: isFriday ? null : ikamah.dhuhr,
      },
      { id: "asr", time: today.asr, iq: ikamah.asr },
      { id: "maghrib", time: today.maghrib, iq: ikamah.maghrib },
      { id: "isha", time: today.isha, iq: ikamah.isha },
    ];
    if (settings?.is_ramadan && ramadan) {
      list.unshift({ id: "suhur_end", time: ramadan.suhur_end, iq: null });
      list.push({ id: "taraweeh", time: ramadan.taraweeh, iq: null });
    }
    return list.sort(
      (a, b) =>
        (parseToToday(a.time)?.valueOf() || 0) -
        (parseToToday(b.time)?.valueOf() || 0),
    );
  }, [today, ikamah, isFriday, settings, ramadan]);

  const active = useMemo(() => {
    if (timeline.length === 0) return { nextIdx: 0 };
    let nextIdx = -1;
    for (let i = 0; i < timeline.length; i++) {
      const checkTime = parseToToday(timeline[i].time);
      if (checkTime && checkTime.isAfter(now)) {
        nextIdx = i;
        break;
      }
    }
    // If all passed (nextIdx remains -1), it means we are looking at tomorrow's Fajr (index 0)
    // However, strictly speaking for today's view, we usually highlight the last prayer or cycle.
    // For this display, we'll wrap to 0 (Fajr)
    if (nextIdx === -1) nextIdx = 0;
    return { nextIdx };
  }, [now, timeline]);

  const activeNotices = useMemo(() => {
    const currentDate = moment();
    return (
      notices?.filter((n) => {
        if (n.language_code !== settings?.language_code || !n.is_active)
          return false;
        const startDate = moment(n.start_date).startOf("day");
        const endDate = moment(n.end_date).endOf("day");
        return (
          currentDate.isSameOrAfter(startDate) &&
          currentDate.isSameOrBefore(endDate)
        );
      }) || []
    );
  }, [notices, settings, now]);

  if (!settings || timeline.length === 0) return null;

  // --- Styles & Colors ---
  const hijriDate = moment().add(settings.hijri_offset || 0, "days");

  const primaryColor = settings.primary_color || "#8b5cf6";
  const secondaryColor = settings.secondary_color || "#06b6d4";
  const accentColor = settings.accent_color || "#10b981";
  const backgroundColor = settings.background_color || "#000000";
  const foregroundColor = settings.foreground_color || "#ffffff";

  const heroPrayer = timeline[active.nextIdx];
  const heroName =
    t("prayer_names", heroPrayer.id) !== heroPrayer.id
      ? t("prayer_names", heroPrayer.id)
      : t("ramadan", heroPrayer.id);

  return (
    <div
      className="h-screen w-screen overflow-hidden bg-black font-sans select-none flex flex-col relative"
      style={{ backgroundColor, color: foregroundColor }}
    >
      {/* Background Ambience */}
      <div
        className="absolute top-0 right-0 w-[60vw] h-[60vw] rounded-full opacity-10 blur-[180px] pointer-events-none mix-blend-screen"
        style={{ backgroundColor: primaryColor }}
      ></div>
      <div
        className="absolute bottom-0 left-0 w-[60vw] h-[60vw] rounded-full opacity-10 blur-[180px] pointer-events-none mix-blend-screen"
        style={{ backgroundColor: secondaryColor }}
      ></div>

      {/* --- HEADER --- */}
      <header className="h-[25vh] flex justify-between items-start pt-[3vh] px-[4vw] z-10">
        <div className="flex flex-col justify-center">
          <h2
            className="text-[3.5vh] font-bold uppercase tracking-wide opacity-90"
            style={{ color: accentColor }}
          >
            {displayDay}
          </h2>
          <div className="text-[2.5vh] font-medium opacity-70 mt-1 flex gap-3">
            <span>
              {now.date()} {displayMonth} {now.year()}
            </span>
            <span className="opacity-40">|</span>
            <span>
              {hijriDate.iDate()}{" "}
              {t("hijri", (hijriDate.iMonth() + 1).toString())}{" "}
              {hijriDate.iYear()}
            </span>
          </div>
        </div>

        {/* CLOCK */}
        <div className="flex flex-col items-end leading-none">
          {/* Time + Seconds + AM/PM Row */}
          <div
            className="text-[18vh] font-black tabular-nums tracking-tighter drop-shadow-2xl flex items-baseline"
            style={{
              color: accentColor,
              textShadow: `0 0 40px ${primaryColor}40`,
            }}
          >
            {/* Time (HH:MM:SS) */}
            {now.format(settings.time_format === 12 ? "hh:mm:ss" : "HH:mm:ss")}

            {/* AM/PM */}
            {settings.time_format === 12 && (
              <span
                className="text-[4vh] ml-3 font-bold uppercase"
                style={{ color: secondaryColor }}
              >
                {now.format("A")}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* --- HERO SECTION (CENTER) --- */}
      <main className="flex-1 flex flex-col justify-center items-center z-10 relative -mt-[2vh]">
        <h1
          className="text-[7vh] font-black uppercase tracking-widest mb-[1vh]"
          style={{ color: primaryColor }}
        >
          {heroName}
        </h1>

        <div className="flex flex-col items-center gap-[4vh]">
          {/* Adhan Time */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[4vh] px-[8vw] py-[2vh] shadow-2xl relative">
            <span
              className="absolute -top-[2vh] left-1/2 -translate-x-1/2 bg-black px-4 py-1 rounded-full border text-[1.8vh] font-bold uppercase tracking-wider whitespace-nowrap"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              {currentLang === "en"
                ? "ADHAN TIME"
                : currentLang === "ta"
                  ? "அதான் நேரம்"
                  : currentLang === "si"
                    ? "අදාන් වේලාව"
                    : t("ui", "prayer_time")}
            </span>
            {/* 22vh */}
            <span
              className="text-[18vh] font-black leading-none tabular-nums tracking-tight block drop-shadow-2xl"
              style={{ color: secondaryColor }}
            >
              {heroPrayer.time}
            </span>
          </div>

          {/* Iqamah Time - Very Large */}
          {heroPrayer.iq && (
            <div className="flex flex-col items-center animate-pulse-slow">
              <span
                className="text-[3vh] font-bold uppercase opacity-90 mb-[0.5vh] tracking-widest"
                style={{ color: secondaryColor }}
              >
                {heroPrayer.id === "jummah"
                  ? t("ui", "khutbah")
                  : t("ui", "iqamah")}
              </span>
              <span
                className="text-[18vh] font-black tabular-nums leading-none drop-shadow-xl"
                style={{ color: primaryColor }}
              >
                {heroPrayer.iq}
              </span>
            </div>
          )}
        </div>
      </main>

      {/* --- FOOTER: FULL WIDTH PRAYER CARDS --- */}
      <div className="h-[20vh] w-full px-[2vw] mb-[2vh] z-10 flex flex-col">
        {/* Cards Container */}
        <div className="flex-1 flex gap-[1vw] items-center">
          {timeline.map((p, idx) => {
            const isActive = idx === active.nextIdx;
            // isPast logic: If not active, and time is before now
            const isPast =
              !isActive && (parseToToday(p.time)?.isBefore(now) ?? false);

            return (
              <div
                key={p.id}
                className={`
                            flex-1 h-full rounded-[2.5vh] flex flex-col justify-start pt-5 items-center relative overflow-hidden transition-all duration-700
                            ${isActive ? "bg-white/10 scale-105 shadow-2xl z-10" : "bg-white/5"}
                            ${isPast ? "grayscale opacity-40" : "opacity-80"}
                            border
                        `}
                style={{
                  // Active gets the Primary Color Border, others get faint white
                  borderColor: isActive
                    ? primaryColor
                    : "rgba(255,255,255,0.1)",
                  // Active gets a subtle tint of the primary color in background
                  backgroundColor: isActive ? `${primaryColor}1a` : undefined,
                }}
              >
                {isActive && (
                  <div
                    className="absolute top-0 left-0 w-full h-[0.6vh] shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                    style={{ backgroundColor: accentColor }}
                  ></div>
                )}

                <span
                  className={`text-[2vh] font-bold uppercase mb-[0.5vh] tracking-wider`}
                  style={{ color: isActive ? primaryColor : foregroundColor }}
                >
                  {t("prayer_names", p.id) !== p.id
                    ? t("prayer_names", p.id)
                    : t("ramadan", p.id)}
                </span>

                <span
                  className="text-[4vh] font-black tabular-nums leading-none mb-1"
                  style={{
                    color: isActive ? foregroundColor : `${foregroundColor}aa`,
                  }}
                >
                  {p.time}
                </span>

                {p.iq && (
                  <div
                    className={`px-[1vh] py-[0.3vh] rounded ${isActive ? "bg-black/40" : "bg-white/5"}`}
                  >
                    <span
                      className="text-[1.8vh] font-bold tabular-nums"
                      style={{
                        color: isActive
                          ? secondaryColor
                          : `${foregroundColor}88`,
                      }}
                    >
                      {isActive ? `${t("ui", "iqamah")}: ` : "IQ: "}
                      {p.iq}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- BOTTOM MARQUEE --- */}
      <div className="h-[5vh] bg-white/5 border-t border-white/10 flex items-center overflow-hidden relative">
        {activeNotices.length > 0 ? (
          <div className="whitespace-nowrap animate-marquee flex items-center">
            {[...activeNotices, ...activeNotices].map((n, i) => (
              <span
                key={i}
                className="text-[2.2vh] font-semibold mx-[4vw] tracking-wide"
                style={{ color: foregroundColor }}
              >
                {n.content}{" "}
                <span
                  className="mx-4 text-opacity-50"
                  style={{ color: primaryColor }}
                >
                  •
                </span>
              </span>
            ))}
          </div>
        ) : (
          <div className="w-full text-center opacity-30 text-[1.8vh] font-bold tracking-widest uppercase">
            {/* Placeholder */}
          </div>
        )}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } 
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        .animate-pulse-slow {
            animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .7; }
        }
      `}</style>
    </div>
  );
};

export default PrayerDisplaySimpleTV;
