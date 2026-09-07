# LinguaConnect

## Interactive frontend prototype

A self-contained demo is available for evaluating the redesigned frontend before backend integration. Run `npm --prefix client ci` and `npm --prefix client run dev:demo` from the repository root. See [PROTOTYPE.md](PROTOTYPE.md) for flows, limitations, testing, and integration notes.

A language exchange app inspired by Tandem: log in, pick a language you want
to practice, and get matched instantly with another online user who wants to
practice the same language — then talk over a real live voice call.

This was implemented from a [Claude Design](https://claude.ai/design)
prototype (see `project/` and `chats/` for the original design handoff). The
prototype used mocked data and a fake timed "connect"; this implementation
replaces that with a real backend: real accounts, real-time presence and
matchmaking over WebSockets, and real peer-to-peer voice calls over WebRTC.

## Stack

- **Client**: React + TypeScript + Vite, styled to match the original design tokens (colors, type, spacing) 1:1.
- **Server**: Node.js + Express (REST for auth/profile) + `ws` (WebSocket for presence, matchmaking, and WebRTC signaling).
- **Database**: PostgreSQL (accounts only — presence/matchmaking state lives in memory in the server process).
- **Auth**: email + password, bcrypt-hashed, JWT bearer tokens.
- **Calls**: real getUserMedia microphone audio over an `RTCPeerConnection`, using a public STUN server for NAT traversal. No TURN server is configured — calls between peers on restrictive/symmetric NATs may fail to connect; add a TURN server for that (see below).

## Running it locally

### 1. Database

```bash
# Postgres must be running and reachable. Then create a database + user:
createuser linguaconnect --pwprompt   # or use an existing role
createdb linguaconnect -O linguaconnect
```

### 2. Server

```bash
cd server
cp .env.example .env   # edit DATABASE_URL / JWT_SECRET if needed
npm install
npm run migrate        # creates the users table
npm run dev            # http://localhost:4000, ws at /ws
```

### 3. Client

```bash
cd client
cp .env.example .env   # points at the server above by default
npm install
npm run dev            # http://localhost:5173
```

Open the client URL in two different browsers (or a normal + incognito
window) and sign up as two different users to try matching and calling
between them.

## How matching works

- After logging in, pick English or Spanish to practice.
- Landing on the "Online now" screen marks you as available and subscribes
  you to live presence updates for that language over the WebSocket.
- Tapping a specific person sends a direct call request to them; "Call
  someone now" pairs you with a random available person. Both cases pair
  instantly (no ringing/accept step, matching the product's "simple as
  that" intent) and open a live WebRTC audio connection, signaled through
  the same WebSocket connection.
- Ending the call (from either side) or disconnecting returns both people
  to the available pool.

## Known limitations / things to revisit

- No TURN server — voice calls rely on STUN only, so calls across some
  restrictive networks/NATs won't connect. Add a TURN server (e.g. coturn
  or a hosted provider) and pass its credentials into `ICE_SERVERS` in
  `client/src/hooks/useWebRTCCall.ts` if that's needed for your users.
- The "Speaker" toggle in the call screen is cosmetic, same as the original
  prototype — browsers don't expose an earpiece/speaker output route to
  switch between the way a native iOS app would.
- No password reset, email verification, or rate limiting.
- The prototype wrapped its screens in a fake iOS device bezel (see
  `project/ios-frame.jsx`) for presentation inside the design tool. Since
  this now runs as a real web app in a real browser, that fake phone frame
  was dropped in favor of a responsive mobile-width column
  (`client/src/components/AppShell.tsx`) — all the actual screen content,
  colors, and spacing match the prototype exactly.

## Repo layout

```
server/   Express + WebSocket backend, Postgres access, JWT auth
client/   React + Vite frontend
project/  Original Claude Design prototype (HTML) — reference only
chats/    Original design conversation transcript — reference only
```

Note: the prototype's design-tool runtime (`support.js`) and the earlier
text-chat backup file from the original handoff bundle are not included
here, so the prototype HTML is for reading, not rendering.

