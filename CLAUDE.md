# Living Cookbook Web

A React TypeScript recipe management web application with meal planning, grocery lists, and cooking mode features.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Routing**: React Router 7
- **State Management**: Zustand
- **Backend**: Supabase
- **Styling**: CSS with design tokens (CSS custom properties)

## Project Structure

```
src/
  App.tsx              # Root component with route definitions
  main.tsx             # Application entry point
  components/
    layout/            # Layout components (MainLayout, etc.)
  pages/               # Route page components
  styles/
    tokens.css         # Design system tokens
    global.css         # Global styles
  types/
    index.ts           # TypeScript type definitions
```

## Path Aliases

Configured in `vite.config.ts`:
- `@/` - `./src`
- `@/components` - `./src/components`
- `@/features` - `./src/features`
- `@/lib` - `./src/lib`
- `@/types` - `./src/types`
- `@/styles` - `./src/styles`

## Commands

- `npm run dev` - Start development server on port 3000
- `npm run build` - Type check and build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint on src directory

## Design System

Uses CSS custom properties defined in `src/styles/tokens.css`:
- Color palette: Warm, bookish theme with brown/cream tones
- Typography: Dyslexia-friendly fonts with OpenDyslexic support
- Spacing, shadows, borders, and z-index scales
- Theme variants: light (default), dark, high-contrast

Key semantic colors:
- `--color-primary-500`: Main brand color (#8B4513)
- `--color-secondary-500`: Accent color (#D2691E)
- `--color-background`: Page background
- `--color-surface`: Card/component backgrounds

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Home | Homepage |
| `/library` | Library | Recipe library/search |
| `/recipe/:id` | RecipeDetail | Single recipe view |
| `/cook/:id` | CookingMode | Full-screen cooking mode (no nav) |
| `/plan` | Plan | Meal planning |
| `/grocery` | Grocery | Grocery list management |
| `/kitchen` | MyKitchen | User's kitchen inventory |
| `/household` | Household | Household member management |
| `/marketplace` | Marketplace | Recipe marketplace |
| `/settings` | Settings | User settings |

## Type Definitions

Core types in `src/types/index.ts`:
- `Recipe` - Full recipe with steps, ingredients, timers
- `CookingSession` - Active cooking state with timers
- `MealPlan` / `MealPlanItem` - Meal planning
- `GroceryListItem` / `AggregatedGroceryList` - Shopping lists
- `User` / `AuthState` - Authentication
