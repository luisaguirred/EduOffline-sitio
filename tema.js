// Aplica el tema guardado antes de pintar la página (evita el parpadeo).
// Va en un archivo aparte porque la política de seguridad (CSP) no permite scripts en línea.
try{var t=localStorage.getItem('eduoffline_sitio_tema');if(t)document.documentElement.dataset.theme=t;}catch(e){}
