/**
 * @fileoverview Basic Calendar Component
 * @description A simple calendar component for date selection with month and year navigation.
 */

"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils"; // Keep consistent with your project style

/**
 * @function Calendar
 * @description Basic calendar component with date selection functionality
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {Date} props.value - Selected date
 * @param {Function} props.onChange - Callback when date selection changes
 * @returns {JSX.Element} Calendar component
 */
function Calendar({ className, value, onChange, ...props }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value || null);
  const [currentMonth, setCurrentMonth] = useState(
    value ? value.getMonth() : new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    value ? value.getFullYear() : new Date().getFullYear()
  );

  useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setCurrentMonth(value.getMonth());
      setCurrentYear(value.getFullYear());
    }
  }, [value]);

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; // Start from Monday
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return (day + 6) % 7; // Adjust so Monday is the first day
  };

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

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    );
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
    if (onChange) onChange(newDate);
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
            isSelected(day) && "shadow-[0_0_0_2px_rgba(59,130,246,0.5)]"
          )}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  // Generate year options for quick selection (current year ± 10 years)
  const yearOptions = Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i);

  return (
    <div className={cn("w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-sm", className)} {...props}>
      {/* Header with month, year dropdown, and navigation */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <select
            value={currentYear}
            onChange={e => setCurrentYear(Number(e.target.value))}
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

export { Calendar };
