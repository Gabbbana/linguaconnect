# LinguaConnect frontend prototype

Based on upstream `c556854ccb49da3b3808abd2f41c59bbcf9796f5` (Windows setup guide).

## Run the prototype

From the repository root:

```bash
npm --prefix client ci
npm --prefix client run dev:demo
```

Open the URL printed by Vite. No database, account, API server, or microphone permission is needed to explore the demo.

```bash
npm run test:prototype
npm run build
```

The root build generates a static preview in `dist/`. The regular `client` development/build commands retain the original API-backed application. `?demo=1` can also select the prototype when running the client locally. Production preview builds use `VITE_DEMO_MODE=true` via `.env.demo`.

## What is functional

- Responsive partner directory and navigation.
- English / Spanish selection, search, native-speaker / fellow-learner filters, and interest filtering.
- Sample partner profiles, temporary profile hiding, and restoring hidden profiles.
- Random matching within the current filtered selection.
- Demo onboarding and profile validation/editing.
- Pre-call screen, optional real microphone availability check, and cancel.
- Simulated incoming call acceptance/decline, outgoing ringing, active call timer, mute state, end call, and session recap.
- Conversation prompt rotation, local rating feedback, and report preview.
- Selectable failure cases: permission denied, busy partner, timeout, empty directory, offline, and connection recovery.
- Accessible native dialogs, semantic buttons/labels, keyboard focus styling, and reduced-motion support.

## Demo boundary

The people are fictional fixtures and are visibly labeled as samples. Calls, online status, account/profile creation, mute controls, ratings, reports, and session history are simulated frontend behavior. No real account, moderation report, or audio call is created. All prototype state lasts only for the current page session. Refresh resets it. No email, password, token, or personal profile is stored.

Only the optional microphone-check button requests browser microphone access. On success the tracks are stopped immediately. Nothing is recorded or transmitted. A pending check is invalidated after 12 seconds or on navigation, and any late stream is stopped. Browser/device permission behavior should also be evaluated on the user's own hardware.

## Structure

- `client/src/prototype/model.ts`: typed fixtures, filtering, and pure call state transitions.
- `client/src/prototype/UI.tsx`: shared brand, icons, avatars, and native dialog.
- `client/src/prototype/PrototypeApp.tsx`: directory, navigation, profile, onboarding, and demo controls.
- `client/src/prototype/CallRoom.tsx`: call lifecycle, microphone-check cleanup, errors, controls, and recap.
- `client/src/prototype/prototype.css`: scoped responsive design using the original teal/coral brand family.
- `client/src/main.tsx`: selects demo or existing application; existing REST/WebSocket providers remain available for live development.
- `scripts/test-prototype.mjs`: behavioral checks for filters and call transitions.

## Changes to the existing live call screen

`client/src/screens/CallScreen.tsx` now keeps cancel available during connection, exposes microphone errors, exposes a recovery message after a 20-second connection timeout, and replaces the nonfunctional speaker toggle with device-output guidance. This is a focused UI recovery change, not a complete WebRTC reliability fix.

## Validation and next integration work

The prototype state/filter checks and TypeScript/static build are run during development. The browser environment blocked its internal preview URL, so visual and end-to-end browser validation could not be completed. Desktop/mobile layout, keyboard behavior, and microphone hardware need manual confirmation in the deployed preview. A real two-user WebRTC call and cross-network audio cannot be established by this static prototype.

Next, connect the approved presentation components to the existing auth/realtime providers, specify consent/acceptance protocol events, handle signaling readiness and reconnects, and configure TURN with short-lived credentials. Authentication security, moderation storage, backend rate limiting, and cross-network WebRTC testing remain production work. Reciprocal native-language matching is a product choice; the demo exposes native-speaker filtering without silently changing the existing matching protocol.
