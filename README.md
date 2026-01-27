# Living Cookbook Web Application

A calm, trust-first digital cookbook and kitchen command center that replaces recipe scrolling with guided cooking, household planning, and intelligent assistance.

## 🎯 Project Vision

Living Cookbook is designed to be:
- **Calm over clutter** - No ads, no infinite feeds, minimal distractions
- **Trust-first** - Clear controls, no silent changes
- **Kitchen reality wins** - Built for actual home cooking scenarios
- **Accessible** - Dyslexia-friendly fonts, WCAG AA compliant

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: CSS Variables (token-based theming)
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Routing**: React Router v6
- **Hosting**: Vercel

## 📦 Project Structure

```
living-cookbook-web/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── layout/        # Layout components (Header, Footer, etc.)
│   │   └── ui/            # Base UI components (Button, Card, etc.)
│   ├── features/          # Feature-specific modules
│   ├── lib/               # Utilities, helpers, API clients
│   ├── pages/             # Page components (routes)
│   ├── styles/            # Global styles and tokens
│   │   ├── tokens.css     # Design tokens (colors, spacing, etc.)
│   │   └── global.css     # Global CSS reset and base styles
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main App component
│   └── main.tsx           # Application entry point
├── public/                # Static assets
├── index.html             # HTML entry point
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd living-cookbook-web
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🎨 Design System

The project uses a token-based theming system with CSS variables. All design tokens are defined in `src/styles/tokens.css`.

### Color Palette
- **Primary**: Warm browns (cookbook aesthetic)
- **Secondary**: Chocolate accents
- **Neutral**: Paper-like cream backgrounds
- **Success**: Natural olive green

### Typography
- **Headers**: Georgia (serif) - Warm, bookish feel
- **Body**: Verdana (sans-serif) - Dyslexia-friendly
- **Increased letter spacing**: Better readability

### Key Principles
- Large tap targets (min 44x44px)
- Generous spacing
- Minimal icons
- Card and shelf layouts
- WCAG AA contrast minimum

## 📋 Development Phases

### Phase 0: Foundations ✅ (CURRENT)
- [x] Project initialization
- [x] Design system setup
- [x] Type definitions
- [x] Basic routing structure
- [ ] Supabase setup
- [ ] Authentication system

### Phase 1: Core Cooking MVP (NEXT)
- [ ] User accounts
- [ ] Browse recipe library
- [ ] Recipe detail page
- [ ] Guided cooking mode
- [ ] Favorites
- [ ] Personal notes

### Phase 2: Planning & Groceries
- [ ] Weekly meal planner
- [ ] Grocery aggregation engine
- [ ] Serving size scaling

### Future Phases
- Phase 2.5: Altitude-Aware Cooking
- Phase 3: Households
- Phase 4: Premium Volumes
- Phase 5: Personal Recipe Builder
- Phase 6: AI Pantry Assistant
- Phase 6.5: Bakeware Intelligence
- Phase 7: Marketplace
- Phase 8: Partner Creator Program

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🧪 Testing

Coming soon...

## 📝 License

Internal project - All rights reserved

## 🤝 Contributing

This is a private project currently in development.

## 📧 Contact

For questions or feedback, please create an issue in the repository.

---

**Current Status**: Phase 0 (Foundations) - Setting up project structure
**Last Updated**: January 27, 2026
