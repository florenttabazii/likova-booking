// src/composables/useDatabaseUsage.js
import { ref } from 'vue'
import { supabase } from '@/supabaseClient'

export function useDatabaseUsage() {
  const usagePercent = ref(null)
  const estimatedMB = ref(null)

  const rowSizes = {
    bookings: 1200, // bytes
    booking_services: 400,
    barbers: 1000,
    services: 600,
  }

  const fetchUsage = async () => {
    let totalBytes = 0

    for (const [table, sizePerRow] of Object.entries(rowSizes)) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error(`Error fetching row count for ${table}:`, error)
        continue
      }

      totalBytes += (count || 0) * sizePerRow
    }

    const usedMB = totalBytes / 1024 / 1024
    const maxMB = 500
    usagePercent.value = Math.min((usedMB / maxMB) * 100, 100).toFixed(1)
    estimatedMB.value = usedMB.toFixed(2)
  }

  return {
    usagePercent,
    estimatedMB,
    fetchUsage,
  }
}
