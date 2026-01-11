/* eslint-disable @typescript-eslint/no-explicit-any */
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

const PrayerDisplayTV = () => {
  const { data: settings } = useSettings.get();
  const { data: today } = usePrayerTimes.today(
    (settings?.time_format as any) || 24
  );
  const { data: ikamah } = useIkamah.time((settings?.time_format as any) || 24);
  const { data: notices } = useNotice.get(true);
  const { data: allTranslations } = useTranslations.get();
  const { data: ramadan } = useRamadan.get(
    (settings?.time_format as any) || 24
  );

  const [now, setNow] = useState(moment());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(moment()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Static Language Mappings
  const langData = {
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

  const currentLang = (settings?.language_code as "en" | "ta" | "si") || "en";
  const displayDay = langData[currentLang].days[now.day()];
  const displayMonth = langData[currentLang].months[now.month()];

  const t = (cat: string, key: string) => {
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
  const timeline = useMemo(() => {
    if (!today || !ikamah) return [];
    const list = [
      { id: "fajr", time: today.fajr, iq: ikamah.fajr },
      { id: "sunrise", time: today.sunrise, iq: null },
      {
        id: isFriday ? "jummah" : "dhuhr",
        time: isFriday ? ikamah.jummah : today.dhuhr,
        iq: ikamah.dhuhr,
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
    )
      target?.add(1, "day");

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

    let scrollInterval: any;

    const runScroll = () => {
      if (el.scrollHeight <= el.clientHeight) return;
      scrollInterval = setInterval(() => {
        if (direction === 1) {
          el.scrollTop += 3;
          if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
            direction = -1;
            clearInterval(scrollInterval);
            setTimeout(runScroll, 1200);
          }
        } else {
          el.scrollTop -= 3;
          if (el.scrollTop <= 0) {
            direction = 1;
            clearInterval(scrollInterval);
            setTimeout(runScroll, 1200);
          }
        }
      }, 25);
    };

    runScroll();
    return () => clearInterval(scrollInterval);
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

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-black text-white p-[1.5vh] font-sans select-none">
      {/* HEADER */}
      <div className="h-[15vh] flex justify-between items-center px-[2vw] border-b-[0.5vh] border-cyan-400">
        <div>
          <h1 className="text-[7.5vh] font-black uppercase text-cyan-400 leading-none">
            {settings.mosque_name}
          </h1>
          <div className="text-[3.2vh] font-bold text-green-500 mt-[0.8vh] flex items-center gap-3">
            <span className="uppercase">{displayDay}</span>
            <span className="text-white/20">|</span>
            <span>
              {now.date()} {displayMonth} {now.year()}
            </span>
            <span className="text-white/20">|</span>
            <span>
              {hijriDate.iDate()}{" "}
              {t("hijri", (hijriDate.iMonth() + 1).toString())}{" "}
              {hijriDate.iYear()}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[12vh] font-black text-green-500 leading-none tabular-nums flex items-baseline">
            {now.format(settings.time_format === 12 ? "hh:mm" : "HH:mm")}
            <span className="text-[4vh] ml-[0.8vw] text-green-400 uppercase">
              {settings.time_format === 12 ? now.format("A") : ""}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex gap-[1.5vw] mt-[2.5vh] px-[1vw] min-h-0">
        <div className="flex-[1.6] flex flex-col justify-center border-[0.6vh] border-cyan-500 rounded-[4vh] p-[4vh] bg-black">
          <p className="text-[4.5vh] font-bold text-green-500 uppercase mb-[1vh]">
            {t("ui", "next_prayer")}
          </p>
          <h2 className="text-[13vh] font-black text-white leading-tight mb-[4vh] uppercase">
            {t("prayer_names", timeline[active.nextIdx].id) !==
            timeline[active.nextIdx].id
              ? t("prayer_names", timeline[active.nextIdx].id)
              : t("ramadan", timeline[active.nextIdx].id)}
          </h2>
          <div className="flex gap-[2vw]">
            <div className="flex-1 bg-white/5 p-[3.5vh] rounded-[3vh] border-l-[1.2vh] border-green-600">
              <p className="text-[3.2vh] font-bold text-green-600 uppercase mb-[0.5vh] whitespace-nowrap">
                {t("ui", "begins")}
              </p>
              <p className="text-[9.5vh] font-black text-green-400 leading-none whitespace-nowrap">
                {timeline[active.nextIdx].time}
              </p>
            </div>
            <div className="flex-1 bg-white/5 p-[3.5vh] rounded-[3vh] border-l-[1.2vh] border-orange-600">
              <p className="text-[3.2vh] font-bold text-orange-600 uppercase mb-[0.5vh] whitespace-nowrap">
                {settings.language_code === "ta"
                  ? "மீதம்"
                  : t("ui", "preparation")}
              </p>
              <p className="text-[9.5vh] font-black text-orange-500 tabular-nums leading-none">
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
                className={`flex justify-between items-center px-[2vw] py-[2.2vh] rounded-[2.5vh] border-[0.2vh] shrink-0 ${
                  isCurrent
                    ? "bg-white text-black scale-[1.01] z-10"
                    : "bg-black border-white/10 opacity-60"
                }`}
              >
                <div className="flex flex-col">
                  <span
                    className={`text-[4.2vh] font-black uppercase leading-none ${
                      isCurrent ? "text-black" : "text-green-600"
                    }`}
                  >
                    {t("prayer_names", p.id) !== p.id
                      ? t("prayer_names", p.id)
                      : t("ramadan", p.id)}
                  </span>
                  {isCurrent && (
                    <p className="text-[2vh] font-bold uppercase mt-1">
                      {t("ui", "now")}
                    </p>
                  )}
                </div>
                <div className="text-right flex flex-col items-end">
                  <p
                    className={`text-[4.8vh] font-black tabular-nums leading-none ${
                      isCurrent ? "text-black" : "text-green-500"
                    }`}
                  >
                    {p.time}
                  </p>
                  {p.iq && (
                    <p
                      className={`text-[2.2vh] font-bold mt-[0.5vh] whitespace-nowrap ${
                        isCurrent ? "text-gray-700" : "text-gray-400"
                      }`}
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

      {/* FOOTER NOTICE: Duplicated content for infinite loop, with bullet separator */}
      {activeNotices.length > 0 && (
        <div className="h-[10vh] mt-[2.5vh] flex items-center bg-black border-t-[0.3vh] border-white/10 px-[2vw] overflow-hidden">
          <div className="bg-red-600 text-white px-[1.5vw] py-[0.5vh] rounded-[1vh] text-[3.2vh] font-black mr-[3vw] z-10 whitespace-nowrap shadow-lg">
            {t("admin", "notices").toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="whitespace-nowrap text-[4.5vh] font-bold text-green-500 animate-marquee inline-flex items-center">
              {/* Render notices twice for seamless looping */}
              {[...activeNotices, ...activeNotices].map((n, i) => (
                <React.Fragment key={`${n.id}-${i}`}>
                  <span>{n.content}</span>
                  {/* Large gap and bullet icon separator */}
                  <span className="mx-[10vw] text-cyan-400 text-[6vh]">•</span>
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
