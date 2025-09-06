import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useEvents } from "@/hooks/useEvents";
import { toast } from "sonner";

interface AddEventDialogProps {
  trigger?: React.ReactNode;
}

export const AddEventDialog = ({ trigger }: AddEventDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("12:00 AM");
  const [date, setDate] = useState<Date>();
  const [type, setType] = useState<"meeting" | "review" | "call" | "workshop" | "planning">("meeting");
  const { addEvent } = useEvents();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !time || !date) {
      toast.error("Please fill in all fields");
      return;
    }

    addEvent({
      title,
      time,
      date,
      type
    });

    toast.success("Event added successfully!");
    
    // Reset form
    setTitle("");
    setTime("12:00 AM");
    setDate(undefined);
    setType("meeting");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="cosmic" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Event
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <div className="flex gap-2">
              <Select value={time.split(':')[0] || '12'} onValueChange={(hour) => {
                const currentMinute = time.split(':')[1]?.split(' ')[0] || '00';
                const currentPeriod = time.includes('PM') ? 'PM' : 'AM';
                setTime(`${hour}:${currentMinute} ${currentPeriod}`);
              }}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                    <SelectItem key={hour} value={hour.toString()}>
                      {hour.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={time.split(':')[1]?.split(' ')[0] || '00'} onValueChange={(minute) => {
                const currentHour = time.split(':')[0] || '12';
                const currentPeriod = time.includes('PM') ? 'PM' : 'AM';
                setTime(`${currentHour}:${minute} ${currentPeriod}`);
              }}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                    <SelectItem key={minute} value={minute.toString().padStart(2, '0')}>
                      {minute.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={time.includes('PM') ? 'PM' : 'AM'} onValueChange={(period) => {
                const currentHour = time.split(':')[0] || '12';
                const currentMinute = time.split(':')[1]?.split(' ')[0] || '00';
                setTime(`${currentHour}:${currentMinute} ${period}`);
              }}>
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="AM/PM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              Selected time: {time || "No time selected"}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Event Type</Label>
            <Select value={type} onValueChange={(value: any) => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};