-- Add missing columns to the needs table
-- Run this in your Supabase SQL Editor

alter table needs 
add column if not exists is_anonymous boolean default false;

alter table needs 
add column if not exists urgency text default 'normal' check (urgency in ('low', 'normal', 'high', 'critical'));
