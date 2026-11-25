# DriveNow — premium car rental system (React + Vite)

A complete multi-page car rental experience with a customer-facing site and a full admin console.
All data is stored in `localStorage` so the demo persists between reloads — no backend required.

## Run it in VS Code

1. Extract the ZIP and open the `drivenow-react` folder.
2. Terminal → `npm install` → `npm run dev`.
3. Open the URL Vite prints (usually http://localhost:5173).

## Pages

| Route | What it does |
| --- | --- |
| `/` | Marketing home: hero availability search, category tiles, top-rated cars, how it works, reviews, FAQ |
| `/cars` | Full fleet with a filter rail (search, category, budget slider, seats, fuel, transmission, brand, availability) and sorting |
| `/cars/:category` | A dedicated filtered page for each type — `luxury`, `suv`, `sports`, `sedan`, `electric`, `muv` |
| `/car/:id` | Full detail page for every car: gallery, spec sheet, features, what is included, extras, live quote, reviews + review form, similar cars |
| `/checkout/:id` | Three-step checkout (trip → extras & driver → payment) with promo codes, taxes, deposit and confirmation |
| `/account` | Customer dashboard: overview, bookings (with cancel), saved cars, profile, verification documents |
| `/admin` | Admin console (password `admin123`): revenue KPIs, monthly chart, fleet CRUD, booking status management, customers, promo codes, review moderation |

## What was improved beyond the original single-page demo

- Real client-side routing with a shared layout and sticky navigation.
- Separate category pages plus a proper filter/sort system instead of four hardcoded buttons.
- A detail page per car — the original only had a modal.
- Live pricing engine: per-day maths, automatic 15% long-rental discount, extras, promo codes, 18% tax and a refundable deposit line.
- Availability-aware checkout, mock payment selection and a real confirmation screen with a booking ID.
- Customer accounts with persisted bookings, cancellation, favourites and document uploads.
- Admin analytics, fleet CRUD, booking status workflow, customer aggregation and promo management.
- Persistent state, favourites and demo data reset.
- Accessible forms, keyboard-focus styles, responsive layouts down to phone widths.

## Notes

Payments and document verification are simulated. To connect a real backend, replace the actions inside
`src/store.jsx` with API calls — every component consumes state through the `useApp()` hook.


## Start in VS Code (Windows)

1. Install Node.js LTS if it is not already installed.
2. Extract the ZIP. In VS Code choose **File → Open Folder** and select the `drivenow-react` folder (the one containing `package.json`).
3. Open **Terminal → New Terminal**.
4. Run `npm install` and wait for it to finish.
5. Run `npm run dev`.
6. Open the local URL printed in the terminal (normally `http://localhost:5173`).

To stop the server, press `Ctrl + C` in the terminal. Payments and admin data are demo-only; the admin demo password is `admin123`.
