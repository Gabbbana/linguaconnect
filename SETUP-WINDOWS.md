# Running LinguaConnect on Windows — step by step

This guide assumes a fresh Windows PC with nothing installed. Total time:
about 20–30 minutes, most of it waiting for installers.

## Step 1 — Install the three tools you need (one time only)

1. **Node.js** (runs the app): download the **LTS** installer from
   https://nodejs.org and run it. Accept all defaults, keep clicking Next.
2. **Git** (downloads your code): download from https://git-scm.com/download/win
   and run it. Accept all defaults.
3. **PostgreSQL** (the database): download the installer from
   https://www.postgresql.org/download/windows/ (click "Download the
   installer"). Run it, accept defaults. **When it asks you to set a
   password for the "postgres" user, choose one and WRITE IT DOWN** — you
   need it in Step 3. You can skip "Stack Builder" at the end.

After installing, close and reopen any command windows so they see the new
tools.

## Step 2 — Download your code

Open **Command Prompt** (press the Windows key, type `cmd`, press Enter),
then run:

```
cd %USERPROFILE%
git clone https://github.com/Gabbbana/linguaconnect.git
cd linguaconnect
```

Your code is now in `C:\Users\<you>\linguaconnect`.

## Step 3 — Create the database

Open **SQL Shell (psql)** from the Start menu (it was installed with
PostgreSQL). Press **Enter** four times to accept the defaults
(Server, Database, Port, Username), then type the **postgres password you
wrote down** and press Enter.

At the `postgres=#` prompt, paste this line and press Enter:

```sql
CREATE DATABASE linguaconnect;
```

It should reply `CREATE DATABASE`. You can close the window.

## Step 4 — Configure and start the server

Back in Command Prompt:

```
cd %USERPROFILE%\linguaconnect\server
copy .env.example .env
notepad .env
```

Notepad opens the settings file. Change the `DATABASE_URL` line to use the
**postgres** user and **your password** (replace `YOUR_PASSWORD`):

```
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/linguaconnect
```

Save and close Notepad. Then run:

```
npm install
npm run migrate
npm run dev
```

You should see: `LinguaConnect server listening on http://localhost:4000`.
**Leave this window open** — this is your running server.

## Step 5 — Start the app

Open a **second** Command Prompt window and run:

```
cd %USERPROFILE%\linguaconnect\client
copy .env.example .env
npm install
npm run dev
```

You should see a `Local: http://localhost:5173/` line. **Leave this window
open too.**

## Step 6 — Use it!

1. Open your browser and go to **http://localhost:5173**
2. Click "Create an account" and sign up.
3. To test a real call, open a **second browser window in Incognito/Private
   mode** (Ctrl+Shift+N in Chrome), go to http://localhost:5173 again, and
   sign up as a **different** user.
4. In both windows: pick the same language → "Find partners". Each window
   now sees the other user online.
5. Click **Call** — the browser will ask for microphone permission, click
   Allow in both windows. The call connects with a live timer.

Note: when both windows are on the same computer they share one
microphone, so you'll hear yourself (echo). That's normal for
self-testing — mute one side, or better, have a friend on another computer
on the same Wi-Fi try it with you (they'd browse to your PC's local IP
instead of localhost, and both `.env` files would need that IP instead of
localhost).

## Day-to-day: starting it again later

Everything is already installed, so next time it's just:

- Window 1: `cd %USERPROFILE%\linguaconnect\server` then `npm run dev`
- Window 2: `cd %USERPROFILE%\linguaconnect\client` then `npm run dev`
- Browser: http://localhost:5173

(PostgreSQL starts with Windows automatically.)

## If something goes wrong

- **`'npm' is not recognized`** — Node.js isn't installed or the Command
  Prompt was open during install. Reopen Command Prompt; reinstall Node if
  needed.
- **`password authentication failed`** when running `npm run migrate` —
  the password in `server\.env` doesn't match the one you set in Step 1.
  Edit `.env` again (`notepad .env` inside the `server` folder).
- **Port already in use** — you already have a server window running.
  Close the old one first.
- **Microphone blocked** — click the padlock/camera icon in the browser's
  address bar and allow the microphone for localhost.

## Important: this makes the app run on YOUR computer only

People on the internet can't reach it. When you're ready for that, the app
needs to be hosted online (e.g. server + database on Railway or Render,
client on Vercel) — that's a separate, follow-up setup.
