/* Motor de la presentación narrada: aparición al hacer scroll, contadores, pestañas, pasos,
   tarjetas que giran, antes/después, y el reproductor que narra, señala y subtitula.
   No se edita por presentación. Acciones propias: Presentacion.acciones.nombre = function(el, valor){}
   armar.py mete este archivo dentro del HTML final. */
window.Presentacion = window.Presentacion || { acciones: {} };
(function(){
  var doc=document.documentElement; doc.classList.add('js');
  /* ?pdf lo pone armar.py al imprimir: sin animaciones, todo a la vista. Si se imprimiera a media
     animación, los contadores saldrían en 0 y las barras vacías. */
  var pdf=/[?&]pdf(=|&|$)/.test(location.search); if(pdf)doc.classList.add('pdf');
  var reduce=pdf||matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $=function(s,c){return (c||document).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var fmt=function(n){return n.toLocaleString('es-MX')};
  function mk(html){var d=document.createElement('div');d.innerHTML=html.trim();return d.firstChild}

  /* piezas fijas que toda presentación usa */
  document.body.insertBefore(mk('<div id="progress"></div>'),document.body.firstChild);
  document.body.appendChild(mk('<nav id="dots" aria-label="Secciones"></nav>'));
  document.body.appendChild(mk('<div id="lb" role="dialog" aria-label="Imagen ampliada"><img alt=""></div>'));
  document.body.appendChild(mk('<div id="pointer" aria-hidden="true"><i></i><span id="ptag">Aquí</span></div>'));
  document.body.appendChild(mk('<div class="player" id="player" role="region" aria-label="Presentación con audio">'+
    '<div class="pcapt" id="pcapt" aria-live="off"></div>'+
    '<button class="pp" id="pp" type="button" aria-label="Pausar">❚❚</button>'+
    '<button class="prs" id="prs" type="button" aria-label="Desde el inicio" title="Desde el inicio">↺</button>'+
    '<div><span class="pcap" id="pcap">Inicio</span><div class="pbar" id="pbar"><i id="pfill"></i></div></div>'+
    '<span class="ptime" id="ptime">0:00</span>'+
    '<div class="pspeed" id="pspeed" role="group" aria-label="Velocidad de la voz"><button type="button" data-r="1">1×</button><button type="button" data-r="1.25">1.25×</button><button type="button" data-r="1.5">1.5×</button></div>'+
    '<label><input type="checkbox" id="pfollow" checked> La página sigue el audio</label>'+
    '<button class="px" id="px" type="button" aria-label="Cerrar">×</button></div>'));

  /* Aparición. Se revisa la posición real en cada scroll en vez de esperar el aviso del navegador:
     ese aviso se puede saltar un bloque con un scroll rápido y el bloque se queda invisible para siempre. */
  var pend=[];
  function once(el,fn,th){if(el)pend.push({el:el,fn:fn,th:th||.25})}
  function check(){var vh=innerHeight;for(var i=pend.length-1;i>=0;i--){var p=pend[i],r=p.el.getBoundingClientRect();
    if(r.top<vh*(1-p.th*0.5)&&r.bottom>0||r.bottom<0){pend.splice(i,1);p.fn()}}}
  var last=0;function queue(){var t=Date.now();if(t-last>60){last=t;check()}else{clearTimeout(queue._t);queue._t=setTimeout(check,80)}}

  /* título palabra por palabra: <h1 data-palabras> */
  $$('[data-palabras]').forEach(function(h){var wi=0;(function split(node){
    Array.prototype.slice.call(node.childNodes).forEach(function(n){
      if(n.nodeType===3){var frag=document.createDocumentFragment();n.textContent.split(/(\s+)/).forEach(function(w){if(!w)return;if(/^\s+$/.test(w)){frag.appendChild(document.createTextNode(w));return}var s=document.createElement('span');s.className='w';s.style.animationDelay=(0.15+wi++*0.06)+'s';s.textContent=w;frag.appendChild(s)});node.replaceChild(frag,n)}
      else if(n.nodeType===1)split(n)});})(h)});

  /* contador: el número final ya está escrito en el HTML; solo se anima si hay movimiento */
  function count(el,again){
    var to=+el.dataset.count; if(el._grp==null)el._grp=/\d[,.]\d/.test(el.textContent); if(reduce||!to||(el._done&&!again))return; el._done=1; var f=el._grp?fmt:String;
    var t0=null,d=1300;
    /* el 0 se pone hasta el primer cuadro: si el navegador no dibuja, se queda el número final */
    function step(t){if(!t0){t0=t;el.textContent='0'}var p=Math.min((t-t0)/d,1),e=1-Math.pow(1-p,3);el.textContent=f(Math.round(to*e));if(p<1)requestAnimationFrame(step)}
    requestAnimationFrame(step);
  }

  /* navegación: un punto por sección con data-label, y el índice si trae data-auto */
  var secs=$$('header.hero, section.sec'), nav=$('#dots');
  secs.forEach(function(s){if(!s.id)return;var a=document.createElement('a');a.href='#'+s.id;a.innerHTML='<span>'+(s.dataset.label||'')+'</span>';a.setAttribute('aria-label',s.dataset.label||s.id);nav.appendChild(a)});
  $$('ol.toc[data-auto]').forEach(function(ol){var own=ol.closest('section');var k=0;
    secs.forEach(function(s){if(s===own||s.tagName==='HEADER'||!s.dataset.label)return;k++;
      var li=document.createElement('li');li.innerHTML='<a href="#'+s.id+'"><b>'+('0'+k).slice(-2)+'</b>'+s.dataset.label+'</a>';ol.appendChild(li)})});
  var dots=$$('#dots a'), prog=$('#progress');
  function onScroll(){
    var max=doc.scrollHeight-innerHeight; prog.style.transform='scaleX('+(max>0?scrollY/max:0)+')';
    var mid=scrollY+innerHeight*0.4, cur=0;
    secs.forEach(function(s,k){if(s.offsetTop<=mid)cur=k});
    dots.forEach(function(d,k){d.classList.toggle('on',k===cur)});
    document.body.classList.toggle('dark-zone',!!(secs[cur]&&secs[cur].classList.contains('dark')));
  }
  addEventListener('scroll',onScroll,{passive:true}); onScroll();

  /* aparición: reveal, stagger, barras, línea de tiempo y cualquier [data-in] */
  var OBS='.reveal,.stagger,.barras,.tl,[data-in]';
  $$(OBS).forEach(function(el){once(el,function(){el.classList.add('in');$$('[data-count]',el).forEach(function(c){count(c)})},.15)});
  $$('.hstat [data-count]').forEach(function(el){setTimeout(function(){count(el)},1100)});

  /* teléfonos: la captura baja sola solo cuando se ve */
  if('IntersectionObserver' in window){var pio=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('run',e.isIntersecting&&!reduce)})},{threshold:.3});
    $$('.phone').forEach(function(p){pio.observe(p)});}

  /* pestañas: <div class="tabs" data-tabs="grupo"><button class="tab" data-p="idPanel"> + <div class="panel" data-group="grupo" id="idPanel"> */
  $$('[data-tabs]').forEach(function(bar){var g=bar.dataset.tabs;
    $$('.tab',bar).forEach(function(b){b.addEventListener('click',function(){
      $$('.tab',bar).forEach(function(x){x.setAttribute('aria-selected',x===b?'true':'false')});
      $$('.panel[data-group="'+g+'"]').forEach(function(p){p.classList.toggle('on',p.id===b.dataset.p)});
    })})});

  /* antes / después: se arrastra; al verse hace un barrido para que se note que se mueve */
  function sweepBA(ba){var t0=null;(function sw(t){if(ba._touched)return;if(!t0)t0=t;var p=(t-t0)/2400;if(p>1){ba.style.setProperty('--x','50%');return}ba.style.setProperty('--x',(50+Math.sin(p*Math.PI*2)*24)+'%');requestAnimationFrame(sw)})(performance.now())}
  $$('.ba').forEach(function(ba){var drag=false;
    function setX(cx){var r=ba.getBoundingClientRect();ba.style.setProperty('--x',Math.max(2,Math.min(98,(cx-r.left)/r.width*100))+'%')}
    ba.addEventListener('pointerdown',function(e){drag=ba._touched=true;ba.setPointerCapture(e.pointerId);setX(e.clientX)});
    ba.addEventListener('pointermove',function(e){if(drag)setX(e.clientX)});
    ba.addEventListener('pointerup',function(){drag=false});
    if(!reduce)once(ba,function(){sweepBA(ba)},.6)});

  /* paso a paso: <div class="stepper" id="..."> con .rail y varios .st */
  function runStepper(s){if(!s)return;var st=$$('.st',s),rail=$('.rail b',s);clearTimeout(s._t);
    st.forEach(function(x){x.classList.remove('done','cur')});if(rail)rail.style.width='0';var k=0;
    (function next(){if(k>=st.length){st[st.length-1].classList.remove('cur');return}st.forEach(function(x){x.classList.remove('cur')});st[k].classList.add('done','cur');if(rail)rail.style.width=(st.length>1?k/(st.length-1)*100:100)+'%';k++;s._t=setTimeout(next,reduce?0:900)})();
  }
  $$('.stepper').forEach(function(s){s.style.setProperty('--n',$$('.st',s).length);once(s,function(){runStepper(s)},.5)});
  $$('[data-play]').forEach(function(b){b.addEventListener('click',function(){runStepper(document.getElementById(b.dataset.play))})});
  $$('.flujo').forEach(function(f){f.style.setProperty('--n',$$('.nodo',f).length)});

  /* tarjetas que giran al tocarlas */
  $$('.voltea').forEach(function(r){r.addEventListener('click',function(){r.classList.toggle('volteada')})});

  /* repetir la animación de entrada de algo que ya se vio (barras, línea de tiempo, stagger) */
  function replay(el){el.classList.remove('in');void el.offsetWidth;setTimeout(function(){el.classList.add('in');$$('[data-count]',el).forEach(function(c){count(c,true)})},60)}

  /* ===== EFECTOS: lo que la voz puede hacer además de iluminar =====
     Ideas tomadas del catálogo de HyperFrames (marcatextos, trazo que se dibuja, cámara que acerca,
     contador tragamonedas, clic con onda, confeti, sello) y pasadas por las reglas de impeccable:
     cada efecto dice algo, frena suave (ease-out-expo), no rebota, y lo que muestra ya está visible sin
     animación (el PDF y "reducir movimiento" ven el estado final). Todo con Web Animations, sin librerías. */
  var EXPO='cubic-bezier(.16,1,.3,1)',NS='http://www.w3.org/2000/svg';
  var fxLayer=mk('<div id="fx" aria-hidden="true"></div>');document.body.appendChild(fxLayer);
  var fxAnims=[],fxTimers=[];
  function anim(el,k,o){if(reduce||!el.animate)return null;var a=el.animate(k,o);fxAnims.push(a);return a}
  function later(fn,ms){var t=setTimeout(fn,reduce?0:ms);fxTimers.push(t)}
  function box(el){var r=el.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height}}
  function svgAt(b,pad){var s=document.createElementNS(NS,'svg');var x=b.x-pad,y=b.y-pad,w=b.w+pad*2,h=b.h+pad*2;
    s.setAttribute('viewBox',x+' '+y+' '+w+' '+h);s.style.cssText='position:absolute;left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px;overflow:visible';fxLayer.appendChild(s);return s}
  function path(s,d,cls){var p=document.createElementNS(NS,'path');p.setAttribute('d',d);p.setAttribute('class',cls||'fx-trazo');s.appendChild(p);return p}
  function draw(p,ms,delay){var L=p.getTotalLength();p.style.strokeDasharray=L;p.style.strokeDashoffset=0;
    anim(p,[{strokeDashoffset:L},{strokeDashoffset:0}],{duration:ms||700,delay:delay||0,easing:EXPO,fill:'backwards'})}
  /* temblor fijo, no aleatorio: el mismo trazo cada vez, como la pluma de una persona */
  /* los renglones reales del texto, en coordenadas de la página */
  function renglones(el){var rg=document.createRange();rg.selectNodeContents(el);var L=[];Array.prototype.forEach.call(rg.getClientRects(),function(r){if(r.width<2)return;
      var t=r.top+scrollY,l=r.left+scrollX,rr=r.right+scrollX,bb=r.bottom+scrollY,m=L.filter(function(x){return Math.abs(x.t-t)<r.height*.6})[0];
      if(m){m.l=Math.min(m.l,l);m.r=Math.max(m.r,rr);m.b=Math.max(m.b,bb)}else L.push({t:t,l:l,r:rr,b:bb})});
    if(!L.length){var b=box(el);L.push({t:b.y,l:b.x,r:b.x+b.w,b:b.y+b.h})}return L.slice(0,6)}
  function jit(i,a){return Math.sin(i*12.9898+a*78.233)*.5}
  function limpiarFx(){fxAnims.forEach(function(a){try{a.cancel()}catch(e){}});fxAnims=[];fxTimers.forEach(clearTimeout);fxTimers=[];
    fxLayer.innerHTML='';$$('.sin-aro').forEach(function(x){x.classList.remove('sin-aro')});$$('.fx-mark.on').forEach(function(m){m.classList.remove('on')})}

  /* ESTILOS cambian CÓMO se señala. Los de ESTILO_SIN_ARO sustituyen el aro; enfocar lo acompaña. */
  var ESTILOS={
    circular:function(el){later(function(){var b=box(el),s=svgAt(b,16),cx=b.x+b.w/2,cy=b.y+b.h/2,rx=b.w/2+10,ry=b.h/2+9,d='';
      for(var i=0;i<=46;i++){var t=(-110+i*(385/46))*Math.PI/180,k=1+jit(i,1)*.035;d+=(i?'L':'M')+(cx+Math.cos(t)*rx*k).toFixed(1)+','+(cy+Math.sin(t)*ry*k).toFixed(1)}
      draw(path(s,d),750)},180)},
    subrayar:function(el){later(function(){var b=box(el),s=svgAt(b,14);renglones(el).forEach(function(r,i){var y=r.b+4,x0=r.l-2,x1=r.r+2;
      draw(path(s,'M'+x0+','+(y+1)+' C'+(x0+(x1-x0)*.3)+','+(y+4)+' '+(x0+(x1-x0)*.7)+','+(y-3)+' '+x1+','+(y+1)),600,i*160)})},180)},
    flecha:function(el){later(function(){var b=box(el),s=svgAt(b,90),izq=b.x-84>scrollX+4,
      x0=izq?b.x-78:b.x+Math.min(b.w*.6,260)+44,y0=b.y-54,x1=izq?b.x-8:b.x+Math.min(b.w*.6,260),y1=b.y+Math.min(b.h/2,26),
      qx=izq?x0+6:x0-6,qy=y1-4,p=path(s,'M'+x0+','+y0+' Q'+qx+','+qy+' '+x1+','+y1);draw(p,600);
      var a=Math.atan2(y1-qy,x1-qx),h=11;
      draw(path(s,'M'+(x1-h*Math.cos(a-.5)).toFixed(1)+','+(y1-h*Math.sin(a-.5)).toFixed(1)+' L'+x1+','+y1+' L'+(x1-h*Math.cos(a+.5)).toFixed(1)+','+(y1-h*Math.sin(a+.5)).toFixed(1)),250,520)},160)},
    esquinas:function(el){later(function(){var b=box(el),s=svgAt(b,18),p=8,L=Math.min(22,b.w/4,b.h/3),x0=b.x-p,y0=b.y-p,x1=b.x+b.w+p,y1=b.y+b.h+p;
      path(s,'M'+x0+','+(y0+L)+'V'+y0+'H'+(x0+L)+'M'+(x1-L)+','+y0+'H'+x1+'V'+(y0+L)+'M'+x1+','+(y1-L)+'V'+y1+'H'+(x1-L)+'M'+(x0+L)+','+y1+'H'+x0+'V'+(y1-L),'fx-trazo fx-esq');
      s.style.transformOrigin='center';anim(s,[{transform:'scale(1.12)',opacity:0},{transform:'none',opacity:1}],{duration:420,easing:EXPO})},120)},
    marcar:function(el){/* marcatextos detrás del texto: el fondo de un span en línea se corta renglón por renglón */
      var m=el.querySelector(':scope > .fx-mark');if(!m){m=document.createElement('span');m.className='fx-mark';while(el.firstChild)m.appendChild(el.firstChild);el.appendChild(m)}
      void m.offsetWidth;later(function(){m.classList.add('on')},150)},
    enfocar:function(el){anim(el,[{scale:'1'},{scale:'1.045'}],{duration:520,easing:EXPO,fill:'forwards'})}
  };
  var ESTILO_SIN_ARO={circular:1,subrayar:1,flecha:1,esquinas:1,marcar:1};

  function textNodes(el){var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),out=[],n;while((n=w.nextNode()))if(n.textContent.trim())out.push(n);return out}
  function splitWords(el){if(el._w)return el._w;var ws=[];textNodes(el).forEach(function(n){var f=document.createDocumentFragment();n.textContent.split(/(\s+)/).forEach(function(t){if(!t)return;if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(t));return}var s=document.createElement('span');s.className='fx-w';s.textContent=t;f.appendChild(s);ws.push(s)});n.parentNode.replaceChild(f,n)});el._w=ws;return ws}
  function digits(el){return (el.dataset&&el.dataset.count)?[el]:$$('[data-count]',el)}
  function onda(b,color,delay){var i=document.createElement('i');i.className='fx-onda';i.style.cssText='left:'+(b.x+b.w/2)+'px;top:'+(b.y+b.h/2)+'px;border-color:'+color;fxLayer.appendChild(i);
    anim(i,[{transform:'translate(-50%,-50%) scale(.2)',opacity:.9},{transform:'translate(-50%,-50%) scale(1)',opacity:0}],{duration:650,delay:delay||0,easing:EXPO,fill:'both'})}

  /* EFECTOS cambian QUÉ pasa */
  var EFECTOS={
    escribir:function(el){if(reduce)return;var ns=textNodes(el),full=ns.map(function(n){return n.textContent}),tot=full.join('').length,ms=Math.min(1800,tot*28),t0=null,fin=false;
      var caret=document.createElement('span');caret.className='fx-caret';el.appendChild(caret);
      function pon(k){var acc=0;ns.forEach(function(n,i){var L=full[i].length;n.textContent=full[i].slice(0,Math.max(0,Math.min(L,k-acc)));acc+=L})}
      pon(0);(function st(t){if(fin)return;if(!t0)t0=t;var k=Math.round(Math.min(1,(t-t0)/ms)*tot);pon(k);if(k<tot)requestAnimationFrame(st)})(performance.now());
      /* pase lo que pase, al final el texto queda completo */
      later(function(){fin=true;pon(tot);caret.remove()},ms+700)},
    palabras:function(el){var ws=splitWords(el),step=Math.min(70,900/Math.max(1,ws.length));
      ws.forEach(function(w,i){anim(w,[{opacity:0,transform:'translateY(.45em)',filter:'blur(6px)'},{opacity:1,transform:'none',filter:'blur(0)'}],{duration:520,delay:i*step,easing:EXPO,fill:'backwards'})})},
    rodar:function(el){/* tragamonedas: cada cifra gira y se asienta de izquierda a derecha */
      if(reduce)return;digits(el).forEach(function(d){var fin=d.textContent,n=fin.length,t0=null,ms=1100,done=false;
        (function st(t){if(done)return;if(!t0)t0=t;var p=(t-t0)/ms,out='';for(var i=0;i<n;i++){var c=fin[i],fija=p>(i+1)/(n+1);out+=(/\d/.test(c)&&!fija)?String((Math.floor((t-t0)/45)+i*3)%10):c}
          d.textContent=out;if(p<1)requestAnimationFrame(st);else d.textContent=fin})(performance.now());
        later(function(){done=true;d.textContent=fin},ms+120)})},
    crecer:function(el){BUILTIN.contar(el);digits(el).forEach(function(d){var b=d.closest('b')||d;anim(b,[{scale:'.82'},{scale:'1.1',offset:.8},{scale:'1'}],{duration:1400,easing:'cubic-bezier(.25,1,.5,1)'})})},
    dibujar:function(el){$$('.g-linea,path.trazo,line.trazo,polyline',el).forEach(function(p,i){if(p.getTotalLength)draw(p,1300,i*120)});
      $$('.g-punto',el).forEach(function(c,i,a){c.style.transformBox='fill-box';c.style.transformOrigin='center';anim(c,[{opacity:0,transform:'scale(0)'},{opacity:1,transform:'none'}],{duration:380,delay:250+i*(1000/a.length),easing:EXPO,fill:'backwards'})});
      $$('.g-area',el).forEach(function(a){anim(a,[{opacity:0},{opacity:1}],{duration:900,delay:500,easing:EXPO,fill:'backwards'})});
      $$('.g-fin',el).forEach(function(a){anim(a,[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:500,delay:1200,easing:EXPO,fill:'backwards'})})},
    llenar:function(el){$$('.anillo',el).concat(el.classList.contains('anillo')?[el]:[]).forEach(function(a){var c=$('.a-val',a);if(!c)return;var L=+c.dataset.l,v=+a.dataset.valor;
      anim(c,[{strokeDashoffset:L},{strokeDashoffset:L*(1-v/100)}],{duration:1400,easing:EXPO,fill:'backwards'});var n=$('[data-count]',a);if(n)count(n,true)})},
    revelar:function(el){anim(el,[{clipPath:'inset(0 100% 0 0)',filter:'blur(4px)'},{clipPath:'inset(0 0 0 0)',filter:'blur(0)'}],{duration:1000,easing:EXPO})},
    acercar:function(el,v){var im=el.tagName==='IMG'?el:$('img',el);if(!im)return;var k=+(v||1.14);
      anim(im,[{transform:'scale(1) translate(0,0)'},{transform:'scale('+k+') translate(-2%,-2%)'}],{duration:7000,easing:'cubic-bezier(.25,.1,.25,1)',fill:'forwards'})},
    recorrer:function(el,v){var im=el.tagName==='IMG'?el:$('img',el);if(!im)return;var fr=im.parentElement,dist=Math.max(0,im.offsetHeight-fr.clientHeight)*((+v||50)/100);
      anim(im,[{transform:'translateY(0)'},{transform:'translateY(-'+dist.toFixed(0)+'px)'}],{duration:1800,easing:EXPO,fill:'forwards'})},
    tocar:function(el){later(function(){var b=box(el);onda(b,'var(--acento)',0);onda(b,'var(--marca)',140)},200);
      anim(el,[{scale:'1'},{scale:'.965',offset:.35},{scale:'1'}],{duration:420,delay:200,easing:EXPO})},
    confeti:function(el){if(reduce)return;later(function(){var b=box(el),cx=b.x+b.w/2,cy=b.y+Math.min(b.h/2,40),cols=['var(--marca)','var(--acento)','var(--brillo)','var(--brillo-marca)'];
      for(var i=0;i<28;i++){var q=document.createElement('i');q.className='fx-confeti';q.style.cssText='left:'+cx+'px;top:'+cy+'px;background:'+cols[i%4]+(i%3?'':';border-radius:50%');fxLayer.appendChild(q);
        var ang=(-90+(i/27-.5)*150)*Math.PI/180,vel=140+((i*37)%90),dx=Math.cos(ang)*vel,dy=Math.sin(ang)*vel,rot=((i*53)%360)-180;
        anim(q,[{transform:'translate(-50%,-50%) rotate(0)',opacity:1},{transform:'translate('+(dx*.9)+'px,'+(dy*.9)+'px) rotate('+rot/2+'deg)',opacity:1,offset:.45},{transform:'translate('+dx+'px,'+(dy+170)+'px) rotate('+rot+'deg)',opacity:0}],{duration:1300+(i%5)*80,easing:'cubic-bezier(.2,.6,.4,1)',fill:'forwards'})}},250)},
    sello:function(el,v){var s=el.querySelector(':scope > .fx-sello');if(!s){s=document.createElement('span');s.className='fx-sello';if(getComputedStyle(el).position==='static')el.style.position='relative';el.appendChild(s)}
      s.textContent=v||el.dataset.sello||'✓ Listo';later(function(){s.classList.add('on');anim(s,[{opacity:0,transform:'rotate(-12deg) scale(1.7)'},{opacity:1,transform:'rotate(-8deg) scale(1)'}],{duration:420,easing:EXPO,fill:'backwards'});
        later(function(){onda(box(s),'var(--acento)',0)},200)},250)},
    cascada:function(el){var kids=Array.prototype.slice.call(el.children),step=Math.min(60,500/Math.max(1,kids.length));
      kids.forEach(function(k,i){anim(k,[{opacity:0,transform:'translateY(28px) scale(.97)'},{opacity:1,transform:'none'}],{duration:600,delay:i*step,easing:EXPO,fill:'backwards'})})},
    comparar:function(el){var k=el.children;if(k.length<2)return;
      anim(k[0],[{opacity:0,transform:'perspective(900px) translateX(-60px) rotateY(10deg)'},{opacity:1,transform:'none'}],{duration:800,easing:EXPO,fill:'backwards'});
      anim(k[1],[{opacity:0,transform:'perspective(900px) translateX(60px) rotateY(-10deg)'},{opacity:1,transform:'none'}],{duration:800,delay:120,easing:EXPO,fill:'backwards'})},
    latido:function(el){anim(el,[{boxShadow:'0 0 0 0 transparent'},{boxShadow:'0 0 44px 10px color-mix(in srgb,var(--acento) 35%,transparent)',offset:.4},{boxShadow:'0 0 0 0 transparent'}],{duration:1300,easing:'ease-out'})},
    cambiar:function(el,v){if(!v)return;if(el.dataset.antes==null)el.dataset.antes=el.textContent;
      var sal=anim(el,[{opacity:1,transform:'none',filter:'blur(0)'},{opacity:0,transform:'translateY(-.5em)',filter:'blur(4px)'}],{duration:260,easing:'cubic-bezier(.4,0,1,1)'});
      function pon(){el.textContent=v;anim(el,[{opacity:0,transform:'translateY(.5em)',filter:'blur(4px)'},{opacity:1,transform:'none',filter:'blur(0)'}],{duration:520,easing:EXPO})}
      if(sal){sal.onfinish=pon;sal.oncancel=function(){el.textContent=v}}else pon()}
  };
  /* al reiniciar, lo que la voz cambió vuelve a como estaba */
  function reponerFx(){$$('[data-antes]').forEach(function(e){e.textContent=e.dataset.antes;delete e.dataset.antes});$$('.fx-sello').forEach(function(s){s.remove()})}

  /* Gráfica de línea: <figure class="grafica" data-valores="12,18,26" data-etiquetas="Ene,Feb,Mar" data-sufijo="%">
     Se dibuja completa desde el principio (así sale en el PDF); al verse o con "dibujar", el trazo se hace solo. */
  $$('.grafica').forEach(function(g){var v=(g.dataset.valores||'').split(',').map(Number),et=(g.dataset.etiquetas||'').split(','),suf=g.dataset.sufijo||'';if(v.length<2)return;
    var W=640,H=240,pl=24,pr=86,pt=24,pb=36,mx=Math.max.apply(null,v),mn=Math.min(0,Math.min.apply(null,v)),X=function(i){return pl+i*(W-pl-pr)/(v.length-1)},Y=function(y){return pt+(H-pt-pb)*(1-(y-mn)/((mx-mn)||1))};
    var pts=v.map(function(y,i){return [X(i),Y(y)]}),d='M'+pts.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1)}).join(' L');
    var s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+(g.getAttribute('aria-label')||'Gráfica')+'">';
    for(var k=0;k<=3;k++){var yy=pt+(H-pt-pb)*k/3;s+='<line class="g-rejilla" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+yy+'" y2="'+yy+'"/>'}
    s+='<path class="g-area" d="'+d+' L'+X(v.length-1)+','+(H-pb)+' L'+pl+','+(H-pb)+' Z"/><path class="g-linea" d="'+d+'"/>';
    pts.forEach(function(p,i){s+='<circle class="g-punto" cx="'+p[0]+'" cy="'+p[1]+'" r="'+(i===pts.length-1?6:4)+'"/>';if(et[i])s+='<text class="g-et" x="'+p[0]+'" y="'+(H-10)+'">'+et[i]+'</text>'});
    var last=pts[pts.length-1];s+='<text class="g-fin" x="'+(last[0]+12)+'" y="'+(last[1]+7)+'">'+v[v.length-1].toLocaleString('es-MX')+suf+'</text></svg>';
    g.insertAdjacentHTML('afterbegin',s);if(!reduce&&!pdf)once(g,function(){EFECTOS.dibujar(g)},.35)});
  /* Anillo de avance: <div class="anillo" data-valor="72"><span>de citas confirmadas</span></div> */
  $$('.anillo').forEach(function(a){var v=Math.max(0,Math.min(100,+a.dataset.valor||0)),r=52,L=2*Math.PI*r;
    a.insertAdjacentHTML('afterbegin','<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="a-pista" cx="60" cy="60" r="'+r+'"/><circle class="a-val" data-l="'+L.toFixed(1)+'" cx="60" cy="60" r="'+r+'" style="stroke-dasharray:'+L.toFixed(1)+';stroke-dashoffset:'+(L*(1-v/100)).toFixed(1)+'"/></svg><b><span data-count="'+Math.round(v)+'">'+Math.round(v)+'</span>%</b>');
    if(!reduce&&!pdf)once(a,function(){EFECTOS.llenar(a)},.35)});

  /* ===== presentación con audio: la página avanza sola a la sección que se está narrando ===== */
  var CAPS=/*CAPITULOS*/null;
  var aud=$('#aud'),pl=$('#player'),pp=$('#pp'),pfill=$('#pfill'),pbar=$('#pbar'),pcap=$('#pcap'),ptime=$('#ptime'),pfollow=$('#pfollow');
  function mmss(t){t=Math.max(0,t|0);return (t/60|0)+':'+('0'+t%60).slice(-2)}
  function withCaps(fn){if(CAPS){fn();return}fetch('audio/capitulos.json').then(function(r){return r.json()}).then(function(j){CAPS=j;fn()}).catch(function(){CAPS={duracion:0,capitulos:[]};fn()})}
  var curCap=-1, marks=false;
  function capAt(t){var c=CAPS.capitulos,k=0;for(var i=0;i<c.length;i++){if(c[i].inicio<=t+.05)k=i}return k}
  function labelOf(id){var el=document.getElementById(id);return el?(el.dataset.label||id):id}
  function drawMarks(){if(marks||!CAPS.duracion)return;marks=true;CAPS.capitulos.forEach(function(c){if(!c.inicio)return;var b=document.createElement('b');b.style.left=(c.inicio/CAPS.duracion*100)+'%';pbar.appendChild(b)})}
  function goTo(id){var el=document.getElementById(id);if(!el)return;var y=el.tagName==='HEADER'?0:el.getBoundingClientRect().top+scrollY-10;scrollTo({top:y,behavior:reduce?'auto':'smooth'})}

  /* "selector@texto" = el primer elemento del selector que contiene ese texto. Se busca primero dentro
     de la sección que se está narrando: si no, ".fila@Julio" podía caer en la fila Julio de otra sección. */
  function pick(q,root){var k=q.indexOf('@'),sel=k<0?q:q.slice(0,k),txt=k<0?null:q.slice(k+1);var L;try{L=$$(sel,root)}catch(e){return null}
    if(root!==document&&root.matches&&root.matches(sel))L.unshift(root);
    if(txt!==null)txt=txt.toLowerCase();for(var i=0;i<L.length;i++){if(txt===null||L[i].textContent.toLowerCase().indexOf(txt)>=0)return L[i]}return null}
  function findEl(q,secId){if(!q)return null;var sec=secId&&document.getElementById(secId);return (sec&&pick(q,sec))||pick(q,document)}
  var BUILTIN={
    clic:function(el){if(el)el.click()},
    tab:function(el,v){var b=$('.tab[data-p="'+v+'"]');if(b)b.click()},
    pasos:function(el,v){runStepper(v?document.getElementById(v):(el&&(el.classList.contains('stepper')?el:el.closest('.stepper'))))},
    voltear:function(el){var c=el&&(el.classList.contains('voltea')?el:el.closest('.voltea'));if(c)c.classList.add('volteada')},
    repetir:function(el){if(el)replay(el)},
    contar:function(el){if(el)$$('[data-count]',el).concat(el.dataset.count?[el]:[]).forEach(function(c){count(c,true)})},
    barrido:function(el){var b=el&&(el.classList.contains('ba')?el:el.closest('.ba'));if(b&&!reduce){b._touched=false;sweepBA(b)}}
  };
  /* Una acción puede juntar varias con "+": "circular+contar". Cada parte es nombre o nombre:valor. */
  function one(a){var n=a.split(':')[0];return Presentacion.acciones[n]||BUILTIN[n]||EFECTOS[n]||ESTILOS[n]||null}
  function actionFn(a){if(!a)return null;var ps=a.split('+');for(var i=0;i<ps.length;i++){if(!one(ps[i].trim()))return null}return one(ps[0].trim())}
  function sinAro(a){return !!a&&a.split('+').some(function(x){return ESTILO_SIN_ARO[x.trim().split(':')[0]]})}
  function partes(a,tab){return (a||'').split('+').map(function(x){return x.trim()}).filter(function(x){return x&&((x.indexOf('tab:')===0)===tab)}).join('+')}
  function act(a,el){if(!a)return;a.split('+').forEach(function(x){x=x.trim();if(!x)return;var p=x.split(':'),f=one(x);if(!f){console.error('Acción desconocida: '+x);return}
    try{f(el,p.slice(1).join(':'))}catch(e){console.error('La acción '+x+' falló',e)}})}

  var spotEl=null,pointer=$('#pointer'),ptag=$('#ptag');
  function placePointer(){if(!spotEl){pointer.classList.remove('on');return}var r=spotEl.getBoundingClientRect();var x=Math.min(Math.max(r.left-10,12),innerWidth-150),y=Math.max(r.top-10,56);pointer.style.transform='translate('+x+'px,'+y+'px)';pointer.classList.add('on')}
  var pulso=null;
  function spot(e,label,suave){$$('.spot').forEach(function(x){x.classList.remove('spot')});if(pulso){pulso.cancel();pulso=null}spotEl=e;if(!e){placePointer();return}
    e.classList.add('spot');if(suave)e.classList.add('sin-aro');
    else if(!reduce&&e.animate&&e.tagName!=='TR')pulso=e.animate([{boxShadow:'0 0 0 6px transparent,0 0 0 6px color-mix(in srgb,var(--acento) 55%,transparent)'},{boxShadow:'0 0 0 6px transparent,0 0 0 22px transparent',offset:.7},{boxShadow:'0 0 0 6px transparent,0 0 0 6px transparent'}],{duration:1800,iterations:Infinity,easing:'cubic-bezier(.2,0,0,1)'});ptag.textContent=label||'Aquí';pointer.classList.remove('tag');void pointer.offsetWidth;pointer.classList.add('tag');
    if(pfollow.checked){var r=e.getBoundingClientRect(),vh=innerHeight-150;if(r.top<70||r.bottom>vh){var y=r.top+scrollY-Math.max(80,(vh-Math.min(r.height,vh-100))/2);scrollTo({top:Math.max(0,y),behavior:reduce?'auto':'smooth'})}}
    setTimeout(placePointer,30);setTimeout(placePointer,650);
  }
  function clearSpot(){$$('.spot').forEach(function(x){x.classList.remove('spot')});if(pulso){pulso.cancel();pulso=null}limpiarFx();spotEl=null;placePointer()}
  addEventListener('scroll',function(){if(spotEl)placePointer()},{passive:true});addEventListener('resize',function(){if(spotEl)placePointer()});

  /* subtítulos: la frase que se dice, palabra por palabra */
  var capt=$('#pcapt'),sentKey='';
  function sentences(c){if(c._s)return c._s;var S=[],cur=[];c.palabras.forEach(function(w,i){cur.push(i);if(/[.?!:]$/.test(w[1])){S.push(cur);cur=[]}});if(cur.length)S.push(cur);c._s=S;return S}
  function caption(c,t){var W=c.palabras,k=-1;for(var i=0;i<W.length;i++){if(W[i][0]<=t+.05)k=i;else break}
    var S=sentences(c),si=0;for(var j=0;j<S.length;j++){if(k>=S[j][0])si=j}
    var key=c.id+':'+si;if(key!==sentKey){sentKey=key;capt.innerHTML=S[si].map(function(i){return '<b data-i="'+i+'">'+W[i][1]+'</b>'}).join(' ')}
    $$('b',capt).forEach(function(b){var i=+b.dataset.i;b.classList.toggle('said',i<k);b.classList.toggle('now',i===k)})}

  var cueKey='',RATE=1.25;
  function tick(){if(!CAPS)return;var t=aud.currentTime,d=CAPS.duracion||aud.duration||1;pfill.style.width=(t/d*100)+'%';ptime.textContent=mmss(t/RATE)+' / '+mmss(d/RATE);
    if(!CAPS.capitulos.length)return;
    var k=capAt(t),c=CAPS.capitulos[k];
    if(k!==curCap){var nuevo=curCap>=0;curCap=k;pcap.textContent=labelOf(c.id);var h2=nuevo&&!aud.paused&&!reduce&&document.querySelector('#'+c.id+' h2');if(h2&&h2.animate)h2.animate([{clipPath:'inset(0 0 100% 0)',transform:'translateY(.35em)'},{clipPath:'inset(0 0 -20% 0)',transform:'none'}],{duration:800,delay:250,easing:EXPO,fill:'backwards'});if(pfollow.checked&&!(c.cues&&c.cues.length&&c.cues[0][0]-c.inicio<1.5))goTo(c.id)}
    if(c.palabras)caption(c,t);
    var ci=-1;(c.cues||[]).forEach(function(q,i){if(q[0]<=t)ci=i});
    var key=k+':'+ci;if(key!==cueKey){cueKey=key;if(ci>=0){var q=c.cues[ci];
      /* una pestaña primero se abre y luego se busca la pieza, que vive dentro del panel */
      limpiarFx();var suave=sinAro(q[2]),tabs=partes(q[2],true),resto=partes(q[2],false);
      if(tabs){act(tabs,null);setTimeout(function(){var e=findEl(q[1],c.id);spot(e,labelOf(c.id),suave);act(resto,e)},120)}
      else{var e=findEl(q[1],c.id);if(!e)console.error('Señalamiento sin destino: '+q[1]);spot(e,labelOf(c.id),suave);act(resto,e)}}
      else clearSpot()}
  }
  function play(){withCaps(function(){drawMarks();pl.classList.add('on');aud.play().catch(function(){})})}

  /* velocidad de la voz: 1.25× por defecto, se recuerda en este navegador. Los señalamientos van con
     el tiempo del audio, así que no se desfasan; el reloj sí se ajusta a la velocidad. */
  try{var sr=parseFloat(localStorage.getItem('presentacion-voz-velocidad'));if(sr===1||sr===1.25||sr===1.5)RATE=sr}catch(e){}
  function setRate(r){RATE=r;aud.playbackRate=r;aud.defaultPlaybackRate=r;try{aud.preservesPitch=true}catch(e){}
    $$('#pspeed button').forEach(function(b){var on=+b.dataset.r===r;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false')});
    try{localStorage.setItem('presentacion-voz-velocidad',String(r))}catch(e){}
    $$('[data-duracion]').forEach(function(s){if(CAPS&&CAPS.duracion){var m=CAPS.duracion/r/60;s.textContent=(m<1?'menos de 1 min':Math.round(m)+' min')+' · la página avanza sola'}})}
  $$('#pspeed button').forEach(function(b){b.addEventListener('click',function(){setRate(+b.dataset.r);tick()})});
  aud.addEventListener('play',function(){if(aud.playbackRate!==RATE)aud.playbackRate=RATE});
  setRate(RATE);
  if(!CAPS)withCaps(function(){setRate(RATE)});

  $$('[data-escuchar]').forEach(function(b){b.addEventListener('click',function(){if(ended){restart();return}if(aud.currentTime>1&&!aud.paused)return;curCap=-1;cueKey='';play()})});
  pp.addEventListener('click',function(){if(ended){restart();return}if(aud.paused)aud.play();else aud.pause()});
  aud.addEventListener('play',function(){pp.textContent='❚❚';pp.setAttribute('aria-label','Pausar')});
  aud.addEventListener('pause',function(){pp.textContent='▶';pp.setAttribute('aria-label','Reproducir')});
  aud.addEventListener('timeupdate',tick);
  /* Volver a empezar: la voz a 0 y la página como estaba al abrirla (pestañas en la primera, tarjetas
     sin voltear, arriba del todo). Al terminar, el reproductor se queda y el botón grande también reinicia. */
  var ended=false;
  function restart(){ended=false;pl.classList.remove('fin');clearSpot();reponerFx();
    $$('.voltea.volteada').forEach(function(x){x.classList.remove('volteada')});
    $$('[data-tabs]').forEach(function(bar){var t=$('.tab',bar);if(t)t.click()});
    aud.currentTime=0;curCap=-1;cueKey='';sentKey='';scrollTo({top:0,behavior:reduce?'auto':'smooth'});play()}
  $('#prs').addEventListener('click',restart);
  aud.addEventListener('ended',function(){ended=true;pl.classList.add('fin');clearSpot();pp.textContent='↺';pp.setAttribute('aria-label','Otra vez desde el inicio')});
  pbar.addEventListener('click',function(e){ended=false;pl.classList.remove('fin');var r=pbar.getBoundingClientRect();var d=CAPS.duracion||aud.duration;aud.currentTime=(e.clientX-r.left)/r.width*d;curCap=-1;cueKey='';tick()});
  $('#px').addEventListener('click',function(){aud.pause();pl.classList.remove('on');clearSpot()});
  /* con el audio sonando, tocar el índice o los puntos lleva el audio a esa sección */
  $$('#dots a, .toc a').forEach(function(a){a.addEventListener('click',function(){if(aud.paused||!CAPS)return;var id=a.getAttribute('href').slice(1);var c=CAPS.capitulos.filter(function(x){return x.id===id})[0];if(c){aud.currentTime=c.inicio;curCap=-1;cueKey=''}})});

  /* Para armar.py: cada señalamiento debe encontrar su pieza y cada acción debe existir. Se revisa
     con las pestañas abiertas en orden, igual que como las abre la voz. */
  window.__cuesSinDestino=function(){var out=[];if(!CAPS)return ['sin capitulos'];
    CAPS.capitulos.forEach(function(c){if(!document.getElementById(c.id))out.push('la sección "'+c.id+'" del guion no existe en la página');
      (c.cues||[]).forEach(function(q){if(q[2]&&!actionFn(q[2]))out.push(c.id+': acción desconocida "'+q[2]+'"');
        if(partes(q[2],true))act(partes(q[2],true),null);if(!findEl(q[1],c.id))out.push(c.id+': no hay pieza para "'+q[1]+'"')})});
    return out};
  /* Piezas que se salen por la derecha del teléfono. El scroll no lo delata (body tiene overflow-x:hidden):
     el teléfono aleja la página para que quepa, innerWidth crece y el reproductor queda fuera de la pantalla. */
  function anchas(W){var out=[];W=W||innerWidth;$$('body *').forEach(function(e){var r=e.getBoundingClientRect();if(r.width===0||r.right<=W+1)return;
    for(var p=e.parentElement;p&&p!==document.body;p=p.parentElement){var o=getComputedStyle(p).overflowX;if(o!=='visible')return}
    if(getComputedStyle(e).position==='fixed'||e.closest('#fx'))return;
    out.push([r.width,e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/).join('.'):'')+' ('+Math.round(r.width)+'px de ancho)'])});return out.sort(function(a,b){return b[0]-a[0]}).map(function(x){return x[1]})}
  /* Para chrome.mjs: la lista de señalamientos y si lo iluminado es lo que el guion pide. */
  window.__cues=function(){return CAPS?CAPS.capitulos.map(function(c){return {id:c.id,inicio:c.inicio,cues:c.cues||[]}}):[]};
  window.__spotEs=function(sel,secId){var e=findEl(sel,secId),s=$('.spot');function d(x){return x?(x.tagName.toLowerCase()+(x.id?'#'+x.id:'')+' "'+x.textContent.trim().replace(/\s+/g,' ').slice(0,40)+'"'):'nada'}
    return {ok:!!e&&s===e,spot:d(s),esperado:d(e)}};
  /* Contraste medido, no a ojo: un recuadro blanco con letra blanca en una sección oscura pasó una
     revisión visual. Se mezcla el color del texto con los fondos de sus contenedores hasta uno sólido;
     si en el camino hay una imagen o un degradado, no se puede medir y se salta. Menos de 3:1 no se lee. */
  function rgba(c){var m=c.match(/[\d.]+/g);return m?[+m[0],+m[1],+m[2],m[3]==null?1:+m[3]]:[0,0,0,0]}
  function mix(a,b){var t=a[3];return [a[0]*t+b[0]*(1-t),a[1]*t+b[1]*(1-t),a[2]*t+b[2]*(1-t),1]}
  function lum(c){var f=function(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])}
  function contraste(){var out=[],seen=0;$$('main *, header.hero *').forEach(function(e){
    if(e.closest('.player,#pointer,#lb,#fx')||!e.childNodes.length)return;
    var txt=Array.prototype.some.call(e.childNodes,function(n){return n.nodeType===3&&n.textContent.trim()});if(!txt)return;
    var cs=getComputedStyle(e);if(cs.visibility==='hidden'||+cs.opacity===0||e.getClientRects().length===0)return;
    var fg=rgba(cs.color);if(fg[3]===0)return;
    var layers=[],x=e,ok=true;for(;x;x=x.parentElement){var s=getComputedStyle(x);if(s.backgroundImage&&s.backgroundImage!=='none'){ok=false;break}var b=rgba(s.backgroundColor);if(b[3]>0){layers.push(b);if(b[3]>=1)break}}
    if(!ok)return;var bg=[255,255,255,1];for(var i=layers.length-1;i>=0;i--)bg=mix(layers[i],bg);
    var f=mix(fg,bg),L1=lum(f),L2=lum(bg),r=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);seen++;
    if(r<3)out.push(e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/)[0]:'')+' "'+e.textContent.trim().slice(0,30)+'" '+r.toFixed(2)+':1')});
    return out}
  window.__contraste=contraste;
  window.__estado=function(W){return {ocultos:$$('.js .reveal:not(.in), .js .stagger:not(.in)').length,ancho:innerWidth,scroll:doc.scrollWidth,anchas:anchas(W).slice(0,5),duracion:CAPS?CAPS.duracion:0}};

  /* imagen ampliada */
  var lb=$('#lb'),lbi=$('img',lb);
  $$('img.zoom').forEach(function(im){im.addEventListener('click',function(){lbi.src=im.src;lbi.alt=im.alt;lb.classList.add('on')})});
  lb.addEventListener('click',function(){lb.classList.remove('on')});
  addEventListener('keydown',function(e){if(e.key==='Escape')lb.classList.remove('on')});

  if(pdf){pend.slice().forEach(function(p){p.fn()});pend=[]}
  addEventListener('scroll',queue,{passive:true}); addEventListener('resize',queue); check();
  /* red de seguridad: si el navegador no avisa del scroll (pestaña sin dibujar), revisar cada medio segundo */
  var guard=setInterval(function(){check();if(!pend.length)clearInterval(guard)},500);
})();
