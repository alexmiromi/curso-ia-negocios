(function(){
'use strict';
var LS = {
  get:function(k,d){ try{ var v=localStorage.getItem(k); return v===null?d:JSON.parse(v); }catch(e){ return d; } },
  set:function(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
};

/* ---------- índice plano ---------- */
var FLAT=[], MAP={};
CURSO.modulos.forEach(function(m,mi){
  m.aulas.forEach(function(a,ai){
    var item={mod:m,modIdx:mi,aula:a,idx:ai};
    FLAT.push(item); MAP[a.id]=FLAT.length-1;
  });
});
var TOTAL=FLAT.length;
var TOTMIN=FLAT.reduce(function(s,i){return s+i.aula.min;},0);

/* ---------- progresso ---------- */
function lidas(){ return LS.get('lidas',{}); }
function isLida(id){ return !!lidas()[id]; }
function marca(id,v){ var l=lidas(); if(v){l[id]=1;}else{delete l[id];} LS.set('lidas',l); }
function nLidas(){ return Object.keys(lidas()).length; }
window.aulaLida=isLida;
window.marcaLida=function(id){ marca(id,true); };
function modDone(m){ var n=0; m.aulas.forEach(function(a){ if(isLida(a.id)) n++; }); return n; }

/* ---------- tema ---------- */
var root=document.documentElement;
function isDark(){
  var t=root.getAttribute('data-theme');
  if(t) return t==='dark';
  return matchMedia('(prefers-color-scheme:dark)').matches;
}
function syncTema(){ document.getElementById('tgi').textContent = isDark()?'☀️':'🌙'; }
var salvo=LS.get('tema',null); if(salvo) root.setAttribute('data-theme',salvo);
syncTema();
document.getElementById('tg').onclick=function(){
  var novo = isDark()?'light':'dark';
  root.setAttribute('data-theme',novo); LS.set('tema',novo); syncTema();
};

/* ---------- utilitários ---------- */
function esc(s){ return String(s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function tempo(min){ if(min<60) return min+' min'; var h=Math.floor(min/60), r=min%60; return h+'h'+(r?' '+r+'min':''); }
function mmss(s){ var m=Math.floor(s/60), r=Math.round(s%60); return m+':'+(r<10?'0':'')+r; }
var ICO_P='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
var view=document.getElementById('view');
var btitle=document.getElementById('btitle');
var back=document.getElementById('back');

/* ---------- telas ---------- */
function telaHome(){
  btitle.textContent = CURSO.titulo;
  back.hidden = true;
  var feitas=nLidas(), pct=Math.round(feitas/TOTAL*100);
  var prox=null;
  for(var i=0;i<FLAT.length;i++){ if(!isLida(FLAT[i].aula.id)){ prox=FLAT[i]; break; } }

  var h='<header class="hero">'
   +'<p class="eyebrow">Curso de estudo</p>'
   +'<h1>'+esc(CURSO.titulo)+'</h1>'
   +'<p class="lead">'+esc(CURSO.subtitulo)+'</p>'
   +'<div class="stats">'
   +'<div class="stat"><b>'+CURSO.modulos.length+'</b><span>módulos</span></div>'
   +'<div class="stat"><b>'+TOTAL+'</b><span>aulas</span></div>'
   +'<div class="stat"><b>'+tempo(TOTMIN)+'</b><span>leitura</span></div>'
   +'</div></header>';

  h+='<div class="pbar"><div class="r"><span>Seu progresso</span><b>'+feitas+' de '+TOTAL+' · '+pct+'%</b></div>'
   +'<div class="track"><i style="width:'+pct+'%"></i></div><div class="lnks">';
  if(prox){ h+='<a class="btn pri w" href="#/a/'+prox.aula.id+'">'+(feitas?'Continuar':'Começar')+'</a>'; }
  else { h+='<span class="btn w" style="border-style:dashed">Curso concluído 🎉</span>'; }
  h+='<a class="btn" href="#/glossario">Glossário</a>';
  if(feitas){ h+='<button class="btn" id="zerar">Zerar</button>'; }
  h+='</div></div>';

  h+='<h2 class="sec">Módulos</h2>';
  CURSO.modulos.forEach(function(m){
    var d=modDone(m), t=m.aulas.length, p=Math.round(d/t*100);
    var mins=m.aulas.reduce(function(s,a){return s+a.min;},0);
    h+='<a class="mcard'+(d===t?' done':'')+'" href="#/m/'+m.id+'">'
     +'<div class="hd"><div class="rn">'+m.num+'</div><div>'
     +'<h3>'+esc(m.titulo)+'</h3><p>'+esc(m.resumo)+'</p></div></div>'
     +'<div class="ft"><span>'+d+'/'+t+' aulas</span><div class="mt"><i style="width:'+p+'%"></i></div><span>'+tempo(mins)+'</span></div></a>';
  });

  h+='<div class="foot"><p><strong>Sobre este material.</strong> Conteúdo autoral, escrito a partir da estrutura curricular pública do Programa de Inteligência Artificial Aplicada aos Negócios (Fundação Dom Cabral / CEDEM). Não é material oficial da instituição, não substitui o programa e não tem vínculo com ela.</p>'
   +'<p>Funciona sem internet. Seu progresso fica salvo neste aparelho.</p></div>';
  view.innerHTML=h;

  var z=document.getElementById('zerar');
  if(z) z.onclick=function(){
    if(z.dataset.c){ LS.set('lidas',{}); telaHome(); }
    else { z.dataset.c='1'; z.textContent='Confirmar?'; z.style.color='var(--dn)';
      setTimeout(function(){ if(z){ delete z.dataset.c; z.textContent='Zerar'; z.style.color=''; } },3500); }
  };
}

function telaModulo(id){
  var m=null; CURSO.modulos.forEach(function(x){ if(x.id===id) m=x; });
  if(!m){ location.hash='#/'; return; }
  btitle.textContent='Módulo '+m.num;
  back.hidden=false;
  var mins=m.aulas.reduce(function(s,a){return s+a.min;},0);
  var d=modDone(m);
  var h='<header class="hero"><p class="eyebrow">Módulo '+m.num+'</p>'
   +'<h1>'+esc(m.titulo)+'</h1><p class="lead">'+esc(m.resumo)+'</p>'
   +'<div class="stats"><div class="stat"><b>'+m.aulas.length+'</b><span>aulas</span></div>'
   +'<div class="stat"><b>'+tempo(mins)+'</b><span>leitura</span></div>'
   +'<div class="stat"><b>'+d+'/'+m.aulas.length+'</b><span>concluídas</span></div></div></header>';
  var comAudio=m.aulas.filter(function(a){ return a.aud; });
  if(comAudio.length){
    var segs=comAudio.reduce(function(s,a){ return s+a.aud; },0);
    h+='<div class="ouvir-row"><button class="ouvir" data-mod="'+m.id+'">'
     +'<span class="ic">'+ICO_P+'</span>Ouvir o módulo <span class="dur">'+Math.round(segs/60)+' min</span></button></div>';
    h+='<div class="baixar"><button id="dl">Baixar áudio para ouvir sem internet</button><span id="dlst"></span></div>';
  }
  h+='<div class="alist">';
  m.aulas.forEach(function(a){
    h+='<a class="arow'+(isLida(a.id)?' ok':'')+'" href="#/a/'+a.id+'">'
     +'<span class="ck"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>'
     +'<span class="tt">'+esc(a.titulo)+'</span>'
     +(a.aud?'<button class="pa" data-play="'+a.id+'" aria-label="Ouvir esta aula"><span class="ic">'+ICO_P+'</span></button>':'')
     +'<span class="mn">'+a.min+' min</span></a>';
  });
  h+='</div>';
  var mi=CURSO.modulos.indexOf(m);
  h+='<div class="navr">';
  if(mi>0) h+='<a class="btn" href="#/m/'+CURSO.modulos[mi-1].id+'">← Módulo '+CURSO.modulos[mi-1].num+'</a>';
  if(mi<CURSO.modulos.length-1) h+='<a class="btn" href="#/m/'+CURSO.modulos[mi+1].id+'">Módulo '+CURSO.modulos[mi+1].num+' →</a>';
  h+='</div>';
  view.innerHTML=h;
}

function telaAula(id){
  var i=MAP[id];
  if(i===undefined){ location.hash='#/'; return; }
  var it=FLAT[i], a=it.aula, m=it.mod;
  btitle.textContent='Módulo '+m.num+' · '+(it.idx+1)+'/'+m.aulas.length;
  back.hidden=false;
  var h='<article><p class="crumb">Módulo '+m.num+' · '+esc(m.titulo)+' · '+a.min+' min</p>'
   +'<h1>'+esc(a.titulo)+'</h1>';
  if(a.aud){
    h+='<div class="ouvir-row"><button class="ouvir" data-play="'+a.id+'">'
     +'<span class="ic">'+ICO_P+'</span><span class="lab">Ouvir</span>'
     +'<span class="dur">'+mmss(a.aud)+'</span></button></div>';
  }
  h+=a.html+'</article>';
  var ok=isLida(a.id);
  h+='<div class="done-row"><button class="btn '+(ok?'':'pri ')+'w" id="mk">'+(ok?'✓ Concluída — desmarcar':'Marcar como concluída')+'</button></div>';
  h+='<div class="navr">';
  if(i>0) h+='<a class="btn" href="#/a/'+FLAT[i-1].aula.id+'">← Anterior</a>';
  else h+='<a class="btn" href="#/m/'+m.id+'">← Módulo</a>';
  if(i<TOTAL-1) h+='<a class="btn" href="#/a/'+FLAT[i+1].aula.id+'">Próxima →</a>';
  else h+='<a class="btn" href="#/">Início</a>';
  h+='</div>';
  view.innerHTML=h;
  if(window.initWidgets) initWidgets(view);
  window.scrollTo(0,0);
  document.getElementById('mk').onclick=function(){
    var novo=!isLida(a.id);
    marca(a.id,novo);
    if(novo && i<TOTAL-1){ location.hash='#/a/'+FLAT[i+1].aula.id; }
    else { telaAula(id); }
  };
}

function telaGlossario(){
  btitle.textContent='Glossário';
  back.hidden=false;
  var h='<header class="hero"><p class="eyebrow">Referência</p><h1>Glossário</h1>'
   +'<p class="lead">'+CURSO.glossario.length+' termos que resolvem a maior parte das conversas sobre IA.</p></header><div class="alist" style="padding:4px 16px">';
  CURSO.glossario.slice().sort(function(a,b){ return a.t.localeCompare(b.t,'pt-BR'); })
    .forEach(function(g){ h+='<div class="gitem"><b>'+esc(g.t)+'</b><span>'+esc(g.d)+'</span></div>'; });
  h+='</div>';
  view.innerHTML=h;
}

/* ---------- roteador ---------- */
function ligaAudio(){
  if(!window.PLAYER) return;
  view.querySelectorAll('[data-play]').forEach(function(b){
    b.onclick=function(e){ e.preventDefault(); e.stopPropagation(); PLAYER.toca(b.getAttribute('data-play')); };
  });
  view.querySelectorAll('[data-mod]').forEach(function(b){
    b.onclick=function(){ PLAYER.tocaModulo(b.getAttribute('data-mod')); };
  });
  var dl=document.getElementById('dl');
  if(dl) dl.onclick=function(){
    var st=document.getElementById('dlst');
    var p=(location.hash||'').split('/')[2];
    var mm=null; CURSO.modulos.forEach(function(x){ if(x.id===p) mm=x; });
    if(!mm) return;
    var alvos=mm.aulas.filter(function(a){ return a.aud; }).map(function(a){ return 'audio/'+a.id+'.mp3'; });
    dl.disabled=true; var ok=0;
    st.textContent='baixando 0 de '+alvos.length+'…';
    Promise.all(alvos.map(function(u){
      return fetch(u).then(function(r){ ok++; st.textContent='baixando '+ok+' de '+alvos.length+'…'; return r; }).catch(function(){});
    })).then(function(){
      st.textContent='pronto — '+ok+' aula'+(ok>1?'s':'')+' disponível'+(ok>1?'eis':'')+' sem internet';
      dl.textContent='Baixado'; 
    });
  };
  PLAYER.pinta();
}

function rota(){
  var p=(location.hash||'#/').replace(/^#\/?/,'').split('/');
  if(p[0]==='m' && p[1]) telaModulo(p[1]);
  else if(p[0]==='a' && p[1]) telaAula(p[1]);
  else if(p[0]==='glossario') telaGlossario();
  else telaHome();
  ligaAudio();
}
addEventListener('hashchange',rota);
back.onclick=function(){
  var p=(location.hash||'').replace(/^#\/?/,'').split('/');
  if(p[0]==='a' && MAP[p[1]]!==undefined){ location.hash='#/m/'+FLAT[MAP[p[1]]].mod.id; }
  else { location.hash='#/'; }
};

/* ---------- busca ---------- */
var sheet=document.getElementById('sheet'), q=document.getElementById('q'), qr=document.getElementById('qr');
function abreBusca(){ sheet.hidden=false; q.value=''; qr.innerHTML='<p class="empty">Digite para buscar em 52 aulas e no glossário.</p>'; setTimeout(function(){q.focus();},60); }
function fechaBusca(){ sheet.hidden=true; }
document.getElementById('srch').onclick=abreBusca;
document.getElementById('qx').onclick=fechaBusca;
sheet.querySelector('.sh-bg').onclick=fechaBusca;
addEventListener('keydown',function(e){ if(e.key==='Escape' && !sheet.hidden) fechaBusca(); });

function limpo(s){ return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
function texto(html){ return html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' '); }
var IDX = FLAT.map(function(it){
  return { t:it.aula.titulo, sub:'Módulo '+it.mod.num+' · '+it.mod.titulo, href:'#/a/'+it.aula.id,
           b:limpo(it.aula.titulo+' '+it.mod.titulo+' '+texto(it.aula.html)), corpo:texto(it.aula.html) };
}).concat(CURSO.glossario.map(function(g){
  return { t:g.t, sub:'Glossário', href:'#/glossario', b:limpo(g.t+' '+g.d), corpo:g.d };
}));

var deb;
q.oninput=function(){
  clearTimeout(deb);
  deb=setTimeout(function(){
    var termo=limpo(q.value.trim());
    if(termo.length<2){ qr.innerHTML='<p class="empty">Digite ao menos 2 letras.</p>'; return; }
    var res=IDX.filter(function(x){ return x.b.indexOf(termo)>=0; }).slice(0,30);
    if(!res.length){ qr.innerHTML='<p class="empty">Nada encontrado para “'+esc(q.value)+'”.</p>'; return; }
    qr.innerHTML=res.map(function(x){
      var pos=limpo(x.corpo).indexOf(termo), tre='';
      if(pos>=0){ var ini=Math.max(0,pos-45); tre=(ini>0?'…':'')+x.corpo.substr(ini,120)+'…'; }
      return '<a class="qrow" href="'+x.href+'"><b>'+esc(x.t)+'</b><span>'+esc(x.sub)+(tre?' — '+esc(tre):'')+'</span></a>';
    }).join('');
    Array.prototype.forEach.call(qr.querySelectorAll('a'),function(el){ el.onclick=fechaBusca; });
  },130);
};

/* ---------- progresso de rolagem + topo ---------- */
var pi=document.querySelector('#prog i'), fab=document.getElementById('top'), tick=false;
function upd(){
  var h=document.documentElement.scrollHeight-innerHeight, y=scrollY||0;
  pi.style.width=(h>40?(y/h*100):0)+'%';
  fab.classList.toggle('on', y>620);
  tick=false;
}
addEventListener('scroll',function(){ if(!tick){ requestAnimationFrame(upd); tick=true; } },{passive:true});
addEventListener('resize',upd);
fab.onclick=function(){ scrollTo({top:0,behavior:'smooth'}); };

rota(); upd();

if('serviceWorker' in navigator){
  addEventListener('load',function(){
    navigator.serviceWorker.register('sw.js').then(function(reg){
      function espera(sw){
        if(!sw) return;
        sw.addEventListener('statechange',function(){ if(sw.state==='installed' && navigator.serviceWorker.controller) avisa(reg); });
      }
      if(reg.waiting && navigator.serviceWorker.controller) avisa(reg);
      espera(reg.installing);
      reg.addEventListener('updatefound',function(){ espera(reg.installing); });
      setInterval(function(){ reg.update().catch(function(){}); }, 1800000);
    }).catch(function(){});
    var recarregou=false;
    navigator.serviceWorker.addEventListener('controllerchange',function(){
      if(recarregou) return; recarregou=true; location.reload();
    });
  });
}
function avisa(reg){
  if(document.getElementById('nova')) return;
  var d=document.createElement('div'); d.id='nova'; d.className='nova';
  var t=document.createElement('span'); t.textContent='Versão nova disponível';
  var b=document.createElement('button'); b.className='btn pri'; b.textContent='Atualizar';
  b.onclick=function(){ if(reg.waiting) reg.waiting.postMessage('atualizar'); else location.reload(); };
  var x=document.createElement('button'); x.className='btn ghost'; x.textContent='Agora não';
  x.onclick=function(){ d.remove(); };
  d.appendChild(t); d.appendChild(b); d.appendChild(x);
  document.body.appendChild(d);
}
})();
