// stores/sidebar.js
import { defineStore } from 'pinia'

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    isCollapsed: false,
  }),
  actions: {
    toggle() {
      this.isCollapsed = !this.isCollapsed
    },
    collapse() {
      this.isCollapsed = true
    },
    expand() {
      this.isCollapsed = false
    },
  },
})
