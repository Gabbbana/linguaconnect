# LinguaConnect app prototype

_Started 2026-07-10 01:30 UTC_

---

## User

Make an interactive prototype of an app of LinguaConnect

## Assistant

_[tool: questions_v2]_

## User

LinguaConnect — a language exchange app inspired by Tandem. Users log in, 
select a language they want to practice Spanish.
and get matched in real time with another online user who wants to 
practice the same language. Once matched, they chat via text (voice/video 
planned for a later phase).

Core screens: login/signup, language selection, a screen showing online 
users available to match with, and a real-time chat interface.

Style: clean, modern, warm and approachable — not corporate. Should feel 
inviting for people practicing a language with strangers, similar in 
spirit to Duolingo's friendliness but for live conversation instead of 
lessons.

## Assistant



## User

LinguaConnect — a language exchange app inspired by Tandem. Users log in, 
select a language they want to practice English
and get matched in real time with another online user who wants to 
practice the same language. Once matched, they chat via text (voice/video 
planned for a later phase).

Core screens: login/signup, language selection, a screen showing online 
users available to match with, and a real-time chat interface.

Style: clean, modern, warm and approachable — not corporate. Should feel 
inviting for people practicing a language with strangers, similar in 
spirit to Duolingo's friendliness but for live conversation instead of 
lessons.

## Assistant

_[tool: copy_starter_component]_

_[tool: read_file]_

_[tool: dc_write]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

**LinguaConnect prototype** is live — try the whole flow in the phone: log in, pick English, tap a partner (or "Match me with someone"), then chat — Maya replies with typing indicators and even corrects your grammar.

Next steps worth considering: a profile/streak screen, voice-call UI placeholder, or 2–3 visual variations of the partner cards. Want any of those?

## User

change the language rooms to choose only English and spanish

## Assistant

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Done — the picker now offers only English and Spanish.

## User

Instead of chatting, make calls to connect immediately with someone available and start the conversation. Simple as that.

## Assistant

_[tool: copy_files]_

Saved the chat version as a backup, now converting the main file to instant voice calls.

_[tool: dc_write]_

_[tool: ready_for_verification]_

Chat is now a live voice call: tap a partner (or "Call someone now") → calling animation → in-call screen with running timer, animated voice waves, mute/speaker toggles, an ice-breaker prompt, and End call. The old chat version is preserved as "LinguaConnect (text chat version).dc.html".
