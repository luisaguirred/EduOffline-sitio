/* Efectos del logo: en la barra superior (.brand) y en el logo grande de la portada (.wordmark), cada vez que el cursor
   entra (o se llega con el teclado) se muestra un efecto distinto. Sustituye las <img> del logo por el SVG en línea para
   poder animar sus partes. Ver README.md (Efectos del logo). */
(function(){
  if(!window.fetch||!window.DOMParser)return;
  var NS='http://www.w3.org/2000/svg', root=document.documentElement, uid=0;
  var mq=window.matchMedia('(prefers-reduced-motion: reduce)');
  function el(n,a){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);return e;}

  // Colores fijos del SVG claro → clases (el tema oscuro cambia las variables --lfx-*)
  var COLORS=[['fill','#0e2f6d','lfx-ink-f'],['stroke','#0e2f6d','lfx-ink-s'],['stroke','#3986e9','lfx-blue-s'],['fill','#3986e9','lfx-blue-f'],
    ['stroke','#fc5e01','lfx-or-s'],['stroke','#3f3f3f','lfx-g1-s'],['fill','#3f3f3f','lfx-g1-f'],['fill','#c1c1c1','lfx-g2-f'],
    ['stroke','#555b66','lfx-g3-s'],['fill','#555b66','lfx-g3-f']];

  // Separa los trazos compuestos en piezas animables.
  function prep(svg){
    COLORS.forEach(function(r){
      svg.querySelectorAll('['+r[0]+'="'+r[1]+'"]').forEach(function(e){e.removeAttribute(r[0]);e.classList.add(r[2]);});
    });
    function split(start,cls,dash){
      svg.querySelectorAll('path').forEach(function(p){
        var d=p.getAttribute('d');if(d.indexOf(start)!==0)return;
        d.split(/(?=M)/).forEach(function(s,i){var q=p.cloneNode();q.setAttribute('d',s);q.classList.add(cls,cls+(i+1));
          if(dash)q.setAttribute('pathLength','1');p.parentNode.insertBefore(q,p);});
        p.remove();
      });
    }
    split('M168.79','lfx-w',true);   // arcos Wi-Fi: lfx-w1 (grande) a lfx-w3 (chico)
    svg.querySelectorAll('circle[r="2.8"]').forEach(function(c){c.classList.add('lfx-w','lfx-w0');});
    split('M85.5','lfx-c',true);     // palomitas
    split('M107.5','lfx-l',false);   // renglones
    svg.querySelectorAll('path.lfx-or-s').forEach(function(p){p.classList.add('lfx-slash');p.setAttribute('pathLength','1');});
  }

  function build(svg,label){
    var id='lfx'+(++uid), vb=svg.getAttribute('viewBox').split(/\s+/).map(Number);
    ['role','aria-label','width','height'].forEach(function(a){svg.removeAttribute(a);});
    if(label){svg.setAttribute('role','img');svg.setAttribute('aria-label',label);}else svg.setAttribute('aria-hidden','true');
    svg.setAttribute('focusable','false');svg.setAttribute('class','lfx-svg');
    var t=svg.querySelector('title');if(t)t.remove();
    svg.querySelectorAll('mask').forEach(function(m){var o=m.id;m.id=id+'-'+o;
      svg.querySelectorAll('[mask="url(#'+o+')"]').forEach(function(e){e.setAttribute('mask','url(#'+m.id+')');});});
    prep(svg);
    var g=el('g',{'class':'lfx-content',id:id+'-c'});
    while(svg.firstChild)g.appendChild(svg.firstChild);
    // Silueta blanca del logo para recortar el destello
    var defs=el('defs',{}), f=el('filter',{id:id+'-w',x:'0',y:'0',width:'1',height:'1'});
    f.appendChild(el('feColorMatrix',{type:'matrix',values:'0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0'}));
    var mk=el('mask',{id:id+'-s',maskUnits:'userSpaceOnUse',x:vb[0],y:vb[1],width:vb[2],height:vb[3]});
    mk.appendChild(el('use',{href:'#'+id+'-c',filter:'url(#'+id+'-w)'}));
    var lg=el('linearGradient',{id:id+'-g'});
    ['0','.5','1'].forEach(function(o,i){lg.appendChild(el('stop',{offset:o,'class':i===1?'lfx-stop-on':'lfx-stop-off'}));});
    defs.appendChild(f);defs.appendChild(mk);defs.appendChild(lg);
    svg.appendChild(defs);svg.appendChild(g);
    var bw=vb[2]*.13, x0=vb[0]-bw*2.2, y0=vb[1]-60, y1=vb[1]+vb[3]+60, sk=bw*.75, bg=el('g',{mask:'url(#'+id+'-s)'});
    bg.appendChild(el('polygon',{'class':'lfx-beam',fill:'url(#'+id+'-g)',points:(x0+sk)+','+y0+' '+(x0+sk+bw)+','+y0+' '+(x0+bw)+','+y1+' '+x0+','+y1}));
    svg.appendChild(bg);
    svg.style.setProperty('--lfx-bd',(vb[2]+bw*3.4)+'px');
    // Copia de contornos para el trazado luminoso
    var tr=g.cloneNode(true);tr.removeAttribute('id');tr.setAttribute('class','lfx-trace');
    tr.querySelectorAll('mask').forEach(function(m){m.remove();});
    tr.querySelectorAll('[mask]').forEach(function(e){e.removeAttribute('mask');});
    tr.querySelectorAll('path,rect,circle').forEach(function(e){e.setAttribute('pathLength','1');});
    svg.appendChild(tr);
    return svg;
  }

  var POOL=['lfx-glow','lfx-lift','lfx-shine','lfx-dust','lfx-trace-on','lfx-wave','lfx-wifi','lfx-check','lfx-marker','lfx-lift lfx-glow lfx-shine','lfx-glow lfx-shine'];
  var ALL=['lfx-glow','lfx-lift','lfx-shine','lfx-dust','lfx-trace-on','lfx-wave','lfx-wifi','lfx-check','lfx-marker'];

  function dust(box,svg,n){
    var cs=getComputedStyle(root), cols=['--lfx-p1','--lfx-p2','--lfx-p3'], k=n>6?2.2:1;
    var bx=box.getBoundingClientRect(), r=svg.getBoundingClientRect();
    var cx=r.left-bx.left+r.width/2, cy=r.top-bx.top+r.height/2;
    for(var i=0;i<n;i++){
      var p=document.createElement('span');p.className='lfx-particle';
      var ang=Math.random()*Math.PI*2, x=cx+Math.cos(ang)*(r.width/2+4*k)*(.7+Math.random()*.3), y=cy+Math.sin(ang)*(r.height/2+5*k)*(.7+Math.random()*.3);
      var c=cs.getPropertyValue(cols[i%3]).trim(), s=(2.5+Math.random()*2.5)*(k>1?1.4:1);
      p.style.width=p.style.height=s+'px';p.style.background=c;p.style.boxShadow='0 0 '+(5*k)+'px '+c;
      box.appendChild(p);
      var dx=Math.cos(ang)*7*k, dy=Math.sin(ang)*5*k-6*k;
      var a=p.animate([
        {transform:'translate('+x+'px,'+y+'px) scale(.3)',opacity:0},
        {transform:'translate('+(x+dx*.4)+'px,'+(y+dy*.4)+'px) scale(1)',opacity:1,offset:.3},
        {transform:'translate('+(x+dx)+'px,'+(y+dy)+'px) scale(.6)',opacity:0}
      ],{duration:850+Math.random()*300,delay:Math.random()*220,easing:'cubic-bezier(.2,.6,.3,1)',fill:'both'});
      a.onfinish=(function(q){return function(){q.remove();};})(p);
    }
  }

  // host: elemento que contiene las <img>; box: elemento que recibe el cursor y las clases de efecto
  function setup(host,opt){
    var img=host&&host.querySelector('img.logo-l');if(!img)return;
    fetch(img.src).then(function(r){if(!r.ok)throw 0;return r.text();}).then(function(txt){
      var src=new DOMParser().parseFromString(txt,'image/svg+xml').documentElement;
      if(src.nodeName!=='svg')return;
      var svg=build(document.importNode(src,true),opt.label?img.alt:'');
      var box=host;
      if(opt.wrap){box=document.createElement('span');box.className='lfx-box';host.appendChild(box);}
      host.querySelectorAll('img').forEach(function(i){i.remove();});
      box.appendChild(svg);
      box.classList.add('lfx');
      var bag=[],last=null;
      function next(){
        if(!bag.length){
          bag=POOL.slice();
          for(var i=bag.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=bag[i];bag[i]=bag[j];bag[j]=t;}
          if(bag[bag.length-1]===last)bag.unshift(bag.pop()); // no repite el último de la ronda anterior
        }
        return last=bag.pop();
      }
      // .lfx-on enciende el efecto: con mouse mientras está encima, con teclado mientras tiene el foco,
      // y en pantallas táctiles durante un momento al tocarlo.
      var timer=0, lastType='mouse';
      function play(){
        clearTimeout(timer);
        box.classList.remove('lfx-on');
        ALL.forEach(function(c){box.classList.remove(c);});
        var e=mq.matches?'lfx-glow':next(); // con movimiento reducido solo cambia la luz
        e.split(' ').forEach(function(c){box.classList.add(c);});
        void box.offsetWidth; // reinicia las animaciones si se vuelve a tocar
        box.classList.add('lfx-on');
        if(e==='lfx-dust')dust(box,svg,opt.dust);
      }
      function off(){clearTimeout(timer);box.classList.remove('lfx-on');}
      function flash(){play();timer=setTimeout(off,1500);}
      box.addEventListener('pointerdown',function(e){lastType=e.pointerType;});
      box.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')play();});
      box.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse')off();});
      box.addEventListener('click',function(){if(lastType!=='mouse')flash();lastType='mouse';});
      box.addEventListener('focus',function(){if(box.matches(':focus-visible'))play();});
      box.addEventListener('blur',off);
      // En el celular, el logo grande muestra un efecto la primera vez que aparece en pantalla.
      if(opt.intro&&window.matchMedia('(hover: none)').matches&&'IntersectionObserver' in window){
        var io=new IntersectionObserver(function(en){
          if(en[0].isIntersecting){io.disconnect();setTimeout(flash,500);}
        },{threshold:.6});
        io.observe(box);
      }
    }).catch(function(){});
  }

  setup(document.querySelector('.brand'),{dust:5});
  setup(document.querySelector('.wordmark'),{dust:12,wrap:true,label:true,intro:true});
})();
