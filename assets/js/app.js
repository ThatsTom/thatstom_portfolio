(() => {
  'use strict';
  const core = window.PortfolioCore;
  if (!core) return;
  const { data, root, reducedMotion, whatsappLink, contactUrl } = core;
  let motionEnabled = core.motionEnabled;
  let animationContext;
  let hasAnimatedIntro = false;

  const toolkitMarquee = document.querySelector('.toolkit-marquee');
  let toolkitDrag;
  toolkitMarquee.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    toolkitDrag = { id: event.pointerId, x: event.clientX, scroll: toolkitMarquee.scrollLeft, active: false };
  });
  toolkitMarquee.addEventListener('pointermove', (event) => {
    if (!toolkitDrag || event.pointerId !== toolkitDrag.id) return;
    const distance = event.clientX - toolkitDrag.x;
    if (!toolkitDrag.active && Math.abs(distance) < 6) return;
    if (!toolkitDrag.active) {
      toolkitDrag.active = true;
      toolkitMarquee.setPointerCapture(event.pointerId);
      toolkitMarquee.classList.add('is-dragging');
    }
    toolkitMarquee.scrollLeft = toolkitDrag.scroll - distance;
    event.preventDefault();
  });
  function finishToolkitDrag(event) {
    if (!toolkitDrag || event.pointerId !== toolkitDrag.id) return;
    toolkitDrag = null;
    toolkitMarquee.classList.remove('is-dragging');
    if (toolkitMarquee.hasPointerCapture(event.pointerId)) toolkitMarquee.releasePointerCapture(event.pointerId);
  }
  toolkitMarquee.addEventListener('pointerup', finishToolkitDrag);
  toolkitMarquee.addEventListener('pointercancel', finishToolkitDrag);
  toolkitMarquee.addEventListener('dragstart', (event) => event.preventDefault());

  const aboutCycleHeading = document.querySelector('.about-cycle-heading');
  const aboutCycleLines = [...aboutCycleHeading.querySelectorAll('.about-cycle-live')];
  const aboutPhrases = [
    ['Vejo além', 'do código.'],
    ['Construo para', 'pessoas.'],
    ['Processos mais', 'simples.'],
    ['Possibilidades', 'maiores.'],
  ];
  let aboutHeadingVisible = false;
  let aboutCycleStarted = false;
  let aboutCycleTimer;
  let aboutPhraseIndex = 0;
  let aboutCharacterCount = 0;
  let aboutCyclePhase = 'typing';

  function renderAboutCycle() {
    const [first, second] = aboutPhrases[aboutPhraseIndex];
    aboutCycleLines[0].textContent = first.slice(0, aboutCharacterCount);
    aboutCycleLines[1].textContent = second.slice(0, Math.max(0, aboutCharacterCount - first.length));
    aboutCycleHeading.classList.toggle('is-accent', aboutPhraseIndex % 2 === 1);
    aboutCycleLines.forEach((line, index) => {
      line.classList.toggle('has-caret', !aboutCycleHeading.classList.contains('is-static') &&
        index === (aboutCharacterCount <= first.length ? 0 : 1));
    });
  }

  function stepAboutCycle() {
    aboutCycleTimer = undefined;
    if (!motionEnabled || reducedMotion.matches) return;
    const phraseLength = aboutPhrases[aboutPhraseIndex].join('').length;
    if (aboutCyclePhase === 'typing') {
      aboutCharacterCount += 1;
      renderAboutCycle();
      if (aboutCharacterCount < phraseLength) {
        aboutCycleTimer = setTimeout(stepAboutCycle, 72);
      } else {
        aboutCyclePhase = 'holding';
        aboutCycleTimer = setTimeout(stepAboutCycle, 1700);
      }
    } else if (aboutCyclePhase === 'holding') {
      aboutCyclePhase = 'erasing';
      aboutCycleTimer = setTimeout(stepAboutCycle, 38);
    } else {
      aboutCharacterCount -= 1;
      if (aboutCharacterCount === 0) {
        aboutPhraseIndex = (aboutPhraseIndex + 1) % aboutPhrases.length;
        aboutCyclePhase = 'typing';
        renderAboutCycle();
        aboutCycleTimer = setTimeout(stepAboutCycle, 240);
      } else {
        renderAboutCycle();
        aboutCycleTimer = setTimeout(stepAboutCycle, 38);
      }
    }
  }

  function startAboutCycle() {
    if (!aboutHeadingVisible || !motionEnabled || reducedMotion.matches || aboutCycleTimer) return;
    aboutCycleHeading.classList.remove('is-waiting', 'is-static');
    if (!aboutCycleStarted) {
      aboutCycleStarted = true;
      aboutPhraseIndex = 0;
      aboutCharacterCount = 0;
      aboutCyclePhase = 'typing';
      renderAboutCycle();
    }
    aboutCycleTimer = setTimeout(stepAboutCycle, 72);
  }

  function stopAboutCycle() {
    clearTimeout(aboutCycleTimer);
    aboutCycleTimer = undefined;
    aboutCycleStarted = false;
    aboutPhraseIndex = 0;
    aboutCharacterCount = aboutPhrases[0].join('').length;
    aboutCyclePhase = 'typing';
    aboutCycleHeading.classList.remove('is-waiting');
    aboutCycleHeading.classList.add('is-static');
    renderAboutCycle();
  }

  if (motionEnabled && !reducedMotion.matches) aboutCycleHeading.classList.add('is-waiting');
  if ('IntersectionObserver' in window) {
    const typingObserver = new IntersectionObserver(([entry], observer) => {
      if (!entry.isIntersecting) return;
      aboutHeadingVisible = true;
      startAboutCycle();
      observer.disconnect();
    }, { threshold: .25 });
    typingObserver.observe(aboutCycleHeading);
  } else {
    const checkAboutHeading = () => {
      const bounds = aboutCycleHeading.getBoundingClientRect();
      if (bounds.top >= innerHeight || bounds.bottom <= 0) return;
      aboutHeadingVisible = true;
      startAboutCycle();
      window.removeEventListener('scroll', checkAboutHeading);
    };
    window.addEventListener('scroll', checkAboutHeading, { passive: true });
    checkAboutHeading();
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearTimeout(aboutCycleTimer);
      aboutCycleTimer = undefined;
    } else {
      startAboutCycle();
    }
  });

  document.querySelectorAll('[data-contact]').forEach((link) => {
    if (link.dataset.contact === 'phone') {
      link.href = `tel:+${data.contacts.whatsappNumber}`;
      link.textContent = data.contacts.phoneDisplay;
    } else {
      link.href = contactUrl(link.dataset.contact);
    }
  });
  document.querySelectorAll('[data-contact-display="phone"]').forEach((element) => {
    element.textContent = data.contacts.phoneDisplay;
  });
  document.querySelectorAll('[data-contact-message]').forEach((link) => {
    link.href = whatsappLink(data.contacts.introMessage);
  });
  const personScript = document.querySelector('#person-structured-data');
  const person = JSON.parse(personScript.textContent);
  person.telephone = `+${data.contacts.whatsappNumber}`;
  person.sameAs = [data.contacts.github, data.contacts.linkedin, data.contacts.instagram];
  personScript.textContent = JSON.stringify(person);

  const menuToggle = document.querySelector('#menu-toggle');
  const nav = document.querySelector('#main-nav');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') { setMenu(false); menuToggle.focus(); }
  });
  document.addEventListener('click', (event) => { if (!event.target.closest('.site-header')) setMenu(false); });
  window.matchMedia('(min-width: 701px)').addEventListener('change', (event) => { if (event.matches) setMenu(false); });

  const visibleSections = new Map();
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visibleSections.set(entry.target.id, entry.isIntersecting));
      const activeSection = [...visibleSections].find(([, visible]) => visible)?.[0];
      nav.querySelectorAll('a').forEach((link) => {
        const active = link.getAttribute('href') === `#${activeSection}`;
        link.classList.toggle('is-current', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-15% 0px -62% 0px', threshold: 0 });
    document.querySelectorAll('main > section[id]').forEach((section) => sectionObserver.observe(section));
    const contactObserver = new IntersectionObserver(([entry]) => document.querySelector('.floating-contact').classList.toggle('is-hidden', entry.isIntersecting), { threshold: .1 });
    contactObserver.observe(document.querySelector('#contato'));
  }

  const copyButton = document.querySelector('#copy-phone');
  let copyTimer;
  copyButton.addEventListener('click', async () => {
    const value = data.contacts.phoneDisplay.replace(/[()]/g, '');
    let success = false;
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(value); success = true; }
    } catch {}
    if (!success) {
      const helper = document.createElement('textarea');
      helper.value = value;
      helper.setAttribute('aria-label', 'Número de telefone para copiar');
      helper.style.cssText = 'position:fixed;left:-9999px;top:0;';
      document.body.append(helper);
      helper.select();
      try { success = document.execCommand('copy'); } catch {}
      helper.remove();
      copyButton.focus({ preventScroll: true });
    }
    clearTimeout(copyTimer);
    document.querySelector('#copy-status').textContent = success ? 'Número copiado!' : 'Selecione o número ao lado para copiar.';
    copyTimer = setTimeout(() => { document.querySelector('#copy-status').textContent = ''; }, 5000);
  });

  let scrollFrame = false;
  function updateScroll() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    document.querySelector('.scroll-progress').style.transform = `scaleX(${progress})`;
    scrollFrame = false;
  }
  core.updateScroll = updateScroll;
  window.addEventListener('scroll', () => { if (!scrollFrame) { scrollFrame = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  document.querySelectorAll('details').forEach((details) => details.addEventListener('toggle', () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); updateScroll(); }));
  if ('ResizeObserver' in window) {
    let layoutFrame = false;
    const layoutObserver = new ResizeObserver(() => {
      if (layoutFrame) return;
      layoutFrame = true;
      requestAnimationFrame(() => {
        layoutFrame = false;
        if (window.ScrollTrigger) ScrollTrigger.refresh();
        updateScroll();
      });
    });
    layoutObserver.observe(document.querySelector('main'));
  }

  function setupAnimations() {
    if (animationContext) animationContext.revert();
    if (!motionEnabled || !window.gsap) return;
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    animationContext = gsap.context(() => {
      if (!hasAnimatedIntro) {
        gsap.from('.cover-title > span', { y: 28, opacity: 0, duration: .85, stagger: .10, ease: 'power3.out', clearProps: 'transform,opacity' });
        gsap.from('.cover-overline, .cover-description, .cover-actions', { y: 12, opacity: 0, duration: .55, stagger: .08, delay: .22, ease: 'power2.out', clearProps: 'transform,opacity' });
        gsap.from('.cover-control', { x: 20, opacity: 0, duration: .7, delay: .25, ease: 'power2.out', clearProps: 'transform,opacity' });
        hasAnimatedIntro = true;
      }
      if (window.ScrollTrigger) {
        gsap.to('.cover-circuit', { y: 75, scale: 1.07, ease: 'none', scrollTrigger: { trigger: '.cover-section', start: 'top top', end: 'bottom top', scrub: .7 } });
        gsap.to('.cover-grid-layer', { y: 55, ease: 'none', scrollTrigger: { trigger: '.cover-section', start: 'top top', end: 'bottom top', scrub: .7 } });
        gsap.to('.cover-main', { y: -36, opacity: .56, ease: 'none', scrollTrigger: { trigger: '.cover-section', start: 'top top', end: 'bottom top', scrub: .5 } });
        gsap.to('.cover-control', { y: 22, ease: 'none', scrollTrigger: { trigger: '.cover-section', start: 'top top', end: 'bottom top', scrub: .6 } });
        gsap.to('.contact-grid-bg', { y: 40, ease: 'none', scrollTrigger: { trigger: '.contact-section', start: 'top bottom', end: 'bottom top', scrub: .7 } });
        gsap.utils.toArray('.reveal').forEach((element) => {
          if (element.getBoundingClientRect().bottom < 0) return;
          gsap.from(element, { y: 24, opacity: 0, immediateRender: false, duration: .65, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 94%', once: true }, clearProps: 'transform,opacity' });
        });
      }

    });
  }
  function applyMotion() {
    core.motionEnabled = motionEnabled;
    root.dataset.motion = motionEnabled ? 'on' : 'off';
    if (!motionEnabled || reducedMotion.matches) stopAboutCycle();
    else if (aboutHeadingVisible) startAboutCycle();
    else { aboutCycleHeading.classList.remove('is-static'); aboutCycleHeading.classList.add('is-waiting'); }
    const toggle = document.querySelector('#motion-toggle');
    toggle.setAttribute('aria-pressed', String(motionEnabled));
    document.querySelector('#motion-label').textContent = motionEnabled ? 'Pausar animações' : 'Ativar animações';
    toggle.querySelector('.motion-symbol').textContent = motionEnabled ? 'Ⅱ' : '▷';
    setupAnimations();
    window.dispatchEvent(new CustomEvent('portfolio:motion', { detail: { enabled: motionEnabled } }));
  }
  document.querySelector('#motion-toggle').addEventListener('click', () => {
    motionEnabled = !motionEnabled;
    try { sessionStorage.setItem('thomas-portfolio-motion', motionEnabled ? 'on' : 'off'); } catch {}
    applyMotion();
  });
  reducedMotion.addEventListener('change', (event) => { motionEnabled = !event.matches; applyMotion(); });
  applyMotion();
  updateScroll();
  if (document.fonts) document.fonts.ready.then(() => { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
})();
