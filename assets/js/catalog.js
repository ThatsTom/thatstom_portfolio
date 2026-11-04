(() => {
  'use strict';
  const core = window.PortfolioCore;
  if (!core) return;
  const { data, escape, icon, tags, skillTags, whatsappLink } = core;
  let modalTween;
  let lastModalTrigger;
  let modalNextFocus;

  const previews = {
    atalanta: `<div class="mini-window"><div class="mini-top"><span class="mini-dots"><i></i><i></i><i></i></span><span>atalanta / workspace</span><span>⌘</span></div><div class="mini-body"><div class="mini-sidebar"><div class="mini-brand">atalanta_</div><span class="mini-active">Visão geral</span><span>Comunicação</span><span>Processos</span><span>Informações</span></div><div class="mini-main"><p class="mini-greeting">Tudo conectado.</p><p class="mini-subtitle">Pessoas, processos e informações no mesmo lugar.</p><div class="mini-tiles"><div>${icon('chat')}<span>Conversas</span></div><div>${icon('flow')}<span>Processos</span></div><div>${icon('database')}<span>Dados</span></div></div><div class="mini-task"><i></i><span>Comunicação entre áreas</span><em>INTEGRADO</em></div><div class="mini-task"><i></i><span>Fluxos com contexto</span><em>MODULAR</em></div></div></div></div>`,
    samira: `<div class="samira-preview">
      <div class="samira-preview-top"><span class="samira-preview-avatar">S</span><span class="samira-preview-identity"><strong>Samira</strong><small>● Assistente conectado</small></span><span class="samira-preview-channel">ATENDIMENTO / IA</span></div>
      <div class="samira-preview-main"><div class="samira-conversation"><div class="samira-conversation-label">CONVERSA EM ANDAMENTO</div><div class="samira-message samira-message-client">Quero personalizar as águas do meu evento.</div><div class="samira-message samira-message-agent">Claro! Para preparar uma cotação, quantas unidades você precisa?</div><div class="samira-context"><span>✓ CONTEXTO SALVO</span><span>● PRÓXIMA ETAPA: COTAÇÃO</span></div></div><div class="samira-workflow"><span>FLUXO DE ATENDIMENTO</span><div><b>01</b><span>Entender pedido</span><i>✓</i></div><div><b>02</b><span>Coletar detalhes</span><i>●</i></div><div><b>03</b><span>Encaminhar</span><i>→</i></div><small>IA + AUTOMAÇÃO + EQUIPE</small></div></div>
      <div class="samira-preview-bottom"><span>Responder à conversa...</span><span>➜</span></div>
    </div>`,
    agrishield: `<div class="data-preview">
      <div class="data-preview-top"><span class="preview-dots"><i></i><i></i><i></i></span><strong>DATA / OPS</strong><span class="data-live">● PIPELINE ATIVO</span></div>
      <div class="data-flow"><span class="data-flow-step"><b>ERP + CSV</b><small>FONTES</small></span><span class="data-flow-arrow">→</span><span class="data-flow-step data-flow-etl"><b>ETL</b><small>TRATAR · UNIFICAR</small></span><span class="data-flow-arrow">→</span><span class="data-flow-step"><b>PAINEL</b><small>INDICADORES</small></span></div>
      <div class="data-dashboard"><div class="data-metrics"><div class="data-primary-stat"><span>RECEITA / MÊS</span><strong>R$ 128,4 mil</strong><em>↗ 12,8% VS. MÊS ANTERIOR</em></div><div class="data-secondary-stats"><span>PEDIDOS <b>1.284</b></span><span>FONTES <b>03</b></span></div></div><div class="data-chart"><div class="data-chart-head"><span>EVOLUÇÃO</span><span>6 MESES</span></div><svg viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true"><path class="data-chart-grid" d="M0 20H300M0 50H300M0 80H300"/><path class="data-chart-area" d="M0 78L42 72 85 75 128 55 171 60 214 37 257 43 300 18V100H0Z"/><path class="data-chart-line" d="M0 78L42 72 85 75 128 55 171 60 214 37 257 43 300 18"/><circle cx="300" cy="18" r="4"/></svg><div class="data-chart-months"><span>JAN</span><span>FEV</span><span>MAR</span><span>ABR</span><span>MAI</span><span>JUN</span></div></div></div>
    </div>`,
    ml: `<div class="ml-preview">
      <div class="ml-preview-top"><span class="preview-dots"><i></i><i></i><i></i></span><strong>MODEL LAB / CLASSIFICAÇÃO</strong><span>DADOS ILUSTRATIVOS</span></div>
      <div class="ml-preview-main"><div class="ml-pipeline"><span class="ml-panel-label">PIPELINE DO MODELO</span><div class="ml-pipeline-step"><b>01</b><span><strong>Preparar dados</strong><small>limpeza + variáveis</small></span></div><div class="ml-pipeline-step"><b>02</b><span><strong>Treinar</strong><small>comparar modelos</small></span></div><div class="ml-pipeline-step"><b>03</b><span><strong>Validar</strong><small>métricas + leitura</small></span></div></div>
      <div class="ml-chart"><div class="ml-chart-heading"><span>DISTRIBUIÇÃO DE CLASSES</span><span>A / B</span></div><svg viewBox="0 0 260 148" preserveAspectRatio="none" aria-hidden="true"><path class="ml-chart-grid" d="M20 15v115h225M20 42h225M20 74h225M20 106h225M70 15v115M120 15v115M170 15v115M220 15v115"/><path class="ml-chart-boundary" d="M28 32c62 18 80 52 106 56 42 8 57 29 103 39"/><g class="ml-points-a">${[[38,55],[51,72],[64,49],[72,84],[82,63],[90,99],[103,72],[109,111],[56,103],[40,88],[119,54],[129,104]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.8"/>`).join('')}</g><g class="ml-points-b">${[[150,36],[164,60],[177,40],[189,69],[205,48],[217,80],[229,56],[174,96],[198,106],[225,107],[141,71],[159,116]].map(([x,y])=>`<rect x="${x}" y="${y}" width="7" height="7" rx="1.5"/>`).join('')}</g></svg><div class="ml-chart-legend"><span><i></i>CLASSE A</span><span><i></i>CLASSE B</span><span>LIMITE DE DECISÃO</span></div></div></div>
      <div class="ml-preview-bottom"><span>● EXPERIMENTO ESTRUTURADO</span><span>DADOS → TREINO → VALIDAÇÃO → LEITURA</span></div>
    </div>`,
    cyber: `<div class="iot-preview">
      <div class="iot-preview-top"><span class="preview-dots"><i></i><i></i><i></i></span><strong>IOT / MONITORAMENTO</strong><span>● DADOS SIMULADOS</span></div>
      <div class="iot-preview-main"><div class="iot-sensors"><span class="iot-panel-label">ENTRADA / DISPOSITIVOS</span><div class="iot-sensor"><span class="iot-sensor-mark">01</span><span><strong>TEMPERATURA</strong><small>Sensor de ambiente</small></span><b>23,8°</b></div><div class="iot-sensor"><span class="iot-sensor-mark">02</span><span><strong>VIBRAÇÃO</strong><small>Máquina em operação</small></span><b class="iot-warning">ALTA</b></div><div class="iot-sensor"><span class="iot-sensor-mark">03</span><span><strong>GATEWAY</strong><small>Eventos recebidos</small></span><b class="iot-online">ONLINE</b></div></div><div class="iot-risk"><span class="iot-panel-label">REGRAS / CLASSIFICAÇÃO</span><div class="iot-risk-badge"><span aria-hidden="true">!</span><strong>ATENÇÃO</strong></div><p>Vibração fora da faixa esperada</p><div class="iot-risk-meter"><i></i></div><small>ALERTA GERADO · REVISÃO HUMANA</small></div></div>
      <div class="iot-preview-trace"><span>FLUXO DE EVENTOS</span><svg viewBox="0 0 360 50" preserveAspectRatio="none" aria-hidden="true"><path class="iot-trace-grid" d="M0 12H360M0 25H360M0 38H360"/><path class="iot-trace-line" d="M0 31h27l8-9 7 18 11-26 10 17h38l10-8 8 12 12-18 9 14h43l9-7 8 10 10-22 12 19h36l9-12 9 20 11-28 10 19h51"/><path class="iot-trace-threshold" d="M0 16H360"/><circle cx="270" cy="31" r="4"/></svg><span>HTTP / JSON</span></div>
      <div class="iot-preview-bottom"><span>01 EVENTO</span><span>02 VALIDAÇÃO</span><span>03 REGRA</span><span>04 ALERTA</span></div>
    </div>`,
    security: `<div class="security-preview">
      <div class="security-preview-top"><span class="preview-dots"><i></i><i></i><i></i></span><strong>SECURITY / CONTROLS</strong><span class="security-live">● MONITORADO</span></div>
      <div class="security-preview-main"><div class="security-core"><div class="security-core-ring"><div class="secure-shield">${icon('lock')}</div></div><span>ACESSO PROTEGIDO</span></div><div class="security-controls"><div><span>01 / IDENTIDADE</span><strong>Perfis e permissões</strong><small>✓ MFA · ACESSO VALIDADO</small></div><div><span>02 / API</span><strong>Entradas verificadas</strong><small>✓ VALIDAÇÃO · LIMITES</small></div><div><span>03 / DADOS</span><strong>Segredos isolados</strong><small>✓ CREDENCIAIS · LOGS</small></div></div></div>
      <div class="security-preview-bottom"><span>● 10:42:18</span><strong>ACESSO VALIDADO</strong><span>EVENTO REGISTRADO</span></div>
    </div>`,
    erp: `<div class="erp-visual"><div class="erp-visual-grid" aria-hidden="true"></div><div class="erp-flow"><div class="erp-node"><span>ERP</span><small>DADOS</small></div><div class="erp-connection"><i></i><i></i><i></i></div><div class="erp-node erp-node-center">${icon('database')}<small>API</small></div><div class="erp-connection"><i></i><i></i><i></i></div><div class="erp-node">${icon('flow')}<small>ROTINA</small></div></div><div class="erp-visual-status"><span>● CONECTADO</span><span>FLUXOS SOB MEDIDA</span></div></div>`,
    rag: `<div class="rag-visual"><img src="assets/img/rag-architecture.svg" alt="" decoding="async"></div>`
  };

  const projectGrid = document.querySelector('#project-grid');
  projectGrid.innerHTML = data.projects.map((project) => `<article class="project-card reveal ${project.featured ? 'featured' : ''} ${project.id === 'samira' ? 'samira-card' : ''}" data-categories="${project.filters.join(' ')}" data-project-card="${project.id}"><div class="project-visual preview-${project.preview}" role="img" aria-label="Representação conceitual da solução ${escape(project.name)}"><span class="visual-label">INTERFACE CONCEITUAL</span><span class="visual-index">[ ${project.number} ]</span>${previews[project.preview]}</div><div class="project-content"><div class="project-meta"><span>${escape(project.category)}</span>${project.featured ? '<span class="featured-label">Solução em destaque</span>' : ''}</div><h3>${escape(project.name)}</h3><p class="project-summary">${escape(project.summary)}</p>${tags(project.tags)}<span class="project-open" aria-hidden="true"><span>Conhecer a solução</span>${icon('external')}</span></div><button class="project-hit-area" type="button" data-project="${project.id}" aria-label="Conhecer a solução ${escape(project.name)} e seus detalhes"></button></article>`).join('');
  projectGrid.querySelectorAll('.project-card').forEach((card) => card.classList.remove('reveal'));
  document.querySelector('#project-count').textContent = String(data.projects.length).padStart(2, '0');
  document.querySelector('#project-status').textContent = `${data.projects.length} soluções disponíveis.`;

  document.querySelector('#service-grid').innerHTML = data.services.map((service) => `<article class="service-card reveal"><div class="service-top">${icon(service.icon)}<span>/${service.number}</span></div><h3>${escape(service.name)}</h3><p>${escape(service.description)}</p><div class="service-tags">${service.tags.map(escape).join(' / ')}</div><a class="service-link" href="${escape(whatsappLink(service.message))}" target="_blank" rel="noopener noreferrer" aria-label="Conversar sobre ${escape(service.name)} no WhatsApp"><span>Conversar sobre este formato</span>${icon('external')}</a></article>`).join('');
  document.querySelector('#skills-grid').innerHTML = data.skills.map((skill, index) => `<details class="skill-row reveal"${index === 0 ? ' open' : ''}><summary><span class="skill-index">${skill.code}</span><h3>${escape(skill.name)}</h3><span class="skill-caption">${escape(skill.text)}</span>${icon('plus')}</summary>${skillTags(skill.items)}</details>`).join('');


  const dialog = document.querySelector('#project-dialog');
  const dialogContent = document.querySelector('#dialog-content');
  function closeProject() {
    if (!dialog.open) return;
    if (modalTween) modalTween.kill();
    dialog.close();
  }
  function openProject(projectId, trigger) {
    const project = data.projects.find((entry) => entry.id === projectId);
    if (!project) return;
    lastModalTrigger = trigger;
    document.querySelector('#dialog-index').textContent = `SOLUÇÃO ${project.number} / ${project.visibility.toUpperCase()}`;
    dialogContent.dataset.project = project.id;
    dialogContent.innerHTML = `
      <p class="eyebrow">${escape(project.category.toUpperCase())}</p>
      <h2 id="dialog-title" tabindex="-1">${escape(project.name)}</h2>
      <p class="dialog-subtitle">${escape(project.subtitle)}</p>
      <p class="dialog-intro">${escape(project.intro)}</p>
      ${project.insights ? `<h3>${escape(project.insightsLabel || 'Como funciona')}</h3>
        <div class="dialog-insight-grid">${project.insights.map((insight) => `<article class="dialog-insight-card"><h4>${escape(insight.name)}</h4><p>${escape(insight.description)}</p></article>`).join('')}</div>` : ''}
      <div class="dialog-columns">
        <section><h3>O desafio</h3><p>${escape(project.challenge)}</p></section>
        <section><h3>Como a solução funciona</h3><p>${escape(project.approach)}</p></section>
      </div>
      ${project.valueProp ? `<div class="dialog-highlight"><strong>Valor principal</strong><p>${escape(project.valueProp)}</p></div>` : ''}
      ${project.audience || project.implementation ? `<div class="dialog-columns${project.implementation ? '' : ' dialog-columns-single'}">
        ${project.audience ? `<section><h3>Para quem faz sentido</h3><p>${escape(project.audience)}</p></section>` : ''}
        ${project.implementation ? `<section><h3>Implementações para sua empresa</h3><p>${escape(project.implementation)}</p></section>` : ''}
      </div>` : ''}
      <h3>O que essa solução entrega</h3>
      ${project.capabilitiesIntro ? `<p class="dialog-section-intro">${escape(project.capabilitiesIntro)}</p>` : ''}
      <ul class="dialog-list">${project.capabilities.map((capability) => `<li>${icon('check')}<span>${escape(capability)}</span></li>`).join('')}</ul>
      ${project.modules ? `<h3>${escape(project.modulesLabel || 'Áreas que podem ser implementadas')}</h3>
        ${project.modulesIntro ? `<p class="dialog-section-intro">${escape(project.modulesIntro)}</p>` : ''}
        <div class="dialog-module-grid">${project.modules.map((module) => `<article class="dialog-module-card"><h4>${escape(module.name)}</h4><p>${escape(module.description)}</p></article>`).join('')}</div>` : ''}
      <h3>Como a implantação pode acontecer</h3>
      <div class="dialog-flow" aria-label="Fluxo da solução">${project.flow.map((step, index) => `<span><i>${escape(step)}</i>${index < project.flow.length - 1 ? icon('arrow') : ''}</span>`).join('')}</div>
      ${project.note ? `<p class="dialog-note">${escape(project.note)}</p>` : ''}
      <div class="dialog-actions">
        ${project.repository ? `<a class="button button-outline" href="${escape(project.repository)}" target="_blank" rel="noopener noreferrer">Ver referência no GitHub ${icon('external')}</a>` : ''}
        ${project.demo ? `<a class="button button-primary" href="${escape(project.demo)}" data-dialog-demo>Experimentar a simulação ${icon('arrow')}</a>` : ''}
        <a class="button button-primary" href="${escape(whatsappLink(project.ctaMessage || `Olá, Thomas! Vi a solução ${project.name} no seu portfólio e gostaria de conversar.`))}" target="_blank" rel="noopener noreferrer">Quero conversar sobre esta solução ${icon('chat')}</a>
      </div>`;
    document.body.classList.add('modal-open');
    dialog.showModal();
    syncAutoplay();
    dialog.scrollTop = 0;
    document.querySelector('#dialog-title').focus({ preventScroll: true });
    if (core.motionEnabled && window.gsap) {
      modalTween = gsap.fromTo(dialog, { opacity: 0, y: 18, scale: .985 }, { opacity: 1, y: 0, scale: 1, duration: .28, ease: 'power2.out', clearProps: 'transform,opacity' });
    }
  }
  document.addEventListener('click', (event) => {
    const projectButton = event.target.closest('[data-project]');
    if (projectButton) openProject(projectButton.dataset.project, projectButton);
    const demoLink = event.target.closest('[data-dialog-demo]');
    if (demoLink) {
      event.preventDefault();
      modalNextFocus = document.querySelector('#samira-demo button');
      closeProject();
      document.querySelector('#laboratorio').scrollIntoView({ behavior: core.motionEnabled ? 'smooth' : 'auto' });
    }
  });
  document.querySelector('#dialog-close').addEventListener('click', closeProject);
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeProject();
  });
  dialog.addEventListener('close', () => {
    if (modalTween) modalTween.kill();
    dialog.style.removeProperty('transform');
    dialog.style.removeProperty('opacity');
    document.body.classList.remove('modal-open');
    const target = modalNextFocus || lastModalTrigger;
    if (target && document.contains(target)) target.focus({ preventScroll: true });
    modalNextFocus = null;
    syncAutoplay();
  });

  const carousel = document.querySelector('#project-carousel');
  const carouselViewport = carousel.querySelector('.project-carousel-viewport');
  const previousButton = document.querySelector('#project-prev');
  const nextButton = document.querySelector('#project-next');
  const pauseButton = document.querySelector('#project-pause');
  const currentLabel = document.querySelector('#project-slide-current');
  const totalLabel = document.querySelector('#project-slide-total');
  const projectStatus = document.querySelector('#project-status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visibleCards = [...projectGrid.querySelectorAll('[data-project-card]')];
  let slideIndex = 0;
  let autoplayTimer;
  let userPaused = false;
  let inView = !('IntersectionObserver' in window);
  let pointerInside = false;
  let focusInside = false;
  let dragGesture = null;
  let suppressDragClick = false;

  function syncAutoplay() {
    clearTimeout(autoplayTimer);
    pauseButton.hidden = !core.motionEnabled || reducedMotion.matches || visibleCards.length < 2;
    if (pauseButton.hidden || userPaused || !inView || pointerInside || focusInside || dragGesture || document.hidden || dialog.open) return;
    autoplayTimer = window.setTimeout(() => showSlide(slideIndex + 1), 5000);
  }

  function showSlide(nextIndex, { instant = false, announce = false } = {}) {
    if (!visibleCards.length) return;
    slideIndex = (nextIndex + visibleCards.length) % visibleCards.length;
    if (instant) projectGrid.classList.add('is-resetting');
    projectGrid.style.transform = `translateX(-${slideIndex * 100}%)`;
    if (instant) {
      void projectGrid.offsetWidth;
      projectGrid.classList.remove('is-resetting');
    }
    projectGrid.querySelectorAll('[data-project-card]').forEach((card) => {
      const active = card === visibleCards[slideIndex];
      card.inert = !active;
      card.setAttribute('aria-hidden', String(!active));
    });
    currentLabel.textContent = String(slideIndex + 1).padStart(2, '0');
    totalLabel.textContent = String(visibleCards.length).padStart(2, '0');
    previousButton.disabled = visibleCards.length < 2;
    nextButton.disabled = visibleCards.length < 2;
    pauseButton.disabled = visibleCards.length < 2;
    if (announce) {
      const title = visibleCards[slideIndex].querySelector('h3').textContent;
      projectStatus.textContent = `${title}, solução ${slideIndex + 1} de ${visibleCards.length}.`;
    }
    syncAutoplay();
  }

  previousButton.addEventListener('click', () => showSlide(slideIndex - 1, { announce: true }));
  nextButton.addEventListener('click', () => showSlide(slideIndex + 1, { announce: true }));
  carouselViewport.addEventListener('pointerdown', (event) => {
    if (dragGesture || visibleCards.length < 2 || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    dragGesture = { id: event.pointerId, startX: event.clientX, startY: event.clientY, startTime: performance.now(), deltaX: 0, active: false };
    syncAutoplay();
  });
  carouselViewport.addEventListener('pointermove', (event) => {
    if (!dragGesture || event.pointerId !== dragGesture.id) return;
    const deltaX = event.clientX - dragGesture.startX;
    const deltaY = event.clientY - dragGesture.startY;
    if (!dragGesture.active) {
      if (Math.abs(deltaY) > 10 && Math.abs(deltaY) > Math.abs(deltaX)) {
        dragGesture = null;
        syncAutoplay();
        return;
      }
      if (Math.abs(deltaX) < 10) return;
      dragGesture.active = true;
      carouselViewport.setPointerCapture(event.pointerId);
      carouselViewport.classList.add('is-dragging');
    }
    dragGesture.deltaX = deltaX;
    projectGrid.style.transform = `translateX(calc(-${slideIndex * 100}% + ${deltaX}px))`;
    event.preventDefault();
  });
  function finishDrag(event, cancelled = false) {
    if (!dragGesture || event.pointerId !== dragGesture.id) return;
    const { active, deltaX, startTime } = dragGesture;
    dragGesture = null;
    carouselViewport.classList.remove('is-dragging');
    if (carouselViewport.hasPointerCapture(event.pointerId)) carouselViewport.releasePointerCapture(event.pointerId);
    if (!active) {
      syncAutoplay();
      return;
    }
    suppressDragClick = true;
    window.setTimeout(() => { suppressDragClick = false; }, 0);
    if (document.activeElement?.classList.contains('project-hit-area')) document.activeElement.blur();
    const threshold = Math.min(100, carouselViewport.clientWidth * .17);
    const quickSwipe = Math.abs(deltaX) > 35 && performance.now() - startTime < 260;
    const step = !cancelled && (Math.abs(deltaX) >= threshold || quickSwipe) ? (deltaX < 0 ? 1 : -1) : 0;
    showSlide(slideIndex + step, { announce: step !== 0 });
  }
  carouselViewport.addEventListener('pointerup', finishDrag);
  carouselViewport.addEventListener('pointercancel', (event) => finishDrag(event, true));
  carouselViewport.addEventListener('click', (event) => {
    if (!suppressDragClick) return;
    suppressDragClick = false;
    event.preventDefault();
    event.stopPropagation();
  }, true);
  carouselViewport.addEventListener('dragstart', (event) => event.preventDefault());
  pauseButton.addEventListener('click', () => {
    userPaused = !userPaused;
    pauseButton.setAttribute('aria-pressed', String(userPaused));
    pauseButton.setAttribute('aria-label', userPaused ? 'Retomar passagem automática' : 'Pausar passagem automática');
    pauseButton.querySelector('span').textContent = userPaused ? '▷' : 'Ⅱ';
    if (!userPaused) focusInside = false;
    syncAutoplay();
  });
  carousel.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'touch') return;
    pointerInside = true;
    syncAutoplay();
  });
  carousel.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'touch') return;
    pointerInside = false;
    syncAutoplay();
  });
  carousel.addEventListener('focusin', () => { focusInside = true; syncAutoplay(); });
  carousel.addEventListener('focusout', () => requestAnimationFrame(() => {
    focusInside = carousel.contains(document.activeElement);
    syncAutoplay();
  }));
  document.addEventListener('visibilitychange', syncAutoplay);
  window.addEventListener('portfolio:motion', syncAutoplay);
  reducedMotion.addEventListener('change', syncAutoplay);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncAutoplay();
    }, { threshold: .2 });
    observer.observe(carousel);
  }

  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  filterButtons.forEach((button) => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((entry) => {
      const active = entry === button;
      entry.classList.toggle('is-active', active);
      entry.setAttribute('aria-pressed', String(active));
    });
    projectGrid.classList.toggle('is-filtered', filter !== 'all');
    projectGrid.dataset.activeFilter = filter;
    visibleCards = [...projectGrid.querySelectorAll('[data-project-card]')].filter((card) => {
      const visible = filter === 'all' || card.dataset.categories.split(' ').includes(filter);
      card.hidden = !visible;
      return visible;
    });
    showSlide(0, { instant: true });
    projectStatus.textContent = `${visibleCards.length} ${visibleCards.length === 1 ? 'solução encontrada' : 'soluções encontradas'}.`;
    if (window.ScrollTrigger) ScrollTrigger.refresh();
    core.updateScroll();
  }));

  showSlide(0, { instant: true });

})();
