-- Migration: Create household_invitations table
-- Description: Stores pending household invitations
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS household_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_household_invitations_household_id ON household_invitations(household_id);
CREATE INDEX idx_household_invitations_token ON household_invitations(token);
CREATE INDEX idx_household_invitations_email ON household_invitations(email);

-- Enable Row Level Security
ALTER TABLE household_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Household members can view invitations for their household
CREATE POLICY "Household members can view invitations"
  ON household_invitations FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Household owners can create invitations
CREATE POLICY "Household owners can create invitations"
  ON household_invitations FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT id FROM households WHERE owner_id = auth.uid()
    ) AND invited_by = auth.uid()
  );

-- Household owners can delete invitations
CREATE POLICY "Household owners can delete invitations"
  ON household_invitations FOR DELETE
  USING (
    household_id IN (
      SELECT id FROM households WHERE owner_id = auth.uid()
    )
  );

-- Anyone can view invitations by token (for accepting)
CREATE POLICY "Anyone can view invitations by token"
  ON household_invitations FOR SELECT
  USING (true);

-- Add comment for documentation
COMMENT ON TABLE household_invitations IS 'Stores pending invitations for users to join households';
COMMENT ON COLUMN household_invitations.token IS 'Unique token used in invitation URL';
COMMENT ON COLUMN household_invitations.expires_at IS 'When this invitation expires (7 days from creation)';
COMMENT ON COLUMN household_invitations.accepted_at IS 'When the invitation was accepted (null if pending)';
