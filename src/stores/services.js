import { defineStore } from 'pinia'
import { supabase } from '@/supabaseClient'

export const useServicesStore = defineStore('services', {
  state: () => ({
    services: [],
    selectedServices: [],
  }),

  getters: {
    groupedServices(state) {
      const groups = {}
      state.services.forEach((service) => {
        const section = service.section_title || 'Other'
        if (!groups[section]) {
          groups[section] = []
        }
        groups[section].push(service)
      })
      return groups
    },

    totalPrice(state) {
      return state.services
        .filter((s) => state.selectedServices.includes(s.id))
        .reduce((sum, s) => sum + (s.price || 0), 0)
    },

    selectedServicesDetails(state) {
      return state.services.filter((s) => state.selectedServices.includes(s.id))
    },
  },

  actions: {
    async fetchServices() {
      const { data, error } = await supabase
        .from('services')
        .select(
          `
          *,
          service_sections (
            section_title,
            is_active
          )
        `,
        )
        .eq('is_active', true)
        .order('name', { ascending: true })

      console.log('✅ fetchServices() called')
      console.log('✅ Services fetched from Supabase:', data)

      if (error) {
        console.error('Failed to fetch services:', error)
        return
      }

      this.services = (data || [])
        .filter(
          (service) =>
            service.is_active &&
            service.service_sections?.is_active === true,
        )
        .map((service) => ({
          ...service,
          section_title: service.service_sections?.section_title || 'Other',
        }))
    },

    toggleService(serviceId) {
      if (this.selectedServices.includes(serviceId)) {
        this.selectedServices = this.selectedServices.filter((id) => id !== serviceId)
      } else {
        this.selectedServices.push(serviceId)
      }
    },

    resetServices() {
      this.selectedServices = []
    },
  },

  persist: {
    storage: sessionStorage,
    paths: ['selectedServices'], // ✅ Persist only selections, not full service list
  },
})
