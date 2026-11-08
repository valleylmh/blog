(() => {
  const host = document.getElementById('power-explorer');
  const model = window.POWER_RANKING;
  if (!host || !model) return;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const names = new Set([...model.snapshots.flatMap(s => s.rows), ...model.peak.flatMap(t => t.rows)].filter(p => !p.group).map(p => p.name));
  const sources = new Map(model.sources.map(s => [s.id, s]));
  const byId = new Map(model.snapshots.map(s => [s.id, s]));
  const route = new URL(location.href);
  const state = {view:route.searchParams.get('power_view') === 'peak' ? 'peak' : 'stage', step:'all', realm:'all', zone:'all', query:'',
    scene:byId.has(route.searchParams.get('power_scene')) ? route.searchParams.get('power_scene') : model.snapshots[0].id, person:'王林'};
  const bandTitles = {1:'第一档',2:'第二档',3:'第三档'};
  const imageFor = name => window.RELATIONSHIP_PORTRAITS?.[model.portraits[name]];
  const avatar = (name, large = false) => imageFor(name)
    ? `<img class="power-avatar${large?' is-large':''}" src="${esc(imageFor(name))}" alt="${esc(name)}的 AI 创作画像" loading="lazy" width="${large?180:56}" height="${large?180:56}">`
    : `<span class="power-avatar power-letter${large?' is-large':''}" aria-hidden="true">${esc(name.replace(/^(古魔|古妖|仙皇)/,'').slice(0,1))}</span>`;
  const refs = ids => [...new Set(ids)].map(id => {
    const source = sources.get(id);
    return source ? `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)} ↗</a>` : '';
  }).join('');
  const eventLink = id => `<a href="#${esc(id)}" data-event-link="${esc(id)}">回到故事 · ${esc(window.CHRONICLE.events.find(e=>e.id===id)?.title || id)} ↗</a>`;
  const matches = snapshot => {
    const step = model.steps.find(s => s.id === state.step);
    if (step && !snapshot.covers.some(n => step.stages.includes(n))) return false;
    if (state.realm !== 'all' && !snapshot.covers.includes(Number(state.realm))) return false;
    if (state.zone !== 'all' && snapshot.zone !== state.zone) return false;
    const haystack = [snapshot.title, snapshot.realm, model.zones[snapshot.zone], ...snapshot.rows.flatMap(p => [p.name, ...(model.aliases[p.name] || [])])].join(' ').toLowerCase();
    return !state.query || haystack.includes(state.query.toLowerCase());
  };
  const filtered = () => model.snapshots.filter(matches);
  host.classList.add('power-explorer');
  host.innerHTML = `
    <figure class="power-hero"><img src="${esc(model.art.src)}" alt="${esc(model.art.alt)}" width="2172" height="724" loading="lazy">
      <div class="power-art-labels" aria-hidden="true"><span>少年 · 入道</span><span>白发 · 逆修</span><span>踏天 · 归人</span></div>
      <figcaption>${esc(model.art.caption)} <a href="${esc(model.art.src)}" target="_blank" rel="noopener">查看原图 ↗</a></figcaption></figure>
    <div class="power-intro"><div><h3>从一国之敌，到天地之敌。</h3><p>境界看修为，战力看此时、此地、此身。沿王林的脚步，查看每一局的人物与强弱。</p></div>
      <div class="power-stats"><span><b>${window.CULTIVATION.length}</b>修行阶段</span><span><b>${model.snapshots.length}</b>篇章副本</span><span><b>${names.size}</b>代表人物</span></div></div>
    <div class="power-tabs" role="tablist" aria-label="战力榜视角"><button id="power-stage-tab" type="button" role="tab" data-power-view="stage" aria-controls="power-stage-panel">阶段战力榜</button><button id="power-peak-tab" type="button" role="tab" data-power-view="peak" aria-controls="power-peak-panel">巅峰分档榜</button></div>
    <details class="power-method"><summary>这份战力榜怎么读</summary><p>阶段榜以本篇章出现的状态粗分强弱，档内并列。明确交手结果写在“本局战果”，不把设局、联手、重伤或借力获胜直接当作常态高一境。</p><p>古神／古魔／古妖星数独立；金尊、天尊、跃天尊是仙罡力量称谓。巅峰榜按本书有据可辨的主要强者分档，内部不强排；历史传承、残魂和特殊身份另列。不同篇章的人物不假定在同一时刻同场交战。</p><p>全书剧透 · 非官方读者整理 · 资料不能代替逐章校勘。${refs(['original'])}</p></details>
    <section id="power-stage-panel" role="tabpanel" aria-labelledby="power-stage-tab">
      <div class="power-step-filter" role="group" aria-label="修行大阶段"><button type="button" data-power-step="all">全部阶段</button>${model.steps.map(s=>`<button type="button" data-power-step="${s.id}">${esc(s.title)}</button>`).join('')}</div>
      <div class="power-filters"><label>王林境界<select id="power-realm"><option value="all">全部境界</option>${window.CULTIVATION.map((r,i)=>`<option value="${i}">${esc(r.realm)}</option>`).join('')}</select></label>
        <label>所在地图<select id="power-zone"><option value="all">全部地图</option>${Object.entries(model.zones).map(([id,name])=>`<option value="${id}">${esc(name)}</option>`).join('')}</select></label>
        <label>查人物与篇章<input id="power-search" type="search" placeholder="如 红蝶、清水、古道、许木" autocomplete="off"></label></div>
      <div class="power-readout"><p id="power-match-status" role="status" aria-live="polite"></p><button type="button" data-power-reset>重置筛选</button></div>
      <div class="power-scene-picker"><button type="button" data-power-prev aria-label="上一个副本">←</button><label>当前副本<select id="power-scene-select"></select></label><button type="button" data-power-next aria-label="下一个副本">→</button></div>
      <div id="power-stage-content"></div>
    </section>
    <section id="power-peak-panel" role="tabpanel" aria-labelledby="power-peak-tab" hidden><div class="power-peak-lead"><h3>看人物最强时期，也看比较的边界。</h3><p>取《仙逆》小说中的已知层次。仙罡九阳、洞府“仙皇”和第四步分别列出；同档排列顺序不代表精确名次。</p></div><div id="power-peak-list"></div><div class="power-special"><h3>这些人物，另开一栏</h3>${model.unranked.map(p=>`<article><h4>${esc(p.name)}</h4><p>${esc(p.note)}</p></article>`).join('')}</div></section>
    <details class="power-source-details"><summary>人物、境界与战果的核对资料 · ${model.version}</summary><ol>${model.sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a><p>${esc(s.note)}</p></li>`).join('')}</ol><p>阶段基础沿用本页已整理的境界与事件资料，分档为读者归纳。没有可靠细阶或公平交手依据的地方，保留宽泛层次及条件。</p></details>`;

  function writeRoute() {
    const url = new URL(location.href);
    url.searchParams.set('power_view', state.view);
    url.searchParams.set('power_scene', state.scene);
    url.hash = 'power-ranking';
    history.replaceState(null, '', url);
  }
  function updateTabs() {
    host.querySelectorAll('[data-power-view]').forEach(button => {
      const active = button.dataset.powerView === state.view;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    host.querySelector('#power-stage-panel').hidden = state.view !== 'stage';
    host.querySelector('#power-peak-panel').hidden = state.view !== 'peak';
  }
  function updateFilters() {
    host.querySelectorAll('[data-power-step]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.powerStep === state.step)));
    host.querySelector('#power-realm').value = state.realm;
    host.querySelector('#power-zone').value = state.zone;
    host.querySelector('#power-search').value = state.query;
  }
  function rowHTML(row) {
    return `<button type="button" class="power-person-card${row.name==='王林'?' is-protagonist':''}" data-power-person="${esc(row.name)}" aria-pressed="${row.name===state.person}">${avatar(row.name)}<span class="power-person-text"><strong>${esc(row.name)}${row.group?'<small>群体</small>':''}</strong><span class="power-person-realm">${esc(row.realm)}</span><small>${esc(row.role)}</small></span><span class="power-person-chevron" aria-hidden="true">›</span></button>`;
  }
  function renderStage() {
    const list = filtered();
    const select = host.querySelector('#power-scene-select');
    const content = host.querySelector('#power-stage-content');
    host.querySelector('#power-match-status').textContent = `${list.length} / ${model.snapshots.length} 个篇章副本${state.query ? ` · 搜索“${state.query}”` : ''} · 档内并列`;
    if (!list.some(s=>s.id===state.scene) && list.length) state.scene = list[0].id;
    select.disabled = !list.length;
    select.innerHTML = list.length ? list.map(s=>`<option value="${s.id}">${String(model.snapshots.indexOf(s)+1).padStart(2,'0')} · ${esc(s.title)}</option>`).join('') : '<option>没有匹配副本</option>';
    select.value = state.scene;
    const index = list.findIndex(s=>s.id===state.scene);
    host.querySelector('[data-power-prev]').disabled = index <= 0;
    host.querySelector('[data-power-next]').disabled = index < 0 || index >= list.length-1;
    if (!list.length) {
      content.innerHTML = '<div class="power-empty"><h3>这一组合没有匹配的篇章。</h3><p>可换一个境界、地图或人物，也可重置筛选。</p><button type="button" data-power-reset>显示全部副本</button></div>';
      return;
    }
    const snapshot = byId.get(state.scene);
    if (!snapshot.rows.some(p=>p.name===state.person)) state.person = '王林';
    const bands = [1,2,3].filter(b=>snapshot.rows.some(p=>p.band===b));
    const cast = snapshot.rows.filter(p=>p.band===null);
    content.innerHTML = `<div class="power-snapshot-head"><p class="eyebrow">${esc(model.zones[snapshot.zone])} · 第 ${model.snapshots.indexOf(snapshot)+1} 局</p><h3>${esc(snapshot.title)}</h3><div class="power-state-grid"><div><span>王林修士线</span><b>${esc(snapshot.realm)}</b></div><div><span>古族与本尊线</span><b>${esc(snapshot.ancient)}</b></div></div><p class="power-position">${esc(snapshot.position)}</p></div>
      <div class="power-verdict"><b>本局战果</b><p>${esc(snapshot.verdict)}</p></div>
      <div class="power-stage-layout"><div class="power-bands">${bands.map(b=>`<section class="power-band" data-power-band="${b}"><header><span>${String(b).padStart(2,'0')}</span><h4>${bandTitles[b]}<small>本篇章 · 档内并列</small></h4></header><div class="power-band-members">${snapshot.rows.filter(p=>p.band===b).map(rowHTML).join('')}</div></section>`).join('')}
      ${cast.length?`<section class="power-band power-cast"><header><span>·</span><h4>同局人物与特殊状态<small>师友、被救者、残魂、历史与幕后 · 不列斗法名次</small></h4></header><div class="power-band-members">${cast.map(rowHTML).join('')}</div></section>`:''}</div><aside id="power-inspector" class="power-inspector" aria-label="本局人物详情"></aside></div>
      <div class="power-scene-footer"><div>${eventLink(snapshot.event)}<button type="button" data-power-growth="${snapshot.stage}">查看这一级如何突破 ↗</button></div><p>核对资料：${refs(snapshot.sources)}</p></div>`;
    renderInspector();
  }
  function renderInspector() {
    const snapshot = byId.get(state.scene);
    const person = snapshot.rows.find(p=>p.name===state.person);
    const inspector = host.querySelector('#power-inspector');
    if (!person || !inspector) return;
    const trail = model.snapshots.filter(s=>s.rows.some(p=>p.name===person.name));
    const graphId = model.portraits[person.name];
    inspector.innerHTML = `<div class="power-inspector-top">${avatar(person.name,true)}<p>${esc(person.role)}</p><h4>${esc(person.name)}</h4><span>${esc(person.realm)}</span></div><div class="power-inspector-body"><p class="power-inspector-label">${person.band ? `${bandTitles[person.band]} · 本篇章状态` : '本篇章贡献与出场状态'}</p><p>${esc(person.note)}</p>${person.name==='王林'?`<dl><dt>古族支线</dt><dd>${esc(snapshot.ancient)}</dd></dl>`:''}${graphId?`<button type="button" data-power-graph="${graphId}">回到人物关系图 ↗</button>`:''}
      <details class="power-trail" ${trail.length<7?'open':''}><summary>跨篇章足迹 · ${trail.length} 处</summary><div>${trail.map(s=>`<button type="button" data-power-scene="${s.id}" data-power-keep-person="${esc(person.name)}" ${s.id===snapshot.id?'aria-current="true"':''}><span>${esc(s.title)}</span><small>${esc(s.rows.find(p=>p.name===person.name).realm)}</small></button>`).join('')}</div></details></div>`;
    host.querySelectorAll('[data-power-person]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.powerPerson===state.person)));
  }
  function renderPeak() {
    host.querySelector('#power-peak-list').innerHTML = model.peak.map(tier=>`<article class="power-peak-tier" data-peak-tier="${tier.id}"><header><span>${tier.mark}</span><div><h3>${esc(tier.title)}</h3><p>${esc(tier.note)}</p></div></header><div class="power-peak-members">${tier.rows.map(p=>`<div class="power-peak-person">${avatar(p.name)}<div><h4>${esc(p.name)}</h4><b>${esc(p.realm)}</b><p>${esc(p.note)}</p>${model.snapshots.some(s=>s.rows.some(r=>r.name===p.name))?`<button type="button" data-power-follow="${esc(p.name)}">查看阶段足迹 ↗</button>`:''}</div></div>`).join('')}</div><div class="power-peak-refs">${refs(tier.sources)}</div></article>`).join('');
  }
  function resetFilters() {state.step='all'; state.realm='all'; state.zone='all'; state.query='';}
  function chooseScene(id, keepPerson) {
    if (!byId.has(id)) return;
    if (!matches(byId.get(id))) resetFilters();
    state.scene=id;
    if (keepPerson) state.person=keepPerson;
    updateFilters(); renderStage(); writeRoute();
  }
  host.addEventListener('input', event => {
    if (event.target.id !== 'power-search') return;
    state.query=event.target.value.trim(); renderStage();
  });
  host.addEventListener('change', event => {
    if (event.target.id==='power-realm') state.realm=event.target.value;
    else if (event.target.id==='power-zone') state.zone=event.target.value;
    else if (event.target.id==='power-scene-select') {chooseScene(event.target.value);return;}
    else return;
    renderStage(); writeRoute();
  });
  host.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-power-view')) {state.view=button.dataset.powerView;updateTabs();writeRoute();}
    else if (button.hasAttribute('data-power-step')) {
      state.step=button.dataset.powerStep;
      const step=model.steps.find(s=>s.id===state.step);
      if (step && state.realm!=='all' && !step.stages.includes(Number(state.realm))) state.realm='all';
      updateFilters();renderStage();writeRoute();
    } else if (button.hasAttribute('data-power-reset')) {resetFilters();updateFilters();renderStage();writeRoute();}
    else if (button.hasAttribute('data-power-prev') || button.hasAttribute('data-power-next')) {
      const list=filtered(), index=list.findIndex(s=>s.id===state.scene), delta=button.hasAttribute('data-power-prev')?-1:1;
      if (list[index+delta]) chooseScene(list[index+delta].id);
    } else if (button.hasAttribute('data-power-person')) {
      state.person=button.dataset.powerPerson;renderInspector();
      if (host.getBoundingClientRect().width <= 620) {
        requestAnimationFrame(() => host.querySelector('#power-inspector')?.scrollIntoView({block:'start',behavior:'instant'}));
      }
    }
    else if (button.hasAttribute('data-power-scene')) chooseScene(button.dataset.powerScene,button.dataset.powerKeepPerson);
    else if (button.hasAttribute('data-power-follow')) {
      resetFilters();state.query=button.dataset.powerFollow;state.person=button.dataset.powerFollow;state.view='stage';
      updateTabs();updateFilters();renderStage();writeRoute();host.querySelector('#power-match-status').scrollIntoView({block:'center'});
    } else if (button.hasAttribute('data-power-graph')) {
      const node=document.querySelector(`.relationship-node[data-person="${button.dataset.powerGraph}"]`);
      if (node) {node.click();node.scrollIntoView({block:'center'});node.focus({preventScroll:true});}
    } else if (button.hasAttribute('data-power-growth')) {
      document.querySelector('[data-lens="growth"]').click();
      document.getElementById(`rank-${Number(button.dataset.powerGrowth)+1}`)?.scrollIntoView({block:'start'});
    }
  });
  host.querySelector('.power-tabs').addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    state.view=event.key==='Home'?'stage':event.key==='End'?'peak':state.view==='stage'?'peak':'stage';
    updateTabs();writeRoute();host.querySelector(`[data-power-view="${state.view}"]`).focus();
  });
  updateTabs();updateFilters();renderPeak();renderStage();
})();
