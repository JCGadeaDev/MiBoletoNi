'use client';

import React, { createContext, useState, ReactNode } from 'react';
import type { CombinedEvent } from '@/lib/types';

interface EventContextType {
  events: CombinedEvent[];
  setEvents: (events: CombinedEvent[]) => void;
}

export const EventContext = createContext<EventContextType>({
  events: [],
  setEvents: () => {},
});

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<CombinedEvent[]>([]);

  return (
    <EventContext.Provider value={{ events, setEvents }}>
      {children}
    </EventContext.Provider>
  );
};
