import React, { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { useEvents } from "@/hooks/useEvents";

export const CalendarWidget = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { events } = useEvents();

  // Get events for the selected date
  const eventsForSelectedDate = events.filter(event => 
    isSameDay(event.date, selectedDate)
  );

  // Get events for current month to show dots on calendar
  const eventsInMonth = events.filter(event => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return event.date >= monthStart && event.date <= monthEnd;
  });

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDay = startOfMonth(currentMonth);
    const lastDay = endOfMonth(currentMonth);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="glass-card p-4 rounded-xl border border-border/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-foreground" />
          <h3 className="font-medium text-sm text-foreground">Calendar</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-accent"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <span className="text-xs font-medium text-foreground min-w-[80px] text-center">
            {format(currentMonth, "MMM yyyy")}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-accent"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-4">
        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="h-6 flex items-center justify-center text-[10px] font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            const hasEvent = eventsInMonth.some(event => isSameDay(event.date, date));
            
            return (
              <div
                key={index}
                className={cn(
                  "relative h-6 w-6 flex items-center justify-center text-[10px] rounded cursor-pointer transition-colors",
                  isCurrentMonth ? "text-foreground hover:bg-accent" : "text-muted-foreground/50",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                  isToday && !isSelected && "bg-accent text-accent-foreground",
                )}
                onClick={() => setSelectedDate(date)}
              >
                <span>{format(date, "d")}</span>
                {hasEvent && (
                  <div className="absolute bottom-0 right-0 w-1 h-1 bg-primary rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events for Selected Date */}
      <div className="pt-3 border-t border-border/30">
        <div className="text-xs font-medium text-foreground mb-2">
          {format(selectedDate, "MMM d, yyyy")}
        </div>
        {eventsForSelectedDate.length > 0 ? (
          <div className="space-y-2">
            {eventsForSelectedDate.map((event) => (
              <div 
                key={event.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-card/50 border border-border/20"
              >
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {event.title}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-2 h-2 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      {event.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-3">
            <div className="text-xs text-muted-foreground">
              No events scheduled
            </div>
          </div>
        )}
      </div>
    </div>
  );
};