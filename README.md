# NIRBHAYA

## Backend and MacroDroid setup

Start the backend from the nested repository root:

```powershell
cd server
npm install
npm run dev
```

Copy `server/.env.example` to `server/.env` and configure `MONGODB_URI`,
`THINGSPEAK_READ_API_KEY` when the channel is private, and the three
MacroDroid webhook URLs:

```env
MACRODROID_DANGER_WEBHOOK_URL=
MACRODROID_AFRAID_WEBHOOK_URL=
MACRODROID_LOCATION_WEBHOOK_URL=
```

The webhook values are server-only and must never be added to React or committed.
The backend returns an unconfigured error when a trigger is requested without its
corresponding URL. Configure `MACRODROID_TRIGGER_TOKEN` for non-browser clients
before production; the existing frontend authentication is not yet a backend
authorization system.

In MacroDroid, add a Webhook/URL trigger to the existing danger, afraid, and
location macros using the corresponding URL. For the location macro, keep the
existing five-minute interval trigger and all existing actions: force a location
update, obtain valid coordinates, and upload latitude to ThingSpeak Field 5 and
longitude to Field 6 using the phone's ThingSpeak Write API Key. The webhook
trigger is an additional trigger for the same macro, not a replacement or a
duplicate macro. MacroDroid must provide the webhook URL; the backend cannot
create phone macros automatically.

The backend trigger endpoints are:

- `POST /api/macrodroid/danger`
- `POST /api/macrodroid/afraid`
- `POST /api/macrodroid/location`

They use timeout handling, per-client rate limiting, optional token
authorization, and MongoDB attempt recording when MongoDB is connected. A
successful response means only that MacroDroid accepted the webhook request; it
does not confirm SMS, phone-call, or physical-device notification delivery.

## Existing Vite template information

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
