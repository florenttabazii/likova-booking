import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zvxpnfltogquylvbhuwl.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2eHBuZmx0b2dxdXlsdmJodXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjgzMzEsImV4cCI6MjA2NDEwNDMzMX0.560hLnP86g0k125dL4h3G0QXq3b-pVV6Go29XX0QhbY'

export const supabase = createClient(supabaseUrl, supabaseKey)
