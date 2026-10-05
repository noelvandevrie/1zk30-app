# Oude Gracht-West Samen — Prototype Design

Working name; change freely.

## Context

- **Neighbourhood:** Oude Gracht-West, ~1,500 households.
- **Problem:** residents feel socially disconnected from each other. Today there is only a seasonal newsletter.
- **Long-term vision:** a commercial product that scales to many neighbourhoods. **This prototype hardcodes one neighbourhood** and builds nothing for multiple neighbourhoods.
- **This deliverable:** a frontend-only demo prototype for a course, built solo, tested with residents.

## Goals

Success (long term) is measured by:

1. More residents turning up at events in person.
2. Residents helping each other (lending, small favours, lifts).

The demo should answer two questions:

1. **Would residents post things themselves?** (events, help requests and offers)
2. **Does seeing who else is going make them more likely to attend?**

## Demo format

- First a presentation (we click through), then hands-on use: residents open the URL on their own phones, possibly with small tasks to do.
- The URL is shared via a QR code on the presentation slides.

## Tech

- Plain **HTML, CSS and JS**. No framework, no build step, **no backend**.
- Mobile-first; phones are the target device.
- All starting content lives in **one content file** (`data.js` / `data.json`) that teammates can edit without touching app code.
- Event dates are **relative to today** (e.g. `+3 days`), so the content never looks stale.
- Hosted on **GitHub Pages**.
- Interface language: **Dutch**.

## Identity

- On first open, a **welcome screen** asks for first name and street, stored on the phone.
- Used for "Jij en 8 anderen gaan" and as the author on posts.

## Navigation

Bottom tab bar:

| Tab | Content |
|---|---|
| **Overzicht** | Mixed feed: upcoming events, newest help posts, short news items |
| **Agenda** | Event list |
| **Hulpbord** | Help requests and offers |
| **Plaatsen (+)** | Create a post |

A small profile card (name, street, one line) is reachable from the header.

## Features

### Events (Agenda)
- A single **"Ik ga"** toggle (no "Misschien"/"Niet", no calendar export).
- Shows avatars and names of who's going: "Jij en 8 anderen gaan".

### Help board (Hulpbord)
- Requests ("Wie kan mijn ladder lenen?") and offers ("Ik kan zaterdag boodschappen doen").
- **"Ik help!"** shows a confirmation ("Petra is op de hoogte, ze neemt contact met je op") and the post shows "1 buur reageerde".
- No fake chat, no real messaging, no WhatsApp links.

### News
- Short updates posted only by the association or municipality (residents can't post news).
- Longer stories (resident portraits, local shops, history) expand inside news cards. There is no separate articles section.

### Posting (Plaatsen)
- Types: **Activiteit**, **Hulpvraag**, **Hulpaanbod**.
- 3–4 fields per form, **no photo upload**; each post gets a category icon.
- New posts appear in the feed **on that phone only**.

## Persistence and reset

- Posts, RSVPs and the tester's name are saved in the phone's browser (`localStorage`), so they survive a refresh.
- Nothing is shared between phones (by design: there is no backend).
- **Hidden reset** (`?reset` in the URL, or tapping the logo five times) wipes everything back to the starting content, for use between testers.

## Content

- Real neighbourhood name (Oude Gracht-West), with **fictional neighbours**: no real people without consent.
- Realistic, made-up events, help posts and news.

## Visual style

- Warm and friendly, but not childish.
- High contrast, large text, large tap targets. Readable for all ages, since many older residents are expected.

## Open items

- [ ] **Street names and landmarks:** use real ones, or keep invented placeholders (they'll be clearly marked in the content file).
- [ ] **App name:** "Oude Gracht-West Samen" is a working name.
- [ ] **Repo:** run `git init`, create the GitHub repo and enable GitHub Pages.
