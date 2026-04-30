import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = "https://xbufqtzlwntrubowxpin.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhidWZxdHpsd250cnVib3d4cGluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNjExNTMsImV4cCI6MjA5MjkzNzE1M30.TT1t7UdgZNuZoLToWqSAaH-BWKJYIEb3K4DJdo0UO8c";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
