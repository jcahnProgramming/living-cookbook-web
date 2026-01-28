# Supabase Migrations for Phase 3: Households

## Overview
These migrations set up the database schema for household functionality including shared meal plans and grocery lists.

## Migration Files

Run these in order in the Supabase SQL Editor:

### 1. `003_create_households_table.sql`
Creates the main households table with:
- Household name
- Owner reference
- Subscription status (trial, active, cancelled, expired)
- Trial end date (30 days from creation)
- Subscription end date
- Basic Row Level Security policies (owner-only for now)

### 2. `004_create_household_members_table.sql`
Creates the household_members junction table:
- Links users to households
- Stores member role (owner/member)
- Tracks who invited each member
- Ensures users can only join a household once

### 3. `004b_update_households_rls.sql` ⚠️ IMPORTANT
Updates households RLS policies to include members:
- Must run AFTER household_members table exists
- Allows members to view households they belong to
- Replaces the temporary owner-only policy

### 4. `005_create_household_invitations_table.sql`
Creates the household_invitations table:
- Stores pending invitations
- Unique token for invitation URLs
- 7-day expiration
- Tracks acceptance status

### 5. `006_add_household_to_meal_plans.sql`
Modifies existing meal_plans table:
- Adds household_id column (nullable)
- Updates RLS policies for shared access
- Backward compatible with personal meal plans

### 6. `007_add_household_to_grocery_lists.sql`
Modifies existing grocery_lists table:
- Adds household_id column (nullable)
- Updates RLS policies for shared access
- Backward compatible with personal grocery lists

## How to Run

### Option 1: Run All at Once
1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of ALL migration files
3. Paste into a new query
4. Click "Run"

### Option 2: Run One by One (Recommended)
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `003_create_households_table.sql`
3. Paste and run ✅
4. Copy contents of `004_create_household_members_table.sql`
5. Paste and run ✅
6. Copy contents of `004b_update_households_rls.sql` ⚠️ Important!
7. Paste and run ✅
8. Copy contents of `005_create_household_invitations_table.sql`
9. Paste and run ✅
10. Copy contents of `006_add_household_to_meal_plans.sql`
11. Paste and run ✅
12. Copy contents of `007_add_household_to_grocery_lists.sql`
13. Paste and run ✅

## Verification

After running migrations, verify in Supabase Dashboard → Database → Tables:

You should see:
- ✅ households (new)
- ✅ household_members (new)
- ✅ household_invitations (new)
- ✅ meal_plans (with household_id column added)
- ✅ grocery_lists (with household_id column added)

## Row Level Security

All tables have RLS enabled with policies:
- **households**: Users can view/manage households they own or belong to
- **household_members**: Users can view members of their households
- **household_invitations**: Household owners can manage invitations
- **meal_plans**: Users can access personal AND household meal plans
- **grocery_lists**: Users can access personal AND household grocery lists

## Rollback (if needed)

If you need to undo these migrations:

```sql
-- Drop in reverse order
DROP TABLE IF EXISTS household_invitations CASCADE;
DROP TABLE IF EXISTS household_members CASCADE;
DROP TABLE IF EXISTS households CASCADE;

-- Remove household_id columns
ALTER TABLE meal_plans DROP COLUMN IF EXISTS household_id;
ALTER TABLE grocery_lists DROP COLUMN IF EXISTS household_id;

-- Restore original RLS policies (you'll need to recreate the original ones)
```

## Next Steps

After running migrations:
1. Verify tables exist in Supabase Dashboard
2. Test RLS policies
3. Proceed to frontend implementation
