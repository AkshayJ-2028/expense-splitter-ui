# Expense Splitter (Frontend)

React frontend for **Expense Splitter**, a Splitwise-style app for sharing group expenses. Create a group, add expenses, see who owes whom, and settle up with the fewest payments. An AI sentence box fills in the expense form for you.

**Live app:** https://expense-splitter-ui-three.vercel.app
**Backend repo:** https://github.com/AkshayJ-2028/Expense-Splitter

> The backend runs on a free Render plan and sleeps when idle. The first request after a quiet period can take up to a minute, and the login button shows "Please wait, server is starting..." while it wakes up.

## Features

- **Register and log in** with JWT authentication
- **Groups and members:** create groups, add members by email, and delete a group (creator only, with a confirmation prompt)
- **Light and dark mode:** a toggle on every screen. It follows your device setting at first, then remembers your choice.
- **Expenses with three split types:** equal, percent or exact amount, with a choice of who shares each expense
- **AI expense entry:** type a sentence like *"Dinner 1200 paid by me, split with Rahul"* and the form fills itself. You always review the draft before saving.
- **Balances and settle up:** see each member's balance and the shortest list of payments that clears all debts, and record payments as they happen
- **Cold-start friendly:** the app wakes the sleeping backend as soon as the login page opens

## Tech stack

React, Vite, React Router, Axios. Deployed on Vercel.

## Run locally

You need Node.js 18 or newer and the [backend](https://github.com/AkshayJ-2028/Expense-Splitter) running on port 8080.

```
git clone https://github.com/AkshayJ-2028/expense-splitter-ui.git
cd expense-splitter-ui
npm install
npm run dev
```

The app opens at http://localhost:5173 and talks to `http://localhost:8080` by default.

To use a different backend, create a `.env` file in the project root:

```
VITE_API_URL=https://your-backend.onrender.com
```

Use the address without a trailing slash. Restart `npm run dev` after changing it.

## Build

```
npm run build
```

The production files are created in `dist/`.

## Deployment

Deployed on Vercel from the `main` branch. Two settings matter:

- **`VITE_API_URL`** (environment variable): the address of the deployed backend. It is read at build time, so redeploy after changing it.
- **`vercel.json`**: rewrites every address to `index.html`, so refreshing a page such as `/login` works instead of showing a 404.

## How the app talks to the backend

All requests go through one Axios instance (`src/api.js`) that:

- sends requests to `VITE_API_URL` (or `http://localhost:8080`)
- attaches the saved JWT token as a `Bearer` header
- allows up to 90 seconds, so a sleeping backend has time to wake up

## Author

Akshay Kumar Jha · https://github.com/AkshayJ-2028
