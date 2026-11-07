// Cada función de las listas se despliega con un clic y se oculta con otro.
(function(){
  let n=0;
  document.querySelectorAll('li[data-info]').forEach(li=>{
    const id='info-'+(++n);
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='info-toggle';
    btn.setAttribute('aria-expanded','false');
    btn.setAttribute('aria-controls',id);
    btn.textContent=li.textContent;
    const panel=document.createElement('p');
    panel.className='info-panel';
    panel.id=id;
    panel.hidden=true;
    panel.textContent=li.dataset.info;
    btn.addEventListener('click',()=>{
      const open=btn.getAttribute('aria-expanded')!=='true';
      btn.setAttribute('aria-expanded',String(open));
      panel.hidden=!open;
    });
    li.textContent='';
    li.classList.add('has-info');
    li.append(btn,panel);
  });
})();
