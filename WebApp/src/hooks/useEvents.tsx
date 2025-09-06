import { useState, createContext, useContext, ReactNode } from 'react';

export interface Event {
  id: number;
  title: string;
  time: string;
  date: Date;
  type: 'meeting' | 'review' | 'call' | 'workshop' | 'planning';
}

interface EventContextType {
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  removeEvent: (id: number) => void;
  updateEvent: (id: number, event: Partial<Event>) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const initialEvents: Event[] = [
  {
    id: 1,
    title: "Team Meeting",
    time: "10:00 AM",
    date: new Date(2024, 11, 6), // December 6, 2024
    type: "meeting"
  },
  {
    id: 2,
    title: "Project Review",
    time: "2:30 PM",
    date: new Date(2024, 11, 6), // December 6, 2024
    type: "review"
  },
  {
    id: 3,
    title: "Client Call",
    time: "11:00 AM",
    date: new Date(2024, 11, 7), // December 7, 2024
    type: "call"
  },
  {
    id: 4,
    title: "Design Workshop",
    time: "3:00 PM",
    date: new Date(2024, 11, 8), // December 8, 2024
    type: "workshop"
  }
];

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>(initialEvents);

  const addEvent = (newEvent: Omit<Event, 'id'>) => {
    const id = Math.max(...events.map(e => e.id), 0) + 1;
    setEvents(prev => [...prev, { ...newEvent, id }]);
  };

  const removeEvent = (id: number) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const updateEvent = (id: number, updatedEvent: Partial<Event>) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updatedEvent } : event
    ));
  };

  return (
    <EventContext.Provider value={{ events, addEvent, removeEvent, updateEvent }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};