(() => {
  'use strict';

  const data = window.PORTFOLIO;
  if (!data) return;
  const root = document.documentElement;
  root.classList.remove('has-custom-cursor');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const icon = (name, extra = '') => `<svg class="icon ${extra}" aria-hidden="true"><use href="#icon-${name}"/></svg>`;
  const tags = (values) => `<div class="tags">${values.map((value) => `<span>${escape(value)}</span>`).join('')}</div>`;
  const skillTags = (values) => `<div class="tags skill-tags">${values.map((value) => `<span>${escape(value)}</span>`).join('')}</div>`;
  const whatsappUrl = `https://wa.me/${data.contacts.whatsappNumber}`;
  const whatsappLink = (message) => `${whatsappUrl}?text=${encodeURIComponent(message)}`;
  const contactUrl = (kind) => kind === 'whatsapp' ? whatsappUrl : data.contacts[kind];
  let storedMotion = null;
  try { storedMotion = sessionStorage.getItem('thomas-portfolio-motion'); } catch {}
  const motionEnabled = storedMotion ? storedMotion === 'on' : !reducedMotion.matches;

  window.PortfolioCore = {
    data, root, reducedMotion, escape, icon, tags, skillTags, whatsappLink, contactUrl,
    motionEnabled,
    updateScroll() {}
  };
})();
