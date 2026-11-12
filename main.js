// Efecto de luz entre categorías: la misma función sirve para el menú y las pestañas.
// Lo usan index.html y funciones.html: cada parte se activa solo si su elemento existe en la página.
(function(){
  // Idioma de la página (<html lang>): inglés en la raíz, español en /es/.
  const ES=document.documentElement.lang.startsWith('es');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  function makeLight(root){
    const items=[...root.querySelectorAll('.light-item')];
    const core=document.createElement('span'),tail=document.createElement('span'),glow=document.createElement('span');
    core.className='light-core';tail.className='light-tail';glow.className='light-glow';
    root.prepend(core,tail,glow);
    let active=items[0],target=active,raf=0,idle=0;

    function place(el){
      const x=el.offsetLeft,y=el.offsetTop,w=el.offsetWidth,h=el.offsetHeight,G=Math.max(150,w*2);
      for(const s of [core,tail]){s.style.width=w+'px';s.style.height=h+'px';s.style.transform=`translate3d(${x}px,${y}px,0)`;}
      glow.style.width=G+'px';glow.style.height=G*.62+'px';
      glow.style.transform=`translate3d(${x+w/2-G/2}px,${y+h/2-G*.31}px,0)`;
    }
    // Cada texto se enciende según qué tan cerca le pasa la luz.
    function paint(){
      const c=core.getBoundingClientRect(),cc=c.left+c.width/2;
      for(const it of items){
        const r=it.getBoundingClientRect();
        // Distancia en x (menú en fila) y en y (menú en columna del celular).
      const cy=c.top+c.height/2,dx=(r.left+r.width/2-cc)/Math.max(r.width*.62,1),dy=(r.top+r.height/2-cy)/Math.max(r.height*.9,1);
      const lit=Math.max(0,1-Math.hypot(dx,dy));
        it.style.setProperty('--lit',lit.toFixed(3));
      }
    }
    function run(){
      cancelAnimationFrame(raf);clearTimeout(idle);
      root.classList.add('moving');
      const loop=()=>{paint();raf=requestAnimationFrame(loop);};loop();
      idle=setTimeout(()=>{cancelAnimationFrame(raf);paint();root.classList.remove('moving');},reduce?30:900);
    }
    function moveTo(el){target=el;place(el);run();}
    function setActive(el){active=el;moveTo(el);}

    items.forEach(it=>{
      it.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')moveTo(it);});
      it.addEventListener('focus',()=>moveTo(it));
    });
    root.addEventListener('pointerleave',()=>moveTo(active));
    root.addEventListener('focusout',e=>{if(!root.contains(e.relatedTarget))moveTo(active);});
    const relayout=()=>{place(target);paint();};
    addEventListener('resize',relayout);
    document.fonts?.ready.then(relayout);
    relayout();
    requestAnimationFrame(()=>root.classList.add('ready'));
    return{items,setActive,getActive:()=>active};
  }

  // Menú: sigue a la sección en pantalla.
  const nav=makeLight(document.querySelector('.nav'));
  // Celular: el menú se despliega con el botón y se cierra al elegir una sección.
  const topBar=document.querySelector('.top'),menuBtn=document.querySelector('.menu-btn');
  if(menuBtn){
    const setOpen=o=>{topBar.classList.toggle('open',o);menuBtn.setAttribute('aria-expanded',String(o));menuBtn.setAttribute('aria-label',o?(ES?'Cerrar el menú':'Close menu'):(ES?'Abrir el menú':'Open menu'));
      if(o)requestAnimationFrame(()=>dispatchEvent(new Event('resize')));};
    menuBtn.addEventListener('click',()=>setOpen(!topBar.classList.contains('open')));
    document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
    addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false);});
    document.addEventListener('click',e=>{if(topBar.classList.contains('open')&&!topBar.contains(e.target))setOpen(false);});
  }
  // Íconos del efecto principal en celular (sin mouse): el primer toque muestra su
  // información con "Ver más"; tocar el mismo ícono otra vez abre su sección.
  const fcInfo=document.getElementById('fc-info');
  if(fcInfo){
    const touchMode=()=>matchMedia('(max-width:820px)').matches||matchMedia('(hover:none)').matches;
    document.querySelectorAll('.float-cards .fc').forEach(a=>a.addEventListener('click',e=>{
      if(!touchMode()||a.classList.contains('sel'))return;
      e.preventDefault();
      document.querySelectorAll('.float-cards .fc.sel').forEach(x=>x.classList.remove('sel'));a.classList.add('sel');
      const tip=a.querySelector('.tip');const title=tip.querySelector('strong').textContent;const desc=tip.textContent.slice(title.length);
      fcInfo.innerHTML='';const st=document.createElement('strong');st.textContent=title;const sp=document.createElement('span');sp.textContent=desc;
      const go=document.createElement('a');go.href=a.getAttribute('href');go.textContent=ES?'Ver más →':'Learn more →';
      go.addEventListener('click',()=>{if(a.dataset.tab){const t=document.getElementById(a.dataset.tab);if(t)t.click();}});
      fcInfo.append(st,sp,document.createElement('br'),go);fcInfo.hidden=false;
    }));
  }
  const links=new Map(nav.items.map(a=>[a.getAttribute('href').slice(1),a]));
  const seen=new Map();
  const spy=new IntersectionObserver(es=>{
    es.forEach(e=>seen.set(e.target.id,e.isIntersecting?e.intersectionRatio:0));
    let best=null,max=0;
    seen.forEach((r,id)=>{if(r>max){max=r;best=id;}});
    const a=links.get(best);
    if(a&&a!==nav.getActive()&&!document.querySelector('.nav:hover')){
      nav.setActive(a);
      if(nav.items[0].parentElement.scrollWidth>innerWidth)a.scrollIntoView({block:'nearest',inline:'center'});
    }
  },{rootMargin:'-30% 0px -50% 0px',threshold:[0,.01,.25,.5,.75,1]});
  document.querySelectorAll('[data-spy]').forEach(s=>spy.observe(s));
  nav.items.forEach(a=>a.addEventListener('click',()=>nav.setActive(a)));

  // Pestañas de funciones (solo en la portada).
  const tabsRoot=document.querySelector('[data-tabs]');
  if(tabsRoot){
  const tabs=makeLight(tabsRoot);
  function select(tab,focus){
    tabs.items.forEach(t=>{
      const on=t===tab;
      t.setAttribute('aria-selected',on);
      t.tabIndex=on?0:-1;
      document.getElementById(t.getAttribute('aria-controls')).hidden=!on;
    });
    tabs.setActive(tab);
    if(focus)tab.focus();
  }
  tabs.items.forEach((t,i)=>{
    t.addEventListener('click',()=>select(t));
    t.addEventListener('keydown',e=>{
      const n=tabs.items.length,d={ArrowRight:1,ArrowLeft:-1}[e.key];
      if(d){e.preventDefault();select(tabs.items[(i+d+n)%n],true);}
      else if(e.key==='Home'){e.preventDefault();select(tabs.items[0],true);}
      else if(e.key==='End'){e.preventDefault();select(tabs.items[n-1],true);}
    });
  });
  // Íconos del efecto principal con data-tab: abren esa pestaña al llegar a Funciones.
  document.querySelectorAll('.fc[data-tab]').forEach(a=>a.addEventListener('click',()=>{const t=document.getElementById(a.dataset.tab);if(t)select(t);}));
  }

  // Constelación de saberes: símbolos de varias materias unidos por trazos; las chispas viajan entre ellos.
  const saberes=!document.getElementById('saberes')?{refresh(){}}:(function(){
    const canvas=document.getElementById('saberes'),ctx=canvas.getContext('2d'),hero=canvas.parentElement;
    const LABELS=['π','H₂O','Aa','E=mc²','∑','♪','√x',ES?'¿?':'?!','△',ES?'ñ':'Ω','x²',ES?'ADN':'DNA','∫','1/2','Fe','α','ABC','∞','°C','a²+b²','λ','%','Δ','Na'];
    let W=0,H=0,dpr=1,clear={x:0,y:0,rx:1,ry:1},nodes=[],links=[],sparks=[],pal={},raf=0,onScreen=true,pointer=null;

    function readPalette(){
      const s=getComputedStyle(document.documentElement),v=n=>s.getPropertyValue(n).trim();
      pal={text:v('--fx-text'),line:v('--fx-line'),spark:v('--fx-spark'),tones:[v('--fx-1'),v('--fx-2'),v('--fx-3')]};
    }
    // Se desvanece hacia el centro para que el texto de la portada siempre se lea.
    function maskAt(x,y){
      const dx=(x-clear.x)/clear.rx,dy=(y-clear.y)/clear.ry,e=Math.sqrt(Math.sqrt(dx**4+dy**4));
      const k=Math.min(1,Math.max(0,(e-1)/.3));
      return k*k*(3-2*k);
    }
    function build(){
      const r=hero.getBoundingClientRect();
      W=r.width;H=r.height;dpr=Math.min(devicePixelRatio||1,2);
      canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
      const t=hero.querySelector('.hero-in').getBoundingClientRect();
      clear={x:t.left-r.left+t.width/2,y:t.top-r.top+t.height/2,rx:t.width/2+40,ry:t.height/2+24};
      const cell=Math.max(120,Math.sqrt(W*H/30)),cols=Math.ceil(W/cell),rows=Math.ceil(H/cell);
      nodes=[];
      for(let c=0,i=0;c<cols;c++)for(let f=0;f<rows;f++,i++){
        const x0=(c+.2+Math.random()*.6)*W/cols,y0=(f+.2+Math.random()*.6)*H/rows;
        const size=24+Math.random()*16,label=LABELS[i%LABELS.length];
        ctx.font=`600 ${size}px Caveat,cursive`;
        nodes.push({x0,y0,x:x0,y:y0,size,label,r:Math.max(16,ctx.measureText(label).width/2+7),
          tone:pal.tones[i%3],phase:Math.random()*6.28,speed:.00018+Math.random()*.00022,amp:7+Math.random()*9,hover:0,flash:0,next:[]});
      }
      // Cada símbolo se une a sus tres vecinos más cercanos.
      links=[];const seen=new Set();
      nodes.forEach((a,i)=>{
        nodes.map((b,j)=>({j,d:Math.hypot(a.x0-b.x0,a.y0-b.y0)})).filter(o=>o.j!==i).sort((p,q)=>p.d-q.d).slice(0,3).forEach(({j})=>{
          const key=Math.min(i,j)+'-'+Math.max(i,j);
          if(seen.has(key))return;
          seen.add(key);
          const l={a,b:nodes[j],bow:(Math.random()-.5)*.22};
          links.push(l);a.next.push(l);nodes[j].next.push(l);
        });
      });
      sparks=[];
      for(let i=0;i<(W<820?2:4)&&links.length;i++)sparks.push(newSpark(nodes[Math.floor(Math.random()*nodes.length)]));
    }
    function newSpark(from,skip){
      const options=from.next.filter(l=>l!==skip),l=options.length?options[Math.floor(Math.random()*options.length)]:from.next[0];
      return{l,from,to:l.a===from?l.b:l.a,p:0,speed:.0035+Math.random()*.003};
    }
    // Curva del trazo, recortada para que no pise los símbolos.
    function curve(l){
      const{a,b}=l,d=Math.hypot(b.x-a.x,b.y-a.y)||1,ux=(b.x-a.x)/d,uy=(b.y-a.y)/d;
      return{x1:a.x+ux*a.r,y1:a.y+uy*a.r,x2:b.x-ux*b.r,y2:b.y-uy*b.r,cx:(a.x+b.x)/2-uy*d*l.bow,cy:(a.y+b.y)/2+ux*d*l.bow};
    }
    function draw(t,animate){
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,W,H);
      for(const n of nodes){
        n.x=n.x0+Math.sin(t*n.speed+n.phase)*n.amp;
        n.y=n.y0+Math.cos(t*n.speed*.8+n.phase)*n.amp;
        let near=0;
        if(pointer){
          const dx=n.x-pointer.x,dy=n.y-pointer.y,d=Math.hypot(dx,dy)||1;
          near=Math.max(0,1-d/190);
          n.x+=dx/d*near*16;n.y+=dy/d*near*16;
        }
        n.hover+=(near-n.hover)*.1;
        n.flash*=.965;
        n.mask=maskAt(n.x,n.y);
        n.lit=Math.min(1,n.hover+n.flash);
      }
      ctx.lineCap='round';
      for(const l of links){
        const lit=Math.max(l.a.lit,l.b.lit),c=curve(l);
        ctx.globalAlpha=(.28+lit*.5)*Math.min(l.a.mask,l.b.mask);
        if(ctx.globalAlpha<.01)continue;
        ctx.strokeStyle=lit>.25?l.a.tone:pal.line;
        ctx.lineWidth=1.2+lit;
        ctx.beginPath();ctx.moveTo(c.x1,c.y1);ctx.quadraticCurveTo(c.cx,c.cy,c.x2,c.y2);ctx.stroke();
      }
      ctx.textAlign='center';ctx.textBaseline='middle';
      for(const n of nodes){
        ctx.globalAlpha=(.6+n.lit*.4)*n.mask;
        if(ctx.globalAlpha<.01)continue;
        ctx.fillStyle=n.lit>.2?n.tone:pal.text;
        ctx.font=`${n.lit>.2?700:600} ${n.size*(1+n.lit*.16)}px Caveat,cursive`;
        ctx.fillText(n.label,n.x,n.y);
      }
      if(!animate)return;
      sparks.forEach((s,i)=>{
        s.p+=s.speed;
        if(s.p>=1){s.to.flash=1;sparks[i]=newSpark(s.to,s.l);return;}
        const c=curve(s.l),q=s.from===s.l.a?s.p:1-s.p,m=1-q;
        const x=m*m*c.x1+2*m*q*c.cx+q*q*c.x2,y=m*m*c.y1+2*m*q*c.cy+q*q*c.y2,mask=maskAt(x,y);
        ctx.fillStyle=pal.spark;
        ctx.globalAlpha=.22*mask;ctx.beginPath();ctx.arc(x,y,9,0,6.29);ctx.fill();
        ctx.globalAlpha=mask;ctx.beginPath();ctx.arc(x,y,3,0,6.29);ctx.fill();
      });
      ctx.globalAlpha=1;
    }
    function loop(t){draw(t,true);raf=requestAnimationFrame(loop);}
    function start(){
      cancelAnimationFrame(raf);
      if(reduce)draw(0,false);
      else if(onScreen)raf=requestAnimationFrame(loop);
    }
    function rebuild(){readPalette();build();start();}

    if(!reduce){
      hero.addEventListener('pointermove',e=>{
        if(e.pointerType==='touch')return;
        const r=hero.getBoundingClientRect();
        pointer={x:e.clientX-r.left,y:e.clientY-r.top};
      },{passive:true});
      hero.addEventListener('pointerleave',()=>{pointer=null;});
    }
    // No se dibuja mientras la portada está fuera de pantalla.
    new IntersectionObserver(([e])=>{onScreen=e.isIntersecting;if(onScreen)start();else cancelAnimationFrame(raf);}).observe(hero);
    let lastW=0,lastH=0;
    new ResizeObserver(([e])=>{
      const{width,height}=e.contentRect;
      if(width===lastW&&Math.abs(height-lastH)<80)return;  // la barra del celular cambia poco el alto al desplazarse
      lastW=width;lastH=height;rebuild();
    }).observe(hero);
    document.fonts?.load('600 28px Caveat').then(rebuild,()=>{});
    return{refresh(){readPalette();nodes.forEach((n,i)=>{n.tone=pal.tones[i%3];});if(reduce)draw(0,false);}};
  })();

  // Cambio de idioma: abre la misma página en el otro idioma, en la misma sección.
  document.querySelectorAll('a.lang').forEach(a=>a.addEventListener('click',()=>{if(location.hash)a.hash=location.hash;}));

  // Tema.
  document.querySelector('.theme').addEventListener('click',()=>{
    const r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;
    r.dataset.theme=dark?'light':'dark';
    try{localStorage.setItem('eduoffline_sitio_tema',r.dataset.theme);}catch(e){}
    saberes.refresh();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>saberes.refresh());

  // Regla lateral: avance de la página.
  const mark=document.getElementById('ruler-mark');
  if(mark){
    const onScroll=()=>{const m=document.documentElement.scrollHeight-innerHeight;mark.style.top=(m>0?scrollY/m*100:0)+'%';};
    addEventListener('scroll',onScroll,{passive:true});onScroll();
  }
})();
