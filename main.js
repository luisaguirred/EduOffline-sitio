// Efecto de luz entre categorías: la misma función sirve para el menú y las pestañas.
(function(){
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
        const lit=Math.max(0,1-Math.abs(r.left+r.width/2-cc)/Math.max(r.width*.62,1));
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

  // Pestañas de funciones.
  const tabsRoot=document.querySelector('[data-tabs]'),tabs=makeLight(tabsRoot);
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

  // Tema.
  document.querySelector('.theme').addEventListener('click',()=>{
    const r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;
    r.dataset.theme=dark?'light':'dark';
    try{localStorage.setItem('eduplay_sitio_tema',r.dataset.theme);}catch(e){}
  });

  // Regla lateral: avance de la página.
  const mark=document.getElementById('ruler-mark');
  const onScroll=()=>{const m=document.documentElement.scrollHeight-innerHeight;mark.style.top=(m>0?scrollY/m*100:0)+'%';};
  addEventListener('scroll',onScroll,{passive:true});onScroll();
})();
