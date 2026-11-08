const data=window.CHRONICLE;
const $=selector=>document.querySelector(selector);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={growth:'悟道 · 修行',crisis:'受创／危机',love:'情缘',kin:'亲情 · 师友',turn:'重要转折'};
const eventById=new Map(data.events.map(e=>[e.id,e]));
const eventOrder=new Map(data.events.map((e,i)=>[e.id,i+1]));
const isCrisis=e=>e.tags.includes('crisis')||e.tags.includes('turn');
let lens='all';
let observer;
const eventLink=(id,label)=>`<a href="#${id}" data-event-link="${id}">${esc(label||eventById.get(id)?.title||id)}</a>`;
const sourceLink=number=>`<a href="#source-${number}">${esc(data.sources[number-1]?.title||'资料')} [${number}]</a>`;
const linksFor=e=>[...new Set(e.sources||[e.source||2])].map(sourceLink).join(' · ');
const promotionHTML=p=>`<div class="detail-row promotion-row"><b>${esc(p.path)} · ${esc(p.kind)}</b><p class="promotion-flow">${esc(p.before)} <span>→</span> ${esc(p.after)}</p><p>${esc(p.how)}</p></div>`;
const foesHTML=foes=>`<div class="foes">${foes.map(([name,level,result])=>`<div class="foe"><div><strong>${esc(name)}</strong><small>${esc(level)}</small></div><p>${esc(result)}</p></div>`).join('')}</div>`;
function eventHTML(e){
 const harm=e.injury;
 return `<article class="event${harm?' has-injury':''}" id="${e.id}" data-tags="${e.tags.join(' ')}">
 <div class="event-card">
 ${e.image?`<figure class="event-image${e.imageKind==='generated'?' generated-scene':''}"><img src="${e.image}" alt="${esc(e.caption)}" loading="lazy" width="1672" height="941"><figcaption>${esc(e.caption)}</figcaption></figure>`:''}
 <div class="event-top"><span class="event-number">${String(eventOrder.get(e.id)).padStart(3,'0')}</span><div class="event-heading"><p class="event-location">${esc(e.place)}</p><h3>${esc(e.title)}</h3></div><span class="realm-badge">${esc(e.realm)}</span></div>
 <div class="event-body"><p class="event-summary">${esc(e.summary)}</p>
 ${harm?`<div class="injury-record"><b>${esc(harm.kind)}</b><dl><div><dt>受创</dt><dd>${esc(harm.damage)}</dd></div><div><dt>脱险／恢复</dt><dd>${esc(harm.rescue)}</dd></div><div><dt>后果</dt><dd>${esc(harm.after)}</dd></div></dl></div>`:''}
 <div class="event-tagline">${e.tags.map(t=>`<span class="tag ${t}">${labels[t]}</span>`).join('')}${e.thread==='donglin'?'<span class="tag eastlin">东临星线</span>':''}</div></div>
 <details><summary>悟道、突破、对手与人物线</summary><div class="detail-body">
 ${e.cause?`<div class="detail-row"><b>前因</b><p>${esc(e.cause)}</p></div>`:''}
 ${e.epiphany?`<div class="detail-row insight-row"><b>在哪里悟道，悟了什么</b><p>${esc(e.epiphany)}</p></div>`:''}
 ${e.promotion?promotionHTML(e.promotion):''}
 ${e.foes?.length?`<div class="detail-row"><b>对手与交手结果</b>${foesHTML(e.foes)}</div>`:''}
 ${e.love?`<div class="detail-row love"><b>爱情线的变化</b><p>${esc(e.love)}</p></div>`:''}
 ${e.kin?`<div class="detail-row kin"><b>亲情与师友</b><p>${esc(e.kin)}</p></div>`:''}
 ${e.impact?`<div class="detail-row"><b>事件造成的变化</b><p>${esc(e.impact)}</p></div>`:''}
 ${e.note?`<p class="rank-note">${esc(e.note)}</p>`:''}
 <div class="detail-sources">核对依据：${linksFor(e)}</div></div></details></div></article>`;
}
function matches(e){return lens==='all'||(lens==='crisis'?isCrisis(e):e.tags.includes(lens));}
const lensNotes={
 all:`${data.events.length} 个事件按小说先后排列。红色区块写明受创、脱险方式与后果，展开可读悟道、突破和交手结果。`,
 crisis:'汇集肉身毁灭、石化、生机损失、夺舍、困局与主要命运转折。亲人或师友离世与身体受创分别标注。',
 growth:'逐境查看突破地点与契机。空涅、空玄等连续跨境，古族路线、神通感悟与外力增强分别标注。',
 love:'先沿三条路线辨认关系变化，再看相应事件。婉儿的一丝生机、重凝肉身与真正苏醒是三个不同节点。',
 kin:'按家人、被养育的孩子、师尊、知己与弟子阅读。每次帮助、托付或诀别保留在故事发生的阶段。'
};
function renderStory(){
 $('#cultivation').hidden=lens!=='growth';
 $('#story').hidden=lens==='growth';
 $('#love-routes').hidden=lens!=='love';
 const activeChapters=[];
 $('#story').innerHTML=data.chapters.map((c,i)=>{
  const events=data.events.filter(e=>e.chapter===c.id&&matches(e));
  if(!events.length)return '';
  activeChapters.push(c.id);
  return `<section class="chapter" id="${c.id}"><div class="chapter-heading"><span class="chapter-numeral">${String(i+1).padStart(2,'0')}</span><div><h3 class="chapter-title">${esc(c.title)}</h3><p class="chapter-sub">${esc(c.sub)}</p></div><span class="chapter-rule"></span><span class="chapter-kicker">${esc(c.scope)}</span></div><div class="events">${events.map(eventHTML).join('')}</div></section>`;
 }).join('');
 document.querySelectorAll('#chapter-nav a').forEach(a=>a.hidden=lens!=='growth'&&!activeChapters.includes(a.hash.slice(1)));
 $('#lens-note').textContent=lensNotes[lens];
 $('#visible-count').textContent=lens==='growth'?`${window.CULTIVATION.length} 个境界／阶段`:`${data.events.filter(matches).length} 个事件`;
 observeChapters();
}
function setLens(next){
 lens=next;
 document.querySelectorAll('[data-lens]').forEach(button=>{const active=button.dataset.lens===lens;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
 renderStory();
}
function observeChapters(){
 observer?.disconnect();
 observer=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting)document.querySelectorAll('#chapter-nav a').forEach(a=>{
   const current=a.hash===`#${entry.target.id}`;a.classList.toggle('current',current);
   if(current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
  });
 },{rootMargin:'-15% 0px -65% 0px',threshold:0});
 if(lens!=='growth')document.querySelectorAll('.chapter').forEach(c=>observer.observe(c));
}
$('#chapter-nav').innerHTML=data.chapters.map((c,i)=>`<a href="#${c.id}" data-chapter-link="${c.id}"><b>${String(i+1).padStart(2,'0')}</b>${esc(c.title)}</a>`).join('');
$('#event-count').textContent=`${data.events.length} 个故事事件`;
$('#coverage-summary').innerHTML=`<span><strong>${data.events.length}</strong>故事事件</span><span><strong>${data.events.filter(e=>e.injury).length}</strong>受创／失去记录</span><span><strong>${data.events.filter(e=>e.epiphany).length}</strong>悟道明细</span><span><strong>${data.events.filter(e=>e.promotion).length}</strong>突破／力量变化</span><span id="visible-count" aria-live="polite"></span>`;
$('#eastlin-map').innerHTML=`<div><b>罗天 · 东临星</b><p>姚家追杀、向家七夕术、生机重损与后续回查。</p></div><div><b>洞府冰界 · 东临宗场景</b><p>洞府核心的冰界、云娜与烨寞遗产相关。</p></div><div><b>仙罡 · 东临宗／东临池</b><p>灭门旧事与天运子线索；池中悟太初、默灭，空劫中期。</p></div>`;
$('#eastlin-links').innerHTML=[['dc01','初到东临星'],['dc02','七夕受创'],['dc04','避天棺护婉儿'],['dc05','重返向家'],['n69','仙罡东临池']].map(([id,label])=>eventLink(id,label)).join('');
document.querySelectorAll('[data-lens]').forEach(button=>button.addEventListener('click',()=>setLens(button.dataset.lens)));

const realmSteps=[
 ['第一步','灵力与意境',['凝气','筑基','结丹','元婴','化神','婴变','问鼎'],'化凡、生死意境与问鼎的逆之感悟都有具体发生地，见修为路线及相应事件。'],
 ['过渡','仙元之变',['阴虚','阳实'],'与第一、二步的划分习惯有关，单列避免和涅三境混淆。'],
 ['第二步','涅之三境',['窥涅','净涅','碎涅'],'谢青印证道心、山崩悟真假、石化后救援与渡劫，分别对应不同阶段。'],
 ['第三步','空之四境',['空涅','空灵','空玄','空劫'],'体系顺序不等于王林每一境均停留多年：六本源破门直达空灵中期；绿魔之局又连续渡玄劫。'],
 ['第四步之途','尊阳与九桥',['大天尊层次','踏天九桥','踏天'],'金尊、天尊、跃天尊等属于仙罡战力与空劫层次；实际修为、尊阳、古族身体与分身要合看。']
];
$('#realm-map').innerHTML=realmSteps.map(([title,sub,chain,note])=>`<div class="realm-step"><h3>${title}<small>${sub}</small></h3><div><div class="realm-chain">${chain.map(esc).join('<em>→</em>')}</div><p>${esc(note)}</p></div></div>`).join('');

$('#love-routes').innerHTML=`<div class="route-intro"><h3>三条主线，各自有起点与结局</h3><p>路线条目可直接回到对应的小说事件。图中的角色造型和 AI 插画不决定原著的人物关系。</p></div><div class="love-route-grid">${data.loveRoutes.map(route=>`<article class="love-route"><h3>${esc(route.name)}</h3><p class="route-description">${esc(route.description)}</p><ol>${route.steps.map(([id,title,text])=>`<li>${eventLink(id,title)}<p>${esc(text)}</p></li>`).join('')}</ol></article>`).join('')}</div><div class="side-affection"><b>仍要单独辨认的情感支线</b><p>西子凤对王林的情意与王林的关照，见${eventLink('n80','西子凤的苦难')}；姚惜雪的核心是${eventLink('n34','恩怨与因果收束')}；红蝶首先是${eventLink('n14','天骄对手')}，后又与清水及故人回望相连。没有将所有女性故人写成已确立的道侣。</p></div>`;

$('#insight-list').innerHTML=`<div class="insight-table"><div class="insight-table-head"><b>地点</b><b>感悟与力量变化</b></div>${data.events.filter(e=>e.epiphany).map(e=>`<div class="insight-table-row"><div><span>${esc(e.place)}</span>${eventLink(e.id,e.title)}</div><p>${esc(e.epiphany)}</p></div>`).join('')}</div>`;
const cultivation=window.CULTIVATION;
$('#cultivation-nav').innerHTML=cultivation.map((r,i)=>`<a href="#rank-${i+1}">${esc(r.realm)}</a>`).join('');
$('#cultivation-list').innerHTML=cultivation.map((r,i)=>`<article class="rank-card" id="rank-${i+1}"><header><span class="rank-index">${String(i+1).padStart(2,'0')}</span><div><p class="rank-from">${esc(r.from)} →</p><h3>${esc(r.realm)}</h3></div><span class="rank-kind">${esc(r.kind)}</span></header><p class="rank-place">${esc(r.place)}</p><p class="rank-scene">${esc(r.scene)}</p><div class="rank-key"><b>突破契机</b><p>${esc(r.key)}</p></div><h4>这一程遇到的强敌</h4>${foesHTML(r.foes)}${r.note?`<p class="rank-note">${esc(r.note)}</p>`:''}<div class="rank-events"><b>展开看具体场景、受创与关系变化</b>${(r.events||[r.event]).map(id=>eventLink(id)).join('')}</div></article>`).join('');

// 人物关系图由 relationships.js 渲染，保留故事事件的统一跳转。

// 原关系卡保留海报与信息，新增相关线索的直达入口。
for(const p of data.people){
 if(p.name==='李慕婉')p.events=[['e04','修魔海同行'],['dc02','七夕受创'],['dc04','避天棺'],['n79','真正苏醒']];
 if(p.name==='李倩梅'){p.events=[['e20','三问天'],['n44','十年血救'],['n78','东梅']];p.text='从三问天到赠镯、十年鲜血相救，再到王林回应与转世为东梅。她的路线有自己的选择和代价，不能被简化成只替婉儿推动剧情。';}
 if(p.name==='十三与谢青'){p.name='十三、谢青与西子凤';p.text='十三承接妖灵之地的传道，谢青在洞府谜局中与师尊诀别；西子凤曾受救助、被收为弟子，她的情意与师徒身份均需保留。';p.events=[['n19','十三'],['e25','谢青诀别'],['n80','救助西子凤']];}
 if(p.name==='司徒南')p.events=[['e03','舍力救命'],['e13','婴变后归来'],['e26','转世仙罡']];
}
$('#people-grid').innerHTML=data.people.map(p=>`<article class="person">${p.image?`<img src="${p.image}" alt="${esc(p.alt||p.name+'动画形象参考')}" loading="lazy" width="640" height="360">`:''}<div class="person-text"><p class="person-meta">${esc(p.type)}</p><h3>${esc(p.name)}${p.alias?`<small>${esc(p.alias)}</small>`:''}</h3><p>${esc(p.text)}</p><div class="person-links">${p.events.map(([id,label])=>eventLink(id,label)).join('')}</div></div></article>`).join('');
$('#source-list').innerHTML=data.sources.map((s,i)=>`<li id="source-${i+1}"><a href="${s.url}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a> — ${esc(s.note)}</li>`).join('');
if(data.hero){$('#intro-art').hidden=false;$('#intro-art').innerHTML=`<img src="${data.hero}" alt="王林动画版人物参考" width="846" height="897"><figcaption>王林 · 动画形象参考</figcaption>`;}
$('#image-credit').textContent=data.imageCredit||'';
function openEvent(id,updateHash=true){
 if(!eventById.has(id))return;
 if(lens==='growth'||!matches(eventById.get(id)))setLens('all');
 const target=document.getElementById(id);
 const details=target?.querySelector('details');
 if(details)details.open=true;
 if(updateHash)history.replaceState(null,'',`#${id}`);
 target?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
}
document.addEventListener('click',event=>{
 const link=event.target.closest('[data-event-link]');
 if(link){event.preventDefault();openEvent(link.dataset.eventLink);return;}
 const chapter=event.target.closest('[data-chapter-link]');
 if(chapter&&(lens==='growth'||!document.querySelector(chapter.hash)))setLens('all');
});
setLens('all');
if(location.hash.startsWith('#rank-'))setLens('growth');
else if(eventById.has(location.hash.slice(1)))requestAnimationFrame(()=>openEvent(location.hash.slice(1),false));
