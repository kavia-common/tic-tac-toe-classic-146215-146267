# Tic Tac Toe • Qwik • Ocean Professional

A modern, accessible Tic Tac Toe game built with Qwik and Qwik City.

Features:
- Ocean Professional theme: blue primary (#2563EB), amber accent (#F59E0B), white surface, subtle gradients/shadows
- Responsive layout (mobile and desktop)
- Accessible: ARIA roles, live region updates, focus styles, keyboard-friendly
- Smooth transitions and interactive hover states
- Frontend-only state management (no backend)

Scripts:
- npm start – run dev server with SSR
- npm run build – production build
- npm run preview – preview production build locally

How to play:
- Click a square to place your mark (X starts by default)
- Status area shows the current turn and outcome
- Use “Restart” to reset the current round
- Use “New Game” to randomize the first player and reset the board

Accessibility:
- Board uses role="grid" and gridcell semantics
- Live region announces wins and draws
- Buttons have clear focus rings and ARIA labels
