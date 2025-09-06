import { Layout } from "@/components/Layout";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddEventDialog } from "@/components/AddEventDialog";
import { useEvents } from "@/hooks/useEvents";
import { format } from "date-fns";
import { toast } from "sonner";

const Calendar = () => {
  const { events, removeEvent } = useEvents();

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const calendarDays = Array.from({ length: 35 }, (_, i) => i + 1);

  const getEventType = (type: string) => {
    switch (type) {
      case "meeting": return "bg-blue-500/20 text-blue-300";
      case "review": return "bg-green-500/20 text-green-300";
      case "call": return "bg-purple-500/20 text-purple-300";
      case "planning": return "bg-orange-500/20 text-orange-300";
      default: return "bg-gray-500/20 text-gray-300";
    }
  };

  return (
    <Layout>
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-white" />
              <h1 className="text-3xl font-bold text-white">Calendar</h1>
            </div>
            <AddEventDialog />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="glass-card border border-white/20 p-6 rounded-xl">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">December 2024</h2>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="text-center text-white/60 font-medium py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    const isCurrentMonth = day <= 31;
                    const hasEvent = events.some(event => {
                      const eventDay = format(event.date, 'd');
                      return parseInt(eventDay) === day;
                    });
                    const isToday = day === 15;
                    
                    return (
                      <div
                        key={index}
                        className={`
                          h-12 flex items-center justify-center rounded-lg cursor-pointer transition-all
                          ${isCurrentMonth ? 'text-white hover:bg-white/10' : 'text-white/30'}
                          ${isToday ? 'bg-gradient-primary text-white shadow-glow' : ''}
                          ${hasEvent && !isToday ? 'bg-white/10' : ''}
                        `}
                      >
                        {isCurrentMonth ? day : day - 31}
                        {hasEvent && (
                          <div className="w-1 h-1 bg-white rounded-full ml-1"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="space-y-6">
              <div className="glass-card border border-white/20 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-4">Upcoming Events</h3>
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={`${getEventType(event.type)} border-0 text-xs`}>
                          {event.type}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/60">{format(event.date, 'MMM d')}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            onClick={() => {
                              removeEvent(event.id);
                              toast.success("Event deleted successfully");
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="font-medium text-white text-sm mb-1">{event.title}</p>
                      <p className="text-xs text-white/70">{event.time}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;