import { DrawProvider, useDraw } from './context/DrawContext';
import { OrganizerPanel } from './components/organizer/OrganizerPanel';
import { LiveDraw } from './components/live/LiveDraw';

function AppContent() {
  const { state, exitLive } = useDraw();

  if (state.isLiveMode) {
    return <LiveDraw onExitLive={exitLive} />;
  }

  return <OrganizerPanel />;
}

export default function App() {
  return (
    <DrawProvider>
      <AppContent />
    </DrawProvider>
  );
}
