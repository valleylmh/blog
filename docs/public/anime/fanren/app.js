(() => {
  'use strict';
  const data = window.CHRONICLE;
  const ranks = window.CULTIVATION;
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels = {growth:'修行',crisis:'危机／受创',love:'情缘',kin:'亲友／师承',turn:'重要转折'};
  const eventById = new Map(data.events.map(e => [e.id, e]));
  const eventOrder = new Map(data.events.map((e, i) => [e.id, i + 1]));
  const rankById = new Map(ranks.map(r => [`rank-${r.id}`, r]));
  const eventCorpus = new Map(data.events.map(e => [e.id, JSON.stringify({...e, sources:undefined}).toLocaleLowerCase()]));
  const rankCorpus = new Map(ranks.map(r => [r.id, JSON.stringify(r).toLocaleLowerCase() + r.events.map(id => eventCorpus.get(id)).join(' ')]));
  let lens = 'all';
  let query = '';
  let expanded = false;
  let chapterObserver;
  const eventLink = (id, label) => `<a href="#${id}" data-event-link="${id}">${esc(label || eventById.get(id)?.title || id)}</a>`;
  const rankLink = (id, label) => `<a href="#rank-${id}" data-rank-link="rank-${id}">${esc(label)}</a>`;
  const queryMatches = text => query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean).every(term => text.includes(term));
  const matches = e => (lens === 'all' || (lens === 'crisis' ? e.tags.some(t => t === 'crisis' || t === 'turn') : e.tags.includes(lens))) && queryMatches(eventCorpus.get(e.id));
  const scrollTo = target => target?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'start'});
  const foesHTML = foes => `<div class="foes">${foes.map(([name,level,result]) => `<div class="foe"><div><strong>${esc(name)}</strong><small>${esc(level)}</small></div><p>${esc(result)}</p></div>`).join('')}</div>`;

  function eventHTML(e) {
    const p = e.promotion;
    const harm = e.injury;
    return `<article class="event${harm ? ' has-injury' : ''}" id="${e.id}" aria-labelledby="title-${e.id}">
      <div class="event-card"><div class="event-top"><span class="event-number">${String(eventOrder.get(e.id)).padStart(3,'0')}</span><div class="event-heading"><p class="event-location">${esc(e.place)}</p><h3 id="title-${e.id}">${esc(e.title)}</h3></div><span class="realm-badge">${esc(e.realm)}</span></div>
      <div class="event-body"><p class="event-summary">${esc(e.summary)}</p>
      ${harm ? `<div class="injury-record"><b>${esc(harm.kind)}</b><dl><div><dt>危机</dt><dd>${esc(harm.damage)}</dd></div><div><dt>脱险／应对</dt><dd>${esc(harm.rescue)}</dd></div><div><dt>后果</dt><dd>${esc(harm.after)}</dd></div></dl></div>` : ''}
      <div class="event-tagline">${e.tags.map(t => `<span class="tag ${t}">${labels[t]}</span>`).join('')}</div></div>
      <details${expanded ? ' open' : ''}><summary>展开：前因、修行与人物线</summary><div class="detail-body">
      <div class="detail-row"><b>为什么走到这一步</b><p>${esc(e.cause)}</p></div>
      ${p ? `<div class="detail-row promotion-row"><b>${esc(p.path)} · ${esc(p.kind)}</b><p class="promotion-flow">${esc(p.before)} <span>→</span> ${esc(p.after)}</p><p>${esc(p.how)}</p></div>` : ''}
      ${e.epiphany ? `<div class="detail-row insight-row"><b>这一程的体会</b><p>${esc(e.epiphany)}</p></div>` : ''}
      ${e.foes?.length ? `<div class="detail-row"><b>对手、实力与结果</b>${foesHTML(e.foes)}</div>` : ''}
      ${e.love ? `<div class="detail-row love"><b>情缘如何变化</b><p>${esc(e.love)}</p></div>` : ''}
      ${e.kin ? `<div class="detail-row kin"><b>亲友与师承</b><p>${esc(e.kin)}</p></div>` : ''}
      ${e.note ? `<p class="rank-note">${esc(e.note)}</p>` : ''}
      <div class="detail-sources">核对与阅读：${e.sources.map(n => `<a href="#source-${n}">${esc(data.sources[n-1].title)} [${n}]</a>`).join(' · ')}</div>
      </div></details></div></article>`;
  }

  function rankHTML(r, i) {
    return `<article class="rank-card" id="rank-${r.id}" aria-labelledby="rank-title-${r.id}"><header><span class="rank-index">${String(i+1).padStart(2,'0')}</span><div><p class="rank-from">${esc(r.from)} →</p><h3 id="rank-title-${r.id}">${esc(r.realm)}</h3></div><span class="rank-kind">${esc(r.kind)}</span></header><p class="rank-place">${esc(r.world)} · ${esc(r.place)}</p><p class="rank-scene">${esc(r.scene)}</p><div class="rank-key"><b>突破契机与条件</b><p>${esc(r.key)}</p></div>${r.foes.length ? `<h4>这一程遇到的强敌与风险</h4>${foesHTML(r.foes)}` : `<p class="rank-note">${esc(r.noFoesNote || '这是同一灌体的连续过程，原著没有为这一小阶段另设独立交手。')}</p>`}${r.note ? `<p class="rank-note">${esc(r.note)}</p>` : ''}<div class="rank-events"><b>回到故事，展开相关场景</b>${r.events.map(id => eventLink(id)).join('')}</div></article>`;
  }

  const lensNotes = {
    all:'按原著先后阅读。展开节点，查看前因、对手、突破条件和人物关系；红色区块记录危机与代价。',
    crisis:'汇集夺舍、追杀、封印、失去与重大命运转折。身体受创、环境压制、道侣和故人遭难分别记述。',
    growth:'按实际境界与重要小阶段阅读，单列伤后恢复、连续灌体。每一程都能回到具体故事。',
    love:'先看三条主要路线，再读事件。道侣、双向情意、单向情感与修行合作按各自关系记录。',
    kin:'沿家人、故友、师长和弟子的线索阅读。约定、救助、传承和诀别各有发生的阶段。'
  };

  function observeChapters() {
    chapterObserver?.disconnect();
    $('#chapter-nav').querySelectorAll('a').forEach(a => {a.classList.remove('current'); a.removeAttribute('aria-current');});
    if (lens === 'growth') return;
    chapterObserver = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        $('#chapter-nav').querySelectorAll('a').forEach(a => {
          const current = a.hash === `#${entry.target.id}`;
          a.classList.toggle('current', current);
          if (current) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
        });
      }
    }, {rootMargin:'-15% 0px -65% 0px', threshold:0});
    document.querySelectorAll('.chapter').forEach(c => chapterObserver.observe(c));
  }

  function render() {
    const isGrowth = lens === 'growth';
    $('#cultivation').hidden = !isGrowth;
    $('#story').hidden = isGrowth;
    $('#love-routes').hidden = lens !== 'love' || !!query;
    $('#toggle-details').hidden = isGrowth;
    $('#clear-search').hidden = !query;
    $('#lens-note').textContent = lensNotes[lens];
    let count;
    const activeChapters = new Set();
    if (isGrowth) {
      const filteredRanks = ranks.filter(r => queryMatches(rankCorpus.get(r.id)));
      count = filteredRanks.length;
      $('#cultivation-list').innerHTML = filteredRanks.map(r => rankHTML(r, ranks.indexOf(r))).join('');
      $('#cultivation-nav').innerHTML = filteredRanks.map(r => rankLink(r.id, r.realm)).join('');
    } else {
      count = data.events.filter(matches).length;
      $('#story').innerHTML = data.chapters.map((c, i) => {
        const events = data.events.filter(e => e.chapter === c.id && matches(e));
        if (!events.length) return '';
        activeChapters.add(c.id);
        return `<section class="chapter" id="${c.id}" aria-labelledby="chapter-${c.id}"><div class="chapter-heading"><span class="chapter-numeral">${String(i+1).padStart(2,'0')}</span><div><span class="chapter-world">${esc(c.world)}</span><h3 class="chapter-title" id="chapter-${c.id}">${esc(c.title)}</h3><p class="chapter-sub">${esc(c.sub)}</p></div><span class="chapter-rule"></span><span class="chapter-kicker">${esc(c.scope)}</span></div><div class="events">${events.map(eventHTML).join('')}</div></section>`;
      }).join('');
    }
    $('#chapter-nav').querySelectorAll('a').forEach(a => {a.hidden = !isGrowth && !activeChapters.has(a.dataset.chapterLink);});
    $('#visible-count').textContent = isGrowth ? `${count} 个修行阶段` : `${count} / ${data.events.length} 个事件`;
    $('#empty-state').hidden = count !== 0;
    measureHeaders();
    observeChapters();
  }

  function setLens(next) {
    if (!Object.hasOwn(lensNotes, next)) return;
    lens = next;
    document.querySelectorAll('[data-lens]').forEach(button => {
      const active = button.dataset.lens === lens;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    render();
  }

  function clearSearch() { query = ''; $('#story-search').value = ''; }
  function revealTarget(target) {
    if (!target) return;
    target.setAttribute('tabindex', '-1');
    target.focus({preventScroll:true});
    scrollTo(target);
  }
  function openEvent(id, updateHistory = true) {
    if (!eventById.has(id)) return;
    if (lens === 'growth' || !matches(eventById.get(id))) {clearSearch(); setLens('all');}
    const target = document.getElementById(id);
    target.querySelector('details').open = true;
    if (updateHistory && location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    revealTarget(target);
  }
  function openRank(id, updateHistory = true) {
    if (!rankById.has(id)) return;
    clearSearch(); setLens('growth');
    if (updateHistory && location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    revealTarget(document.getElementById(id));
  }
  function resolveHash() {
    const id = location.hash.slice(1);
    if (eventById.has(id)) openEvent(id, false);
    else if (rankById.has(id)) openRank(id, false);
    else if (data.chapters.some(c => c.id === id)) {
      if (lens === 'growth' || !document.getElementById(id)) {clearSearch(); setLens('all');}
      scrollTo(document.getElementById(id));
    }
  }

  $('#chapter-nav').innerHTML = data.chapters.map((c, i) => `<a href="#${c.id}" data-chapter-link="${c.id}"><b>${String(i+1).padStart(2,'0')}</b>${esc(c.title)}</a>`).join('');
  $('#event-count').textContent = `${data.events.length} 个故事事件`;
  $('#coverage-summary').innerHTML = [[data.chapters.length,'卷故事'],[data.events.length,'个事件'],[ranks.length,'个修行阶段'],[data.events.filter(e => e.injury).length,'项危机记录']].map(([count,label]) => `<span><strong>${count}</strong>${label}</span>`).join('');
  $('#parallel-list').innerHTML = window.PARALLEL_PATHS.map(path => `<div><b>${esc(path.title)}</b><p>${esc(path.text)}</p><div class="small-links">${path.events.map(id => eventLink(id)).join('')}</div></div>`).join('');
  $('#love-routes').innerHTML = `<div class="route-intro"><h3>有各自的起点，也有各自的归路</h3><p>三条主要路线都能跳回故事；关系由原著事件说明。</p></div><div class="love-route-grid">${data.loveRoutes.map(route => `<article class="love-route"><h3>${esc(route.name)}</h3><p class="route-caption">${esc(route.caption)}</p><p class="route-description">${esc(route.description)}</p><ol>${route.steps.map(([id,title,text]) => `<li>${eventLink(id,title)}<p>${esc(text)}</p></li>`).join('')}</ol></article>`).join('')}</div><div class="side-affection"><b>旁边的交集，也各有来处</b><p>陈巧倩、墨彩环、梅凝等人的情意与去向，保留在早年事件中。冰凤的互助与突破助力、慕沛灵的身份关系分别记述。</p></div>`;

  const realmSteps = [
    ['人界起步','药、灵根与功法',[['qi','炼气'],['foundation-early','筑基'],['core-early','结丹'],['nascent-early','元婴']],'筑基丹、海外妖丹与结婴准备各有阶段。曲魂煞丹先于本体结丹，另行记录。'],
    ['跨界前后','恢复与再积累',[['deity-early','化神'],['void-early','炼虚'],['body-early','合体']],'化神后冒险穿空间节点，在灵界恢复法力。广寒界灌体到炼虚巅峰，合体在回归后正式突破。'],
    ['灵界终段','根基、心魔与渡劫',[['mahayana','大乘'],['ascension','飞升之劫'],['ascension','仙界起点']],'洗灵池为大乘准备，斩马良是真仙之战的战果。最终飞升之劫仍需要漫长修炼与准备。']
  ];
  $('#realm-map').innerHTML = realmSteps.map(([title,sub,chain,note]) => `<div class="realm-step"><h3>${esc(title)}<small>${esc(sub)}</small></h3><div><div class="realm-chain">${chain.map(([id,label]) => rankLink(id,label)).join('<em>→</em>')}</div><p>${esc(note)}</p></div></div>`).join('');

  const tones = {love:'#d6a0ae',kin:'#a9c1ac',mentor:'#9fc0cd',foe:'#d3a086'};
  const groupNames = [...new Set(data.relationships.map(r => r.group))];
  const groups = groupNames.map((group, i) => ({group,x:i%2 ? 665 : 23,y:i<2 ? 32 : 422}));
  const center = {x:410,y:340,w:190,h:103};
  const nodes = [], paths = [];
  for (const {group,x,y} of groups) data.relationships.filter(r => r.group === group).forEach((r, i) => {
    const ny = y + 35 + i * 62;
    const edgeX = x < 400 ? x + 290 : x;
    const startX = x < 400 ? center.x : center.x + center.w;
    paths.push(`<path d="M ${startX} 392 C ${x<400 ? 365 : 630} 392, ${x<400 ? 365 : 630} ${ny+26}, ${edgeX} ${ny+26}" stroke="${tones[r.tone]}"${r.tone === 'foe' ? ' stroke-dasharray="5 6"' : ''}/>`);
    nodes.push(`<a href="#${r.event}" data-event-link="${r.event}" aria-label="${esc(r.name + '：' + r.label)}"><rect x="${x}" y="${ny}" width="290" height="51" rx="4" fill="#152629" stroke="${tones[r.tone]}"/><text x="${x+14}" y="${ny+22}" class="relation-name">${esc(r.name)}</text><text x="${x+14}" y="${ny+40}" class="relation-label">${esc(r.label)}</text></a>`);
  });
  $('#relationship-diagram').innerHTML = `<div class="relation-legend">${Object.entries(tones).map(([tone,color]) => `<span style="--relation-color:${color}">${{love:'情缘与牵挂',kin:'亲友与同行',mentor:'师承与弟子',foe:'强敌、转变与合作'}[tone]}</span>`).join('')}</div><p class="graph-mobile-note">窄屏可横向滑动；图下方也有完整的文字关系清单。</p><div class="relation-scroll" tabindex="0" role="region" aria-label="可横向滚动的韩立人物关系图"><svg viewBox="0 0 980 805" class="relation-svg" role="img" aria-labelledby="relation-title relation-desc"><title id="relation-title">韩立人物关系图</title><desc id="relation-desc">围绕韩立，${data.relationships.length}组人物分成情缘、师承、亲友、强敌四类，选择节点可回到相关事件。</desc><g fill="none" stroke-width="1.4" opacity=".4">${paths.join('')}</g>${groups.map(g => `<text x="${g.x}" y="${g.y+14}" class="relation-group">${esc(g.group)}</text>`).join('')}<rect x="410" y="340" width="190" height="103" rx="5" fill="#25372e" stroke="#d1b880" stroke-width="1.6"/><text x="505" y="383" text-anchor="middle" class="relation-center">韩立</text><text x="505" y="410" text-anchor="middle" class="relation-label">求道 · 守约 · 故人</text>${nodes.join('')}</svg></div><details class="relation-list"><summary>文字版关系清单 · ${data.relationships.length} 组人物</summary><ul>${data.relationships.map(r => `<li><b>${esc(r.group)}</b> · ${eventLink(r.event,r.name)}：${esc(r.label)}</li>`).join('')}</ul></details>`;
  $('#people-grid').innerHTML = data.people.map(p => `<article class="person"><header><span class="person-seal" aria-hidden="true">${esc(p.seal)}</span><div><p class="person-meta">${esc(p.type)}</p><h3>${esc(p.name)}</h3></div></header><p>${esc(p.text)}</p><div class="person-links">${p.events.map(([id,label]) => eventLink(id,label)).join('')}</div></article>`).join('');
  $('#source-list').innerHTML = data.sources.map((source, i) => `<li id="source-${i+1}"><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a> — ${esc(source.note)}</li>`).join('');

  document.querySelectorAll('[data-lens]').forEach(button => button.addEventListener('click', () => setLens(button.dataset.lens)));
  $('#story-search').addEventListener('input', event => {query = event.target.value.trim(); render();});
  $('#clear-search').addEventListener('click', () => {clearSearch(); render(); $('#story-search').focus();});
  $('#reset-filters').addEventListener('click', () => {clearSearch(); setLens('all'); scrollTo($('.reading-controls'));});
  $('#toggle-details').addEventListener('click', () => {
    expanded = !expanded;
    document.querySelectorAll('#story .event details').forEach(details => {details.open = expanded;});
    $('#toggle-details').textContent = expanded ? '收起本页详情' : '展开本页详情';
    $('#toggle-details').setAttribute('aria-pressed', String(expanded));
  });
  document.addEventListener('click', event => {
    const eventAnchor = event.target.closest('[data-event-link]');
    if (eventAnchor) {event.preventDefault(); openEvent(eventAnchor.dataset.eventLink); return;}
    const rankAnchor = event.target.closest('[data-rank-link]');
    if (rankAnchor) {event.preventDefault(); openRank(rankAnchor.dataset.rankLink); return;}
    const chapterAnchor = event.target.closest('[data-chapter-link]');
    if (chapterAnchor && (lens === 'growth' || !document.getElementById(chapterAnchor.dataset.chapterLink))) {
      clearSearch(); setLens('all');
    }
  });
  window.addEventListener('hashchange', resolveHash);
  window.addEventListener('popstate', resolveHash);
  $('#back-top').addEventListener('click', () => scrollTo($('#top')));
  window.addEventListener('scroll', () => {$('#back-top').hidden = window.scrollY < 1000;}, {passive:true});
  function measureHeaders() {
    const headerHeight = Math.ceil($('.topbar').getBoundingClientRect().height);
    const controlsHeight = Math.ceil($('.reading-controls').getBoundingClientRect().height);
    $('.reading-controls').style.top = `${headerHeight}px`;
    document.documentElement.style.setProperty('--topbar-height', `${headerHeight}px`);
    document.documentElement.style.setProperty('--scroll-top', `${headerHeight + controlsHeight + 18}px`);
  }
  const resizeObserver = new ResizeObserver(measureHeaders);
  resizeObserver.observe($('.topbar'));
  resizeObserver.observe($('.reading-controls'));
  setLens('all');
  measureHeaders();
  if (location.hash) requestAnimationFrame(resolveHash);
})();
