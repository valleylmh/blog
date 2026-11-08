(() => {
const scenes={
mortal:{src:'assets/scenes/mortal-woodcarver.webp',title:'木雕里的生死',caption:'AI 情节示意：凡俗木雕生活中的生死感悟；人物年龄、衣着与街景为创作表达。'},
qixi:{src:'assets/scenes/life-and-coffin-symbolic.webp',title:'为重逢付出的代价',caption:'AI 象征合画：七夕术的生机代价与之后避天棺保存婉儿。施术时婉儿是元婴，图中成年棺身对应后续重凝；非同一时刻现场，古树及旁观者为象征构图。'},
bloodrescue:{src:'assets/scenes/liqianmei-blood-rescue.webp',title:'守住石像的十年',caption:'AI 情节示意：蓝发李倩梅以鲜血守护石化的王林；不是动画截图，环境与造型为创作表达。'},
reunion:{src:'assets/scenes/reunion-bridge.webp',title:'醒来后，再不松手',caption:'AI 情节示意：王林与复苏的李慕婉携手踏天；仙桥、服饰与雪景为创作表达。'}
};
window.CHRONICLE.scenes=scenes;
for(const e of window.CHRONICLE.events)if(e.artKey){const art=scenes[e.artKey];e.image=art.src;e.caption=art.caption;e.imageKind='generated';}
})();
