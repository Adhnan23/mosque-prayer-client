import React, { useState, useEffect, useMemo, useRef } from "react";
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

interface TimelineItem {
  id: string;
  time: string | undefined;
  iq: string | null | undefined;
}

const PrayerDisplayTV = () => {
  const { data: settings } = useSettings.get(20000);
  const timeFormat = (settings?.time_format as TimeFormat) || 24;

  const { data: today } = usePrayerTimes.today(timeFormat);
  const { data: ikamah } = useIkamah.time(timeFormat);
  const { data: notices } = useNotice.get(true);
  const { data: allTranslations } = useTranslations.get();
  const { data: ramadan } = useRamadan.get(timeFormat);

  const [now, setNow] = useState(moment());
  const [weather, setWeather] = useState<{
    temp: number;
    condition: string;
    icon: string;
  } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(moment()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Fetch weather data
  useEffect(() => {
    if (!isOnline) return;

    const fetchWeather = async () => {
      try {
        // Using wttr.in - a simple weather API that doesn't require API key
        const response = await fetch("https://wttr.in/?format=j1");
        const data = await response.json();

        if (data && data.current_condition && data.current_condition[0]) {
          const current = data.current_condition[0];
          setWeather({
            temp: parseInt(current.temp_C),
            condition: current.weatherDesc[0].value,
            icon: getWeatherIcon(current.weatherCode),
          });
        }
      } catch (error) {
        console.error("Weather fetch failed:", error);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // Update every 10 minutes

    return () => clearInterval(interval);
  }, [isOnline]);

  const getWeatherIcon = (code: string) => {
    const weatherCodes: { [key: string]: string } = {
      "113": "☀️", // Sunny
      "116": "⛅", // Partly cloudy
      "119": "☁️", // Cloudy
      "122": "☁️", // Overcast
      "143": "🌫️", // Mist
      "176": "🌦️", // Patchy rain possible
      "179": "🌨️", // Patchy snow possible
      "182": "🌧️", // Patchy sleet possible
      "185": "🌧️", // Patchy freezing drizzle
      "200": "⛈️", // Thundery outbreaks
      "227": "🌨️", // Blowing snow
      "230": "❄️", // Blizzard
      "248": "🌫️", // Fog
      "260": "🌫️", // Freezing fog
      "263": "🌦️", // Patchy light drizzle
      "266": "🌧️", // Light drizzle
      "281": "🌧️", // Freezing drizzle
      "284": "🌧️", // Heavy freezing drizzle
      "293": "🌦️", // Patchy light rain
      "296": "🌧️", // Light rain
      "299": "🌧️", // Moderate rain at times
      "302": "🌧️", // Moderate rain
      "305": "🌧️", // Heavy rain at times
      "308": "🌧️", // Heavy rain
      "311": "🌧️", // Light freezing rain
      "314": "🌧️", // Moderate or heavy freezing rain
      "317": "🌨️", // Light sleet
      "320": "🌨️", // Moderate or heavy sleet
      "323": "🌨️", // Patchy light snow
      "326": "❄️", // Light snow
      "329": "❄️", // Patchy moderate snow
      "332": "❄️", // Moderate snow
      "335": "❄️", // Patchy heavy snow
      "338": "❄️", // Heavy snow
      "350": "🌨️", // Ice pellets
      "353": "🌦️", // Light rain shower
      "356": "🌧️", // Moderate or heavy rain shower
      "359": "🌧️", // Torrential rain shower
      "362": "🌨️", // Light sleet showers
      "365": "🌨️", // Moderate or heavy sleet showers
      "368": "🌨️", // Light snow showers
      "371": "❄️", // Moderate or heavy snow showers
      "374": "🌧️", // Light showers of ice pellets
      "377": "🌧️", // Moderate or heavy showers of ice pellets
      "386": "⛈️", // Patchy light rain with thunder
      "389": "⛈️", // Moderate or heavy rain with thunder
      "392": "⛈️", // Patchy light snow with thunder
      "395": "⛈️", // Moderate or heavy snow with thunder
    };
    return weatherCodes[code] || "🌡️";
  };

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
        "ஞாயிற்றுக்கிழமை",
        "திங்கட்கிழமை",
        "செவ்வாய்க்கிழமை",
        "புதன்கிழமை",
        "வியாழக்கிழமை",
        "வெள்ளிக்கிழமை",
        "சனிக்கிழமை",
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
          i.key === key
      )?.value || key
    );
  };

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
        (parseToToday(b.time)?.valueOf() || 0)
    );
  }, [today, ikamah, isFriday, settings, ramadan]);

  const active = useMemo(() => {
    if (timeline.length === 0) return null;

    let nextIdx = -1;
    let currentIdx = -1;
    let isInIkamahWindow = false;
    let ikamahTarget: moment.Moment | null = null;

    for (let i = timeline.length - 1; i >= 0; i--) {
      const prayerTime = parseToToday(timeline[i].time);
      if (prayerTime && prayerTime.isBefore(now)) {
        currentIdx = i;
        break;
      }
    }
    if (currentIdx === -1) currentIdx = timeline.length - 1;

    const currentPrayer = timeline[currentIdx];
    if (currentPrayer.iq) {
      const prayerTime = parseToToday(currentPrayer.time);
      const ikamahTime = parseToToday(currentPrayer.iq);

      if (
        prayerTime &&
        ikamahTime &&
        now.isAfter(prayerTime) &&
        now.isBefore(ikamahTime)
      ) {
        isInIkamahWindow = true;
        ikamahTarget = ikamahTime;
        nextIdx = currentIdx;
      }
    }

    if (!isInIkamahWindow) {
      for (let i = 0; i < timeline.length; i++) {
        const prayerTime = parseToToday(timeline[i].time);
        if (prayerTime && prayerTime.isAfter(now)) {
          nextIdx = i;
          break;
        }
      }
      if (nextIdx === -1) nextIdx = 0;
    }

    let target: moment.Moment | null = null;
    let countdownLabel = "";
    let rightBoxTime = "";

    if (isInIkamahWindow && ikamahTarget) {
      target = ikamahTarget;
      countdownLabel =
        currentLang === "en"
          ? "PRAYER STARTS IN"
          : currentLang === "ta"
          ? "தொழுகை தொடங்கும்"
          : currentLang === "si"
          ? "නමාසය ආරම්භ වේ"
          : t("ui", "preparation");
      rightBoxTime = currentPrayer.iq || "";
    } else {
      const nextPrayer = timeline[nextIdx];
      target = parseToToday(nextPrayer.iq || nextPrayer.time);
      countdownLabel = t("ui", "iqamah");
      rightBoxTime = nextPrayer.iq || nextPrayer.time || "";

      if (
        nextIdx === 0 &&
        now.isAfter(parseToToday(timeline[timeline.length - 1].time))
      ) {
        target?.add(1, "day");
      }
    }

    const diff = moment.duration(target?.diff(now));
    const pad = (n: number) => Math.floor(n).toString().padStart(2, "0");

    return {
      nextIdx,
      currentIdx,
      isInIkamahWindow,
      countdownLabel,
      rightBoxTime,
      countdown: `${pad(diff.hours())}:${pad(diff.minutes())}:${pad(
        diff.seconds()
      )}`,
    };
  }, [now, timeline, t, currentLang]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let direction = 1;
    let scrollInterval: NodeJS.Timeout | null = null;
    let pauseTimeout: NodeJS.Timeout | null = null;

    const runScroll = () => {
      if (el.scrollHeight <= el.clientHeight) return;

      const doScroll = () => {
        scrollInterval = setInterval(() => {
          if (direction === 1) {
            el.scrollTop += 2;
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
              direction = -1;
              if (scrollInterval) clearInterval(scrollInterval);
              pauseTimeout = setTimeout(() => {
                doScroll();
              }, 2000);
            }
          } else {
            el.scrollTop -= 2;
            if (el.scrollTop <= 1) {
              direction = 1;
              if (scrollInterval) clearInterval(scrollInterval);
              pauseTimeout = setTimeout(() => {
                doScroll();
              }, 2000);
            }
          }
        }, 30);
      };

      doScroll();
    };

    runScroll();
    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
      if (pauseTimeout) clearTimeout(pauseTimeout);
    };
  }, [timeline]);

  const activeNotices = useMemo(() => {
    const currentDate = moment();
    return (
      notices?.filter((n) => {
        if (n.language_code !== settings?.language_code || !n.is_active) {
          return false;
        }

        const startDate = moment(n.start_date).startOf("day");
        const endDate = moment(n.end_date).endOf("day");

        return (
          currentDate.isSameOrAfter(startDate) &&
          currentDate.isSameOrBefore(endDate)
        );
      }) || []
    );
  }, [notices, settings, now]);

  if (!settings || !active) return null;

  const hijriDate = moment().add(settings.hijri_offset || 0, "days");

  const primaryColor = settings.primary_color || "#8b5cf6";
  const secondaryColor = settings.secondary_color || "#06b6d4";
  const accentColor = settings.accent_color || "#10b981";
  const backgroundColor = settings.background_color || "#000000";
  const foregroundColor = settings.foreground_color || "#ffffff";

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden font-sans select-none relative"
      style={{
        backgroundColor,
        color: foregroundColor,
      }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial animate-pulse-slow"></div>
      </div>

      {/* HEADER - Redesigned with split sections */}
      <div className="relative z-10 h-[18vh] flex items-stretch gap-[1vw] px-[2vw] py-[1.5vh]">
        {/* Left: Mosque Name & Date */}
        <div
          className="flex-[2] flex flex-col justify-center px-[3vw] rounded-[3vh] shadow-2xl backdrop-blur-md border-[0.4vh]"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}15, ${accentColor}15)`,
            borderColor: `${primaryColor}60`,
          }}
        >
          <h1
            className="text-[6.5vh] font-black uppercase leading-none mb-[1vh]"
            style={{ color: primaryColor }}
          >
            {t("mosque", "name") || settings.mosque_name}
          </h1>
          <div
            className="text-[2.8vh] font-bold flex items-center gap-3 flex-wrap"
            style={{ color: accentColor }}
          >
            <span className="uppercase">{displayDay}</span>
            <span style={{ color: `${foregroundColor}30` }}>•</span>
            <span>
              {now.date()} {displayMonth} {now.year()}
            </span>
            <span style={{ color: `${foregroundColor}30` }}>•</span>
            <span>
              {hijriDate.iDate()}{" "}
              {t("hijri", (hijriDate.iMonth() + 1).toString())}{" "}
              {hijriDate.iYear()}
            </span>
          </div>
        </div>

        {/* Right: Current Time */}
        <div
          className="flex-1 flex flex-col items-center justify-center rounded-[3vh] shadow-2xl backdrop-blur-md border-[0.4vh]"
          style={{
            background: `linear-gradient(135deg, ${accentColor}15, ${secondaryColor}15)`,
            borderColor: `${accentColor}60`,
          }}
        >
          <div
            className="text-[11vh] font-black leading-none tabular-nums flex items-baseline gap-[1vw]"
            style={{ color: accentColor }}
          >
            <span>
              {now.format(settings.time_format === 12 ? "hh:mm" : "HH:mm")}
            </span>
            {settings.time_format === 12 && (
              <span
                className="text-[4vh] font-black"
                style={{ color: secondaryColor }}
              >
                {now.format("A")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - Three column layout */}
      <div className="flex-1 flex gap-[1.5vw] px-[2vw] py-[1.5vh] min-h-0 relative z-10">
        {/* LEFT: Next Prayer Big Display */}
        <div
          className="flex-1 flex flex-col justify-between rounded-[4vh] p-[3vh] shadow-2xl backdrop-blur-md border-[0.5vh] relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}20, ${backgroundColor}80)`,
            borderColor: `${primaryColor}80`,
          }}
        >
          {/* Decorative corner pattern */}
          <div
            className="absolute top-0 right-0 w-[15vh] h-[15vh] rounded-bl-full opacity-20"
            style={{ background: primaryColor }}
          ></div>

          <div>
            <p
              className="text-[3.5vh] font-bold uppercase mb-[1vh] opacity-80"
              style={{ color: accentColor }}
            >
              {t("ui", "next_prayer")}
            </p>
            <h2
              className="text-[11vh] font-black leading-tight uppercase"
              style={{ color: foregroundColor }}
            >
              {t("prayer_names", timeline[active.nextIdx].id) !==
              timeline[active.nextIdx].id
                ? t("prayer_names", timeline[active.nextIdx].id)
                : t("ramadan", timeline[active.nextIdx].id)}
            </h2>
          </div>

          <div className="space-y-[2vh]">
            {/* Adhan Time */}
            <div
              className="p-[2.5vh] rounded-[2.5vh] backdrop-blur-sm border-l-[1vh] shadow-lg"
              style={{
                background: `${foregroundColor}08`,
                borderColor: accentColor,
              }}
            >
              <p
                className="text-[2.8vh] font-bold uppercase mb-[0.5vh] opacity-70"
                style={{ color: accentColor }}
              >
                {currentLang === "en"
                  ? "ADHAN TIME"
                  : currentLang === "ta"
                  ? "அதான் நேரம்"
                  : currentLang === "si"
                  ? "අදාන් වේලාව"
                  : t("ui", "prayer_time")}
              </p>
              <p
                className="text-[7vh] font-black leading-none"
                style={{ color: secondaryColor }}
              >
                {timeline[active.nextIdx].time}
              </p>
            </div>

            {/* Countdown / Ikamah */}
            <div
              className="p-[2.5vh] rounded-[2.5vh] backdrop-blur-sm border-l-[1vh] shadow-lg"
              style={{
                background: `${primaryColor}15`,
                borderColor: primaryColor,
              }}
            >
              <p
                className="text-[2.8vh] font-bold uppercase mb-[0.5vh] opacity-90"
                style={{ color: primaryColor }}
              >
                {active.countdownLabel}
              </p>
              <p
                className="text-[7vh] font-black tabular-nums leading-none min-w-[25vw]"
                style={{ color: accentColor }}
              >
                {active.isInIkamahWindow
                  ? active.countdown
                  : active.rightBoxTime}
              </p>
            </div>
          </div>
        </div>

        {/* MIDDLE: All Prayers Timeline */}
        <div
          className="flex-1 rounded-[4vh] p-[2vh] shadow-2xl backdrop-blur-md border-[0.5vh] overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${backgroundColor}90, ${secondaryColor}10)`,
            borderColor: `${secondaryColor}60`,
          }}
        >
          <div
            ref={scrollRef}
            className="h-full flex flex-col gap-[1.5vh] overflow-y-auto no-scrollbar scroll-smooth pointer-events-none pr-[1vh]"
          >
            {timeline.map((p, idx) => {
              const isCurrent = idx === active.currentIdx;
              const isNext = idx === active.nextIdx;
              return (
                <div
                  key={p.id}
                  className={`flex justify-between items-center px-[2.5vw] py-[2.5vh] rounded-[2vh] border-[0.3vh] shrink-0 shadow-lg transition-all duration-300 ${
                    isCurrent ? "z-10" : "opacity-60"
                  }`}
                  style={{
                    background: isCurrent
                      ? `linear-gradient(135deg, ${primaryColor}, ${accentColor})`
                      : isNext
                      ? `${secondaryColor}20`
                      : `${foregroundColor}08`,
                    borderColor: isCurrent
                      ? foregroundColor
                      : isNext
                      ? secondaryColor
                      : `${foregroundColor}20`,
                    color: isCurrent ? backgroundColor : foregroundColor,
                  }}
                >
                  <div className="flex flex-col">
                    <span
                      className={`text-[3.8vh] font-black uppercase leading-none`}
                      style={{
                        color: isCurrent
                          ? backgroundColor
                          : isNext
                          ? secondaryColor
                          : accentColor,
                      }}
                    >
                      {t("prayer_names", p.id) !== p.id
                        ? t("prayer_names", p.id)
                        : t("ramadan", p.id)}
                    </span>
                    {isCurrent && (
                      <p
                        className="text-[1.8vh] font-bold uppercase mt-1"
                        style={{ color: backgroundColor, opacity: 0.8 }}
                      >
                        {t("ui", "now")}
                      </p>
                    )}
                    {isNext && !isCurrent && (
                      <p
                        className="text-[1.8vh] font-bold uppercase mt-1"
                        style={{ color: secondaryColor, opacity: 0.7 }}
                      >
                        NEXT
                      </p>
                    )}
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p
                      className={`text-[4.5vh] font-black tabular-nums leading-none`}
                      style={{
                        color: isCurrent ? backgroundColor : secondaryColor,
                      }}
                    >
                      {p.time}
                    </p>
                    {p.iq &&
                      p.id !== "sunrise" &&
                      p.id !== "suhur_end" &&
                      p.id !== "taraweeh" && (
                        <p
                          className={`text-[2vh] font-bold mt-[0.5vh] whitespace-nowrap`}
                          style={{
                            color: isCurrent
                              ? `${backgroundColor}90`
                              : primaryColor,
                          }}
                        >
                          {p.id === "jummah"
                            ? currentLang === "en"
                              ? "Khutbah: "
                              : currentLang === "ta"
                              ? "குத்பா: "
                              : currentLang === "si"
                              ? "කුත්බා: "
                              : t("ui", "khutbah") + ": "
                            : t("ui", "iqamah") + ": "}
                          {p.iq}
                        </p>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Weather or Decorative Panel */}
        <div className="w-[18vw] flex flex-col gap-[1.5vh]">
          {/* Weather Info (when online) or Decorative Pattern (when offline) */}
          {isOnline && weather ? (
            <div
              className="flex-1 rounded-[3vh] p-[3vh] shadow-2xl backdrop-blur-md border-[0.4vh] flex flex-col justify-between relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${accentColor}15, ${primaryColor}15)`,
                borderColor: `${accentColor}60`,
              }}
            >
              {/* Weather Icon */}
              <div className="text-center">
                <div className="text-[12vh] leading-none mb-[1vh]">
                  {weather.icon}
                </div>
                <div
                  className="text-[3vh] font-bold opacity-70 mb-[2vh]"
                  style={{ color: foregroundColor }}
                >
                  {weather.condition}
                </div>
              </div>

              {/* Temperature */}
              <div className="text-center">
                <div
                  className="text-[10vh] font-black leading-none"
                  style={{ color: accentColor }}
                >
                  {weather.temp}°
                </div>
                <div
                  className="text-[2.5vh] font-bold opacity-60 mt-[0.5vh]"
                  style={{ color: foregroundColor }}
                >
                  CELSIUS
                </div>
              </div>

              {/* Decorative corner */}
              <div
                className="absolute top-0 right-0 w-[8vh] h-[8vh] rounded-bl-full opacity-10"
                style={{ background: primaryColor }}
              ></div>
            </div>
          ) : (
            <div
              className="flex-1 rounded-[3vh] p-[2vh] shadow-2xl backdrop-blur-md border-[0.4vh] flex items-center justify-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${accentColor}15, ${primaryColor}15)`,
                borderColor: `${accentColor}60`,
              }}
            >
              {/* Animated rotating patterns */}
              <div className="absolute inset-0 animate-spin-slow opacity-20">
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient
                      id="grad1"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        style={{ stopColor: primaryColor, stopOpacity: 1 }}
                      />
                      <stop
                        offset="100%"
                        style={{ stopColor: accentColor, stopOpacity: 1 }}
                      />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="url(#grad1)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="60"
                    fill="none"
                    stroke="url(#grad1)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="40"
                    fill="none"
                    stroke="url(#grad1)"
                    strokeWidth="2"
                  />
                  <path
                    d="M 100,20 L 100,180 M 20,100 L 180,100"
                    stroke="url(#grad1)"
                    strokeWidth="2"
                  />
                  <circle cx="100" cy="20" r="8" fill={accentColor} />
                  <circle cx="100" cy="180" r="8" fill={accentColor} />
                  <circle cx="20" cy="100" r="8" fill={primaryColor} />
                  <circle cx="180" cy="100" r="8" fill={primaryColor} />
                </svg>
              </div>

              <div className="absolute inset-0 animate-spin-reverse opacity-15">
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    stroke={secondaryColor}
                    strokeWidth="2"
                    strokeDasharray="10,10"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="50"
                    fill="none"
                    stroke={secondaryColor}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                </svg>
              </div>

              <div className="absolute inset-0 flex items-center justify-center animate-pulse-slow">
                <div
                  className="text-[10vh] font-black opacity-40"
                  style={{ color: primaryColor }}
                >
                  ☪
                </div>
              </div>
            </div>
          )}

          {/* Remaining Prayers Today */}
          <div
            className="h-[25vh] rounded-[3vh] p-[2vh] shadow-2xl backdrop-blur-md border-[0.4vh] flex flex-col"
            style={{
              background: `linear-gradient(135deg, ${secondaryColor}15, ${backgroundColor}80)`,
              borderColor: `${secondaryColor}60`,
            }}
          >
            <p
              className="text-[2.5vh] font-black uppercase mb-[1.5vh] opacity-70"
              style={{ color: secondaryColor }}
            >
              REMAINING
            </p>
            <div className="flex-1 flex flex-col justify-center items-center">
              <div
                className="text-[8vh] font-black leading-none mb-[1vh]"
                style={{ color: accentColor }}
              >
                {timeline.filter((p, idx) => idx > active.currentIdx).length}
              </div>
              <div
                className="text-[2vh] font-bold opacity-70 text-center"
                style={{ color: foregroundColor }}
              >
                {timeline.filter((p, idx) => idx > active.currentIdx).length ===
                1
                  ? "Prayer Left"
                  : "Prayers Left"}
              </div>
              {settings.is_ramadan && (
                <div
                  className="mt-[1.5vh] px-[1.5vw] py-[0.8vh] rounded-[1vh] text-[1.8vh] font-black"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                    color: backgroundColor,
                  }}
                >
                  🌙 RAMADAN
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER NOTICE - Only show if there are active notices */}
      {activeNotices.length > 0 && (
        <div
          className="relative z-10 h-[9vh] mx-[2vw] mb-[1.5vh] flex items-center rounded-[2vh] px-[2vw] overflow-hidden shadow-2xl backdrop-blur-md border-[0.4vh]"
          style={{
            background: `linear-gradient(90deg, ${accentColor}20, ${backgroundColor}80)`,
            borderColor: `${accentColor}60`,
          }}
        >
          <div
            className="px-[2vw] py-[1vh] rounded-[1.5vh] text-[2.8vh] font-black mr-[3vw] z-10 whitespace-nowrap shadow-lg backdrop-blur-sm"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${primaryColor})`,
              color: backgroundColor,
            }}
          >
            📢 {t("admin", "notices").toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div
              className="whitespace-nowrap text-[3.8vh] font-bold animate-marquee inline-flex items-center"
              style={{ color: foregroundColor }}
            >
              {[...activeNotices, ...activeNotices].map((n, i) => (
                <React.Fragment key={`${n.id}-${i}`}>
                  <span>{n.content}</span>
                  <span
                    className="mx-[8vw] text-[5vh]"
                    style={{ color: primaryColor, opacity: 0.6 }}
                  >
                    ✦
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } 
        }
        
        .animate-marquee {
          display: inline-flex;
          animation: marquee 35s linear infinite;
          will-change: transform;
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }

        @keyframes spin-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        .animate-spin-reverse {
          animation: spin-reverse 20s linear infinite;
        }

        .bg-gradient-radial {
          background: radial-gradient(circle at 50% 50%, ${
            settings?.primary_color || "#8b5cf6"
          }20 0%, transparent 70%);
        }
      `}</style>
    </div>
  );
};

export default PrayerDisplayTV;
