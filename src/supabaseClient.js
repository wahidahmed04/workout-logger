import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tmweagqoqbeludptnqpb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtd2VhZ3FvcWJlbHVkcHRucXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1ODU0NzMsImV4cCI6MjA3NDE2MTQ3M30.SDOJ_5ebKn4Ksakio2YoUhdA69MhDFSX0RXU4I2Ggyk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)