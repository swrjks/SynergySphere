import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { EventProvider } from './hooks/useEvents.tsx'

createRoot(document.getElementById("root")!).render(
  <EventProvider>
    <App />
  </EventProvider>
);
