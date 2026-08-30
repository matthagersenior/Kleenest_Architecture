const ROUTE_PREVIEW_VALUE='active';

function syncRoutePreviewMode(){
  if(typeof document==='undefined'||typeof window==='undefined')return;
  const params=new URLSearchParams(window.location.search);
  const active=params.get('routePreview')===ROUTE_PREVIEW_VALUE;
  if(active)document.documentElement.setAttribute('data-kleenest-route-preview','active');
  else document.documentElement.removeAttribute('data-kleenest-route-preview');
}

function pulseMapLayout(){
  if(typeof window==='undefined')return;
  [0,120,360,900,1600].forEach(delay=>window.setTimeout(()=>{
    syncRoutePreviewMode();
    window.dispatchEvent(new Event('resize'));
  },delay));
}

if(typeof window!=='undefined'&&typeof document!=='undefined'){
  const sync=()=>{syncRoutePreviewMode();pulseMapLayout();};
  window.addEventListener('pageshow',sync);
  window.addEventListener('load',sync,{once:true});
  window.addEventListener('popstate',sync);
  window.addEventListener('hashchange',sync);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')pulseMapLayout();});
  const observer=new MutationObserver(syncRoutePreviewMode);
  const startObserver=()=>observer.observe(document.body,{subtree:true,childList:true});
  if(document.body)startObserver();else document.addEventListener('DOMContentLoaded',startObserver,{once:true});
  syncRoutePreviewMode();
}
