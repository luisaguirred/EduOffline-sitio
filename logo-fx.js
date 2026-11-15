/* Efectos del logo de la barra superior: cada vez que el cursor entra (o llega con el teclado) se muestra un efecto distinto.
   Sustituye las <img> del logo por el SVG en línea para poder animar sus partes. Ver README.md (Efectos del logo). */
(function(){
  var brand=document.querySelector('.brand'), img=brand&&brand.querySelector('img.logo-l');
  if(!img||!window.fetch||!window.DOMParser)return;
  var NS='http://www.w3.org/2000/svg', root=document.documentElement;
  var mq=window.matchMedia('(prefers-reduced-motion: reduce)');
  function el(n,a){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);return e;}

  // Pasa los colores fijos a clases (para el tema oscuro) y separa los trazos compuestos en piezas animables.
  function prep(svg){
    [['fill','#0e2f6d','lfx-ink-f'],['stroke','#0e2f6d','lfx-ink-s'],['stroke','#3986e9','lfx-blue-s'],['stroke','#fc5e01','lfx-or-s']].forEach(function(r){
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

  function build(svg){
    var vb=svg.getAttribute('viewBox').split(/\s+/).map(Number);
    ['role','aria-label','width','height'].forEach(function(a){svg.removeAttribute(a);});
    svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.setAttribute('class','lfx-svg');
    var t=svg.querySelector('title');if(t)t.remove();
    svg.querySelectorAll('mask').forEach(function(m){var o=m.id;m.id='lfx-'+o;
      svg.querySelectorAll('[mask="url(#'+o+')"]').forEach(function(e){e.setAttribute('mask','url(#'+m.id+')');});});
    prep(svg);
    var g=el('g',{'class':'lfx-content',id:'lfx-c'});
    while(svg.firstChild)g.appendChild(svg.firstChild);
    // Silueta blanca del logo para recortar el destello
    var defs=el('defs',{}), f=el('filter',{id:'lfx-white',x:'0',y:'0',width:'1',height:'1'});
    f.appendChild(el('feColorMatrix',{type:'matrix',values:'0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0'}));
    var mk=el('mask',{id:'lfx-sil',maskUnits:'userSpaceOnUse',x:vb[0],y:vb[1],width:vb[2],height:vb[3]});
    mk.appendChild(el('use',{href:'#lfx-c',filter:'url(#lfx-white)'}));
    var lg=el('linearGradient',{id:'lfx-grad'});
    ['0','.5','1'].forEach(function(o,i){lg.appendChild(el('stop',{offset:o,'class':i===1?'lfx-stop-on':'lfx-stop-off'}));});
    defs.appendChild(f);defs.appendChild(mk);defs.appendChild(lg);
    svg.appendChild(defs);svg.appendChild(g);
    var x0=vb[0]-380,y0=vb[1]-60,y1=vb[1]+vb[3]+60, bg=el('g',{mask:'url(#lfx-sil)'});
    bg.appendChild(el('polygon',{'class':'lfx-beam',fill:'url(#lfx-grad)',points:(x0+130)+','+y0+' '+(x0+300)+','+y0+' '+(x0+170)+','+y1+' '+x0+','+y1}));
    svg.appendChild(bg);
    svg.style.setProperty('--lfx-bd',(vb[2]+520)+'px');
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
  var bag=[], last=null;
  function next(){
    if(!bag.length){
      bag=POOL.slice();
      for(var i=bag.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=bag[i];bag[i]=bag[j];bag[j]=t;}
      if(bag[bag.length-1]===last)bag.unshift(bag.pop()); // no repite el último de la ronda anterior
    }
    return last=bag.pop();
  }

  function dust(svg){
    var cs=getComputedStyle(root), cols=['--lfx-p1','--lfx-p2','--lfx-p3'];
    var bx=brand.getBoundingClientRect(), r=svg.getBoundingClientRect();
    var cx=r.left-bx.left+r.width/2, cy=r.top-bx.top+r.height/2;
    for(var i=0;i<5;i++){
      var p=document.createElement('span');p.className='lfx-particle';
      var ang=Math.random()*Math.PI*2, x=cx+Math.cos(ang)*(r.width/2+4)*(.7+Math.random()*.3), y=cy+Math.sin(ang)*(r.height/2+5)*(.7+Math.random()*.3);
      var c=cs.getPropertyValue(cols[i%3]).trim(), s=2.5+Math.random()*2.5;
      p.style.width=p.style.height=s+'px';p.style.background=c;p.style.boxShadow='0 0 5px '+c;
      brand.appendChild(p);
      var dx=Math.cos(ang)*7, dy=Math.sin(ang)*5-6;
      var a=p.animate([
        {transform:'translate('+x+'px,'+y+'px) scale(.3)',opacity:0},
        {transform:'translate('+(x+dx*.4)+'px,'+(y+dy*.4)+'px) scale(1)',opacity:1,offset:.3},
        {transform:'translate('+(x+dx)+'px,'+(y+dy)+'px) scale(.6)',opacity:0}
      ],{duration:850+Math.random()*300,delay:Math.random()*200,easing:'cubic-bezier(.2,.6,.3,1)',fill:'both'});
      a.onfinish=(function(q){return function(){q.remove();};})(p);
    }
  }

  fetch(img.src).then(function(r){if(!r.ok)throw 0;return r.text();}).then(function(txt){
    var doc=new DOMParser().parseFromString(txt,'image/svg+xml'), src=doc.documentElement;
    if(src.nodeName!=='svg')return;
    var svg=build(document.importNode(src,true));
    brand.querySelectorAll('img').forEach(function(i){i.remove();});
    brand.appendChild(svg);
    brand.classList.add('lfx');
    function play(){
      ALL.forEach(function(c){brand.classList.remove(c);});
      var e=mq.matches?'lfx-glow':next(); // con movimiento reducido solo cambia la luz
      e.split(' ').forEach(function(c){brand.classList.add(c);});
      if(e==='lfx-dust')dust(svg);
    }
    brand.addEventListener('pointerenter',function(e){if(e.pointerType!=='touch')play();});
    brand.addEventListener('focus',function(){if(brand.matches(':focus-visible'))play();});
  }).catch(function(){});
})();
