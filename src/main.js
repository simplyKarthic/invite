/* ========================================
   Wedding Invitation – Card Animations
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  // GSAP entrance animations
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Names
  tl.fromTo('.name-1',
    { opacity: 0, y: 40, scale: 0.9 },
    { opacity: 1, y: 0, scale: 1, duration: 1.2 }
  )
  .fromTo('.ampersand',
    { opacity: 0, scale: 0.5 },
    { opacity: 0.8, scale: 1, duration: 0.6 },
    '-=0.6'
  )
  .fromTo('.name-2',
    { opacity: 0, y: 40, scale: 0.9 },
    { opacity: 1, y: 0, scale: 1, duration: 1.2 },
    '-=0.4'
  )
  .fromTo('.heart-ornament',
    { opacity: 0, scale: 0 },
    { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' },
    '-=0.5'
  )

  // Invite message
  .fromTo('.invite-message p',
    { opacity: 0, y: 15 },
    { opacity: 1, y: 0, duration: 0.7, stagger: 0.2 },
    '-=0.2'
  )

  // First divider
  .fromTo('.divider',
    { opacity: 0, scaleX: 0 },
    { opacity: 0.8, scaleX: 1, duration: 0.6, stagger: 0.3 },
    '-=0.3'
  )

  // Event sections
  .fromTo('.event-section',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, stagger: 0.4 },
    '-=0.4'
  )

  // Footer
  .fromTo('.footer-message',
    { opacity: 0, y: 15 },
    { opacity: 1, y: 0, duration: 0.7 },
    '-=0.2'
  )

  // Buttons
  .fromTo('.btn',
    { opacity: 0, y: 10, scale: 0.9 },
    { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.4)' },
    '-=0.2'
  );

  // Corner decorations — subtle float in
  gsap.fromTo('.corner-decor',
    { opacity: 0, scale: 0.7 },
    { opacity: 1, scale: 1, duration: 1.5, ease: 'power2.out', stagger: 0.15, delay: 0.3 }
  );

  // Side vines
  gsap.fromTo('.side-vine',
    { opacity: 0 },
    { opacity: 0.6, duration: 2, delay: 1 }
  );

  // Calendar download
  document.getElementById('btn-calendar').addEventListener('click', downloadCalendar);
});

function downloadCalendar() {
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wedding//Invite//EN
BEGIN:VEVENT
DTSTART:20260422T183000
DTEND:20260422T220000
SUMMARY:Karthic & Prathyusha - Reception
LOCATION:Annalakshmi Banquet Hall, No. 6 Mayor Ramanathan Salai, Chetpet, Chennai
DESCRIPTION:Wedding Reception of Karthic & Prathyusha
END:VEVENT
BEGIN:VEVENT
DTSTART:20260423T073000
DTEND:20260423T090000
SUMMARY:Karthic & Prathyusha - Wedding Ceremony
LOCATION:MA Murugan Temple Mandapam, Maduravoyal, Chennai
DESCRIPTION:Wedding Ceremony of Karthic & Prathyusha
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'karthic-prathyusha-wedding.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
