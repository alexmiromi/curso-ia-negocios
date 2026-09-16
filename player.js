/* Player de áudio do curso: mini-barra fixa, painel expandido, velocidade,
   continuar de onde parou, fila automática e integração com o painel do carro. */
(function(){
'use strict';
var VEL=[1,1.25,1.5,1.75,2];
function LSget(k,d){ try{ var v=localStorage.getItem(k); return v===null?d:JSON.parse(v); }catch(e){ return d; } }
function LSset(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
function el(t,c,x){ var e=document.createElement(t); if(c) e.className=c; if(x!=null) e.textContent=x; return e; }
function mmss(s){ if(!isFinite(s)||s<0) s=0; var m=Math.floor(s/60), r=Math.floor(s%60); return m+':'+(r<10?'0':'')+r; }

var au=new Audio();
au.preload='metadata';
try{ au.preservesPitch=true; au.mozPreservesPitch=true; au.webkitPreservesPitch=true; }catch(e){}

var P={ id:null, lista:[], idx:-1, aberto:false, pronto:false };
var bar, ui={};

/* ---------- catálogo ---------- */
function flat(){
  var out=[];
  CURSO.modulos.forEach(function(m){ m.aulas.forEach(function(a){ if(a.aud) out.push({mod:m,aula:a}); }); });
  return out;
}
function acha(id){ var f=flat(); for(var i=0;i<f.length;i++) if(f[i].aula.id===id) return f[i]; return null; }

/* ---------- construção da interface ---------- */
function monta(){
  if(bar) return;
  bar=el('div','pl');
  bar.hidden=true;

  var mini=el('div','pl-mini');
  ui.miniPlay=el('button','pl-b pl-b-play'); ui.miniPlay.setAttribute('aria-label','Tocar ou pausar');
  var info=el('div','pl-info');
  ui.miniT=el('b'); ui.miniS=el('span');
  info.appendChild(ui.miniT); info.appendChild(ui.miniS);
  ui.miniUp=el('button','pl-b pl-b-up'); ui.miniUp.setAttribute('aria-label','Abrir controles');
  ui.miniUp.innerHTML=svg('M6 15l6-6 6 6');
  mini.appendChild(ui.miniPlay); mini.appendChild(info); mini.appendChild(ui.miniUp);
  ui.miniBar=el('i');
  var miniTrack=el('div','pl-mtrack'); miniTrack.appendChild(ui.miniBar);
  bar.appendChild(miniTrack); bar.appendChild(mini);

  var pan=el('div','pl-pan'); pan.hidden=true;
  var head=el('div','pl-head');
  ui.panMod=el('span','pl-kick'); ui.panT=el('b');
  var close=el('button','pl-b pl-b-down'); close.setAttribute('aria-label','Fechar controles');
  close.innerHTML=svg('M6 9l6 6 6-6');
  var ht=el('div'); ht.appendChild(ui.panMod); ht.appendChild(ui.panT);
  head.appendChild(ht); head.appendChild(close);

  ui.seek=document.createElement('input');
  ui.seek.type='range'; ui.seek.min=0; ui.seek.max=1000; ui.seek.value=0; ui.seek.className='pl-seek';
  ui.seek.setAttribute('aria-label','Posição do áudio');
  var times=el('div','pl-times'); ui.tNow=el('span','',' 0:00'); ui.tEnd=el('span'); 
  times.appendChild(ui.tNow); times.appendChild(ui.tEnd);

  var ctr=el('div','pl-ctr');
  ui.prev=el('button','pl-b'); ui.prev.setAttribute('aria-label','Aula anterior'); ui.prev.innerHTML=svg('M19 20L9 12l10-8v16M5 4v16',1);
  ui.b15=el('button','pl-b pl-b-15'); ui.b15.setAttribute('aria-label','Voltar 15 segundos');
  ui.b15.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="2 5 2 11 8 11"/><path d="M4.6 15.5a9 9 0 1 0 2-9.5L2 11"/></svg><b>15</b>';
  ui.play=el('button','pl-b pl-b-main'); ui.play.setAttribute('aria-label','Tocar ou pausar');
  ui.f15=el('button','pl-b pl-b-15 pl-f'); ui.f15.setAttribute('aria-label','Avançar 15 segundos');
  ui.f15.innerHTML='<b>15</b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 5 22 11 16 11"/><path d="M19.4 15.5a9 9 0 1 1-2-9.5L22 11"/></svg>';
  ui.next=el('button','pl-b'); ui.next.setAttribute('aria-label','Próxima aula'); ui.next.innerHTML=svg('M5 4l10 8-10 8V4M19 4v16',1);
  [ui.prev,ui.b15,ui.play,ui.f15,ui.next].forEach(function(b){ ctr.appendChild(b); });

  var foot=el('div','pl-foot');
  ui.vel=el('button','pl-vel'); ui.vel.setAttribute('aria-label','Velocidade de reprodução');
  ui.fila=el('span','pl-fila');
  foot.appendChild(ui.vel); foot.appendChild(ui.fila);

  pan.appendChild(head); pan.appendChild(ui.seek); pan.appendChild(times); pan.appendChild(ctr); pan.appendChild(foot);
  bar.appendChild(pan); ui.pan=pan;
  document.body.appendChild(bar);

  ui.miniPlay.onclick=function(e){ e.stopPropagation(); toggle(); };
  ui.play.onclick=toggle;
  mini.onclick=function(){ abre(true); };
  ui.miniUp.onclick=function(e){ e.stopPropagation(); abre(true); };
  close.onclick=function(){ abre(false); };
  ui.b15.onclick=function(){ pula(-15); };
  ui.f15.onclick=function(){ pula(15); };
  ui.prev.onclick=function(){ salta(-1); };
  ui.next.onclick=function(){ salta(1); };
  ui.vel.onclick=function(){
    var v=LSget('audioVel',1), i=VEL.indexOf(v); v=VEL[(i+1)%VEL.length];
    LSset('audioVel',v); aplicaVel();
  };
  var arr=false;
  ui.seek.addEventListener('input',function(){ arr=true; ui.tNow.textContent=mmss(au.duration*ui.seek.value/1000); });
  ui.seek.addEventListener('change',function(){ if(au.duration) au.currentTime=au.duration*ui.seek.value/1000; arr=false; });
  ui.seek._arr=function(){ return arr; };
  P.pronto=true;
}
function svg(d,fill){
  return '<svg viewBox="0 0 24 24" fill="'+(fill?'currentColor':'none')+'" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="'+d+'"/></svg>';
}
var ICO_PLAY='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
var ICO_PAUSE='<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';

/* ---------- controle ---------- */
function aplicaVel(){
  var v=LSget('audioVel',1);
  try{ au.playbackRate=v; }catch(e){}
  if(ui.vel) ui.vel.textContent=String(v).replace('.',',')+'×';
}
function pos(id,t){ var p=LSget('audioPos',{}); if(t===undefined) return p[id]||0; p[id]=t; LSset('audioPos',p); }

function carrega(id,tocar){
  monta();
  var it=acha(id); if(!it) return;
  if(P.id!==id){
    P.id=id;
    P.lista=flat().map(function(x){ return x.aula.id; });
    P.idx=P.lista.indexOf(id);
    au.src='audio/'+id+'.mp3';
    var t=pos(id);
    if(t>2 && t < (it.aula.aud-8)) au.currentTime=t;
    ui.miniT.textContent=it.aula.titulo;
    ui.panT.textContent=it.aula.titulo;
    ui.panMod.textContent='Módulo '+it.mod.num+' · '+it.mod.titulo;
    ui.tEnd.textContent=mmss(it.aula.aud);
    ui.fila.textContent='Aula '+(P.idx+1)+' de '+P.lista.length+' com áudio';
    media(it);
  }
  bar.hidden=false;
  document.body.classList.add('com-player');
  aplicaVel();
  if(tocar) toca();
  pinta();
}
function toca(){
  var pr=au.play();
  if(pr && pr.catch) pr.catch(function(){});
}
function toggle(){ if(au.paused) toca(); else au.pause(); }
function pula(s){ if(!isFinite(au.duration)) return; au.currentTime=Math.max(0,Math.min(au.duration-0.5,au.currentTime+s)); }
function salta(d){
  var i=P.idx+d;
  if(i<0||i>=P.lista.length) return;
  carrega(P.lista[i],true);
  if(document.visibilityState==='visible') location.hash='#/a/'+P.lista[i];
}
function abre(v){ P.aberto=v; ui.pan.hidden=!v; bar.classList.toggle('aberto',v); }

/* ---------- painel do carro / tela de bloqueio ---------- */
function media(it){
  if(!('mediaSession' in navigator)) return;
  try{
    navigator.mediaSession.metadata=new MediaMetadata({
      title: it.aula.titulo,
      artist: 'Módulo '+it.mod.num+' · '+it.mod.titulo,
      album: CURSO.titulo,
      artwork: [
        {src:'icons/icon-192.png',sizes:'192x192',type:'image/png'},
        {src:'icons/icon-512.png',sizes:'512x512',type:'image/png'}
      ]
    });
    navigator.mediaSession.setActionHandler('play',toca);
    navigator.mediaSession.setActionHandler('pause',function(){ au.pause(); });
    navigator.mediaSession.setActionHandler('seekbackward',function(){ pula(-15); });
    navigator.mediaSession.setActionHandler('seekforward',function(){ pula(15); });
    navigator.mediaSession.setActionHandler('previoustrack',function(){ salta(-1); });
    navigator.mediaSession.setActionHandler('nexttrack',function(){ salta(1); });
    navigator.mediaSession.setActionHandler('seekto',function(d){ if(d.seekTime!=null) au.currentTime=d.seekTime; });
  }catch(e){}
}
function mediaPos(){
  if(!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
  if(!isFinite(au.duration)) return;
  try{ navigator.mediaSession.setPositionState({duration:au.duration,playbackRate:au.playbackRate,position:Math.min(au.currentTime,au.duration)}); }catch(e){}
}

/* ---------- pintura ---------- */
function pinta(){
  if(!P.pronto) return;
  var tocando=!au.paused;
  ui.miniPlay.innerHTML=tocando?ICO_PAUSE:ICO_PLAY;
  ui.play.innerHTML=tocando?ICO_PAUSE:ICO_PLAY;
  ui.prev.disabled=P.idx<=0;
  ui.next.disabled=P.idx>=P.lista.length-1;
  var it=acha(P.id);
  var d=isFinite(au.duration)&&au.duration>0 ? au.duration : (it?it.aula.aud:0);
  var t=au.currentTime;
  var pc=(isFinite(d)&&d>0)?(t/d*100):0;
  ui.miniBar.style.width=pc+'%';
  if(!ui.seek._arr()){ ui.seek.value=Math.round(pc*10); ui.tNow.textContent=mmss(t); }
  ui.tEnd.textContent=mmss(d);
  ui.miniS.textContent=(tocando?'tocando':'pausado')+' · '+mmss(t)+' de '+mmss(d||0);
  document.querySelectorAll('[data-play]').forEach(function(b){
    var on = b.getAttribute('data-play')===P.id;
    b.classList.toggle('tocando', on && tocando);
    var lab=b.querySelector('.lab');
    if(lab) lab.textContent = on ? (tocando?'Tocando':'Continuar') : (pos(b.getAttribute('data-play'))>5?'Continuar':'Ouvir');
    var ic=b.querySelector('.ic');
    if(ic) ic.innerHTML = (on&&tocando)?ICO_PAUSE:ICO_PLAY;
  });
}

au.addEventListener('play',function(){ pinta(); mediaPos(); if('mediaSession' in navigator) navigator.mediaSession.playbackState='playing'; });
au.addEventListener('pause',function(){ pinta(); if(P.id) pos(P.id,au.currentTime); if('mediaSession' in navigator) navigator.mediaSession.playbackState='paused'; });
au.addEventListener('loadedmetadata',function(){ pinta(); mediaPos(); });
au.addEventListener('ratechange',mediaPos);
var ult=0;
au.addEventListener('timeupdate',function(){
  pinta();
  var n=Date.now();
  if(n-ult>4000){ ult=n; if(P.id) pos(P.id,au.currentTime); mediaPos(); }
});
au.addEventListener('ended',function(){
  if(P.id) pos(P.id,0);
  if(window.marcaLida) window.marcaLida(P.id);
  if(P.idx<P.lista.length-1) salta(1); else { abre(false); pinta(); }
});
au.addEventListener('error',function(){
  if(ui.miniS) ui.miniS.textContent='não foi possível carregar o áudio';
});

/* ---------- interface pública ---------- */
window.PLAYER={
  toca:function(id){
    monta();
    if(P.id===id){ toggle(); }
    else { carrega(id,true); }
  },
  tocaModulo:function(modId){
    var m=null; CURSO.modulos.forEach(function(x){ if(x.id===modId) m=x; });
    if(!m) return;
    var alvo=null;
    for(var i=0;i<m.aulas.length;i++){ var a=m.aulas[i]; if(a.aud && !(window.aulaLida&&window.aulaLida(a.id))){ alvo=a.id; break; } }
    if(!alvo){ for(var j=0;j<m.aulas.length;j++) if(m.aulas[j].aud){ alvo=m.aulas[j].id; break; } }
    if(alvo){ window.PLAYER.toca(alvo); location.hash='#/a/'+alvo; }
  },
  atual:function(){ return P.id; },
  tocando:function(){ return !au.paused; },
  pinta:pinta,
  temAudio:function(){ return flat().length>0; },
  posDe:function(id){ return pos(id); }
};
})();
