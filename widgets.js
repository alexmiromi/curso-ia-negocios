/* Widgets interativos das aulas. Cada bloco <div data-w="nome"> é inicializado
   por initWidgets(raiz) depois que a aula é renderizada. Sem dependências. */
(function(){
'use strict';
var W = {};
function el(tag, cls, txt){ var e=document.createElement(tag); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e; }
function fmtBRL(v){ return 'R$ '+Math.round(v).toLocaleString('pt-BR'); }
function fmtInt(v){ return Math.round(v).toLocaleString('pt-BR'); }
function LSget(k,d){ try{ var v=localStorage.getItem(k); return v===null?d:JSON.parse(v); }catch(e){ return d; } }
function LSset(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }

/* ---------- tooltip para marcas SVG com data-tip ---------- */
var tip=null;
function showTip(txt,x,y){
  if(!tip){ tip=el('div','tip'); document.body.appendChild(tip); }
  tip.textContent=txt; tip.hidden=false;
  var r=tip.getBoundingClientRect();
  var left=Math.min(Math.max(8, x - r.width/2), innerWidth - r.width - 8);
  var top=y - r.height - 14; if(top<8) top=y+18;
  tip.style.left=left+'px'; tip.style.top=(top+scrollY)+'px';
}
function hideTip(){ if(tip) tip.hidden=true; }
W.tip=function(root){
  Array.prototype.forEach.call(root.querySelectorAll('[data-tip]'),function(m){
    m.setAttribute('tabindex','0');
    var on=function(e){ var p=e.touches?e.touches[0]:e; var b=m.getBoundingClientRect(); showTip(m.getAttribute('data-tip'), p?p.clientX:b.left+b.width/2, b.top); };
    m.addEventListener('pointerenter',on); m.addEventListener('pointermove',on);
    m.addEventListener('pointerleave',hideTip);
    m.addEventListener('focus',function(){ var b=m.getBoundingClientRect(); showTip(m.getAttribute('data-tip'), b.left+b.width/2, b.top); });
    m.addEventListener('blur',hideTip);
    m.addEventListener('click',function(e){ e.stopPropagation(); on(e); setTimeout(hideTip,1800); });
  });
};

/* ---------- vídeo do YouTube com capa e fallback offline ---------- */
W.yt=function(root){
  var id=root.getAttribute('data-id'), t=root.getAttribute('data-t')||'Vídeo', d=root.getAttribute('data-d')||'', n=root.getAttribute('data-n')||'';
  var box=el('div','yt');
  var cover=el('button','yt-cover'); cover.setAttribute('aria-label','Assistir: '+t);
  cover.style.backgroundImage='url(https://i.ytimg.com/vi/'+id+'/hqdefault.jpg)';
  var play=el('span','yt-play'); play.innerHTML='<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  cover.appendChild(play);
  var meta=el('div','yt-meta');
  var tt=el('b',null,t); meta.appendChild(tt);
  var sub=el('span',null,'YouTube'+(d?' · '+d:'')+(n?' · '+n:'')); meta.appendChild(sub);
  var link=el('a','yt-link','Abrir no YouTube ↗'); link.href='https://www.youtube.com/watch?v='+id; link.target='_blank'; link.rel='noopener';
  meta.appendChild(link);
  box.appendChild(cover); box.appendChild(meta); root.appendChild(box);
  cover.onclick=function(){
    if(navigator.onLine===false){ cover.classList.add('off'); play.textContent='Sem internet — o vídeo precisa de conexão'; return; }
    var f=document.createElement('iframe');
    f.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&hl=pt-BR';
    f.allow='accelerometer; autoplay; encrypted-media; picture-in-picture'; f.allowFullscreen=true; f.title=t;
    f.className='yt-frame'; box.replaceChild(f,cover);
  };
};

/* ---------- simulador da árvore de receita ---------- */
W.arvore=function(root){
  var st={v:20000,c:2.0,t:180}, base={v:20000,c:2.0,t:180};
  var box=el('div','w');
  box.appendChild(el('p','w-h','Simulador · Receita = Visitantes × Conversão × Ticket'));
  var hero=el('div','w-hero'); var hv=el('b'); var hd=el('span'); hero.appendChild(hv); hero.appendChild(hd); box.appendChild(hero);
  function slider(key,label,min,max,step,fmt){
    var row=el('label','w-row'); var top=el('div','w-lab'); var nm=el('span',null,label); var val=el('b'); top.appendChild(nm); top.appendChild(val);
    var inp=el('input'); inp.type='range'; inp.min=min; inp.max=max; inp.step=step; inp.value=st[key];
    inp.oninput=function(){ st[key]=parseFloat(inp.value); val.textContent=fmt(st[key]); calc(); };
    val.textContent=fmt(st[key]); row.appendChild(top); row.appendChild(inp); box.appendChild(row);
  }
  slider('v','Visitantes / mês',5000,100000,1000,fmtInt);
  slider('c','Conversão',0.5,5,0.1,function(x){ return x.toFixed(1).replace('.',',')+'%'; });
  slider('t','Ticket médio',60,500,5,fmtBRL);
  var acts=el('div','w-acts');
  var b10=el('button','btn ghost','+10% em cada um'); var bres=el('button','btn ghost','Fixar como base'); var bz=el('button','btn ghost','Voltar à base');
  acts.appendChild(b10); acts.appendChild(bres); acts.appendChild(bz); box.appendChild(acts);
  var note=el('p','w-note'); box.appendChild(note);
  function rec(s){ return s.v*(s.c/100)*s.t; }
  function calc(){
    var r=rec(st), rb=rec(base), d=(r/rb-1)*100;
    hv.textContent=fmtBRL(r); hd.textContent='receita / mês';
    if(Math.abs(d)<0.05){ note.textContent='Igual à base. Mexa num controle: cada 10% em um fator vira 10% na receita; 10% nos três vira 33%, porque eles se multiplicam.'; }
    else { note.textContent=(d>0?'+':'')+d.toFixed(1).replace('.',',')+'% contra a base de '+fmtBRL(rb)+'. '+(d>25?'Três fatores pequenos, um resultado grande — é o efeito composto da árvore.':d<-25?'Repare como uma queda dividida em três fatores parece pequena em cada um e enorme no total.':'A árvore transforma uma variação difusa em três alavancas nomeadas.'); }
    note.style.color = d<0?'var(--dn)':'';
  }
  function sync(){ Array.prototype.forEach.call(box.querySelectorAll('input[type=range]'),function(i,k){ var key=['v','c','t'][k]; i.value=st[key]; i.oninput(); }); }
  b10.onclick=function(){ st.v=Math.min(100000,Math.round(st.v*1.1)); st.c=Math.min(5,+(st.c*1.1).toFixed(1)); st.t=Math.min(500,Math.round(st.t*1.1)); sync(); };
  bres.onclick=function(){ base={v:st.v,c:st.c,t:st.t}; calc(); };
  bz.onclick=function(){ st={v:base.v,c:base.c,t:base.t}; sync(); };
  root.appendChild(box); calc();
};

/* ---------- calculadora de amostra para teste A/B ---------- */
W.amostra=function(root){
  var p=2.0, lift=10, vis=20000;
  var box=el('div','w');
  box.appendChild(el('p','w-h','Calculadora · Quantos visitantes um teste A/B precisa'));
  function slider(label,get,set,min,max,step,fmt){
    var row=el('label','w-row'); var top=el('div','w-lab'); top.appendChild(el('span',null,label)); var val=el('b'); top.appendChild(val);
    var inp=el('input'); inp.type='range'; inp.min=min; inp.max=max; inp.step=step; inp.value=get();
    inp.oninput=function(){ set(parseFloat(inp.value)); val.textContent=fmt(get()); calc(); };
    val.textContent=fmt(get()); row.appendChild(top); row.appendChild(inp); box.appendChild(row);
  }
  slider('Conversão atual',function(){return p;},function(x){p=x;},0.5,10,0.1,function(x){return x.toFixed(1).replace('.',',')+'%';});
  slider('Ganho que você quer detectar',function(){return lift;},function(x){lift=x;},2,50,1,function(x){return '+'+x+'%';});
  slider('Visitantes / mês na página',function(){return vis;},function(x){vis=x;},2000,300000,1000,fmtInt);
  var hero=el('div','w-hero'); var hv=el('b'); var hd=el('span'); hero.appendChild(hv); hero.appendChild(hd); box.appendChild(hero);
  var note=el('p','w-note'); box.appendChild(note);
  box.appendChild(el('p','w-fine','Duas proporções, bicaudal, 5% de significância, 80% de poder. Aproximação padrão; ferramentas de teste chegam a números parecidos.'));
  function calc(){
    var p1=p/100, p2=p1*(1+lift/100), pb=(p1+p2)/2, d=p2-p1;
    var n=Math.pow(1.96*Math.sqrt(2*pb*(1-pb))+0.8416*Math.sqrt(p1*(1-p1)+p2*(1-p2)),2)/(d*d);
    var total=2*n, meses=total/vis;
    hv.textContent=fmtInt(n); hd.textContent='visitantes por grupo · '+fmtInt(total)+' no total';
    var txt;
    if(meses<=0.5) txt='Com '+fmtInt(vis)+' visitantes/mês, o teste fecha em cerca de '+Math.ceil(meses*30)+' dias. Viável.';
    else if(meses<=1.5) txt='Com '+fmtInt(vis)+' visitantes/mês, leva cerca de '+Math.ceil(meses*30)+' dias — cobre pelo menos um ciclo completo de semana. Viável com paciência.';
    else if(meses<=4) txt='Com '+fmtInt(vis)+' visitantes/mês, leva uns '+meses.toFixed(1).replace('.',',')+' meses. Aceitável só para mudança que valha muito. Alternativa: testar uma mudança maior, que exige menos amostra.';
    else txt='Com '+fmtInt(vis)+' visitantes/mês, levaria '+Math.round(meses)+' meses. Na prática, não dá para testar isso — escolha uma mudança grande e aposte com critério, ou aceite que não vai ter prova.';
    note.textContent=txt; note.style.color = meses>4?'var(--dn)':(meses>1.5?'var(--wr)':'');
  }
  root.appendChild(box); calc();
};

/* ---------- simulação: espiar o teste todo dia ---------- */
W.espiar=function(root){
  var box=el('div','w'); box.appendChild(el('p','w-h','Simulação · Dois grupos IDÊNTICOS (efeito real = 0%). O que você vê se olhar todo dia?'));
  var fig=el('div','fig-svg'); box.appendChild(fig);
  var note=el('p','w-note'); box.appendChild(note);
  var acts=el('div','w-acts'); var b=el('button','btn ghost','Simular de novo'); acts.appendChild(b); box.appendChild(acts);
  function rnd(){ return Math.random(); }
  function run(){
    var dias=45, n=300, p=0.02, ca=0, cb=0, pts=[], maxAbs=0, diasTent=0, cruzou=0, ultimo=0;
    for(var d=1; d<=dias; d++){
      for(var i=0;i<n;i++){ if(rnd()<p) ca++; if(rnd()<p) cb++; }
      var lift = ca>0 ? (cb-ca)/ca*100 : 0;
      if(d>=3){ pts.push({d:d,l:lift}); if(Math.abs(lift)>maxAbs) maxAbs=Math.abs(lift); if(Math.abs(lift)>=10) diasTent++; if(d>3 && (lift>=0)!==(ultimo>=0)) cruzou++; }
      ultimo=lift;
    }
    var W_=400,H=190,px=38,py=16,pw=W_-px-10,ph=H-py-32;
    var ymax=Math.max(30,Math.ceil(maxAbs/10)*10);
    function X(d){ return px+(d-3)/(dias-3)*pw; } function Y(v){ return py+ph/2-(v/ymax)*(ph/2); }
    var s='<svg viewBox="0 0 '+W_+' '+H+'" role="img" aria-label="Diferença aparente entre dois grupos iguais ao longo de 45 dias">';
    s+='<rect x="'+px+'" y="'+Y(10)+'" width="'+pw+'" height="'+(Y(-10)-Y(10))+'" class="band"/>';
    [ymax,ymax/2,0,-ymax/2,-ymax].forEach(function(v){ s+='<line x1="'+px+'" x2="'+(px+pw)+'" y1="'+Y(v)+'" y2="'+Y(v)+'" class="'+(v===0?'ax':'gr')+'"/><text x="'+(px-6)+'" y="'+(Y(v)+4)+'" class="tk" text-anchor="end">'+(v>0?'+':'')+v+'%</text>'; });
    [10,20,30,45].forEach(function(d){ s+='<text x="'+X(d)+'" y="'+(H-8)+'" class="tk" text-anchor="middle">dia '+d+'</text>'; });
    var path='M'; pts.forEach(function(q,i){ path+=(i?' L':'')+X(q.d).toFixed(1)+' '+Y(q.l).toFixed(1); });
    s+='<path d="'+path+'" class="l1"/>';
    var fim=pts[pts.length-1]; s+='<circle cx="'+X(fim.d)+'" cy="'+Y(fim.l)+'" r="5" class="s1 ring"/>';
    s+='<text x="'+(px+pw-4)+'" y="'+(Y(ymax)+12)+'" class="tk" text-anchor="end">zona de tentação: ±10%</text>';
    s+='</svg>';
    fig.innerHTML=s;
    var final=fim.l;
    note.textContent='Efeito real: 0%. Mas a diferença aparente chegou a '+(maxAbs>=0?'±':'')+maxAbs.toFixed(0)+'% e passou '+diasTent+' dia'+(diasTent===1?'':'s')+' dentro da “zona de tentação”. Quem parasse num desses dias declararia vencedor um grupo idêntico ao outro. No dia 45 a diferença era '+(final>0?'+':'')+final.toFixed(1).replace('.',',')+'%.';
  }
  b.onclick=run; root.appendChild(box); run();
};

/* ---------- autodiagnóstico de maturidade analítica ---------- */
W.degrau=function(root){
  var Q=[
    {d:1,t:'Duas áreas diferentes chegam ao MESMO número quando calculam a mesma métrica.'},
    {d:1,t:'Para qualquer indicador do painel, alguém sabe dizer de qual sistema o dado saiu.'},
    {d:2,t:'Uma variação relevante de ontem consegue ser explicada em menos de um dia.'},
    {d:2,t:'A receita está decomposta em fatores (tráfego, conversão, ticket) que fecham a conta.'},
    {d:3,t:'Existe uma previsão do próximo mês com faixa, e alguém compara depois o previsto com o real.'},
    {d:3,t:'O histórico tem marcação de promoção e de ruptura de estoque, para não confundir com demanda.'},
    {d:4,t:'Existe pelo menos uma decisão recorrente (compra, preço, disparo) tomada a partir de recomendação automática.'},
    {d:4,t:'Quando a recomendação é ignorada, isso fica registrado e alguém revisa por quê.'}
  ];
  var ans=LSget('degrau',{});
  var box=el('div','w'); box.appendChild(el('p','w-h','Autodiagnóstico · Em que degrau a sua empresa está?'));
  var lista=el('div','dg');
  Q.forEach(function(q,i){
    var row=el('div','dg-row'); var txt=el('span',null,q.t); var g=el('div','dg-btns');
    var s=el('button','dg-b','Sim'); var n=el('button','dg-b','Não');
    function paint(){ s.classList.toggle('on',ans[i]===1); n.classList.toggle('on',ans[i]===0); }
    s.onclick=function(){ ans[i]=1; LSset('degrau',ans); paint(); res(); };
    n.onclick=function(){ ans[i]=0; LSset('degrau',ans); paint(); res(); };
    g.appendChild(s); g.appendChild(n); row.appendChild(txt); row.appendChild(g); lista.appendChild(row); paint();
  });
  box.appendChild(lista);
  var out=el('div','dg-out'); box.appendChild(out);
  var nomes={0:'Ainda antes do degrau 1',1:'Degrau 1 · Descritiva',2:'Degrau 2 · Diagnóstica',3:'Degrau 3 · Preditiva',4:'Degrau 4 · Prescritiva'};
  var dicas={0:'Comece definindo UMA métrica com ficha completa (fórmula, fonte, dono). Nada mais até isso existir.',1:'Você enxerga o que aconteceu. Próximo passo: a árvore de indicadores — decompor a receita em fatores que fecham a conta.',2:'Você explica o passado. Próximo passo: uma previsão simples com faixa, comparada com o real todo mês. Marque promoção e ruptura no histórico.',3:'Você antecipa. Próximo passo: escolher uma decisão recorrente e deixar a recomendação automática guiá-la — com registro de quando é ignorada.',4:'Você prescreve. O trabalho agora é manter: monitorar deriva, revisar a confiança da operação na recomendação e não deixar o dado apodrecer.'};
  function res(){
    var resp=0; for(var k in ans) resp++;
    if(resp<Q.length){ out.textContent='Responda as '+Q.length+' afirmações ('+resp+' de '+Q.length+').'; out.className='dg-out'; return; }
    var deg=0; for(var d=1; d<=4; d++){ var ok=Q.every(function(q,i){ return q.d!==d || ans[i]===1; }); if(ok) deg=d; else break; }
    out.innerHTML=''; out.className='dg-out on';
    out.appendChild(el('b',null,nomes[deg])); out.appendChild(el('span',null,dicas[deg]));
  }
  root.appendChild(box); res();
};

/* ---------- ficha de métrica (salva no aparelho) ---------- */
W.ficha=function(root){
  var campos=[
    ['nome','Nome da métrica','ex.: Abandono na etapa de frete'],
    ['formula','Fórmula exata','ex.: (chegaram na etapa − passaram) ÷ chegaram'],
    ['fonte','Fonte do dado','ex.: eventos do checkout, tabela X'],
    ['periodo','Periodicidade','ex.: semanal, toda segunda 9h'],
    ['dono','Dono (nome de pessoa)','ex.: quem responde por ela'],
    ['acao','Se mudar, o que se faz','ex.: acima de 35% → revisar faixa de frete grátis']
  ];
  var dados=LSget('ficha',{});
  var box=el('div','w'); box.appendChild(el('p','w-h','Sua ficha de métrica · preencha para a métrica mais importante do seu negócio'));
  var st=el('span','w-save'); 
  campos.forEach(function(c){
    var row=el('label','w-row'); row.appendChild(el('span','w-lab2',c[1]));
    var inp=el(c[0]==='acao'||c[0]==='formula'?'textarea':'input','w-in'); inp.placeholder=c[2]; inp.value=dados[c[0]]||''; if(inp.tagName==='TEXTAREA') inp.rows=2;
    inp.oninput=function(){ dados[c[0]]=inp.value; LSset('ficha',dados); st.textContent='salvo neste aparelho'; clearTimeout(st._t); st._t=setTimeout(function(){ st.textContent=''; },1800); };
    row.appendChild(inp); box.appendChild(row);
  });
  var foot=el('div','w-acts'); var chk=el('span','w-fine','Teste: se dois campos ficaram vagos, a métrica ainda não existe — existe um apelido.'); foot.appendChild(chk); foot.appendChild(st); box.appendChild(foot);
  root.appendChild(box);
};

/* ---------- inicialização ---------- */
window.initWidgets=function(raiz){
  Array.prototype.forEach.call(raiz.querySelectorAll('[data-w]'),function(n){
    var k=n.getAttribute('data-w'); if(W[k] && !n.dataset.ok){ n.dataset.ok='1'; try{ W[k](n); }catch(e){ n.textContent='(widget indisponível)'; } }
  });
  W.tip(raiz);
};
})();
