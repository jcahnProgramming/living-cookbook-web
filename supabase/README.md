# Supabase Setup Guide for Living Cookbook

## 📋 Prerequisites

- ✅ Supabase account created
- ✅ Project created: `living-cookbook`
- ✅ Credentials saved

## 🗄️ Step 1: Run Database Schema

1. **Go to Supabase SQL Editor**:
   - Open: https://supabase.com/dashboard/project/lgzbrycabgvbvuvybxbh/editor
   - Or navigate to: Your Project → SQL Editor

2. **Create a new query**:
   - Click "+ New query"

3. **Copy the schema**:
   - Open: `supabase/schema.sql` in your project
   - Copy the ENTIRE contents

4. **Paste and run**:
   - Paste into the SQL editor
   - Click "Run" (or press Ctrl+Enter)
   - Wait for success message

**Expected Output:**
```
NOTICE: Living Cookbook database schema created successfully!
NOTICE: Next steps:
NOTICE: 1. Run the seed data script to import sample recipes
NOTICE: 2. Test authentication in your app
NOTICE: 3. Start building the recipe library!
```

## 📊 Step 2: Import Sample Recipes

1. **Still in SQL Editor**:
   - Click "+ New query" (new tab)

2. **Copy the seed data**:
   - Open: `supabase/seed.sql` in your project
   - Copy the ENTIRE contents

3. **Paste and run**:
   - Paste into the SQL editor
   - Click "Run"

**Expected Output:**
```
NOTICE: Seed data imported successfully!
NOTICE: Total recipes in database: 5
NOTICE: You can now browse recipes in the app!
```

## 🔍 Step 3: Verify Data

1. **Go to Table Editor**:
   - Navigate to: Your Project → Table Editor

2. **Check the tables**:
   - Click "recipes" table
   - You should see 5 recipes:
     ✅ Honey Butter Salmon + Rice with Carrots
     ✅ Simple Pasta with Marinara
     ✅ Classic Chocolate Chip Cookies
     ✅ Hot Toddy
     ✅ Fluffy Scrambled Eggs

3. **Check other tables**:
   - `users` - Should have 1 system user
   - `favorites` - Empty (will populate when users favorite recipes)
   - `recipe_notes` - Empty (will populate when users add notes)

## ✅ Step 4: Test in Your App

1. **Make sure .env.local exists**:
   ```bash
   # In your project root
   ls .env.local
   ```

2. **Start dev server**:
   ```bash
   npm run dev
   ```

3. **Open browser**:
   - Should open automatically to: http://localhost:3000
   - No errors in console = success!

## 🔐 Step 5: Enable Authentication (Optional - Phase 1B)

For now, we'll build without auth. Later we'll enable:

1. **Email/Password** - Basic auth
2. **Social Logins** - Google, Facebook, Discord, TikTok

We'll tackle this after the recipe library is working!

## 🐛 Troubleshooting

### Error: "relation does not exist"
- **Solution**: Make sure schema.sql ran successfully first
- Check Table Editor to see if tables were created

### Error: "violates foreign key constraint"
- **Solution**: Make sure schema.sql ran before seed.sql
- Drop all tables and start over if needed

### Error: "duplicate key value"
- **Solution**: Seed data already imported
- This is fine! Recipes are already in database

### Can't see tables in Table Editor
- **Solution**: Refresh the page
- Or navigate away and back to Table Editor

## 📝 What We Created

### Tables:
- **users** - User profiles (extends auth.users)
- **recipes** - All recipe data with JSONB fields
- **favorites** - User favorite recipes
- **recipe_notes** - Personal notes on recipes

### Security:
- ✅ Row Level Security (RLS) enabled
- ✅ Policies for read/write access
- ✅ Public can read recipes
- ✅ Users can manage their own data

### Indexes:
- ✅ Fast search by tags
- ✅ Fast filter by difficulty/spice
- ✅ Fast sort by time

## 🚀 Next Steps

After database setup is complete:
1. Build recipe library page
2. Create recipe cards
3. Add search/filter
4. Build recipe detail page
5. Add favorites functionality

Ready to continue? Come back to the chat and say:
**"Database setup complete! Ready for recipe library!"**
