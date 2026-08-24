import type { ReactNode } from 'react';
import { colors, fontFamily } from '../styles/theme';

// Full-height mobile-style column, centered on wide viewports —
// the prototype's iOS device bezel was just a design-canvas presentation
// frame, dropped here since this now runs as a real web app in a real
// browser chrome rather than inside a mockup.
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        background: colors.pageBg,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 430,
          minHeight: '100vh',
          background: colors.screenBg,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          fontFamily,
          color: colors.text,
          boxShadow: '0 0 0 1px rgba(46,40,35,0.06)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
