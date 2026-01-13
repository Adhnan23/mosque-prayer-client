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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(moment()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Static Language Mappings
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
        iq: isFriday ? ikamah.jummah : today.dhuhr,
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
    let nextIdx = timeline.findIndex((p) => parseToToday(p.time)?.isAfter(now));
    if (nextIdx === -1) nextIdx = 0;

    let currentIdx = -1;
    for (let i = timeline.length - 1; i >= 0; i--) {
      if (parseToToday(timeline[i].time)?.isBefore(now)) {
        currentIdx = i;
        break;
      }
    }
    if (currentIdx === -1) currentIdx = timeline.length - 1;

    const target = parseToToday(timeline[nextIdx].time);
    if (
      nextIdx === 0 &&
      now.isAfter(parseToToday(timeline[timeline.length - 1].time))
    ) {
      target?.add(1, "day");
    }

    const diff = moment.duration(target?.diff(now));
    const pad = (n: number) => Math.floor(n).toString().padStart(2, "0");

    return {
      nextIdx,
      currentIdx,
      countdown: `${pad(diff.hours())}:${pad(diff.minutes())}:${pad(
        diff.seconds()
      )}`,
    };
  }, [now, timeline]);

  // Sidebar Auto-Scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let direction = 1;

    let scrollInterval: NodeJS.Timeout | null = null;

    const runScroll = () => {
      if (el.scrollHeight <= el.clientHeight) return;
      scrollInterval = setInterval(() => {
        if (direction === 1) {
          el.scrollTop += 3;
          if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
            direction = -1;
            if (scrollInterval) clearInterval(scrollInterval);
            setTimeout(runScroll, 1200);
          }
        } else {
          el.scrollTop -= 3;
          if (el.scrollTop <= 0) {
            direction = 1;
            if (scrollInterval) clearInterval(scrollInterval);
            setTimeout(runScroll, 1200);
          }
        }
      }, 25);
    };

    runScroll();
    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [timeline]);

  const activeNotices = useMemo(() => {
    return (
      notices?.filter(
        (n) => n.language_code === settings?.language_code && n.is_active
      ) || []
    );
  }, [notices, settings]);

  if (!settings || !active) return null;

  const hijriDate = moment().add(settings.hijri_offset || 0, "days");

  // Use colors from settings
  const primaryColor = settings.primary_color || "#8b5cf6";
  const secondaryColor = settings.secondary_color || "#06b6d4";
  const accentColor = settings.accent_color || "#10b981";
  const backgroundColor = settings.background_color || "#000000";
  const foregroundColor = settings.foreground_color || "#ffffff";

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden p-[1.5vh] font-sans select-none"
      style={{
        backgroundColor,
        color: foregroundColor,
      }}
    >
      {/* HEADER */}
      <div
        className="h-[15vh] flex justify-between items-center px-[2vw] border-b-[0.8vh] rounded-[2vh] shadow-2xl"
        style={{ borderColor: primaryColor }}
      >
        <div>
          <h1
            className="text-[7.5vh] font-black uppercase leading-none"
            style={{ color: primaryColor }}
          >
            {t("mosque", "name") ? t("mosque", "name") : settings.mosque_name}
          </h1>
          <div
            className="text-[3.2vh] font-bold mt-[0.8vh] flex items-center gap-3"
            style={{ color: accentColor }}
          >
            <span className="uppercase">{displayDay}</span>
            <span style={{ color: `${foregroundColor}33` }}>|</span>
            <span>
              {now.date()} {displayMonth} {now.year()}
            </span>
            <span style={{ color: `${foregroundColor}33` }}>|</span>
            <span>
              {hijriDate.iDate()}{" "}
              {t("hijri", (hijriDate.iMonth() + 1).toString())}{" "}
              {hijriDate.iYear()}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-[12vh] font-black leading-none tabular-nums flex items-baseline"
            style={{ color: accentColor }}
          >
            {now.format(settings.time_format === 12 ? "hh:mm" : "HH:mm")}
            <span
              className="text-[4vh] ml-[0.8vw] uppercase"
              style={{ color: secondaryColor }}
            >
              {settings.time_format === 12 ? now.format("A") : ""}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex gap-[1.5vw] mt-[2.5vh] px-[1vw] min-h-0">
        <div
          className="flex-[1.6] flex flex-col justify-center border-[0.8vh] rounded-[4vh] p-[4vh] shadow-2xl"
          style={{
            borderColor: primaryColor,
            backgroundColor: `${backgroundColor}dd`,
          }}
        >
          <p
            className="text-[4.5vh] font-bold uppercase mb-[1vh]"
            style={{ color: accentColor }}
          >
            {t("ui", "next_prayer")}
          </p>
          <h2
            className="text-[13vh] font-black leading-tight mb-[4vh] uppercase"
            style={{ color: foregroundColor }}
          >
            {t("prayer_names", timeline[active.nextIdx].id) !==
            timeline[active.nextIdx].id
              ? t("prayer_names", timeline[active.nextIdx].id)
              : t("ramadan", timeline[active.nextIdx].id)}
          </h2>
          <div className="flex gap-[2vw]">
            <div
              className="flex-1 p-[3.5vh] rounded-[3vh] border-l-[1.2vh] shadow-xl"
              style={{
                backgroundColor: `${foregroundColor}0d`,
                borderColor: accentColor,
              }}
            >
              <p
                className="text-[3.2vh] font-bold uppercase mb-[0.5vh] whitespace-nowrap"
                style={{ color: accentColor }}
              >
                {t("ui", "begins")}
              </p>
              <p
                className="text-[9.5vh] font-black leading-none whitespace-nowrap"
                style={{ color: secondaryColor }}
              >
                {timeline[active.nextIdx].time}
              </p>
            </div>
            <div
              className="flex-1 p-[3.5vh] rounded-[3vh] border-l-[1.2vh] shadow-xl"
              style={{
                backgroundColor: `${foregroundColor}0d`,
                borderColor: primaryColor,
              }}
            >
              <p
                className="text-[3.2vh] font-bold uppercase mb-[0.5vh] whitespace-nowrap"
                style={{ color: primaryColor }}
              >
                {settings.language_code === "ta"
                  ? "மீதம்"
                  : t("ui", "preparation")}
              </p>
              <p
                className="text-[9.5vh] font-black tabular-nums leading-none"
                style={{ color: accentColor }}
              >
                {active.countdown}
              </p>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 flex flex-col gap-[1.2vh] overflow-y-auto no-scrollbar scroll-smooth"
        >
          {timeline.map((p, idx) => {
            const isCurrent = idx === active.currentIdx;
            return (
              <div
                key={p.id}
                className={`flex justify-between items-center px-[2vw] py-[2.2vh] rounded-[2.5vh] border-[0.3vh] shrink-0 shadow-lg transition-all ${
                  isCurrent ? "scale-[1.03] z-10" : "opacity-70"
                }`}
                style={{
                  backgroundColor: isCurrent
                    ? foregroundColor
                    : `${foregroundColor}0a`,
                  borderColor: isCurrent
                    ? primaryColor
                    : `${foregroundColor}1a`,
                  color: isCurrent ? backgroundColor : foregroundColor,
                }}
              >
                <div className="flex flex-col">
                  <span
                    className={`text-[4.2vh] font-black uppercase leading-none`}
                    style={{
                      color: isCurrent ? backgroundColor : accentColor,
                    }}
                  >
                    {t("prayer_names", p.id) !== p.id
                      ? t("prayer_names", p.id)
                      : t("ramadan", p.id)}
                  </span>
                  {isCurrent && (
                    <p
                      className="text-[2vh] font-bold uppercase mt-1"
                      style={{ color: primaryColor }}
                    >
                      {t("ui", "now")}
                    </p>
                  )}
                </div>
                <div className="text-right flex flex-col items-end">
                  <p
                    className={`text-[4.8vh] font-black tabular-nums leading-none`}
                    style={{
                      color: isCurrent ? backgroundColor : secondaryColor,
                    }}
                  >
                    {p.time}
                  </p>
                  {p.iq && (
                    <p
                      className={`text-[2.2vh] font-bold mt-[0.5vh] whitespace-nowrap`}
                      style={{
                        color: isCurrent
                          ? `${backgroundColor}aa`
                          : `${foregroundColor}66`,
                      }}
                    >
                      {t("ui", "iqamah")}: {p.iq}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER NOTICE */}
      {activeNotices.length > 0 && (
        <div
          className="h-[10vh] mt-[2.5vh] flex items-center border-t-[0.5vh] rounded-[2vh] px-[2vw] overflow-hidden shadow-2xl"
          style={{
            backgroundColor: `${backgroundColor}dd`,
            borderColor: `${foregroundColor}1a`,
          }}
        >
          <div
            className="px-[1.5vw] py-[0.5vh] rounded-[1vh] text-[3.2vh] font-black mr-[3vw] z-10 whitespace-nowrap shadow-lg"
            style={{
              backgroundColor: accentColor,
              color: backgroundColor,
            }}
          >
            {t("admin", "notices").toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div
              className="whitespace-nowrap text-[4.5vh] font-bold animate-marquee inline-flex items-center"
              style={{ color: secondaryColor }}
            >
              {[...activeNotices, ...activeNotices].map((n, i) => (
                <React.Fragment key={`${n.id}-${i}`}>
                  <span>{n.content}</span>
                  <span
                    className="mx-[10vw] text-[6vh]"
                    style={{ color: primaryColor }}
                  >
                    •
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
          animation: marquee 30s linear infinite;
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default PrayerDisplayTV;
