const svg = (body, size = 20, extra = '') =>
  `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${body}</svg>`;

export const icons = {
  search: (s) => svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', s),
  menu: (s) => svg('<path d="M4 7h16M4 12h16M4 17h16"/>', s),
  close: (s) => svg('<path d="M6 6l12 12M18 6 6 18"/>', s),
  play: (s) => svg('<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>', s),
  pause: (s) => svg('<rect x="7" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="13.5" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none"/>', s),
  headphones: (s) => svg('<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4.5" height="6.5" rx="1.5"/><rect x="16.5" y="14" width="4.5" height="6.5" rx="1.5"/>', s),
  share: (s) => svg('<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1"/>', s),
  link: (s) => svg('<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>', s),
  mail: (s) => svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>', s),
  x: (s) => svg('<path d="M4 4l16 16M20 4 4 20" stroke-width="1.8"/>', s),
  facebook: (s) => svg('<path d="M14.5 8H17V4.5h-2.5A4 4 0 0 0 10.5 8.5V11H8v3.5h2.5V21H14v-6.5h2.6L17 11h-3V9a1 1 0 0 1 1-1z" fill="currentColor" stroke="none"/>', s),
  whatsapp: (s) => svg('<path d="M4 20l1.2-4A8 8 0 1 1 8.4 19z"/><path d="M9 9.5c.5 2 2.5 4 4.5 4.6l1-1.1 1.8.8c-.2 1-1 1.7-2 1.7-3 0-6.2-3.2-6.2-6.2 0-1 .7-1.8 1.7-2l.8 1.8z" fill="currentColor" stroke="none"/>', s),
  linkedin: (s) => svg('<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M8 10.5V16M8 7.8v.1M11.5 16v-5.5M11.5 13a2.5 2.5 0 0 1 5 0v3"/>', s),
  arrow: (s) => svg('<path d="M5 12h14M13 6l6 6-6 6"/>', s),
  issues: (s) => svg('<rect x="4" y="3" width="12" height="16" rx="1.5"/><path d="M8 21h11a1 1 0 0 0 1-1V7"/><path d="M7 7h6M7 10.5h6"/>', s),
  audio: (s) => svg('<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4.5" height="6.5" rx="1.5"/><rect x="16.5" y="14" width="4.5" height="6.5" rx="1.5"/>', s),
  video: (s) => svg('<rect x="3" y="5.5" width="13" height="13" rx="2"/><path d="m16 10.5 5-3v9l-5-3z"/>', s),
  letter: (s) => svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>', s),
  check: (s) => svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>', s),
  back: (s) => svg('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>', s),
  rss: (s) => svg('<path d="M5 11a8 8 0 0 1 8 8M5 5a14 14 0 0 1 14 14"/><circle cx="6" cy="18" r="1.3" fill="currentColor"/>', s),
};
