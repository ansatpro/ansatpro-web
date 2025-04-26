"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils"; // 保持你原来的样式风格

function CalendarPlus({ className, mode = "single", value, onChange, ...props }) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [range, setRange] = useState({ start: null, end: null });

  useEffect(() => {
    if (value) {
      if (mode === "single") {
        setSelectedDate(value);
        setCurrentMonth(value.getMonth());
        setCurrentYear(value.getFullYear());
      } else if (mode === "range") {
        setRange(value);
        setCurrentMonth(value?.start?.getMonth() || new Date().getMonth());
        setCurrentYear(value?.start?.getFullYear() || new Date().getFullYear());
      }
    }
  }, [value, mode]);

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => (new Date(year, month, 1).getDay() + 6) % 7;

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelectedSingle = (day) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    );
  };

  const isInRange = (day) => {
    if (!range.start || !range.end) return false;
    const d = new Date(currentYear, currentMonth, day);
    return d >= range.start && d <= range.end;
  };

  const isSelectedRange = (day) => {
    if (!range.start && !range.end) return false;
    const d = new Date(currentYear, currentMonth, day);
    return d.toDateString() === range.start?.toDateString() || d.toDateString() === range.end?.toDateString();
  };

  const handleDateClick = (day) => {
    const selected = new Date(currentYear, currentMonth, day);
    if (mode === "single") {
      setSelectedDate(selected);
      if (onChange) onChange(selected);
    } else if (mode === "range") {
      if (!range.start || (range.start && range.end)) {
        setRange({ start: selected, end: null });
      } else if (selected < range.start) {
        setRange({ start: selected, end: range.start });
        if (onChange) onChange({ start: selected, end: range.start });
      } else {
        setRange({ ...range, end: selected });
        if (onChange) onChange({ start: range.start, end: selected });
      }
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={cn(
            "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all hover:bg-gray-100",
            isToday(day) && "bg-blue-100 text-blue-600 font-semibold",
            (mode === "single" && isSelectedSingle(day)) && "bg-blue-500 text-white",
            (mode === "range" && isInRange(day)) && "bg-blue-100 text-blue-700",
            (mode === "range" && isSelectedRange(day)) && "bg-blue-500 text-white"
          )}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const yearOptions = Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i);

  return (
    <div className={cn("w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-sm", className)} {...props}>
      {/* Header with month, year dropdown, and navigation */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="border rounded px-1 py-0.5 text-base focus:outline-none"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {months[currentMonth]}
        </h2>
        <div className="flex space-x-1">
          <button
            onClick={prevMonth}
            className="rounded-full p-1 hover:bg-gray-100"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={nextMonth}
            className="rounded-full p-1 hover:bg-gray-100"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="mb-2 grid grid-cols-7 gap-1 text-center">
        {weekdays.map((day) => (
          <div key={day} className="text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
    </div>
  );
}

export { CalendarPlus };
