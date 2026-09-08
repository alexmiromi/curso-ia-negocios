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


/* ---------- triagem: regra, ML ou IA generativa? ---------- */
W.triagem=function(root){
  var N={
    q1:{q:'A decisão cabe numa frase do tipo “se A, então B” — que você conseguiria escrever agora?',s:'r_regra',n:'q2'},
    q2:{q:'O que você quer de volta é conteúdo NOVO (texto, imagem, código, resumo)?',s:'q3',n:'q4'},
    q3:{q:'Essa saída precisa ser factualmente correta e verificável (número, política, prazo)?',s:'r_rag',n:'r_gen'},
    q4:{q:'Você tem histórico com a RESPOSTA CERTA conhecida — milhares de casos passados rotulados?',s:'r_ml',n:'q5'},
    q5:{q:'Você quer descobrir grupos parecidos, ou casos fora do padrão?',s:'r_nsup',n:'r_nada'}
  };
  var R={
    r_regra:{t:'Escreva a regra. Não use IA.',c:'ac',d:'Mais barato, instantâneo, auditável e nunca inventa. Só volte a considerar IA se a regra virar uma árvore de mais de 20 condições que ninguém consegue manter.'},
    r_gen:{t:'IA generativa, com revisão humana antes de sair',c:'ac',d:'Rascunho gerado, pessoa aprova. Meça o tempo de revisão: se revisar demora mais que escrever, o ganho é negativo.'},
    r_rag:{t:'IA generativa + RAG (busca na sua base) + citação da fonte',c:'wr',d:'Nunca deixe o modelo responder de cabeça sobre fato da sua empresa. Entregue o documento no prompt e exija que ele cite o trecho. Sem fonte, ele preenche a lacuna com algo plausível.'},
    r_ml:{t:'Aprendizado supervisionado (classificação ou previsão)',c:'ac',d:'É aqui que mora quase todo o valor de negócio. Antes de treinar: qual a decisão que muda, e qual o número dela hoje?'},
    r_nsup:{t:'Agrupamento ou detecção de anomalia',c:'ac',d:'Comece pela anomalia — é a de melhor retorno sobre esforço. Agrupamento sempre devolve grupos, mesmo quando não há estrutura real: julgue se são acionáveis.'},
    r_nada:{t:'Ainda não é um caso de uso. É uma vontade.',c:'dn',d:'Sem regra, sem conteúdo novo, sem histórico rotulado e sem exploração — falta definir o problema. Volte para a pergunta de negócio antes de falar em ferramenta.'}
  };
  var box=el('div','w'); box.appendChild(el('p','w-h','Triagem · Regra, aprendizado de máquina ou IA generativa?'));
  var passo=el('div','tri'); box.appendChild(passo);
  var trilha=el('div','tri-tr'); box.appendChild(trilha);
  var hist=[];
  function render(k){
    passo.innerHTML='';
    if(R[k]){
      var r=R[k], out=el('div','tri-out '+r.c);
      out.appendChild(el('b',null,r.t)); out.appendChild(el('span',null,r.d));
      passo.appendChild(out);
      var again=el('button','btn ghost','Começar de novo'); again.onclick=function(){ hist=[]; trilha.innerHTML=''; render('q1'); };
      passo.appendChild(again); return;
    }
    var n=N[k];
    passo.appendChild(el('p','tri-q',n.q));
    var g=el('div','w-acts');
    var bs=el('button','btn pri','Sim'); var bn=el('button','btn','Não');
    bs.onclick=function(){ mark(n.q,'Sim'); render(n.s); };
    bn.onclick=function(){ mark(n.q,'Não'); render(n.n); };
    g.appendChild(bs); g.appendChild(bn); passo.appendChild(g);
  }
  function mark(q,a){ hist.push(a); var c=el('span','tri-chip',hist.length+'. '+a); trilha.appendChild(c); }
  root.appendChild(box); render('q1');
};

/* ---------- simulação de treino ---------- */
W.treino=function(root){
  var P=[], seed=7; function rr(){ seed=(seed*1103515245+12345)%2147483648; return seed/2147483648; }
  for(var i=0;i<12;i++){ var x=i/11; P.push({x:x, y:8+22*x+(rr()-0.5)*6}); }
  var a=0,b=0,ep=0,LR=0.2,hist=[];
  function mse(){ var s=0; P.forEach(function(p){ var e=p.y-(a*p.x+b); s+=e*e; }); return s/P.length; }
  hist.push(mse());
  var box=el('div','w'); box.appendChild(el('p','w-h','Simulação · o que “treinar” quer dizer, passo a passo'));
  var fig=el('div'); box.appendChild(fig);
  var acts=el('div','w-acts');
  var b1=el('button','btn pri','1 passo'); var b10=el('button','btn','10 passos'); var bfim=el('button','btn','Até o fim'); var bz=el('button','btn ghost','Zerar');
  acts.appendChild(b1); acts.appendChild(b10); acts.appendChild(bfim); acts.appendChild(bz); box.appendChild(acts);
  var note=el('p','w-note'); box.appendChild(note);
  function passo(){ if(ep>=200) return; var ga=0,gb=0; P.forEach(function(p){ var er=p.y-(a*p.x+b); ga+=-2*p.x*er; gb+=-2*er; }); a-=LR*ga/P.length; b-=LR*gb/P.length; ep++; hist.push(mse()); }
  function draw(){
    var e=mse(), e0=hist[0];
    var s='<div class="two">';
    // painel 1: pontos + reta
    s+='<div><p>Os exemplos e a reta do modelo</p><svg viewBox="0 0 200 150" role="img" aria-label="Doze exemplos e a reta que o modelo ajusta">';
    s+='<line x1="26" y1="126" x2="192" y2="126" class="ax"/><line x1="26" y1="10" x2="26" y2="126" class="ax"/>';
    function X(x){ return 26+x*160; } function Y(y){ return 126-(y/34)*110; }
    P.forEach(function(p){ s+='<circle cx="'+X(p.x).toFixed(1)+'" cy="'+Y(p.y).toFixed(1)+'" r="4" class="s1 ring" data-tip="exemplo · entrada '+(p.x*10).toFixed(1)+' · resposta certa '+p.y.toFixed(1)+'"/>'; });
    var y0=b, y1=a+b;
    s+='<line x1="'+X(0)+'" y1="'+Y(Math.max(-2,Math.min(40,y0)))+'" x2="'+X(1)+'" y2="'+Y(Math.max(-2,Math.min(40,y1)))+'" class="l2"/>';
    s+='<text x="192" y="140" class="tk" text-anchor="end">entrada →</text></svg></div>';
    // painel 2: curva de erro
    s+='<div><p>O erro, a cada passo</p><svg viewBox="0 0 200 150" role="img" aria-label="Curva do erro caindo ao longo dos passos de treino">';
    s+='<line x1="30" y1="126" x2="192" y2="126" class="ax"/><line x1="30" y1="10" x2="30" y2="126" class="ax"/>';
    var vis=hist.slice(0,Math.max(20,ep+1)), n=vis.length;
    function EX(i){ return 30+(n<2?0:i/(n-1))*160; } function EY(v){ return 126-(v/e0)*112; }
    var d='M'; vis.forEach(function(v,i){ d+=(i?' L':'')+EX(i).toFixed(1)+' '+EY(v).toFixed(1); });
    s+='<path d="'+d+'" class="l1"/>';
    s+='<circle cx="'+EX(ep).toFixed(1)+'" cy="'+EY(vis[ep]).toFixed(1)+'" r="4.5" class="s1 ring"/>';
    if(ep===0) s+='<text x="'+(EX(0)+8)+'" y="'+(EY(vis[0])+4)+'" class="lb2" font-size="10.5">chute inicial</text>';
    s+='<text x="26" y="16" class="tk" text-anchor="end">'+e0.toFixed(0)+'</text><text x="26" y="126" class="tk" text-anchor="end">0</text>';
    s+='<text x="192" y="140" class="tk" text-anchor="end">passos →</text></svg></div></div>';
    fig.innerHTML=s; W.tip(fig);
    var pct=(1-e/e0)*100;
    note.innerHTML='';
    note.appendChild(el('b',null,'Passo '+ep+' · erro '+e.toFixed(1)+' ('+pct.toFixed(0)+'% menor que no chute inicial)'));
    var txt = ep===0 ? ' — O modelo começa com números aleatórios e erra quase tudo. Nenhuma regra foi programada: só existem dois números, ajustáveis.'
      : ep<=3 ? ' — Repare: os primeiros passos derrubam quase todo o erro. É sempre assim; o resto é refino.'
      : ep<25 ? ' — Cada passo mede o erro e move os dois números na direção que reduz. Isso é “aprender”: otimização, não compreensão.'
      : ' — O erro parou de cair. Sobrou o ruído dos próprios dados, que nenhum modelo elimina. Continuar treinando aqui só faria decorar o ruído.';
    note.appendChild(document.createTextNode(txt));
  }
  b1.onclick=function(){ passo(); draw(); };
  b10.onclick=function(){ for(var i=0;i<10;i++) passo(); draw(); };
  bfim.onclick=function(){ for(var i=0;i<200;i++) passo(); draw(); };
  bz.onclick=function(){ a=0;b=0;ep=0;hist=[mse()]; draw(); };
  root.appendChild(box); draw();
};

/* ---------- próxima palavra + temperatura ---------- */
W.proximo=function(root){
  var C=[['atrasou',.38],['chegou',.22],['não',.16],['veio',.11],['está',.08],['sumiu',.03],['explodiu',.015],['cantou',.005]];
  var T=0.7, saiu=null, absurdos=0, total=0;
  var box=el('div','w'); box.appendChild(el('p','w-h','Simulação · como o modelo escolhe a próxima palavra'));
  box.appendChild(el('p','w-ctx','“O cliente reclamou que o pedido ___”'));
  var fig=el('div'); box.appendChild(fig);
  var row=el('label','w-row'); var top=el('div','w-lab'); top.appendChild(el('span',null,'Temperatura')); var val=el('b'); top.appendChild(val);
  var inp=el('input'); inp.type='range'; inp.min=0.1; inp.max=2; inp.step=0.1; inp.value=T;
  inp.oninput=function(){ T=parseFloat(inp.value); val.textContent=T.toFixed(1).replace('.',','); draw(); };
  val.textContent=T.toFixed(1).replace('.',','); row.appendChild(top); row.appendChild(inp); box.appendChild(row);
  var acts=el('div','w-acts'); var bs=el('button','btn pri','Sortear uma palavra'); var bz=el('button','btn ghost','Zerar contagem');
  acts.appendChild(bs); acts.appendChild(bz); box.appendChild(acts);
  var note=el('p','w-note'); box.appendChild(note);
  function probs(){ var e=C.map(function(c){ return Math.pow(c[1],1/T); }); var s=e.reduce(function(x,y){return x+y;},0); return e.map(function(v){ return v/s; }); }
  function draw(){
    var pr=probs(), max=Math.max.apply(null,pr);
    var h=C.length*26+16, s='<svg viewBox="0 0 400 '+h+'" role="img" aria-label="Probabilidade de cada palavra candidata">';
    C.forEach(function(c,i){
      var y=i*26+8, w=pr[i]/max*236, abs=i>=6;
      s+='<text x="82" y="'+(y+14)+'" class="lb2" text-anchor="end" font-size="12.5">'+c[0]+'</text>';
      s+='<rect x="88" y="'+(y+4)+'" width="'+Math.max(2,w).toFixed(1)+'" height="15" rx="0" class="'+(abs?'s2':(saiu===i?'s3':'s1'))+'" data-tip="'+c[0]+' · '+(pr[i]*100).toFixed(1)+'%"/>';
      s+='<rect x="88" y="'+(y+4)+'" width="'+Math.min(4,Math.max(2,w)).toFixed(1)+'" height="15" class="'+(abs?'s2':(saiu===i?'s3':'s1'))+'"/>';
      s+='<text x="'+(88+Math.max(2,w)+6)+'" y="'+(y+16)+'" class="tk">'+(pr[i]*100).toFixed(1)+'%</text>';
      if(saiu===i) s+='<text x="378" y="'+(y+16)+'" class="lb2" text-anchor="end" font-size="11" font-weight="700">← saiu</text>';
    });
    s+='</svg>';
    fig.innerHTML=s; W.tip(fig);
    var pAbs=(pr[6]+pr[7])*100;
    var t;
    if(T<=0.3) t='Temperatura baixa: quase toda a probabilidade vai para a palavra do topo. Repetível e previsível — é o que você quer em classificação e extração.';
    else if(T<=0.9) t='Temperatura média: o topo domina, mas há variação. Bom para texto que precisa soar natural sem delirar.';
    else if(T<=1.4) t='Temperatura alta: a distribuição achata. As palavras absurdas (em laranja) já somam '+pAbs.toFixed(1)+'% de chance.';
    else t='Temperatura muito alta: as absurdas somam '+pAbs.toFixed(1)+'%. É literalmente assim que nasce alucinação — não é defeito, é o sorteio funcionando como projetado.';
    if(total>0) t+=' · Você sorteou '+total+' vez'+(total>1?'es':'')+'; '+absurdos+' saíram absurdas.';
    note.textContent=t;
  }
  bs.onclick=function(){ var pr=probs(), r=Math.random(), acc=0, k=0; for(var i=0;i<pr.length;i++){ acc+=pr[i]; if(r<=acc){ k=i; break; } } saiu=k; total++; if(k>=6) absurdos++; draw(); };
  bz.onclick=function(){ saiu=null; total=0; absurdos=0; draw(); };
  root.appendChild(box); draw();
};

/* ---------- contador de tokens e custo ---------- */
W.tokens=function(root){
  var preco=3, chamadas=10000;
  var ex='Você classifica mensagens de clientes de uma loja on-line. Classifique a mensagem abaixo por assunto e urgência. Assunto deve ser exatamente um de: rastreio, troca, dúvida técnica, orçamento, reclamação, outro. Responda apenas com um objeto JSON.';
  var box=el('div','w'); box.appendChild(el('p','w-h','Calculadora · tokens e a conta do fim do mês'));
  var ta=el('textarea','w-in'); ta.rows=4; ta.value=ex; box.appendChild(ta);
  var st=el('div','w-stats'); box.appendChild(st);
  function slider(label,get,set,min,max,step,fmt){
    var row=el('label','w-row'); var top=el('div','w-lab'); top.appendChild(el('span',null,label)); var v=el('b'); top.appendChild(v);
    var i=el('input'); i.type='range'; i.min=min; i.max=max; i.step=step; i.value=get();
    i.oninput=function(){ set(parseFloat(i.value)); v.textContent=fmt(get()); calc(); };
    v.textContent=fmt(get()); row.appendChild(top); row.appendChild(i); box.appendChild(row);
  }
  slider('Chamadas por mês',function(){return chamadas;},function(x){chamadas=x;},1000,2000000,1000,fmtInt);
  slider('Preço por milhão de tokens (US$)',function(){return preco;},function(x){preco=x;},0.1,20,0.1,function(x){return 'US$ '+x.toFixed(2).replace('.',',');});
  var note=el('p','w-note'); box.appendChild(note);
  box.appendChild(el('p','w-fine','Estimativa: em português cada token vale mais ou menos 3,3 caracteres. O preço varia muito por modelo e por fornecedor — consulte a tabela atual do seu antes de decidir. Aqui só a ordem de grandeza importa.'));
  function calc(){
    var t=ta.value, ch=t.length, pal=(t.trim().match(/\S+/g)||[]).length;
    var tk=Math.max(1,Math.round(ch/3.3));
    st.innerHTML='';
    [[fmtInt(ch),'caracteres'],[fmtInt(pal),'palavras'],[fmtInt(tk),'tokens ≈']].forEach(function(p){
      var c=el('div','w-stat'); c.appendChild(el('b',null,p[0])); c.appendChild(el('span',null,p[1])); st.appendChild(c);
    });
    var mesUSD=tk*chamadas/1e6*preco;
    var mesBRL=mesUSD*5.5;
    note.innerHTML='';
    note.appendChild(el('b',null,'US$ '+mesUSD.toFixed(2).replace('.',',')+' / mês  ·  cerca de '+fmtBRL(mesBRL)));
    var extra = mesUSD<20 ? ' — custo de cafezinho. Nesse patamar, otimizar token é perda de tempo: foque em acertar o caso de uso.'
      : mesUSD<300 ? ' — já é uma linha no orçamento. Vale cortar o que se repete em toda chamada e testar um modelo menor para a tarefa.'
      : ' — isso é orçamento de verdade. Aqui pesa cache do contexto fixo, modelo menor para a tarefa simples e um filtro por regra antes de chamar o modelo.';
    note.appendChild(document.createTextNode(extra+' Só a ENTRADA está contada: some a saída e, em conversa, lembre que o histórico inteiro é reenviado a cada turno.'));
  }
  ta.oninput=calc; root.appendChild(box); calc();
};

/* ---------- custo do erro ---------- */
W.custoerro=function(root){
  var ac=95, vol=5000, custo=40;
  var box=el('div','w'); box.appendChild(el('p','w-h','Calculadora · quanto custam os erros que sobram'));
  function slider(label,get,set,min,max,step,fmt){
    var row=el('label','w-row'); var top=el('div','w-lab'); top.appendChild(el('span',null,label)); var v=el('b'); top.appendChild(v);
    var i=el('input'); i.type='range'; i.min=min; i.max=max; i.step=step; i.value=get();
    i.oninput=function(){ set(parseFloat(i.value)); v.textContent=fmt(get()); calc(); };
    v.textContent=fmt(get()); row.appendChild(top); row.appendChild(i); box.appendChild(row);
  }
  slider('Acerto do modelo',function(){return ac;},function(x){ac=x;},80,99.9,0.1,function(x){return x.toFixed(1).replace('.',',')+'%';});
  slider('Casos por mês',function(){return vol;},function(x){vol=x;},100,200000,100,fmtInt);
  slider('Custo de UM erro',function(){return custo;},function(x){custo=x;},1,5000,1,fmtBRL);
  var hero=el('div','w-hero'); var hv=el('b'); var hd=el('span'); hero.appendChild(hv); hero.appendChild(hd); box.appendChild(hero);
  var ver=el('div','ver'); box.appendChild(ver);
  var note=el('p','w-note'); box.appendChild(note);
  function calc(){
    var erros=vol*(1-ac/100), prej=erros*custo;
    hv.textContent=fmtBRL(prej); hd.textContent='de prejuízo por mês · '+fmtInt(erros)+' erro'+(erros>=2?'s':'')+' escapando';
    ver.innerHTML='';
    var t,c,d;
    if(custo>=1500){ t='Nunca automático'; c='dn'; d='Erro caro assim não se delega. O sistema sugere, uma pessoa nomeada aprova, e fica registrado quem aprovou.'; }
    else if(prej<500){ t='Automatize'; c='ac'; d='O prejuízo cabe no ruído da operação. Automatize e revise por amostragem — revisar tudo custaria mais que os erros.'; }
    else if(prej<8000){ t='Automatize com humano no fim'; c='wr'; d='Vale automatizar, mas mande ao humano só os casos de fronteira (onde o modelo está inseguro). Revisar 100% aqui já é caro demais.'; }
    else { t='Assistido, não automático'; c='dn'; d='Nesse patamar, cada ponto de acerto vale muito dinheiro. Sugestão + aprovação humana, e trate os '+fmtInt(erros)+' erros como meta de redução.'; }
    var v=el('div','ver-b '+c); v.appendChild(el('b',null,t)); v.appendChild(el('span',null,d)); ver.appendChild(v);
    var ac2=Math.min(99.95,ac+1), econ=(vol*(1-ac/100)-vol*(1-ac2/100))*custo;
    note.textContent='Subir o acerto de '+ac.toFixed(1).replace('.',',')+'% para '+ac2.toFixed(1).replace('.',',')+'% economizaria '+fmtBRL(econ)+' por mês. É esse número — não a acurácia — que decide se vale investir mais no modelo.';
  }
  root.appendChild(box); calc();
};

/* ---------- comprar, alugar ou construir ---------- */
W.construir=function(root){
  var cB=120000, mB=6000, mC=900, cA=15000, mA=600;
  var box=el('div','w'); box.appendChild(el('p','w-h','Comparador · custo acumulado em 36 meses'));
  var fig=el('div'); box.appendChild(fig);
  function slider(label,get,set,min,max,step,fmt){
    var row=el('label','w-row'); var top=el('div','w-lab'); top.appendChild(el('span',null,label)); var v=el('b'); top.appendChild(v);
    var i=el('input'); i.type='range'; i.min=min; i.max=max; i.step=step; i.value=get();
    i.oninput=function(){ set(parseFloat(i.value)); v.textContent=fmt(get()); draw(); };
    v.textContent=fmt(get()); row.appendChild(top); row.appendChild(i); box.appendChild(row);
  }
  slider('Construir: custo do projeto',function(){return cB;},function(x){cB=x;},20000,400000,5000,fmtBRL);
  slider('Construir: manutenção mensal',function(){return mB;},function(x){mB=x;},500,20000,250,fmtBRL);
  slider('Comprar: mensalidade da ferramenta',function(){return mC;},function(x){mC=x;},100,15000,100,fmtBRL);
  var note=el('p','w-note'); box.appendChild(note);
  function draw(){
    var M=36, sc=function(m){ return 2000+mC*m; }, sa=function(m){ return cA+mA*m; }, sb=function(m){ return cB+mB*m; };
    var max=Math.max(sc(M),sa(M),sb(M));
    var W_=400,H=190,px=52,py=12,pw=W_-px-16,ph=H-py-30;
    function X(m){ return px+m/M*pw; } function Y(v){ return py+ph-(v/max)*ph; }
    var s='<svg viewBox="0 0 '+W_+' '+H+'" role="img" aria-label="Custo acumulado de comprar, alugar e construir ao longo de 36 meses">';
    [0,.5,1].forEach(function(f){ var v=max*f; s+='<line x1="'+px+'" x2="'+(px+pw)+'" y1="'+Y(v)+'" y2="'+Y(v)+'" class="'+(f?'gr':'ax')+'"/><text x="'+(px-6)+'" y="'+(Y(v)+4)+'" class="tk" text-anchor="end">'+(v>=1000?Math.round(v/1000)+'k':'0')+'</text>'; });
    [0,12,24,36].forEach(function(m){ s+='<text x="'+X(m)+'" y="'+(H-8)+'" class="tk" text-anchor="middle">'+(m?'mês '+m:'início')+'</text>'; });
    [['l1',sc],['l3',sa],['l2',sb]].forEach(function(L){
      var d='M'; for(var m=0;m<=M;m+=2){ d+=(m?' L':'')+X(m).toFixed(1)+' '+Y(L[1](m)).toFixed(1); }
      s+='<path d="'+d+'" class="'+L[0]+'"/>';
    });
    s+='<circle cx="'+X(M)+'" cy="'+Y(sc(M))+'" r="4.5" class="s1 ring" data-tip="Comprar · 36 meses · '+fmtBRL(sc(M))+'"/>';
    s+='<circle cx="'+X(M)+'" cy="'+Y(sa(M))+'" r="4.5" class="s3 ring" data-tip="Alugar · 36 meses · '+fmtBRL(sa(M))+'"/>';
    s+='<circle cx="'+X(M)+'" cy="'+Y(sb(M))+'" r="4.5" class="s2 ring" data-tip="Construir · 36 meses · '+fmtBRL(sb(M))+'"/>';
    s+='</svg>';
    fig.innerHTML=s+'<div class="legend"><span><i style="background:var(--s1)"></i>Comprar (pronto)</span><span><i style="background:var(--s3)"></i>Alugar (API + integração)</span><span><i style="background:var(--s2)"></i>Construir</span></div>';
    W.tip(fig);
    var cruz=-1; for(var m=0;m<=120;m++){ if(sb(m)<=Math.min(sc(m),sa(m))){ cruz=m; break; } }
    note.textContent = cruz<0 ? 'Nesta configuração, construir NUNCA alcança as outras duas dentro de 10 anos. O gráfico está dizendo o que quase toda planilha esconde: a manutenção mensal, não o projeto, é o que decide.'
      : cruz>36 ? 'Construir só empataria no mês '+cruz+' — mais de 3 anos. Tempo demais: até lá a tecnologia mudou, a equipe mudou e o problema mudou.'
      : 'Construir empata no mês '+cruz+'. É defensável — mas só se o dado for realmente seu e ninguém puder comprar equivalente.';
  }
  root.appendChild(box); draw();
};

/* ---------- os seis filtros ---------- */
W.filtros=function(root){
  var F=[
    ['Valor','Se funcionar perfeitamente, você consegue estimar quanto vale em reais por ano?','Não sabe estimar? Não é caso de uso, é curiosidade. Volte quando tiver um número, mesmo grosseiro.'],
    ['Frequência','Isso acontece pelo menos algumas dezenas de vezes por mês?','Tarefa que roda 5 vezes por ano não paga a automação nem o tempo de quem vai mantê-la.'],
    ['Dado','Existe histórico acessível e com qualidade razoável?','Se o dado está em planilha de três pessoas diferentes, o projeto começa aí — e é outro projeto, com outro prazo.'],
    ['Erro','Você sabe dizer quanto custa um erro e quem paga por ele?','Sem isso você não consegue decidir se é automático, assistido ou proibido. É a pergunta que define o desenho inteiro.'],
    ['Dono','Existe uma PESSOA, com nome, que vai usar isso todo dia e responder pelo resultado?','Sem nome próprio, morre no piloto. “A área tal” não é dono.'],
    ['Medição','Existe um número que prova que funcionou — e você sabe quanto ele vale HOJE?','Este é o que mais mata projeto bonito. Sem linha de base, qualquer resultado vira discussão.']
  ];
  var ans=LSget('filtros',{});
  var box=el('div','w'); box.appendChild(el('p','w-h','Avaliador · o teste dos seis filtros (todos eliminatórios)'));
  F.forEach(function(f,i){
    var row=el('div','dg-row');
    var left=el('span'); left.appendChild(el('b','f-n',(i+1)+'. '+f[0]+' — ')); left.appendChild(document.createTextNode(f[1]));
    var g=el('div','dg-btns'); var s=el('button','dg-b','Sim'); var n=el('button','dg-b','Não');
    function paint(){ s.classList.toggle('on',ans[i]===1); n.classList.toggle('on',ans[i]===0); }
    s.onclick=function(){ ans[i]=1; LSset('filtros',ans); paint(); res(); };
    n.onclick=function(){ ans[i]=0; LSset('filtros',ans); paint(); res(); };
    g.appendChild(s); g.appendChild(n); row.appendChild(left); row.appendChild(g); box.appendChild(row); paint();
  });
  var out=el('div','dg-out'); box.appendChild(out);
  function res(){
    var resp=0; for(var k in ans) resp++;
    if(resp<F.length){ out.className='dg-out'; out.textContent='Responda os '+F.length+' filtros ('+resp+' de '+F.length+').'; return; }
    var falhas=[]; F.forEach(function(f,i){ if(ans[i]===0) falhas.push(i); });
    out.innerHTML=''; out.className='dg-out on'+(falhas.length?' bad':'');
    if(!falhas.length){ out.appendChild(el('b',null,'Passa nos seis. Pode começar.')); out.appendChild(el('span',null,'Antes de escrever a primeira linha: anote o valor atual da métrica e a data de morte do piloto. Sem esses dois, mesmo um caso aprovado vira zumbi.')); return; }
    out.appendChild(el('b',null,'Reprovou em '+falhas.length+' de 6 — filtro '+falhas.map(function(i){return F[i][0];}).join(', ')));
    out.appendChild(el('span',null,F[falhas[0]][2]+' Filtros não somam pontos: são eliminatórios. Resolva este antes de seguir.'));
  }
  root.appendChild(box); res();
};

/* ---------- inicialização ---------- */
window.initWidgets=function(raiz){
  Array.prototype.forEach.call(raiz.querySelectorAll('[data-w]'),function(n){
    var k=n.getAttribute('data-w'); if(W[k] && !n.dataset.ok){ n.dataset.ok='1'; try{ W[k](n); }catch(e){ n.textContent='(widget indisponível)'; } }
  });
  W.tip(raiz);
};
})();
