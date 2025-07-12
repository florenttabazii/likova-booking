document.addEventListener('DOMContentLoaded', async () => {
  const overlay = document.getElementById('slots-loading-overlay');
  if (overlay) overlay.style.display = 'flex';

  try {
    await loadTodaySlots();
  } catch (err) {
    console.error('❌ Failed to load slots:', err);
  } finally {
    if (overlay) overlay.style.display = 'none';
  }
});

async function loadTodaySlots() {
  const today = new Date();
  const weekday = today.getDay();
  const formattedDate = today.toISOString().split('T')[0];

  const { data: barberList } = await supabase
    .from('barbers')
    .select('id, slot_interval_minutes')
    .limit(1);

  const barberId = barberList?.[0]?.id;
  const interval = barberList?.[0]?.slot_interval_minutes;

  if (!barberId || !interval) return;

  const { data: hours } = await supabase
    .from('barber_working_hours')
    .select('start_time, end_time')
    .eq('barber_id', barberId)
    .eq('weekday', weekday)
    .single();

  const { data: taken } = await supabase
    .from('availability')
    .select('hour')
    .eq('barber_id', barberId)
    .eq('date', formattedDate)
    .eq('is_available', false);

  const takenHours = (taken || []).map((t) => t.hour.trim().slice(0, 5));

  const slots = [];
  let current = new Date();
  const [sh, sm] = hours.start_time.split(':').map(Number);
  const [eh, em] = hours.end_time.split(':').map(Number);
  current.setHours(sh, sm, 0, 0);
  const end = new Date();
  end.setHours(eh, em, 0, 0);

  while (current < end) {
    const hh = current.getHours().toString().padStart(2, '0');
    const mm = current.getMinutes().toString().padStart(2, '0');
    const time = `${hh}:${mm}`;
    const now = new Date();
    if (
      !takenHours.includes(time) &&
      !(today.toDateString() === now.toDateString() && current <= now)
    ) {
      slots.push(time);
    }
    current.setMinutes(current.getMinutes() + interval);
  }

  renderSlotButtons(slots, barberId);
}

function renderSlotButtons(slots, barberId) {
  const template = document.getElementById('slot-template')
  const container = document.getElementById('slot-buttons-container')
  container.innerHTML = ''

  // ✅ Show fallback message and button if no slots
  if (!slots.length) {
    container.innerHTML = '<p>Heute sind keine freien Slots verfügbar.</p>'
    const terminBtn = document.getElementById('termin-button')
    if (terminBtn) terminBtn.style.display = 'inline-block'
    return
  }

  slots.forEach((slot, i) => {
    const clone = template.cloneNode(true)
    clone.style.display = ''
    clone.id = ''

    // ✅ Remove unwanted animation classes to avoid opacity conflicts
    clone.querySelectorAll('.has-animation, .parallax-wrap, .parallax-element, .parallax-element-second')
      .forEach(el => {
        el.classList.remove('has-animation', 'parallax-wrap', 'parallax-element', 'parallax-element-second')
        el.removeAttribute('data-delay')
        el.style.opacity = '1'
      })

    // ✅ Force full color + remove transitions
    const buttonEl = clone.querySelector('.clapat-button')
    const borderEl = clone.querySelector('.button-border')
    const spanEl = clone.querySelector('span')

    if (buttonEl) {
      buttonEl.style.opacity = '1'
      buttonEl.style.filter = 'none'
    }
    if (borderEl) {
      borderEl.style.borderColor = '#000'
    }
    if (spanEl) {
      spanEl.style.color = '#000'
      spanEl.style.opacity = '1'
      spanEl.style.transition = 'none'
    }

    // ✅ Fill content
    const a = clone.querySelector('a')
    if (a) {
      a.href = `/booking/barber-selection?barber=${barberId}&time=${encodeURIComponent(slot)}`
      a.setAttribute('target', '_self')
    }

    if (spanEl) spanEl.textContent = slot
    if ((i + 1) % 5 === 0) clone.classList.add('last')
    container.appendChild(clone)
  })
}

