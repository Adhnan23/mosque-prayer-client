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

const PrayerDisplaySimpleTVV4 = () => {
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

  // UPDATED: Stay on current prayer until 5 minutes after iqamah (or adhan if no iqamah)
  const active = useMemo(() => {
    if (timeline.length === 0) return { nextIdx: 0 };
    let nextIdx = -1;

    for (let i = 0; i < timeline.length; i++) {
      // Get the time we should check (iqamah if exists, otherwise adhan)
      const timeToCheck = timeline[i].iq || timeline[i].time;
      const checkTime = parseToToday(timeToCheck);

      if (checkTime) {
        // Add 5 minutes to the check time
        const switchTime = checkTime.clone().add(5, "minutes");

        // If this switch time is still in the future, this is our current prayer
        if (switchTime.isAfter(now)) {
          nextIdx = i;
          break;
        }
      }
    }

    // If all prayers have passed (nextIdx remains -1), wrap to first prayer (tomorrow's Fajr)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notices, settings, now]);

  if (!settings || timeline.length === 0) return null;

  // --- Styles & Colors ---
  const hijriDate = moment().add(settings.hijri_offset || 0, "days");

  const primaryColor = settings.primary_color || "#00CFFF";
  const secondaryColor = settings.secondary_color || "#10b981";
  const accentColor = settings.accent_color || "#f59e0b";
  const backgroundColor = settings.background_color || "#1a1a2e";
  const foregroundColor = settings.foreground_color || "#f5f5f5";

  const heroPrayer = timeline[active.nextIdx];
  const heroName =
    t("prayer_names", heroPrayer.id) !== heroPrayer.id
      ? t("prayer_names", heroPrayer.id)
      : t("ramadan", heroPrayer.id);

  // Helper function to format time with smaller AM/PM
  const formatTimeWithSmallAmPm = (timeStr: string | undefined) => {
    if (!timeStr || settings.time_format !== 12) return timeStr;

    // Check if time already has AM/PM
    const hasAmPm = timeStr.includes("AM") || timeStr.includes("PM");
    if (!hasAmPm) return timeStr;

    // Split time and AM/PM
    const parts = timeStr.split(" ");
    return { time: parts[0], period: parts[1] };
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden font-sans select-none flex flex-col"
      style={{ backgroundColor, color: foregroundColor }}
    >
      {/* --- HEADER: Date Info (7vh) --- */}
      <header
        className="h-[7vh] min-h-[7vh] flex justify-between items-center px-[5vw] border-b-2 mb-10"
        style={{ borderColor: `${foregroundColor}20` }}
      >
        <div className="flex items-baseline gap-4">
          <span
            className="text-[3vh] font-bold tracking-wide"
            style={{ color: foregroundColor }}
          >
            {displayDay}
          </span>
          <span className="text-[3vh] font-medium opacity-80">
            {now.date()} {displayMonth} {now.year()}
          </span>
        </div>

        <div className="text-[3vh] font-medium opacity-80">
          {hijriDate.iDate()} {t("hijri", (hijriDate.iMonth() + 1).toString())}{" "}
          {hijriDate.iYear()}
        </div>
      </header>

      {/* --- CURRENT TIME SECTION WITH SECONDS (20vh) --- */}
      <div className="h-[20vh] min-h-[20vh] flex justify-center items-center px-[5vw]">
        <div className="text-center">
          <div className="text-[2.5vh] font-bold tracking-wider opacity-70 mb-1">
            {currentLang === "en"
              ? "CURRENT TIME"
              : currentLang === "ta"
                ? "தற்போதைய நேரம்"
                : currentLang === "si"
                  ? "වත්මන් වේලාව"
                  : "CURRENT TIME"}
          </div>
          <div
            className="text-[20vh] font-black tabular-nums tracking-tight leading-none"
            style={{ color: foregroundColor }}
          >
            {now.format(settings.time_format === 12 ? "hh:mm:ss" : "HH:mm:ss")}
            {settings.time_format === 12 && (
              <span
                className="text-[6vh] ml-3 font-bold"
                style={{ color: foregroundColor }}
              >
                {now.format("A")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* --- CURRENT PRAYER SECTION (38vh) --- */}
      <div className="h-[38vh] min-h-[38vh] flex flex-col justify-center items-center px-[5vw]">
        <div
          className="w-full max-w-[90vw] rounded-[3vh] border-4 px-[4vw] py-[2.5vh] text-center"
          style={{
            borderColor: primaryColor,
            backgroundColor: `${primaryColor}10`,
          }}
        >
          {/* Prayer Name */}
          <div className="mb-[2vh]">
            <div className="text-[2vh] font-bold tracking-wider opacity-70 mb-1">
              {currentLang === "en"
                ? "NEXT PRAYER"
                : currentLang === "ta"
                  ? "அடுத்த தொழுகை"
                  : currentLang === "si"
                    ? "මීළඟ නමාසය"
                    : "NEXT PRAYER"}
            </div>
            <div
              className="text-[7vh] font-black uppercase tracking-wider leading-none"
              style={{ color: primaryColor }}
            >
              {heroName}
            </div>
          </div>

          {/* Adhan & Iqamah Times Side by Side */}
          <div
            className={`flex ${heroPrayer.iq ? "justify-around" : "justify-center"} items-center gap-[4vw] mt-[1.5vh]`}
          >
            {/* Adhan Time */}
            <div className="flex-1 text-center">
              <div
                className="text-[2vh] font-bold tracking-wider mb-1 opacity-80"
                style={{ color: accentColor }}
              >
                {currentLang === "en"
                  ? "ADHAN"
                  : currentLang === "ta"
                    ? "அதான்"
                    : currentLang === "si"
                      ? "අදාන්"
                      : "ADHAN"}
              </div>
              <div
                className="text-[13vh] font-black tabular-nums tracking-tight leading-none"
                style={{ color: accentColor }}
              >
                {settings.time_format === 12
                  ? (() => {
                      const [time, period] = heroPrayer.time!.split(" ");
                      return (
                        <>
                          {time}
                          <span className="text-[3.5vh] ml-2 align-baseline">
                            {period}
                          </span>
                        </>
                      );
                    })()
                  : heroPrayer.time}
              </div>
            </div>

            {/* Iqamah Time */}
            {heroPrayer.iq && (
              <>
                <div
                  className="w-0.5 h-[16vh] opacity-30"
                  style={{ backgroundColor: accentColor }}
                ></div>
                <div className="flex-1 text-center">
                  <div
                    className="text-[2vh] font-bold tracking-wider mb-1 opacity-80"
                    style={{ color: secondaryColor }}
                  >
                    {heroPrayer.id === "jummah"
                      ? currentLang === "en"
                        ? "KHUTBAH"
                        : currentLang === "ta"
                          ? "குத்பா"
                          : "කුත්බා"
                      : currentLang === "en"
                        ? "IQAMAH"
                        : currentLang === "ta"
                          ? "இகாமத்"
                          : "ඉකාමා"}
                  </div>
                  <div
                    className="text-[14vh] font-black tabular-nums tracking-tight leading-none"
                    style={{ color: secondaryColor }}
                  >
                    {settings.time_format === 12
                      ? (() => {
                          const [time, period] = heroPrayer.iq.split(" ");
                          return (
                            <>
                              {time}
                              <span className="text-[4vh] ml-2 align-baseline">
                                {period}
                              </span>
                            </>
                          );
                        })()
                      : heroPrayer.iq}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- FOOTER: Other Prayer Times (18vh) --- */}
      <div className="h-[18vh] min-h-[18vh] px-[3vw] pb-[1vh] pt-[1vh] mb-18">
        <div className="h-full flex gap-[1vw]">
          {timeline.map((p, idx) => {
            const isActive = idx === active.nextIdx;
            const isPast =
              !isActive && (parseToToday(p.time)?.isBefore(now) ?? false);

            if (isActive) return null; // Don't show current prayer in footer

            const formattedTime = formatTimeWithSmallAmPm(p.time);
            const formattedIqTime = formatTimeWithSmallAmPm(p.iq!);

            return (
              <div
                key={p.id}
                className={`
                  flex-1 rounded-[2vh] flex flex-col justify-center items-center
                  transition-opacity duration-500
                  ${isPast ? "opacity-40" : "opacity-90"}
                `}
                style={{
                  backgroundColor: `${foregroundColor}08`,
                  border: `2px solid ${foregroundColor}20`,
                }}
              >
                <div
                  className="text-[2vh] font-bold uppercase tracking-wide"
                  style={{ color: foregroundColor }}
                >
                  {t("prayer_names", p.id) !== p.id
                    ? t("prayer_names", p.id)
                    : t("ramadan", p.id)}
                </div>

                <div
                  className="text-[5vh] font-black tabular-nums leading-none my-1 flex items-baseline gap-1"
                  style={{ color: primaryColor }}
                >
                  {typeof formattedTime === "object" ? (
                    <>
                      <span>{formattedTime.time}</span>
                      <span
                        className="text-[2vh] font-bold"
                        style={{ color: secondaryColor }}
                      >
                        {formattedTime.period}
                      </span>
                    </>
                  ) : (
                    <span>{p.time}</span>
                  )}
                </div>

                {p.iq && (
                  <div
                    className="text-[1.8vh] font-semibold tabular-nums flex items-baseline gap-1"
                    style={{ color: secondaryColor }}
                  >
                    <span className="opacity-70">{t("ui", "iqamah")}:</span>
                    {typeof formattedIqTime === "object" ? (
                      <>
                        <span>{formattedIqTime.time}</span>
                        <span
                          className="text-[1.4vh]"
                          style={{ color: accentColor }}
                        >
                          {formattedIqTime.period}
                        </span>
                      </>
                    ) : (
                      <span>{p.iq}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- BOTTOM MARQUEE (5vh) --- */}
      {activeNotices.length > 0 && (
        <div
          className="h-[5vh] min-h-[5vh] border-t-2 flex items-center overflow-hidden"
          style={{
            backgroundColor: `${foregroundColor}05`,
            borderColor: `${foregroundColor}20`,
          }}
        >
          <div className="whitespace-nowrap animate-marquee flex items-center">
            {[...activeNotices, ...activeNotices].map((n, i) => (
              <span
                key={i}
                className="text-[3.5vh] font-semibold mx-[4vw]"
                style={{ color: foregroundColor }}
              >
                {n.content}{" "}
                <span
                  className="mx-4 opacity-50"
                  style={{ color: primaryColor }}
                >
                  •
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Fallback for no notices - maintain layout */}
      {activeNotices.length === 0 && (
        <div className="h-[12vh] min-h-[12vh]"></div>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } 
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 35s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PrayerDisplaySimpleTVV4;
