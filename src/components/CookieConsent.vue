<template>
  <div v-if="show" class="cookie-banner bg-light p-4 shadow-lg fixed-bottom w-100">
    <div class="container d-flex justify-content-between align-items-center">
      <div>
        <strong>Cookies:</strong> Wir verwenden Cookies für Analyse & Benutzerfreundlichkeit.
      </div>
      <div>
        <button class="btn btn-sm btn-secondary me-2" @click="rejectCookies">Ablehnen</button>
        <button class="btn btn-sm btn-primary" @click="acceptCookies">Akzeptieren</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CookieConsent',
  data() {
    return {
      show: false,
    }
  },
  mounted() {
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      this.show = true
    } else if (consent === 'accepted') {
      this.loadAnalytics()
    }
  },
  methods: {
    acceptCookies() {
      localStorage.setItem('cookieConsent', 'accepted')
      this.show = false
      this.loadAnalytics()
    },
    rejectCookies() {
      localStorage.setItem('cookieConsent', 'rejected')
      this.show = false
    },
    loadAnalytics() {
      const script = document.createElement('script')
      script.setAttribute('async', '')
      script.setAttribute('src', 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX')
      document.head.appendChild(script)

      window.dataLayer = window.dataLayer || []
      function gtag() { window.dataLayer.push(arguments) }
      gtag('js', new Date())
      gtag('config', 'G-XXXXXXXXXX')
    }
  }
}
</script>

<style scoped>
.cookie-banner {
  z-index: 9999;
}
</style>
