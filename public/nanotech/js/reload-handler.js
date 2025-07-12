document.addEventListener('DOMContentLoaded', () => {
  // Force reload even when clicking to the same page
  document.querySelectorAll('a.force-reload').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const url = this.getAttribute('href');

      if (window.location.pathname === new URL(url, window.location.origin).pathname) {
        // Same page — force a hard reload
        window.location.reload();
      } else {
        // Different page — navigate normally
        window.location.href = url;
      }
    });
  });

  // Dynamic data loader
  const container = document.getElementById('dynamic-content');
  if (container) {
    fetch('/api/data') // change to your real API
      .then(res => res.json())
      .then(data => {
        container.innerHTML = data.message || 'No data found.';
      })
      .catch(err => {
        console.error('Failed to load dynamic data:', err);
      });
  }
});
