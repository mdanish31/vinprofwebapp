/*
  # Create enquiries table

  ## Purpose
  Stores contact/join enquiries submitted from the Investor, Inventor, and Advisor portal pages.

  ## New Tables
  - `enquiries`
    - `id` (uuid, primary key)
    - `full_name` (text) — submitter's full name
    - `email` (text) — submitter's email address
    - `phone` (text) — submitter's phone number
    - `category` (text) — one of: Investor, Inventor, Advisor
    - `message` (text) — free-text message from the submitter
    - `created_at` (timestamptz) — submission timestamp

  ## Security
  - RLS enabled
  - Anyone (including unauthenticated users) can INSERT their own enquiry
  - Only authenticated users with the service role can SELECT (admin access only)
*/

CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Investor',
  message text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an enquiry"
  ON enquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
