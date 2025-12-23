import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kgswlhiolxopunygghrs.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnc3dsaGlvbHhvcHVueWdnaHJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc1NDA5OSwiZXhwIjoyMDc2MzMwMDk5fQ.76sStGVfwtts9rGy6d1bePmU6djMFw8jtP721H5QxBg'
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase