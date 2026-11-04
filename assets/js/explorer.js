(() => {
  'use strict';
  const core = window.PortfolioCore;
  if (!core) return;
  const { data, escape, icon, tags, whatsappLink } = core;
  const areas = data.areas;
  const switcher = document.querySelector('.cover-switcher');
  document.querySelector('#area-count').textContent = `${String(Object.keys(areas).length).padStart(2, '0')} ÁREAS`;
  switcher.innerHTML = Object.entries(areas).map(([mode, item]) => `<button class="area-card" type="button" data-cover-mode="${mode}" aria-label="Selecionar ${escape(item.title)}" aria-pressed="false"><span class="area-card-index">${escape(item.code)}</span><span class="area-card-icon">${icon(item.icon)}</span><strong>${escape(item.cardTitle)}</strong><small>${escape(item.cardSubtitle)}</small></button>`).join('');

  let currentArea = 'software';
  function setArea(mode, origin) {
    const item = areas[mode];
    if (!item) return;
    currentArea = mode;
    document.querySelectorAll('[data-cover-mode]').forEach((button) => {
      const active = button.dataset.coverMode === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelector('#cover-stage').dataset.cover = mode;
    document.querySelector('#cover-diagram-name').textContent = item.diagramLabel;
    document.querySelector('#cover-readout-title').textContent = item.coverTitle;
    document.querySelector('#cover-readout-text').textContent = item.coverText;
    document.querySelector('#cover-readout-highlights').innerHTML = item.highlights.map((value) => `<span>${escape(value)}</span>`).join('');
    document.querySelector('#area-open-label').textContent = `Explorar ${item.cardTitle}`;
    document.querySelector('#area-open').setAttribute('aria-label', `Ver detalhes de ${item.title}`);
    if (core.motionEnabled && window.gsap && origin) {
      gsap.fromTo('.cover-readout', { opacity: .35, y: 7 }, { opacity: 1, y: 0, duration: .34, overwrite: true, clearProps: 'transform,opacity' });
      gsap.fromTo('#cover-diagram-name', { opacity: .25, scale: .88 }, { opacity: 1, scale: 1, duration: .35, overwrite: true, ease: 'power2.out', clearProps: 'transform,opacity' });
    }
  }
  document.querySelectorAll('[data-cover-mode]').forEach((button) => button.addEventListener('click', () => setArea(button.dataset.coverMode, 'cover')));


  const areaDialog = document.querySelector('#area-dialog');
  const areaDialogContent = document.querySelector('#area-dialog-content');
  const areaButton = document.querySelector('#area-open');
  let areaNextFocus;
  function closeArea() { if (areaDialog.open) areaDialog.close(); }
  function openArea() {
    const item = areas[currentArea];
    document.querySelector('#area-dialog-code').textContent = `APRESENTAÇÃO / ÁREA ${item.code}`;
    areaDialog.dataset.area = currentArea;
    areaDialogContent.innerHTML = `<p class="eyebrow">${escape(item.eyebrow)}</p><h2 id="area-dialog-title" tabindex="-1">${escape(item.headline)}</h2><p class="dialog-intro">${escape(item.pitch)}</p><div class="dialog-highlight"><strong>O que esta área pode entregar</strong><p>${escape(item.result)}</p></div><h3>Possibilidades de aplicação</h3><div class="dialog-module-grid">${item.examples.map(([title, description]) => `<article class="dialog-module-card"><h4>${escape(title)}</h4><p>${escape(description)}</p></article>`).join('')}</div><h3>Como a solução se conecta</h3><div class="dialog-flow">${item.flow.map((step,index) => `<span><i>${escape(step)}</i>${index < item.flow.length-1 ? icon('arrow') : ''}</span>`).join('')}</div><h3>Tecnologias e conceitos</h3>${tags(item.chips)}<div class="dialog-actions"><a class="button button-primary" href="${escape(whatsappLink(`Olá, Thomas! ${item.cta}.`))}" target="_blank" rel="noopener noreferrer">Conversar sobre esta área ${icon('chat')}</a><a class="button button-outline" href="#projetos" data-area-solutions>Ver soluções de ${escape(item.cardTitle)} ${icon('arrow')}</a></div>`;
    if (item.chipLabel) {
      [...areaDialogContent.querySelectorAll('h3')].find((heading) => heading.textContent === 'Tecnologias e conceitos').textContent = item.chipLabel;
    }
    if (item.note) {
      const note = document.createElement('p');
      note.className = 'dialog-note';
      note.textContent = item.note;
      areaDialogContent.querySelector('.dialog-actions').before(note);
    }
    document.body.classList.add('modal-open');
    areaDialog.showModal();
    areaDialog.scrollTop = 0;
    document.querySelector('#area-dialog-title').focus({ preventScroll: true });
  }
  areaButton.addEventListener('click', openArea);
  document.querySelector('#area-dialog-close').addEventListener('click', closeArea);
  areaDialog.addEventListener('click', (event) => {
    if (event.target !== areaDialog) return;
    const bounds = areaDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeArea();
  });
  areaDialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    (areaNextFocus || areaButton).focus({ preventScroll: true });
    areaNextFocus = null;
  });
  areaDialog.addEventListener('click', (event) => {
    if (!event.target.closest('[data-area-solutions]')) return;
    event.preventDefault();
    const filter = document.querySelector(`[data-filter="${areas[currentArea].projectFilter}"]`);
    if (filter) {
      filter.click();
      areaNextFocus = filter;
    }
    closeArea();
    document.querySelector('#projetos').scrollIntoView({ behavior: core.motionEnabled ? 'smooth' : 'auto' });
  });

  setArea('software');
})();
