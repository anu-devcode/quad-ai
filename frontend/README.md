# Fiduciary AI Frontend

A mobile-first React + Vite interface for:
- Landing experience
- Authentication flow
- User dashboard
- Admin operations dashboard

The UI is designed for phone-first interaction and progressively enhanced for tablet and desktop.

## Tech Stack
- React 19
- Vite 8
- Tailwind CSS
- React Router DOM

## Run Locally
```bash
npm install
npm run dev
```

## Build and Quality
```bash
npm run lint
npm run build
```

## Route Map
- / : Landing page
- /auth : Authentication page
- /dashboard/home : User dashboard home
- /dashboard/history : User transaction history
- /dashboard/send : User send money flow
- /dashboard/loan : User loan request flow
- /admin : Admin dashboard

Compatibility redirects:
- /dashboard -> /dashboard/home
- /dashboard/user -> /dashboard/home
- /dashboard/admin -> /admin

## Responsive Strategy
This app is mobile-first by default:
- Base styles target phone layouts first.
- Breakpoints scale spacing, typography, density, and layout progressively.
- Navigation behavior changes by device:
- Bottom nav is fixed on phone.
- Bottom nav becomes inline in content flow on desktop.
- Data-heavy admin views:
- Card list on mobile.
- Structured table on tablet/desktop.

## Manual Responsive QA Matrix
Validate these widths before merging UI changes:
- 320px: smallest mobile layout and CTA tap targets
- 360px: Android baseline
- 390px: modern iPhone baseline
- 414px: large phone
- 768px: tablet portrait
- 1024px: tablet landscape / small laptop
- 1280px: desktop baseline

Checklist per screen:
- No horizontal overflow
- No clipped fixed navigation
- Readable hierarchy (title, body, metadata)
- Buttons and links remain easily tappable
- Admin data remains usable without zooming

## Design Notes
- Fonts: Sora (display), Space Grotesk (body)
- Cards and controls use soft depth, rounded geometry, and clear state contrast
- Motion is subtle and supports reduced-motion preferences
