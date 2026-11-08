(() => {
  const model=window.RELATIONSHIP_GRAPH;
  const host=document.getElementById('relationship-diagram');
  if(!host||!model)return;
  const portraits=window.RELATIONSHIP_PORTRAITS||{};
  const nodes=new Map([model.center,...model.nodes].map(n=>[n.id,n]));
  const groups=new Map(model.groups.map(g=>[g.id,g]));
  let selected='wanglin',filter='all';
  let view=matchMedia('(max-width:760px)').matches?'list':'graph';
  let resizeFrame;
  const avatar=(node,className='')=>{
    // 转世后的东梅不重复套用李倩梅画像，人物组也不套用某一成员的脸。
    const src=portraits[node.id];
    return `<span class="relationship-avatar ${className}" aria-hidden="true">${src?`<img src="${esc(src)}" alt="" width="256" height="256" loading="lazy">`:`<span>${esc(node.name.slice(0,1))}</span>`}</span>`;
  };
  const nodeButton=(node,center=false)=>`<button class="relationship-node${center?' relationship-center':''}" type="button" data-person="${node.id}" aria-pressed="${node.id===selected}" aria-controls="relationship-inspector" aria-label="${esc(node.name+'：'+node.label)}" style="--relationship-tone:${groups.get(node.group)?.color||'#d8b477'}">${avatar(node)}<span class="relationship-node-copy"><strong>${esc(node.name)}</strong><small>${esc(node.label)}</small></span>${center?'<span class="relationship-center-note">点选故人<br>循关系读故事</span>':''}</button>`;
  host.className='relationship-explorer';
  host.innerHTML=`<div class="relationship-controls"><div class="relationship-filters" role="group" aria-label="筛选人物关系"><button type="button" data-relation-filter="all" aria-pressed="true">全部关系</button>${model.groups.map(g=>`<button type="button" data-relation-filter="${g.id}" aria-pressed="false" style="--relationship-tone:${g.color}">${g.short}<small>${model.nodes.filter(n=>n.group===g.id).length}</small></button>`).join('')}</div><div class="relationship-view-toggle" role="group" aria-label="关系图显示方式"><button type="button" data-relation-view="graph">图谱</button><button type="button" data-relation-view="list">列表</button></div></div>
  <div class="relationship-readout"><p id="relationship-status" aria-live="polite"></p><a href="#relationship-inspector" class="relationship-detail-link">关系详解</a></div>
  <div class="relationship-viewport"><div class="relationship-scene"><svg class="relationship-connections" aria-hidden="true" focusable="false"></svg><div class="relationship-center-slot">${nodeButton(model.center,true)}</div>${model.groups.map(g=>`<section class="relationship-group relationship-group-${g.id}" data-relation-group="${g.id}" style="--relationship-tone:${g.color}"><header><h3>${g.name}</h3><p>${g.note}</p></header><div class="relationship-members">${model.nodes.filter(n=>n.group===g.id).map(n=>nodeButton(n)).join('')}</div></section>`).join('')}</div></div>
  <p class="relationship-caption">实线连接王林与故人，虚线标出选中人物的身份或事件关联。人物画像为 AI 创作示意，非官方动画形象。<span class="relationship-pan-note">图谱可横向滑动；切到列表可直接逐人阅读。</span></p>
  <section id="relationship-inspector" class="relationship-inspector" aria-labelledby="relationship-person-name"></section>
  <details class="relationship-text-list"><summary>全部人物关系与事件索引</summary>${model.groups.map(g=>`<section><h3>${g.name}</h3><ul>${model.nodes.filter(n=>n.group===g.id).map(n=>`<li><b>${esc(n.name)}</b>：${esc(n.label)} · ${n.steps.map(([id,title])=>eventLink(id,title)).join('、')}</li>`).join('')}</ul></section>`).join('')}</details>`;

  function neighbors(id){
    return model.links.filter(link=>link.from===id||link.to===id);
  }
  function updateInspector(){
    const node=nodes.get(selected),group=groups.get(node.group);
    const connections=neighbors(selected);
    const caption=portraits[node.id]?'AI 人物形象示意':'人物关系索引';
    const original=window.RELATIONSHIP_ORIGINAL_PORTRAITS?.[node.id]||portraits[node.id];
    const detailArt=portraits[node.id]?`<a href="${esc(original)}" target="_blank" rel="noopener noreferrer" class="relationship-art-link" aria-label="查看${esc(node.name)}完整画像">${avatar(node,'relationship-detail-avatar')}</a>`:avatar(node,'relationship-detail-avatar');
    host.querySelector('#relationship-inspector').innerHTML=`<div class="relationship-person-intro">${detailArt}<div><p class="relationship-person-type" style="--relationship-tone:${group?.color||'#d8b477'}">${group?.name||'故事的中心'}</p><h3 id="relationship-person-name">${esc(node.name)}</h3><p>${esc(node.label)}</p><small>${caption}${portraits[node.id]?' · 点画像看大图':''}</small></div></div><div class="relationship-person-story"><h4>${esc(node.role||'修行路上的关系与选择')}</h4><p>${esc(node.description)}</p>${connections.length?`<div class="relationship-related"><h4>还需辨清的关系</h4>${connections.map(link=>{const other=nodes.get(link.from===selected?link.to:link.from);return `<div><button type="button" data-person="${other.id}" class="relationship-peer">${esc(other.name)}</button><span>${esc(link.label)}</span>${eventLink(link.event,'看相关事件')}</div>`;}).join('')}</div>`:selected==='wanglin'?`<div class="relationship-overview">${model.groups.map(g=>`<button type="button" data-relation-filter="${g.id}" style="--relationship-tone:${g.color}">${g.name}<span>${model.nodes.filter(n=>n.group===g.id).length} 位／组</span></button>`).join('')}</div>`:''}</div><nav class="relationship-person-events" aria-label="${esc(node.name)}的关系变化"><h4>沿事件看关系变化</h4><ol>${node.steps.map(([id,title])=>`<li>${eventLink(id,title)}<small>${esc(eventById.get(id)?.place||'')}</small></li>`).join('')}</ol></nav>`;
  }
  function updateState(){
    const related=new Set(neighbors(selected).map(link=>link.from===selected?link.to:link.from));
    host.dataset.relationView=view;
    host.dataset.relationFilter=filter;
    host.querySelectorAll('button[data-relation-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.relationFilter===filter)));
    host.querySelectorAll('button[data-relation-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.relationView===view)));
    host.querySelectorAll('[data-relation-group]').forEach(section=>section.hidden=filter!=='all'&&section.dataset.relationGroup!==filter);
    host.querySelectorAll('.relationship-node').forEach(button=>{
      const id=button.dataset.person;
      button.setAttribute('aria-pressed',String(id===selected));
      button.classList.toggle('is-related',related.has(id));
      button.classList.toggle('is-muted',selected!=='wanglin'&&id!==selected&&id!=='wanglin'&&!related.has(id));
    });
    const visibleCount=model.nodes.filter(n=>filter==='all'||n.group===filter).length;
    host.querySelector('#relationship-status').textContent=`${filter==='all'?'全部关系':groups.get(filter).name} · ${visibleCount} 位／组 · 当前：${nodes.get(selected).name}`;
    scheduleConnections();
  }
  function select(id){
    if(!nodes.has(id))return;
    selected=id;
    const group=nodes.get(id).group;
    if(filter!=='all'&&group&&filter!==group)filter=group;
    updateInspector();
    updateState();
  }
  function setFilter(next){
    if(next!=='all'&&!groups.has(next))return;
    filter=next;
    if(next!=='all'&&nodes.get(selected).group!==next)selected=model.nodes.find(n=>n.group===next).id;
    updateInspector();
    updateState();
  }
  function scheduleConnections(){
    cancelAnimationFrame(resizeFrame);
    resizeFrame=requestAnimationFrame(drawConnections);
  }
  function drawConnections(){
    const scene=host.querySelector('.relationship-scene');
    const svg=host.querySelector('.relationship-connections');
    if(view!=='graph'){svg.innerHTML='';return;}
    const origin=scene.getBoundingClientRect();
    if(!origin.width||!origin.height)return;
    svg.setAttribute('viewBox',`0 0 ${origin.width} ${origin.height}`);
    const point=element=>{
      const box=element.getBoundingClientRect();
      return {x:box.left-origin.left+box.width/2,y:box.top-origin.top+box.height/2,w:box.width,h:box.height};
    };
    const center=point(host.querySelector('.relationship-center'));
    const visible=node=>filter==='all'||node.group===filter;
    const paths=[];
    const curve=(from,to,color,focused=false,dashed=false)=>{
      const a=point(from),b=point(to);
      const distance=b.x-a.x;
      const fromX=a.x+Math.sign(distance)*a.w/2;
      const toX=b.x-Math.sign(distance)*b.w/2;
      const middle=(fromX+toX)/2;
      paths.push(`<path d="M ${fromX} ${a.y} C ${middle} ${a.y}, ${middle} ${b.y}, ${toX} ${b.y}" stroke="${color}" class="${focused?'is-focused':''}" ${dashed?'stroke-dasharray="5 5"':''}/>`);
    };
    const centerButton=host.querySelector('.relationship-center');
    for(const group of model.groups){
      if(filter!=='all'&&filter!==group.id)continue;
      const panel=host.querySelector(`[data-relation-group="${group.id}"]`);
      const p=point(panel);
      const fromX=center.x+(p.x<center.x?-center.w/2:center.w/2);
      const toX=p.x+(p.x<center.x?p.w/2:-p.w/2);
      const mid=(fromX+toX)/2;
      const isActive=selected==='wanglin'||nodes.get(selected).group===group.id;
      paths.push(`<path d="M ${fromX} ${center.y} C ${mid} ${center.y}, ${mid} ${p.y}, ${toX} ${p.y}" stroke="${group.color}" class="${isActive?'is-group-focused':''}"/>`);
    }
    if(selected!=='wanglin'){
      const selectedButton=host.querySelector(`.relationship-node[data-person="${selected}"]`);
      curve(centerButton,selectedButton,groups.get(nodes.get(selected).group).color,true);
      for(const link of neighbors(selected)){
        const otherId=link.from===selected?link.to:link.from;
        if(!visible(nodes.get(otherId)))continue;
        curve(selectedButton,host.querySelector(`.relationship-node[data-person="${otherId}"]`),'#d8b477',true,true);
      }
    }
    svg.innerHTML=paths.join('');
  }
  host.addEventListener('click',event=>{
    const person=event.target.closest('button[data-person]');
    if(person){
      const fromInspector=person.closest('#relationship-inspector');
      select(person.dataset.person);
      if(fromInspector)host.querySelector(`.relationship-node[data-person="${selected}"]`).focus({preventScroll:true});
      return;
    }
    const filterButton=event.target.closest('button[data-relation-filter]');
    if(filterButton){
      const fromInspector=filterButton.closest('#relationship-inspector');
      setFilter(filterButton.dataset.relationFilter);
      if(fromInspector)host.querySelector(`.relationship-filters button[data-relation-filter="${filter}"]`).focus({preventScroll:true});
      return;
    }
    const viewButton=event.target.closest('button[data-relation-view]');
    if(viewButton){view=viewButton.dataset.relationView;updateState();}
  });
  const scene=host.querySelector('.relationship-scene');
  if('ResizeObserver'in window)new ResizeObserver(scheduleConnections).observe(scene);
  else window.addEventListener('resize',scheduleConnections);
  updateInspector();
  updateState();
})();
