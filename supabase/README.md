# Living Cookbook

A calm, trust-first digital cookbook and kitchen command center that replaces recipe scrolling with guided cooking, household planning, and intelligent grocery management.

## Product Vision

Living Cookbook is designed to be a modern kitchen companion that focuses on the actual cooking experience rather than infinite scrolling. Built with a warm, bookish aesthetic and dyslexia-friendly design principles, it provides a distraction-free environment for managing recipes, planning meals, and organizing grocery shopping.

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Custom CSS with design token system
- **Deployment**: Web-first, mobile-responsive

## Design Philosophy

1. **Calm over Clutter** - Minimal UI, generous spacing, no infinite feeds
2. **Trust-First UX** - Clear actions, reversible changes, no dark patterns
3. **Kitchen Reality Wins** - Built for real cooking workflows
4. **Accessibility** - Dyslexia-friendly fonts, high contrast, large tap targets
5. **No Ads, No Tracking** - Privacy-respecting, subscription-based

## Project Structure

```
living-cookbook-web/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── RecipeCard.tsx
│   │   ├── MealPlanCalendar.tsx
│   │   └── GroceryList.tsx
│   ├── pages/              # Page-level components
│   │   ├── RecipeLibrary.tsx
│   │   ├── RecipeDetail.tsx
│   │   ├── MealPlanner.tsx
│   │   └── GroceryListPage.tsx
│   ├── services/           # API and business logic
│   │   ├── recipeService.ts
│   │   ├── mealPlanService.ts
│   │   └── groceryService.ts
│   ├── types/              # TypeScript definitions
│   │   └── recipe.ts
│   ├── styles/             # CSS modules and tokens
│   │   ├── tokens.css      # Design system variables
│   │   └── global.css
│   └── App.tsx
├── supabase/
│   └── migrations/         # Database schemas
└── package.json
```

## Completed Features

### ✅ Phase 0: Foundations (Completed)

**Design System**
- Token-based CSS architecture with design variables
- Warm, bookish aesthetic with serif headers and sans-serif body text
- Dyslexia-friendly fonts (OpenDyslexic, Lexend)
- Responsive spacing, color, and typography tokens
- Dark-mode ready color system

**Project Setup**
- React + TypeScript + Vite configuration
- Component architecture
- Routing structure
- Development workflow established

### ✅ Phase 1: Core Cooking MVP (Completed)

**Recipe Library**
- Grid-based recipe card layout
- Recipe filtering and search
- Beautiful card design with images, titles, and metadata
- Responsive layout (1-3 columns based on screen size)

**Recipe Detail Pages**
- Hero section with full-width recipe image
- Comprehensive recipe metadata (servings, time, difficulty)
- Organized ingredient lists with quantities and units
- Step-by-step cooking instructions
- Navigation between recipes

**Database Integration**
- Supabase project configured
- Complete database schema for recipes
- Recipe service layer with CRUD operations
- Sample recipes imported (Honey Butter Salmon, Pasta Marinara, Chocolate Chip Cookies, Hot Toddy, Scrambled Eggs)

**Recipe Data Structure**
Custom JSON template supporting:
- Multiple images and hero images
- Detailed metadata (prep time, cook time, servings, difficulty, cuisine)
- Structured ingredients with quantities, units, and preparation notes
- Atomic step-by-step instructions
- Tags and categories
- Dietary information
- Equipment requirements
- Storage and reheating instructions

### ✅ Phase 2: Planning & Groceries (Completed)

**Weekly Meal Planner**
- Calendar-based weekly view
- Add recipes to specific days
- Navigate between weeks (previous/next)
- Visual recipe cards in calendar slots
- Persistent meal plans in database
- Remove recipes from meal plan
- Clear and intuitive day/date display

**Grocery List System**
- Automatic ingredient aggregation from meal plans
- Intelligent quantity combining (e.g., "2 cups + 1 cup = 3 cups")
- Category-based organization (Proteins, Produce, Pantry, Dairy, Spices, etc.)
- Interactive checklist with real-time progress tracking
- Visual progress indicator
- Check/uncheck individual items
- Persistent grocery list state
- Week date range display

**Database Schema Updates**
- `meal_plans` table with user and week tracking
- `meal_plan_items` table linking recipes to specific days
- `grocery_lists` table with aggregated ingredients
- Row Level Security policies configured for development

## Current Status

**Last Completed**: Phase 2 - Meal Planning & Grocery Lists (Base Functionality)

The application now has a fully functional meal planning workflow:
1. Users can browse recipes in the library
2. View detailed recipe information
3. Add recipes to specific days in the weekly planner
4. Automatically generate grocery lists from planned meals
5. Check off items while shopping with progress tracking

**Database**: Connected to Supabase with temporary anonymous access for development
**Testing**: All features tested and working locally

## Development Workflow

1. **Container Development**: Features built in isolated container environment
2. **Packaging**: Code packaged as `.tar.gz` files
3. **Local Extraction**: Extracted to `E:/Programming/recipe-cooking-app/repo/living-cookbook-web`
4. **Testing**: Features tested locally with real Supabase connection
5. **Version Control**: Git commits after confirmed working features

## Supabase Configuration

**Project URL**: `https://lgzbrycabgvbvuvybxbh.supabase.co`

**Current Tables**:
- `recipes` - Recipe storage with JSON structure
- `meal_plans` - Weekly meal plan tracking
- `meal_plan_items` - Individual recipe-day assignments
- `grocery_lists` - Aggregated shopping lists

**Authentication**: Currently using anonymous access for development (will be replaced with proper auth in Phase 1 user accounts)

## Next Steps

The foundation is complete and ready for the next phase of development:

### Phase 2 Enhancements (Planned)
- Serving size scaling
- Recipe substitutions
- Meal plan templates
- "Repeat last week" functionality

### Phase 2.5: Altitude-Aware Cooking (Planned)
- Location-based elevation detection
- Recipe adjustments for high-altitude cooking
- UI indicators for altitude-adjusted recipes

### Phase 3: Households (Planned)
- Multi-user household creation
- Shared meal plans and grocery lists
- Member invitation system
- Subscription management

### Phase 4: Premium Volumes (Planned)
- Recipe volume marketplace
- One-time purchase system
- Volume landing pages
- Household sharing rules

### Phase 5: Personal Recipe Builder (Planned)
- Create and edit custom recipes
- Photo upload
- Structured ingredient and step entry
- Personal recipe library

## Design Tokens

The application uses a comprehensive design token system:

**Colors**
- Primary: Warm amber (#D97706)
- Secondary: Deep brown (#78350F)
- Neutral grayscale palette
- Semantic colors (success, warning, error)

**Typography**
- Headers: Serif (Crimson Text, Georgia fallback)
- Body: Dyslexia-friendly (OpenDyslexic, Lexend, system fallback)
- Type scale from xs to 3xl

**Spacing**
- 8px base unit
- Scale from xs (4px) to 6xl (96px)

**Component Patterns**
- Cards with subtle shadows
- Generous padding and margins
- High contrast for readability
- Large tap targets (minimum 44x44px)

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env.local` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Contributing

This is a personal project currently in active development. Features are being added in phases following the master build plan.

## License

Proprietary - All rights reserved

---

**Last Updated**: January 28, 2026
**Version**: 0.2.0 (Phase 2 Complete)
**Status**: Active Development
