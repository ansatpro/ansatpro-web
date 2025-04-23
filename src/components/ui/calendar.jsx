"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      showWeekdayHeadings={true} // ✅ 强制显示星期标题
      className={cn("p-3", className)}
      weekStartsOn={0}
      formatters={{
        formatWeekdayName: (locale, date) => ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][new Date(date).getDay()]
      }}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "flex justify-between items-center px-8 pb-4",
        caption_label: "text-4xl font-normal",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-10 w-10 bg-transparent p-0 text-gray-500 hover:bg-gray-50"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7 gap-0",
        head_cell: cn("text-[#3A6784] text-sm font-normal text-center pb-4"),
        row: "grid grid-cols-7 gap-0 mt-2",
        cell: "text-center relative py-1",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal mx-auto text-base hover:bg-gray-50"
        ),
        day_selected:
          "bg-[#3A6784] text-white hover:bg-[#2d5268] hover:text-white focus:bg-[#3A6784] focus:text-white",
        day_today: "border-2 border-[#3A6784] text-[#3A6784] font-semibold",
        day_outside: "text-gray-300",
        day_disabled: "text-gray-300 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-6 w-6" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-6 w-6" />,
      }}
      modifiers={{
        disabled: (date) => date > new Date(),
      }}
      modifiersClassNames={{
        disabled: "text-gray-300 cursor-not-allowed",
        today: "border-2 border-[#3A6784] text-[#3A6784] font-semibold",
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }