// Amplía las capturas al hacer clic. Con las flechas se pasa a las demás imágenes visibles.
(function(){
  const box=document.getElementById('lightbox');
  if(!box||!box.showModal)return;
  const big=box.querySelector('img'),cap=box.querySelector('figcaption');
  let current=null;
  const visible=()=>[...document.querySelectorAll('.shot img')].filter(i=>i.offsetParent!==null);
  function show(img){
    current=img;
    big.src=img.currentSrc||img.src;
    big.alt=img.alt;
    cap.textContent=img.closest('figure').querySelector('figcaption')?.textContent||img.alt;
  }
  function move(step){
    const list=visible(),i=list.indexOf(current);
    if(list.length)show(list[(i+step+list.length)%list.length]);
  }
  function open(img){
    show(img);
    box.showModal();
    document.documentElement.style.overflow='hidden';
  }
  document.querySelectorAll('.shot img').forEach(img=>{
    img.tabIndex=0;
    img.setAttribute('role','button');
    img.setAttribute('aria-label','Ampliar imagen: '+img.alt);
    img.addEventListener('click',()=>open(img));
    img.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();open(img);}
    });
  });
  box.querySelector('.lb-close').addEventListener('click',()=>box.close());
  box.querySelector('.lb-prev').addEventListener('click',()=>move(-1));
  box.querySelector('.lb-next').addEventListener('click',()=>move(1));
  box.addEventListener('click',e=>{if(e.target===box||e.target===big)box.close();});
  box.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft')move(-1);
    if(e.key==='ArrowRight')move(1);
  });
  box.addEventListener('close',()=>{
    document.documentElement.style.overflow='';
    big.removeAttribute('src');
    if(current&&current.offsetParent!==null)current.focus({preventScroll:true});
  });
})();
