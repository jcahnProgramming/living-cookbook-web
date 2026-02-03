# Living Cookbook Web Application

A calm, trust-first digital cookbook and kitchen command center that replaces recipe scrolling with guided cooking, household planning, and intelligent assistance.

## 🎯 Project Vision

Living Cookbook is designed to be:
- **Calm over clutter** - No ads, no infinite feeds, minimal distractions
- **Trust-first** - Clear controls, no silent changes
- **Kitchen reality wins** - Built for actual home cooking scenarios
- **Accessible** - Dyslexia-friendly fonts, WCAG AA compliant
- **Social yet private** - Connect with friends without the noise

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: CSS Variables (token-based theming)
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Routing**: React Router v6
- **Hosting**: Vercel

## 🎯 Current Development Status

**Version**: 0.7.0-alpha  
**Phase**: 6 Complete (Social Features + Privacy & Safety)  
**Next**: Phase 7 (Marketplace) or completing remaining Phase 6 items

### ✅ Completed Features

#### Phase 0: Foundations
- Project setup with Vite + React + TypeScript
- Token-based design system
- 5 theme system (including dark mode)
- Supabase integration
- Authentication (email + OAuth)

#### Phase 1: Core Cooking MVP
- User accounts with profiles
- Recipe library with filters
- Recipe detail pages
- Favorites system
- Personal notes on recipes

#### Phase 2: Planning & Groceries
- Weekly meal planner with calendar
- Smart grocery aggregation
- Interactive checklist
- Serving size scaling

#### Phase 3: Households
- Household creation & invites
- Shared meal planning
- Shared grocery lists
- Member management

#### Phase 6: Social Features ⭐
- OAuth social connections (Discord, Google, Facebook, etc.)
- Activity feed with meal posts
- Dashboard with friends' activity
- Likes system
- Friends system (requests & accepts)
- Comments on posts
- Multi-source avatar picker
- Smart polling (90% query reduction)
- Real-time notifications with bell icon
- Universal search (⌘K) for users, recipes, posts
- **Privacy & Safety System**:
  - Tabbed settings page (6 sections)
  - Privacy controls (visibility, permissions)
  - Notification preferences (13 types)
  - Blocked users management
  - Content reporting system
  - Muting system

### 🚧 Planned / In Progress

#### Phase 4: Premium Volumes
- Volumes catalog
- One-time purchases
- Household sharing

#### Phase 5: Personal Recipe Builder
- Custom recipe creation
- Photo uploads
- Sharing with friends

#### Phase 6.5: AI Pantry Assistant
- Ingredient scanning
- Recipe matching
- AI recipe generation

#### Phase 7: Marketplace
- Creator profiles
- Recipe selling
- Revenue tracking

#### Phase 8: Partner Creator Program
- Referral system
- Revenue sharing

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account

### Installation

```bash
# Clone & install
git clone <your-repo-url>
cd living-cookbook-web
npm install

# Configure environment
cp .env.example .env.local
# Add your Supabase credentials

# Run migrations (in Supabase SQL Editor)
# Execute files in /supabase/migrations/ in order

# Start dev server
npm run dev
```

## 🎨 Design System

### Themes
- 🌞 Warm Day (Default)
- 🌙 Cool Night (Dark)
- 🌳 Forest
- 🌸 Sakura
- ☕ Espresso

Toggle themes with the 🎨 icon in navigation.

### Typography
- **Headers**: Georgia (serif)
- **Body**: Verdana (sans-serif, dyslexia-friendly)
- Increased letter spacing for readability

### Key Principles
- Large tap targets (44px min)
- 8px baseline grid
- WCAG AA contrast (4.5:1)
- Mobile-first responsive

## 🗄️ Database Architecture

### Core Tables
- `users` - Accounts with privacy settings
- `recipes` - Recipe library
- `meal_plans` - Weekly planning
- `grocery_lists` - Smart lists
- `households` - Shared groups

### Social Tables
- `user_social_connections` - OAuth accounts
- `activity_feed` - Meal posts
- `activity_likes` - Post likes
- `activity_comments` - Comments
- `user_follows` - Following
- `friend_requests` - Friend system
- `friends` - Accepted friendships
- `notifications` - Real-time alerts

### Privacy & Safety Tables
- `user_blocks` - Blocked users
- `user_mutes` - Muted users  
- `content_reports` - Reports
- `notification_preferences` - User prefs
- `hidden_posts` - Hidden from feed

All tables use Row Level Security (RLS) policies.

## 🔒 Privacy & Safety

### User Controls
- Profile & post visibility (Public/Friends/Private)
- Friend request permissions
- Comment permissions
- Follower visibility
- Searchable toggle
- Online status toggle

### Notifications
- Email & push toggles
- Frequency control (Instant/Daily/Weekly)
- 13 granular notification types
- Enable/disable all

### Safety
- Block users
- Mute users
- Report content (spam, harassment, etc.)
- Hide posts from feed

## 🔍 Search System

- **Shortcut**: ⌘K / Ctrl+K
- Searches users, recipes, posts
- Real-time results (300ms debounce)
- Filter tabs: All / Users / Recipes / Posts

## 🔔 Notifications

- Real-time updates via Supabase
- Bell icon with unread count
- Dropdown notification center
- Mark as read
- Smart polling fallback (60s)

## 🚀 Performance

- **90% query reduction** with smart polling
- Indexed database columns
- Code splitting by route
- Lazy loading
- CSS minification

## 📱 Mobile Support

- Touch-friendly (44px tap targets)
- Responsive navigation
- Mobile-optimized layouts
- PWA ready (coming soon)

## 🌐 Browser Support

- Chrome/Edge 100+
- Firefox 100+
- Safari 15+
- Mobile browsers (iOS Safari 15+, Chrome Mobile)

## 🔐 Security

- Supabase Auth (email + OAuth)
- Row Level Security (RLS)
- HTTPS encrypted
- JWT tokens with auto-refresh
- CORS configured
- Rate limiting

## 🛠️ Development

### Scripts
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview build
npm run lint     # ESLint
```

### Commit Format
```
<type>: <description>

feat: Add new feature
fix: Bug fix
docs: Documentation
style: Formatting
refactor: Code restructure
test: Add tests
chore: Maintenance
```

## 📊 Project Stats

- **Lines of Code**: ~15,000+
- **Database Tables**: 18
- **UI Components**: 50+
- **Pages**: 15+
- **Themes**: 5
- **Features**: 30+

## 🎉 Recent Updates

### February 2026
- ✨ Privacy & Safety System (2,500+ lines)
- 🔍 Universal Search with ⌘K
- 🔔 Real-time Notifications
- 📊 Smart Polling (-90% queries)
- 👤 Avatar Picker (multi-source)
- 💬 Comments System
- 👥 Friends System
- ❤️ Likes System
- 📱 Activity Feed

### January 2026
- 🏠 Households
- 🛒 Smart Grocery Lists
- 📅 Meal Planner
- 📚 Recipe Library
- 🎨 Theme System
- 🔐 Authentication

## 📝 License

Internal project - All rights reserved

## 📧 Support

Create an issue in the repository for questions or feedback.

---

**Built with ❤️ for home cooks everywhere**  
**Last Updated**: February 3, 2026
