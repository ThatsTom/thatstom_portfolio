(function () {
  'use strict';

  const mount = document.getElementById('samira-demo');
  if (!mount || !window.PortfolioCore) return;
  const { whatsappLink } = window.PortfolioCore;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pendingWaits = new Set();
  const scenarioButtons = new Map();
  let generation = 0;
  let scenario = 'operations';
  let running = false;
  let paused = false;
  let motionPreference = document.documentElement.dataset.motion !== 'off';
  let focusNextChoice = false;
  let details = {};

  function element(tag, className, text, attributes) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    Object.entries(attributes || {}).forEach(([name, value]) => node.setAttribute(name, value));
    return node;
  }

  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.6');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const paths = {
      reset: 'M3 10a9 9 0 1 1 2.6 8.5M3 4v6h6',
      pause: 'M8 5v14M16 5v14',
      play: 'M8 5l11 7-11 7V5Z',
      arrow: 'M5 12h14M13 6l6 6-6 6',
      check: 'M5 12l4 4L19 6'
    };
    path.setAttribute('d', paths[name] || paths.arrow);
    svg.append(path);
    return svg;
  }

  function motionEnabled() {
    return motionPreference && !reducedMotion.matches;
  }

  const shell = element('div', 'samira-shell');
  const header = element('div', 'samira-header');
  const identity = element('div', 'samira-identity');
  const avatar = element('span', 'samira-avatar', 'S', { 'aria-hidden': 'true' });
  const identityText = element('div', 'samira-identity-text');
  identityText.append(element('strong', 'samira-name', 'Samira'));
  const localStatus = element('span', 'samira-local-status', 'Simulação de atendimento');
  localStatus.prepend(element('span', 'samira-status-dot', '', { 'aria-hidden': 'true' }));
  identityText.append(localStatus);
  identity.append(avatar, identityText);
  const controls = element('div', 'samira-controls');
  const pauseButton = element('button', 'samira-control', null, {
    type: 'button',
    'aria-label': 'Pausar a conversa demonstrativa',
    'aria-pressed': 'false'
  });
  const pauseText = element('span', 'samira-control-label', 'Pausar');
  pauseButton.append(icon('pause'), pauseText);
  pauseButton.disabled = true;
  const resetButton = element('button', 'samira-control', null, {
    type: 'button',
    'aria-label': 'Reiniciar o cenário da Samira'
  });
  resetButton.append(icon('reset'), element('span', 'samira-control-label', 'Reiniciar'));
  controls.append(pauseButton, resetButton);
  header.append(identity, controls);

  const scenarios = element('div', 'samira-scenarios', null, {
    role: 'group',
    'aria-label': 'Escolha um cenário de demonstração'
  });
  const scenarioDefinitions = [
    { id: 'operations', number: '01', label: 'Atalanta', contactMessage: 'Olá, Thomas! Vi a simulação da Atalanta e gostaria de conversar sobre uma plataforma para minha operação.' },
    { id: 'agent', number: '02', label: 'IA no WhatsApp', contactMessage: 'Olá, Thomas! Vi a simulação da Samira e gostaria de conversar sobre atendimento com IA no WhatsApp.' },
    { id: 'automation', number: '03', label: 'Automação', contactMessage: 'Olá, Thomas! Vi a simulação de automação e gostaria de conversar sobre processos e sistemas conectados.' },
    { id: 'erp', number: '04', label: 'ERPs', contactMessage: 'Olá, Thomas! Vi a simulação de integração com ERP e gostaria de avaliar automações na minha rotina.' },
    { id: 'data', number: '05', label: 'Dados', contactMessage: 'Olá, Thomas! Vi a simulação de dashboards e gostaria de conversar sobre dados e indicadores da minha empresa.' },
    { id: 'security', number: '06', label: 'Segurança', contactMessage: 'Olá, Thomas! Vi a simulação de segurança e gostaria de conversar sobre boas práticas para meus sistemas.' }
  ];
  scenarioDefinitions.forEach((item) => {
    const button = element('button', 'samira-scenario', null, {
      type: 'button',
      'aria-pressed': 'false',
      'data-scenario': item.id
    });
    button.append(element('span', 'samira-scenario-number', item.number, { 'aria-hidden': 'true' }));
    button.append(element('span', '', item.label));
    button.addEventListener('click', () => {
      focusNextChoice = false;
      resetScenario(item.id, true);
    });
    scenarioButtons.set(item.id, button);
    scenarios.append(button);
  });

  const main = element('div', 'samira-main');
  const conversation = element('div', 'samira-conversation');
  const transcript = element('div', 'samira-transcript', null, {
    role: 'log',
    'aria-label': 'Conversa fictícia entre cliente e Samira',
    'aria-live': 'off',
    tabindex: '0'
  });
  const replyArea = element('div', 'samira-reply-area');
  const replyHint = element('p', 'samira-reply-hint', 'Escolha uma resposta para continuar.');
  const contactSlot = element('div', 'samira-contact-slot');
  const replies = element('div', 'samira-replies', null, {
    role: 'group',
    'aria-label': 'Respostas prontas do cliente'
  });
  replyArea.append(replyHint, contactSlot, replies);
  conversation.append(transcript, replyArea);

  const workflow = element('aside', 'samira-workflow', null, {
    'aria-label': 'Etapas do atendimento demonstrativo'
  });
  workflow.append(element('p', 'samira-workflow-title', 'DA CONVERSA À SOLUÇÃO'));
  const steps = element('ol', 'samira-steps');
  const stepNodes = [
    ['Entrada', 'Solicitação inicial'],
    ['Diagnóstico', 'Necessidade identificada'],
    ['Próximo passo', 'Encaminhamento comercial']
  ].map(([title, description], index) => {
    const step = element('li', 'samira-step');
    const number = element('span', 'samira-step-number', String(index + 1).padStart(2, '0'), {
      'aria-hidden': 'true'
    });
    const text = element('div', 'samira-step-text');
    const detail = element('span', 'samira-step-detail', description);
    text.append(element('strong', '', title), detail);
    step.append(number, text);
    steps.append(step);
    return { step, detail };
  });
  const record = element('div', 'samira-record', null, { 'data-empty': 'true' });
  workflow.append(steps, record);
  main.append(conversation, workflow);

  const footnote = element('p', 'samira-footnote', 'Conversa fictícia para demonstrar como um atendimento pode qualificar necessidades e direcionar soluções.');
  const announcement = element('div', 'samira-sr-only', '', {
    role: 'status',
    'aria-live': 'polite',
    'aria-atomic': 'true'
  });
  shell.append(header, scenarios, main, footnote, announcement);
  mount.replaceChildren(shell);

  function announce(text) {
    announcement.textContent = text;
  }

  function nearBottom() {
    return transcript.scrollHeight - transcript.scrollTop - transcript.clientHeight < 72;
  }

  function followConversation(shouldFollow) {
    if (shouldFollow) transcript.scrollTop = transcript.scrollHeight;
  }

  function wait(duration, token) {
    if (token !== generation) return Promise.resolve(false);
    return new Promise((resolve) => {
      let last = performance.now();
      let elapsed = 0;
      let finished = false;
      const task = {
        timer: null,
        finish(value) {
          if (finished) return;
          finished = true;
          window.clearTimeout(task.timer);
          pendingWaits.delete(task);
          resolve(value);
        }
      };
      function tick() {
        if (token !== generation) return task.finish(false);
        const now = performance.now();
        if (!paused && !document.hidden) {
          elapsed += now - last;
          if (!motionEnabled() || elapsed >= duration) return task.finish(true);
        }
        last = now;
        task.timer = window.setTimeout(tick, paused || document.hidden ? 120 : 24);
      }
      pendingWaits.add(task);
      tick();
    });
  }

  function syncPauseControl() {
    pauseButton.disabled = !running;
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute('aria-label', paused ? 'Continuar a conversa demonstrativa' : 'Pausar a conversa demonstrativa');
    pauseText.textContent = paused ? 'Continuar' : 'Pausar';
    pauseButton.replaceChild(icon(paused ? 'play' : 'pause'), pauseButton.firstElementChild);
    shell.classList.toggle('samira-paused', paused || document.hidden);
    shell.classList.toggle('samira-reduced-motion', !motionEnabled());
    shell.dataset.playback = running ? (paused ? 'paused' : 'playing') : 'ready';
  }

  function setStage(index, descriptions, complete) {
    stepNodes.forEach((node, stepIndex) => {
      const state = complete || stepIndex < index ? 'done' : stepIndex === index ? 'current' : 'pending';
      node.step.dataset.state = state;
      node.step.removeAttribute('aria-current');
      if (state === 'current') node.step.setAttribute('aria-current', 'step');
      if (descriptions && descriptions[stepIndex]) node.detail.textContent = descriptions[stepIndex];
    });
  }

  function clearRecord() {
    record.dataset.empty = 'true';
    record.replaceChildren(
      element('span', 'samira-record-eyebrow', 'RESUMO DA OPORTUNIDADE'),
      element('p', 'samira-record-placeholder', 'Os pontos principais da conversa vão aparecer aqui.')
    );
  }

  function showRecord(rows) {
    record.dataset.empty = 'false';
    const title = element('span', 'samira-record-eyebrow', 'RESUMO DA OPORTUNIDADE');
    const list = element('dl', 'samira-record-list');
    rows.forEach(([term, value]) => {
      const row = element('div', 'samira-record-row');
      row.append(element('dt', '', term), element('dd', '', value));
      list.append(row);
    });
    record.replaceChildren(title, list, element('span', 'samira-record-note', 'Simulação fictícia · exemplo de qualificação inicial'));
  }

  function makeMessage(role) {
    const follow = nearBottom();
    const message = element('div', 'samira-message samira-message--' + role);
    const bubble = element('div', 'samira-bubble');
    const author = role === 'client' ? 'CLIENTE' : 'SAMIRA';
    bubble.append(element('span', 'samira-message-author', author));
    const content = element('p', 'samira-text');
    bubble.append(content);
    const meta = element('span', 'samira-message-meta', role === 'client' ? '11:24' : '11:25');
    bubble.append(meta);
    message.append(bubble);
    transcript.append(message);
    followConversation(follow);
    return { message, bubble, content };
  }

  function instantMessage(role, text) {
    const view = makeMessage(role);
    view.content.textContent = text;
    transcript.scrollTop = transcript.scrollHeight;
  }

  async function say(role, text, token) {
    if (token !== generation) return false;
    const view = makeMessage(role);
    view.message.setAttribute('aria-busy', 'true');
    if (role === 'bot' && motionEnabled()) {
      const typing = element('span', 'samira-typing', null, { 'aria-hidden': 'true' });
      for (let index = 0; index < 3; index += 1) typing.append(element('i'));
      view.content.append(typing);
      replyHint.textContent = 'Samira está digitando…';
      if (!(await wait(420, token))) return false;
      view.content.replaceChildren();
    }
    let position = 0;
    while (position < text.length) {
      if (token !== generation) return false;
      const follow = nearBottom();
      position = motionEnabled() ? Math.min(text.length, position + (role === 'client' ? 8 : 5)) : text.length;
      view.content.textContent = text.slice(0, position);
      followConversation(follow);
      if (!(await wait(18, token))) return false;
    }
    view.message.setAttribute('aria-busy', 'false');
    announce((role === 'client' ? 'Cliente: ' : 'Samira: ') + text);
    return wait(role === 'bot' ? 160 : 280, token);
  }

  function setChoices(choices, hint) {
    replies.replaceChildren();
    contactSlot.replaceChildren();
    replyHint.textContent = hint || 'Escolha uma resposta para continuar.';
    replyArea.setAttribute('aria-busy', 'false');
    choices.forEach((choice) => {
      const button = element('button', 'samira-reply', null, { type: 'button' });
      button.append(element('span', '', choice.label), icon('arrow'));
      button.addEventListener('click', (event) => {
        if (running) return;
        focusNextChoice = event.detail === 0;
        play(choice.action);
      });
      replies.append(button);
    });
    const focusStayedInConversation = document.activeElement === document.body ||
      document.activeElement === transcript || replies.contains(document.activeElement);
    if (focusNextChoice && focusStayedInConversation && replies.firstElementChild) {
      replies.firstElementChild.focus({ preventScroll: true });
    }
    focusNextChoice = false;
  }

  async function play(action) {
    const token = generation;
    running = true;
    paused = false;
    replies.replaceChildren();
    contactSlot.replaceChildren();
    replyHint.textContent = 'A conversa está em andamento…';
    replyArea.setAttribute('aria-busy', 'true');
    syncPauseControl();
    try {
      await action(token);
    } finally {
      if (token === generation) {
        running = false;
        paused = false;
        replyArea.setAttribute('aria-busy', 'false');
        syncPauseControl();
      }
    }
  }

  function finishedChoices() {
    const current = scenarioDefinitions.find((item) => item.id === scenario);
    setChoices([
      { label: 'Repetir este cenário', action: () => resetScenario(scenario, true) },
      {
        label: 'Explorar outro cenário',
        action: () => resetScenario(scenarioDefinitions[(scenarioDefinitions.indexOf(current) + 1) % scenarioDefinitions.length].id, true)
      }
    ], 'Fluxo concluído. Converse com Thomas sobre este serviço ou explore outro cenário.');
    const message = current.contactMessage + (details.contactFocus ? ` Meu foco é ${details.contactFocus}.` : '');
    const contact = element('a', 'samira-contact-link', null, {
      href: whatsappLink(message),
      target: '_blank',
      rel: 'noopener noreferrer',
      'aria-label': `Conversar com Thomas sobre ${current.label} no WhatsApp`
    });
    contact.append(element('span', '', `Conversar sobre ${current.label}`), icon('arrow'));
    contactSlot.append(contact);
    if (document.activeElement === replies.firstElementChild) contact.focus({ preventScroll: true });
  }

  async function finalizeOperations(token, focus) {
    details.focus = focus;
    details.contactFocus = focus === 'marketing' ? 'organizar marketing e solicitações internas' : 'integrar clientes, comercial e operação';
    if (!(await say('client', focus === 'marketing' ? 'Temos muitas ações de marketing e falta acompanhamento.' : 'Queremos organizar clientes, solicitações e equipes no mesmo ambiente.', token))) return;
    setStage(2, ['Solicitação recebida', 'Necessidades principais mapeadas', 'Próximo passo sugerido']);
    if (!(await say('bot', 'Pelo contexto do exemplo, a solução mais aderente é a Atalanta. Ela pode reunir ' + (focus === 'marketing' ? 'ações de marketing, solicitações internas, comunicação e acompanhamento' : 'cadastro de clientes, CRM, solicitações, comunicação e relatórios') + ' em uma implantação modular.', token))) return;
    showRecord([
      ['Solução indicada', 'Atalanta'],
      ['Foco principal', focus === 'marketing' ? 'Marketing + solicitações internas' : 'Comercial + operação interna'],
      ['Módulos sugeridos', focus === 'marketing' ? 'Marketing, solicitações, comunicação, gestão' : 'CRM, solicitações, produtos, comunicação, relatórios'],
      ['Próximo passo', 'Mapeamento da operação e escopo da implantação']
    ]);
    setStage(2, ['Interesse recebido', 'Solução enquadrada', 'Reunião de diagnóstico'], true);
    announce('Demonstração concluída com direcionamento para a Atalanta.');
    finishedChoices();
  }

  async function startOperations(token) {
    if (!(await say('client', 'Quero organizar a operação da minha empresa e reduzir controles espalhados.', token))) return;
    setStage(1, ['Solicitação recebida', 'Entender prioridade', 'Definir solução']);
    if (!(await say('bot', 'Posso te ajudar a enquadrar isso. Hoje o maior gargalo está mais ligado ao comercial e clientes ou às solicitações internas e marketing?', token))) return;
    setChoices([
      { label: 'Comercial, clientes e processos internos', action: (nextToken) => finalizeOperations(nextToken, 'commercial') },
      { label: 'Marketing, solicitações e acompanhamento', action: (nextToken) => finalizeOperations(nextToken, 'marketing') }
    ], 'Escolha o foco principal do exemplo.');
  }

  async function finalizeAgent(token, focus) {
    details.focus = focus;
    details.contactFocus = focus === 'quote' ? 'automatizar coleta de dados e cotações' : 'atender dúvidas e qualificar contatos';
    if (!(await say('client', focus === 'quote' ? 'Quero automatizar a coleta de dados e cotações.' : 'Quero responder dúvidas e qualificar melhor quem chama no WhatsApp.', token))) return;
    setStage(2, ['Objetivo recebido', 'Aplicação identificada', 'Próximo passo sugerido']);
    if (!(await say('bot', 'Neste caso, a Samira pode ser configurada como agente de IA para ' + (focus === 'quote' ? 'coletar dados, organizar solicitações, preparar cotações e repassar o contexto à equipe' : 'atender dúvidas, qualificar oportunidades, coletar contexto e encaminhar casos especiais') + '.', token))) return;
    showRecord([
      ['Solução indicada', 'Samira'],
      ['Foco principal', focus === 'quote' ? 'Coleta de dados + cotação' : 'Atendimento + qualificação'],
      ['Módulos sugeridos', focus === 'quote' ? 'Fluxos de atendimento, qualificação, cotações, handoff humano' : 'FAQ, qualificação, histórico, handoff, integrações'],
      ['Próximo passo', 'Definir conhecimento, regras e integrações da IA']
    ]);
    setStage(2, ['Interesse recebido', 'Escopo da IA definido', 'Implantação sugerida'], true);
    announce('Demonstração concluída com direcionamento para a Samira.');
    finishedChoices();
  }

  async function startAgent(token) {
    if (!(await say('client', 'Quero usar IA no WhatsApp para ganhar agilidade no atendimento.', token))) return;
    setStage(1, ['Solicitação recebida', 'Entender o objetivo', 'Definir solução']);
    if (!(await say('bot', 'Legal. O foco principal da automação está mais em responder e qualificar ou em coletar dados e preparar solicitações/cotações?', token))) return;
    setChoices([
      { label: 'Responder dúvidas e qualificar contatos', action: (nextToken) => finalizeAgent(nextToken, 'service') },
      { label: 'Coletar dados e ajudar na cotação', action: (nextToken) => finalizeAgent(nextToken, 'quote') }
    ], 'Escolha o foco do atendimento automatizado.');
  }

  async function finalizeAutomation(token, focus) {
    details.focus = focus;
    details.contactFocus = focus === 'crm' ? 'conectar formulário, CRM e alertas' : 'reduzir tarefas manuais entre equipes';
    if (!(await say('client', focus === 'crm' ? 'Quero integrar formulário, CRM e alertas.' : 'Quero reduzir tarefas manuais entre sistemas e equipes.', token))) return;
    setStage(2, ['Necessidade recebida', 'Fluxo identificado', 'Próximo passo sugerido']);
    if (!(await say('bot', 'Esse cenário combina com um serviço de integrações e automações. A ideia é conectar eventos, APIs, webhooks e regras para tirar o trabalho repetitivo do caminho.', token))) return;
    showRecord([
      ['Serviço indicado', 'Integrações & automação'],
      ['Foco principal', focus === 'crm' ? 'Formulário + CRM + alertas' : 'Processos manuais entre sistemas'],
      ['Módulos sugeridos', 'Webhooks, APIs, notificações, registro de histórico'],
      ['Próximo passo', 'Mapear origem, destino e regras do fluxo']
    ]);
    setStage(2, ['Interesse recebido', 'Fluxo enquadrado', 'Diagnóstico técnico'], true);
    announce('Demonstração concluída com direcionamento para integrações e automação.');
    finishedChoices();
  }

  async function startAutomation(token) {
    if (!(await say('client', 'Quero automatizar algumas tarefas repetitivas da operação.', token))) return;
    setStage(1, ['Solicitação recebida', 'Entender integração', 'Definir próximo passo']);
    if (!(await say('bot', 'Perfeito. O que mais representa esse cenário no exemplo: conectar sistemas e alertas ou reduzir atividades manuais entre etapas do processo?', token))) return;
    setChoices([
      { label: 'Conectar formulário, CRM e alertas', action: (nextToken) => finalizeAutomation(nextToken, 'crm') },
      { label: 'Reduzir tarefas manuais entre áreas', action: (nextToken) => finalizeAutomation(nextToken, 'manual') }
    ], 'Escolha o tipo de automação do exemplo.');
  }

  const additionalScenarios = {
    erp: {
      greeting: 'Vamos simular como uma rotina dentro do ERP pode se conectar a outras ferramentas por uma integração sob medida.',
      startLabel: 'Quero integrar meu ERP',
      startHint: 'Comece o cenário de integração com ERP.',
      opening: 'Nossa equipe usa um ERP, mas ainda copia informações manualmente para outros sistemas.',
      question: 'Qual rotina consome mais tempo hoje: acompanhar pedidos e estoque ou manter cadastros e financeiro alinhados?',
      choiceHint: 'Escolha a rotina que precisa de integração.',
      solution: 'Integrações com ERPs',
      options: [
        {
          label: 'Pedidos e estoque',
          reply: 'Precisamos acompanhar pedidos e mudanças de estoque sem atualizar tudo à mão.',
          answer: 'Eu começaria observando esse fluxo com a equipe. Depois avaliaria a API e as permissões do ERP para sincronizar dados, aplicar regras de conferência e registrar falhas. A implementação depende dos recursos disponíveis na plataforma.',
          focus: 'Pedidos + estoque',
          modules: 'Diagnóstico da rotina, API, sincronização, alertas e logs',
          next: 'Validar o ERP, a API disponível e os pontos de revisão humana',
          contactFocus: 'integrar pedidos e estoque ao ERP'
        },
        {
          label: 'Cadastros e financeiro',
          reply: 'Cadastros e dados financeiros ficam diferentes entre o ERP e nossas planilhas.',
          answer: 'Dá para mapear a origem de cada dado, definir qual sistema prevalece e criar uma integração com validações antes de atualizar registros. Primeiro preciso verificar a API, as permissões e as regras do ERP utilizado.',
          focus: 'Cadastros + financeiro',
          modules: 'Mapeamento de dados, validação, API, sincronização e histórico',
          next: 'Conferir campos, permissões e regras de atualização',
          contactFocus: 'sincronizar cadastros e dados financeiros com o ERP'
        }
      ]
    },
    data: {
      greeting: 'Neste exemplo, vamos transformar dados espalhados em indicadores que a equipe consiga acompanhar.',
      startLabel: 'Quero organizar meus dados',
      startHint: 'Comece o cenário de dashboards e dados.',
      opening: 'Tenho dados em planilhas e sistemas diferentes, mas não consigo enxergar o resultado com clareza.',
      question: 'Você precisa acompanhar mais os indicadores de vendas e operação ou juntar fontes diferentes em um painel confiável?',
      choiceHint: 'Escolha o objetivo do painel.',
      solution: 'Dashboards & dados operacionais',
      options: [
        {
          label: 'Indicadores de vendas e operação',
          reply: 'Quero ver vendas, pedidos e gargalos da operação em um só lugar.',
          answer: 'Podemos definir as métricas com a equipe, integrar as fontes e montar um dashboard com evolução, filtros e indicadores úteis para a rotina. Os números exibidos serão definidos a partir dos dados reais e das regras do negócio.',
          focus: 'Vendas + operação',
          modules: 'Indicadores, integração de fontes, filtros e visualizações',
          next: 'Definir métricas, fontes e frequência de atualização',
          contactFocus: 'criar dashboards de vendas e operação'
        },
        {
          label: 'Unir planilhas, APIs e bases',
          reply: 'O maior problema é consolidar planilhas, APIs e o banco de dados sem divergências.',
          answer: 'O primeiro passo é revisar as fontes e criar um processo de coleta, limpeza e modelagem. Com os dados organizados, posso construir consultas e painéis para acompanhar o que importa para a empresa.',
          focus: 'Consolidação de dados',
          modules: 'Coleta, ETL, modelagem, validação e painéis',
          next: 'Avaliar fontes, qualidade dos dados e regras de transformação',
          contactFocus: 'consolidar planilhas, APIs e bases de dados'
        }
      ]
    },
    security: {
      greeting: 'Vamos simular uma conversa sobre melhorias de segurança em sistemas e integrações.',
      startLabel: 'Quero revisar meu sistema',
      startHint: 'Comece o cenário de desenvolvimento seguro.',
      opening: 'Nosso sistema cresceu e queremos melhorar a proteção dos acessos e dos dados.',
      question: 'O ponto mais urgente está nas permissões dos usuários ou na segurança das APIs, credenciais e registros?',
      choiceHint: 'Escolha a prioridade de segurança.',
      solution: 'Cibersegurança & boas práticas',
      options: [
        {
          label: 'Acessos e permissões',
          reply: 'Pessoas de áreas diferentes enxergam informações que não deveriam acessar.',
          answer: 'Eu revisaria os perfis, as regras de autorização e os fluxos de autenticação. A partir disso, implementaria controles e testes para que cada pessoa acesse somente o que precisa.',
          focus: 'Acessos + permissões',
          modules: 'Autenticação, autorização por perfil, revisão de rotas e testes',
          next: 'Mapear perfis, dados sensíveis e regras de acesso',
          contactFocus: 'revisar acessos e permissões do sistema'
        },
        {
          label: 'APIs, credenciais e logs',
          reply: 'Temos integrações por API e queremos cuidar melhor das credenciais e dos registros.',
          answer: 'Podemos revisar validação de entradas, armazenamento de segredos, permissões das integrações e logs de eventos. As melhorias entram no processo de desenvolvimento e são priorizadas conforme o risco e o uso do sistema.',
          focus: 'APIs + credenciais',
          modules: 'Validação de APIs, gestão de segredos, logs e revisão de código',
          next: 'Levantar integrações, credenciais e pontos de exposição',
          contactFocus: 'melhorar a segurança de APIs, credenciais e logs'
        }
      ]
    }
  };

  async function finalizeAdditional(token, definition, option) {
    details.contactFocus = option.contactFocus;
    if (!(await say('client', option.reply, token))) return;
    setStage(2, ['Solicitação recebida', 'Prioridade identificada', 'Próximo passo sugerido']);
    if (!(await say('bot', option.answer, token))) return;
    showRecord([
      ['Serviço indicado', definition.solution],
      ['Foco principal', option.focus],
      ['Etapas possíveis', option.modules],
      ['Próximo passo', option.next]
    ]);
    setStage(2, ['Interesse recebido', 'Prioridade mapeada', 'Diagnóstico sugerido'], true);
    announce(`Demonstração concluída com direcionamento para ${definition.solution}.`);
    finishedChoices();
  }

  async function startAdditional(token) {
    const definition = additionalScenarios[scenario];
    if (!(await say('client', definition.opening, token))) return;
    setStage(1, ['Solicitação recebida', 'Entender prioridade', 'Definir próximo passo']);
    if (!(await say('bot', definition.question, token))) return;
    setChoices(definition.options.map((option) => ({
      label: option.label,
      action: (nextToken) => finalizeAdditional(nextToken, definition, option)
    })), definition.choiceHint);
  }

  function resetScenario(nextScenario, notify) {
    generation += 1;
    Array.from(pendingWaits).forEach((task) => task.finish(false));
    scenario = nextScenario;
    running = false;
    paused = false;
    details = {};
    transcript.replaceChildren();
    clearRecord();
    setStage(0, ['Aguardando sua escolha', 'Necessidade identificada', 'Próximo passo']);
    scenarioButtons.forEach((button, id) => button.setAttribute('aria-pressed', String(id === scenario)));
    shell.dataset.scenario = scenario;
    if (scenario === 'operations') {
      instantMessage('bot', 'Olá! Sou a Samira. Vamos simular como um atendimento pode identificar a necessidade de uma operação e direcionar a solução ideal?');
      setChoices([
        { label: 'Quero organizar minha operação', action: startOperations }
      ], 'Comece o cenário da Atalanta.');
    } else if (scenario === 'agent') {
      instantMessage('bot', 'Neste exemplo, eu posso mostrar como uma empresa pode enquadrar um agente de IA para WhatsApp com foco comercial e operacional.');
      setChoices([
        { label: 'Quero aplicar IA no WhatsApp', action: startAgent }
      ], 'Comece o cenário do agente de IA.');
    } else if (scenario === 'automation') {
      instantMessage('bot', 'Agora vamos simular uma conversa sobre integrações e automações para reduzir tarefas manuais e conectar sistemas.');
      setChoices([
        { label: 'Quero automatizar processos', action: startAutomation }
      ], 'Comece o cenário de automação.');
    } else {
      const definition = additionalScenarios[scenario];
      instantMessage('bot', definition.greeting);
      setChoices([
        { label: definition.startLabel, action: startAdditional }
      ], definition.startHint);
    }
    syncPauseControl();
    if (notify) {
      const current = scenarioDefinitions.find((item) => item.id === scenario);
      announce('Cenário ' + current.label + ' iniciado. Escolha uma resposta pronta para continuar.');
    }
  }

  pauseButton.addEventListener('click', () => {
    if (!running) return;
    paused = !paused;
    syncPauseControl();
    announce(paused ? 'Conversa pausada.' : 'Conversa retomada.');
  });
  resetButton.addEventListener('click', () => {
    focusNextChoice = false;
    resetScenario(scenario, true);
  });
  document.addEventListener('visibilitychange', syncPauseControl);
  reducedMotion.addEventListener('change', syncPauseControl);
  window.addEventListener('portfolio:motion', (event) => {
    if (event.detail && typeof event.detail.enabled === 'boolean') {
      motionPreference = event.detail.enabled;
      syncPauseControl();
    }
  });
  resetScenario('operations', false);
}());
