import { USUARIOS, type Usuario } from "../data/permissoes";

export const USUARIO_DEFAULT_ID = "augusto";

export function getUsuarioServerSide(): Usuario {
  return USUARIOS[USUARIO_DEFAULT_ID];
}

export function clientScriptVerComo(): string {
  return `
    (function(){
      const KEY = 'qg_user_view';
      const select = document.querySelector('[data-qg-userselect]');
      const root   = document.documentElement;

      function visiveisDe(uid){
        const u = window.QG_USUARIOS && window.QG_USUARIOS[uid];
        if(!u) return ['*'];
        return u.projetosVisiveis;
      }

      function aplicar(uid){
        if(!uid) uid = '${USUARIO_DEFAULT_ID}';
        root.dataset.qgUser = uid;
        const visiveis = visiveisDe(uid);
        const podeTudo = visiveis.indexOf('*') >= 0;
        document.querySelectorAll('[data-projeto]').forEach(el => {
          const raw = el.getAttribute('data-projeto') || '';
          if (!raw) { el.toggleAttribute('hidden', false); return; }
          const ids = raw.split(',').map(s => s.trim()).filter(Boolean);
          const visivel = podeTudo || ids.some(id => visiveis.indexOf(id) >= 0);
          el.toggleAttribute('hidden', !visivel);
        });
        document.querySelectorAll('[data-papel-min]').forEach(el => {
          const min = el.getAttribute('data-papel-min');
          const u = window.QG_USUARIOS && window.QG_USUARIOS[uid];
          const papel = u ? u.papel : 'admin';
          const ordem = ['cliente','executor','diretor','socio','admin'];
          const ok = ordem.indexOf(papel) >= ordem.indexOf(min);
          el.toggleAttribute('hidden', !ok);
        });
        document.querySelectorAll('[data-visibilidade]').forEach(el => {
          const lista = (el.getAttribute('data-visibilidade')||'').split(',').filter(Boolean);
          el.toggleAttribute('hidden', lista.length>0 && lista.indexOf(uid)<0);
        });
        const u2 = window.QG_USUARIOS && window.QG_USUARIOS[uid];
        const isCliente = u2 && u2.papel === 'cliente';
        const path = location.pathname.replace(/\\/$/, '');
        const inCliente = path.indexOf('/escritorio/cliente/') === 0;
        if (isCliente && !inCliente && (path === '/escritorio' || path.indexOf('/escritorio/') === 0)) {
          location.href = '/escritorio/cliente/' + uid;
          return;
        }
      }

      const saved = localStorage.getItem(KEY) || '${USUARIO_DEFAULT_ID}';
      if(select){
        select.value = saved;
        select.addEventListener('change', () => {
          localStorage.setItem(KEY, select.value);
          aplicar(select.value);
        });
      }
      aplicar(saved);
    })();
  `;
}
