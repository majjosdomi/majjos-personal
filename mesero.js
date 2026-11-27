/*
  MAJJOS Mesero | Interfaz práctica con Supabase
  Para el repositorio majjos-personal: sustituye mesero.js por este archivo.
  Requiere el index.html ya publicado, que define `db` (Supabase).
  No incluye impresión, cobros, promociones ni adiciones.
  Usar solo para pruebas hasta completar validaciones y flujo de cocina/caja.
*/
(() => {
  'use strict';
  if (typeof db === 'undefined') {
    console.error('MAJJOS: falta el cliente db de Supabase en index.html');
    return;
  }
  if (document.getElementById('mj-app')) return;

  const style = document.createElement('style');
  style.textContent = `
  #mj-app[hidden],#mj-app [hidden]{display:none!important}
  #mj-app{position:fixed;inset:0;z-index:6000;overflow:auto;overscroll-behavior:contain;
    background:#f7f5f0;color:#222;font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif;
    font-size:15px;-webkit-font-smoothing:antialiased}
  #mj-app *{box-sizing:border-box}
  #mj-app button,#mj-app input,#mj-app textarea{font:inherit}
  #mj-app button{cursor:pointer;touch-action:manipulation}
  #mj-app button:disabled{opacity:.55;cursor:default}
  #mj-app .mj-head{background:#171717;color:#fff;display:flex;align-items:center;
    justify-content:space-between;gap:12px;padding:14px max(18px,env(safe-area-inset-left));min-height:92px}
  #mj-app .mj-logo{font-size:35px;line-height:1;font-weight:1000;letter-spacing:-1.8px;color:#fb7822}
  #mj-app .mj-logo span{color:#efbc14}
  #mj-app .mj-top-right{text-align:right;line-height:1.4;font-size:12px;color:#ffd06e;font-weight:800}
  #mj-app .mj-top-right small{display:block;color:#eee;font-size:10px}
  #mj-app .mj-main{max-width:760px;margin:auto;padding:14px 18px 34px}
  #mj-app h1{font-size:31px;letter-spacing:-1.1px;line-height:1.15;margin:4px 0 20px;color:#202020}
  #mj-app h2{font-size:21px;margin:18px 0 16px;color:#202020}
  #mj-app .mj-eyebrow{font-size:12px;letter-spacing:1.3px;color:#686868;font-weight:800;text-transform:uppercase}
  #mj-app .mj-banner{background:#fff2d4;color:#7b571d;border:1px solid #ecd089;
    border-radius:12px;padding:11px 13px;font-size:12px;line-height:1.45;margin-bottom:18px}
  #mj-app .mj-title-row{display:flex;justify-content:space-between;align-items:center;gap:10px}
  #mj-app .mj-pill{background:#f0ebe3;padding:10px 13px;border-radius:26px;font-size:14px;font-weight:800;white-space:nowrap}
  #mj-app .mj-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
  #mj-app .mj-table{width:100%;min-height:170px;padding:22px 18px;background:#fff;border:1px solid #e9e1d7;
    color:#202020;border-radius:23px;box-shadow:0 2px 7px #0000000b;text-align:left;margin:0}
  #mj-app .mj-table:focus-visible,#mj-app button:focus-visible{outline:3px solid #eb8c2e;outline-offset:2px}
  #mj-app .mj-table-top{display:flex;align-items:center;justify-content:space-between;gap:5px}
  #mj-app .mj-table-name{font-size:23px;font-weight:850;letter-spacing:-.5px}
  #mj-app .mj-table-icon{font-size:26px;opacity:.48}
  #mj-app .mj-state{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:16px;font-weight:750;color:#14814f}
  #mj-app .mj-state.mj-busy{color:#b56814}
  #mj-app .mj-dot{display:inline-block;height:14px;width:14px;background:currentColor;border-radius:50%}
  #mj-app .mj-shortcuts{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:22px 0 28px}
  #mj-app .mj-shortcut{border:0;border-radius:23px;min-height:116px;text-align:left;padding:19px 20px;
    background:#232323;color:#fff;font-size:19px;font-weight:850;line-height:1.3;margin:0}
  #mj-app .mj-shortcut.mj-delivery{background:#f4ae00;color:#181818}
  #mj-app .mj-shortcut .mj-emoji{display:block;font-size:29px;margin-bottom:7px}
  #mj-app .mj-open-list{display:grid;gap:10px;margin-bottom:24px}
  #mj-app .mj-open-item{background:#fff;color:#252525;border:1px solid #e8dfd5;border-radius:15px;
    padding:15px;text-align:left;width:100%;margin:0;display:flex;align-items:center;justify-content:space-between;gap:8px}
  #mj-app .mj-open-item strong{font-size:15px}
  #mj-app .mj-open-item small{display:block;color:#777;margin-top:5px}
  #mj-app .mj-muted{color:#777;line-height:1.55;font-size:14px}
  #mj-app .mj-actions{display:flex;gap:8px;align-items:center;margin:15px 0}
  #mj-app .mj-ghost{background:#eee8df;color:#272727;border:0;border-radius:12px;
    min-height:44px;padding:10px 15px;font-weight:750;margin:0;width:auto}
  #mj-app .mj-logout{background:#303030;color:#fff;border:1px solid #4e4e4e;
    border-radius:9px;padding:8px 11px;font-size:12px;margin-top:6px;width:auto}
  #mj-app .mj-card{background:#fff;border-radius:18px;border:1px solid #e9e1d6;padding:15px;
    box-shadow:0 2px 6px #0000000a;margin:12px 0}
  #mj-app .mj-search,#mj-app .mj-field{background:#fff;color:#171717;border:1px solid #d8ccbd;border-radius:11px;
    width:100%;padding:14px 13px;font-size:16px;min-height:48px}
  #mj-app label{display:block;margin:10px 0 6px;font-size:13px;font-weight:800;color:#585048}
  #mj-app .mj-fields{display:grid;grid-template-columns:1fr;gap:7px}
  #mj-app .mj-cats{display:flex;gap:8px;overflow-x:auto;padding:12px 0 15px;scrollbar-width:thin}
  #mj-app .mj-cat{border:1px solid #e2d6c8;background:#fff;color:#222;border-radius:22px;
    font-size:13px;font-weight:800;white-space:nowrap;min-height:42px;padding:9px 13px;flex-shrink:0;margin:0;width:auto}
  #mj-app .mj-cat.mj-active{background:#202020;color:#fff;border-color:#202020}
  #mj-app .mj-product{display:flex;align-items:center;gap:12px;border-top:1px solid #eee5db;min-height:81px;padding:12px 0}
  #mj-app .mj-product strong{display:block;font-size:15px;color:#202020}
  #mj-app .mj-product small{display:block;color:#8c632c;font-size:13px;margin-top:6px}
  #mj-app .mj-plus{width:48px;height:48px;background:#ff8618;color:#111;border:0;border-radius:13px;
    font-size:29px;font-weight:850;padding:0;margin:0 0 0 auto;flex-shrink:0}
  #mj-app .mj-status{font-size:13px;color:#795820;line-height:1.45;margin:9px 0}
  #mj-app .mj-bottom{position:fixed;bottom:0;left:0;right:0;z-index:20;padding:10px 13px max(10px,env(safe-area-inset-bottom));
    background:#fff;box-shadow:0 -3px 15px #00000017}
  #mj-app .mj-bottom button{display:flex;justify-content:space-between;align-items:center;gap:10px;
    background:#ff850e;color:#171717;border:0;border-radius:13px;font-size:16px;font-weight:850;
    padding:16px 14px;width:100%;max-width:740px;margin:auto}
  #mj-app .mj-count{background:#252525;color:#fff;border-radius:7px;min-width:31px;padding:4px 8px;font-size:13px}
  #mj-app #mj-order-view{min-height:100%;display:flex;flex-direction:column}
  #mj-app #mj-order-content{flex:1;padding-bottom:105px}
  #mj-app .mj-modal{position:fixed;inset:0;z-index:50;background:#0009;display:flex;
    justify-content:center;align-items:flex-end}
  #mj-app .mj-sheet{width:100%;max-width:650px;max-height:92dvh;overflow-y:auto;background:#fff;
    color:#222;border-radius:22px 22px 0 0;padding:19px 17px max(22px,env(safe-area-inset-bottom));}
  #mj-app .mj-sheet-title{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;border-bottom:1px solid #eee5da;
    padding-bottom:12px;margin-bottom:16px}
  #mj-app .mj-sheet-title h2{font-size:21px;margin:0}
  #mj-app .mj-opt-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:14px 0}
  #mj-app .mj-option{border:1px solid #d9cfc3;background:#f7f3ee;color:#222;border-radius:12px;
    text-align:left;font-weight:800;min-height:89px;padding:15px 12px;margin:0}
  #mj-app .mj-option.mj-picked{border:2px solid #ed8c1c;background:#fff0d9}
  #mj-app .mj-option small{display:block;margin-top:12px;color:#946529}
  #mj-app .mj-quantity{display:flex;align-items:center;gap:13px;margin-top:9px}
  #mj-app .mj-quantity button,#mj-app .mj-line-button{background:#f1ebe3;color:#1f1f1f;border:1px solid #dcd0c0;
    border-radius:9px;min-width:43px;height:43px;font-size:24px;font-weight:800;padding:0;margin:0;width:auto}
  #mj-app .mj-quantity b{min-width:22px;text-align:center}
  #mj-app textarea.mj-field{resize:vertical;min-height:68px}
  #mj-app .mj-modal-actions{display:flex;gap:9px;margin-top:20px}
  #mj-app .mj-modal-actions button{width:100%;min-height:50px;border-radius:11px;
    padding:10px;border:1px solid #ddd3c6;font-weight:850;background:#fff;color:#222;margin:0}
  #mj-app .mj-modal-actions button.mj-primary{background:#ff850e;color:#171717;border-color:#ff850e;flex:1.5}
  #mj-app .mj-cart-row{border-bottom:1px solid #eee5dc;padding:12px 0;line-height:1.5}
  #mj-app .mj-cart-row strong{display:block;font-size:14px}
  #mj-app .mj-cart-row small{display:block;color:#777;margin-top:3px}
  #mj-app .mj-cart-control{display:flex;gap:8px;justify-content:flex-end;align-items:center;margin-top:8px}
  #mj-app .mj-cart-control span{min-width:20px;text-align:center}
  #mj-app .mj-cart-heading{font-size:12px;font-weight:900;color:#8b673d;margin:18px 0 4px}
  #mj-app .mj-total-line{display:flex;justify-content:space-between;gap:8px;align-items:center;
    padding:12px 0;border-top:1px solid #eee5db;font-size:16px;font-weight:800}
  #mj-app #mj-toast{position:fixed;bottom:100px;left:50%;transform:translateX(-50%);z-index:99;
    background:#1c1c1c;color:#fff;padding:11px 16px;border-radius:12px;font-size:13px;
    box-shadow:0 5px 16px #0003;max-width:90vw;text-align:center}
  @media(min-width:550px){#mj-app .mj-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
    #mj-app .mj-table{min-height:146px}#mj-app .mj-fields{grid-template-columns:1fr 1fr}}
  `;
  document.head.appendChild(style);

  const app = document.createElement('div');
  app.id = 'mj-app';
  app.hidden = true;
  app.innerHTML = `
    <header class="mj-head">
      <div class="mj-logo">ma<span>jj</span>os</div>
      <div class="mj-top-right">COMANDAS · MESERO<small>VERSIÓN DE PRUEBA</small>
        <button type="button" class="mj-logout" id="mj-logout">Cerrar sesión</button>
      </div>
    </header>
    <section id="mj-home-view">
      <main class="mj-main">
        <div class="mj-banner">Versión de prueba conectada con Supabase. No imprime ni cobra. Promociones y adiciones pendientes: no utilizar para ventas reales.</div>
        <div class="mj-title-row"><div><div class="mj-eyebrow">SISTEMA INTERNO</div><h1>Mesas y pedidos</h1></div>
          <span class="mj-pill">7 mesas</span></div>
        <h2>Salón</h2><div class="mj-grid" id="mj-tables"></div>
        <div class="mj-shortcuts">
          <button type="button" id="mj-pickup" class="mj-shortcut"><span class="mj-emoji">🛍️</span>Nuevo para llevar</button>
          <button type="button" id="mj-delivery" class="mj-shortcut mj-delivery"><span class="mj-emoji">🛵</span>Nuevo domicilio</button>
        </div>
        <h2>Pedidos para llevar y domicilios abiertos</h2><div id="mj-other-orders" class="mj-open-list"></div>
        <p class="mj-status" id="mj-home-status" role="status"></p>
        <div class="mj-actions"><button type="button" class="mj-ghost" id="mj-refresh">⟳ Actualizar mesas</button></div>
      </main>
    </section>
    <section id="mj-order-view" hidden>
      <div id="mj-order-content" class="mj-main">
        <div class="mj-actions"><button type="button" class="mj-ghost" id="mj-back">← Volver a mesas</button></div>
        <div class="mj-title-row"><div><div class="mj-eyebrow">TOMAR PEDIDO</div><h1 id="mj-order-title">Pedido</h1></div></div>
        <div id="mj-customer" class="mj-card" hidden>
          <h2>Datos del cliente</h2>
          <label for="mj-name">Nombre</label><input id="mj-name" class="mj-field" maxlength="100" placeholder="Nombre del cliente">
          <div class="mj-fields" id="mj-delivery-fields" hidden>
            <div><label for="mj-phone">Teléfono</label><input id="mj-phone" class="mj-field" type="tel" maxlength="30" placeholder="Celular"></div>
            <div><label for="mj-fee">Costo del domicilio ($)</label><input id="mj-fee" class="mj-field" type="number" min="0" max="1000000" step="100" value="0"></div>
            <div><label for="mj-address">Dirección</label><input id="mj-address" class="mj-field" maxlength="250" placeholder="Dirección de entrega"></div>
          </div>
          <p class="mj-muted" id="mj-customer-hint"></p>
        </div>
        <div class="mj-card">
          <input class="mj-search" id="mj-search" type="search" placeholder="🔎 Buscar hamburguesa, bebida..." aria-label="Buscar producto">
          <div class="mj-cats" id="mj-cats"></div><div id="mj-products"></div>
          <p class="mj-status" id="mj-order-status" role="status"></p>
        </div>
      </div>
      <div class="mj-bottom"><button type="button" id="mj-open-cart"><span class="mj-count" id="mj-count">0</span><span>Ver pedido</span><span id="mj-total">$ 0</span></button></div>
    </section>
    <div class="mj-modal" id="mj-config" hidden>
      <div class="mj-sheet" role="dialog" aria-modal="true" aria-label="Personalizar producto">
        <div class="mj-sheet-title"><h2 id="mj-config-title">Producto</h2><button type="button" class="mj-ghost" id="mj-config-close">✕</button></div>
        <div id="mj-options"></div>
        <label for="mj-note">Observaciones para este producto</label>
        <textarea id="mj-note" class="mj-field" maxlength="400" placeholder="Ejemplo: sin cebolla"></textarea>
        <p class="mj-muted">Las adiciones y promociones se configurarán después.</p>
        <div class="mj-title-row"><div><label>Cantidad</label><div class="mj-quantity">
          <button type="button" id="mj-minus">−</button><b id="mj-quantity">1</b><button type="button" id="mj-plus">+</button>
        </div></div><div><label>Total</label><strong id="mj-config-total"></strong></div></div>
        <div class="mj-modal-actions"><button type="button" id="mj-config-cancel">Cancelar</button>
          <button type="button" id="mj-add" class="mj-primary">Agregar</button></div>
      </div>
    </div>
    <div class="mj-modal" id="mj-cart" hidden>
      <div class="mj-sheet" role="dialog" aria-modal="true" aria-label="Ver pedido">
        <div class="mj-sheet-title"><h2>Pedido actual</h2><button type="button" class="mj-ghost" id="mj-cart-close">✕</button></div>
        <div id="mj-saved"></div><div id="mj-draft"></div><div id="mj-cart-summary"></div>
        <p class="mj-status" id="mj-save-status" role="status"></p>
        <div class="mj-modal-actions"><button type="button" id="mj-continue">Seguir agregando</button>
          <button type="button" class="mj-primary" id="mj-save">Guardar productos</button></div>
      </div>
    </div>
    <div id="mj-toast" hidden role="status"></div>
  `;
  document.body.appendChild(app);

  const $ = id => document.getElementById(id);
  const make = (tag, className, content) => {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (content !== undefined) n.textContent = String(content);
    return n;
  };
  const cop = n => '$ ' + new Intl.NumberFormat('es-CO', {maximumFractionDigits: 0}).format(Number(n) || 0);
  const moneyNum = n => Number(n) || 0;
  const isBurger = name => String(name).match(/^(.*?)\s*[-–]\s*(Solo|Con papas)$/i);

  let active = false;
  let serial = 0;
  let busy = false;
  let current = null; // {tipo,mesa_id,id,customer}
  let products = [];
  let categories = [];
  let saved = [];
  let draft = [];
  let catId = '';
  let group = null;
  let option = null;
  let quantity = 1;
  let toastTimeout;

  function toast(message) {
    $('mj-toast').textContent = message;
    $('mj-toast').hidden = false;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { $('mj-toast').hidden = true; }, 3000);
  }
  const qtyDraft = () => draft.reduce((n, i) => n + i.quantity, 0);
  const totalDraft = () => draft.reduce((n, i) => n + moneyNum(i.product.price) * i.quantity, 0);
  const totalSaved = () => saved.reduce((n, i) => n + moneyNum(i.precio_unitario) * i.cantidad, 0);
  const fee = () => current?.tipo === 'domicilio' ? Math.max(0, Number($('mj-fee').value) || 0) : 0;
  function updateCount() {
    $('mj-count').textContent = qtyDraft();
    $('mj-total').textContent = cop(totalDraft() + totalSaved() + fee());
    $('mj-save').disabled = busy || !draft.length;
  }
  function titleFor(c) {
    if (!c) return '';
    return c.tipo === 'mesa' ? 'Mesa ' + String(c.mesa_id).padStart(2,'0') :
      c.tipo === 'para_llevar' ? 'Para llevar' : 'Domicilio';
  }
  function setHome(){
    $('mj-home-view').hidden = false;
    $('mj-order-view').hidden = true;
    $('mj-config').hidden = true;
    $('mj-cart').hidden = true;
    current = null; draft = []; saved = []; products = [];
    updateCount();
    app.scrollTop = 0;
  }
  async function refreshHome() {
    if (!active) return;
    $('mj-home-status').textContent = 'Actualizando pedidos...';
    const r = await db.from('majjos_orders')
      .select('id,tipo,mesa_id,nombre_cliente,telefono_cliente,direccion_cliente,costo_domicilio,estado,creado_en')
      .eq('estado','abierto').order('creado_en', {ascending:false});
    if (r.error) {
      $('mj-home-status').textContent = 'No se pudieron consultar las mesas: ' + r.error.message;
      return;
    }
    const orders = r.data || [];
    const grid = $('mj-tables'); grid.replaceChildren();
    for (let n = 1; n <= 7; n++) {
      const occupied = orders.some(o => o.tipo === 'mesa' && Number(o.mesa_id) === n);
      const btn = make('button','mj-table'); btn.type='button';
      const top = make('div','mj-table-top');
      top.append(make('strong','mj-table-name','Mesa '+String(n).padStart(2,'0')),
        make('span','mj-table-icon','🍽️'));
      const state = make('span','mj-state'+(occupied?' mj-busy':''));
      state.append(make('span','mj-dot'),make('span','',occupied?'Ocupada':'Disponible'));
      btn.append(top,state);
      btn.addEventListener('click',()=>openOrder('mesa',n)); grid.append(btn);
    }
    const extra = $('mj-other-orders');extra.replaceChildren();
    const others = orders.filter(o => o.tipo !== 'mesa');
    if (!others.length) extra.append(make('p','mj-muted','No hay pedidos abiertos para llevar ni domicilios.'));
    for (const o of others) {
      const btn = make('button','mj-open-item'); btn.type='button';
      const left = make('div');
      left.append(make('strong','',titleFor(o)),make('small','',o.nombre_cliente || 'Sin nombre registrado'));
      btn.append(left,make('span','', '›'));
      btn.addEventListener('click',()=>openOrder(o.tipo,null,o.id));
      extra.append(btn);
    }
    $('mj-home-status').textContent = 'Conectado con Supabase. ' + orders.length + ' pedido(s) abierto(s).';
  }
  function groupedProducts() {
    const m = new Map();
    for (const p of products) {
      if (p.price === null || p.price === undefined || Number(p.price) < 0) continue;
      const match = isBurger(p.name);
      const title = match ? match[1].trim() : p.name;
      const key = match ? `${p.category_id}|${title.toLocaleLowerCase('es')}` : p.id;
      if (!m.has(key)) m.set(key,{title,category_id:p.category_id,options:[]});
      m.get(key).options.push(p);
    }
    return [...m.values()];
  }
  function renderCats() {
    const el = $('mj-cats'); el.replaceChildren();
    for (const c of [{id:'',name:'Todos'},...categories]) {
      const b = make('button','mj-cat'+(catId === c.id ? ' mj-active':''),c.name);
      b.type='button'; b.addEventListener('click',()=>{catId=c.id;renderCats();renderProducts();});
      el.append(b);
    }
  }
  function renderProducts() {
    const el = $('mj-products'); el.replaceChildren();
    const search = $('mj-search').value.trim().toLocaleLowerCase('es');
    const list = groupedProducts().filter(p=>
      (!catId || p.category_id === catId) &&
      (!search || p.title.toLocaleLowerCase('es').includes(search)));
    if (!list.length) { el.append(make('p','mj-muted','No hay productos activos con esta búsqueda.')); return; }
    for (const p of list) {
      const line = make('div','mj-product');
      const txt = make('div');txt.style.flex='1';
      txt.append(make('strong','',p.title));
      const low = Math.min(...p.options.map(x=>Number(x.price)));
      txt.append(make('small','',p.options.length>1?'Desde '+cop(low):cop(low)));
      const btn = make('button','mj-plus','+');btn.type='button';
      btn.setAttribute('aria-label','Agregar '+p.title);
      btn.addEventListener('click',()=>chooseProduct(p));
      line.append(txt,btn);el.append(line);
    }
  }
  function fillCustomer() {
    const c=current;
    $('mj-customer').hidden = c.tipo === 'mesa';
    $('mj-delivery-fields').hidden = c.tipo !== 'domicilio';
    const d=c.customer||{};
    $('mj-name').value = d.nombre_cliente || '';
    $('mj-phone').value = d.telefono_cliente || '';
    $('mj-address').value = d.direccion_cliente || '';
    $('mj-fee').value = d.costo_domicilio || 0;
    const locked=!!c.id;
    for(const k of ['mj-name','mj-phone','mj-address','mj-fee']) $(k).disabled=locked;
    $('mj-customer-hint').textContent=locked?'Pedido guardado: estos datos no se pueden editar en esta versión.':
      'Completa los datos antes de guardar. El pedido se creará con el primer producto.';
  }
  async function refreshSaved() {
    saved = [];
    if (!current?.id) return;
    const r=await db.from('majjos_order_items')
      .select('nombre_producto,cantidad,precio_unitario,observaciones,estado_comanda,creado_en')
      .eq('order_id',current.id).order('creado_en',{ascending:true});
    if(r.error)throw r.error;
    saved=r.data || [];
  }
  async function openOrder(tipo,mesa=null,id=null) {
    if (busy) return;
    const seq=++serial;
    current={tipo,mesa_id:mesa,id,customer:null};
    products=[];categories=[];saved=[];draft=[];catId='';
    $('mj-order-title').textContent = titleFor(current);
    $('mj-home-view').hidden=true;
    $('mj-order-view').hidden=false;
    $('mj-config').hidden=true;
    $('mj-cart').hidden=true;
    $('mj-search').value='';
    $('mj-products').replaceChildren();$('mj-cats').replaceChildren();
    $('mj-customer').hidden=true;
    $('mj-order-status').textContent='Cargando el menú de MAJJOS...';
    updateCount();app.scrollTop=0;
    try{
      const orderQuery=id ? db.from('majjos_orders')
        .select('id,tipo,mesa_id,nombre_cliente,telefono_cliente,direccion_cliente,costo_domicilio')
        .eq('id',id).eq('estado','abierto').maybeSingle() :
        tipo==='mesa' ? db.from('majjos_orders')
        .select('id,tipo,mesa_id,nombre_cliente,telefono_cliente,direccion_cliente,costo_domicilio')
        .eq('tipo','mesa').eq('mesa_id',mesa).eq('estado','abierto').maybeSingle() : Promise.resolve({data:null,error:null});
      const results=await Promise.all([
        orderQuery,
        db.from('categories').select('id,name').eq('active',true).order('name'),
        db.from('products').select('id,name,category_id,price,sort_order')
          .eq('active',true).order('sort_order',{ascending:true})
      ]);
      if(seq!==serial || !active) return;
      for(const r of results) if(r.error)throw r.error;
      const order=results[0].data;
      if(id && !order) throw Error('El pedido ya no está abierto. Regresa a las mesas.');
      if(order){current.id=order.id;current.customer=order;}
      categories=results[1].data||[];products=results[2].data||[];
      catId=categories.find(c=>/hamburguesas/i.test(c.name))?.id || '';
      fillCustomer();await refreshSaved();
      if(seq!==serial)return;
      renderCats();renderProducts();updateCount();
      $('mj-order-status').textContent=current.id ?
        'Pedido abierto. Puedes agregar productos nuevos.' :
        'Pedido nuevo. Se guardará en Supabase al confirmar productos.';
    }catch(error){
      if(seq===serial) $('mj-order-status').textContent='Error al abrir el pedido: '+error.message;
    }
  }
  function drawOptions() {
    const el=$('mj-options'); el.replaceChildren();
    if(group.options.length>1){
      el.append(make('label','','Elige la presentación'));
      const grid=make('div','mj-opt-grid');
      for(const p of group.options){
        const m=isBurger(p.name);
        const btn=make('button','mj-option'+(option?.id===p.id?' mj-picked':''));
        btn.type='button';
        btn.append(make('span','',m?m[2]:'Presentación'),make('small','',cop(p.price)));
        btn.addEventListener('click',()=>{option=p;drawOptions();});grid.append(btn);
      }el.append(grid);
    }
    $('mj-quantity').textContent=quantity;
    $('mj-config-total').textContent=cop(moneyNum(option?.price)*quantity);
  }
  function chooseProduct(g) {
    group=g;option=g.options.find(p=>/[-–]\s*Solo$/i.test(p.name))||g.options[0];
    quantity=1;$('mj-note').value='';$('mj-config-title').textContent=g.title;
    drawOptions();$('mj-config').hidden=false;
  }
  function closeProduct(){ $('mj-config').hidden=true;group=null; }
  function addProduct() {
    if(!option)return;
    const note=$('mj-note').value.trim();
    const same=draft.find(i=>i.product.id===option.id && i.note===note);
    if(same) same.quantity+=quantity;
    else draft.push({product:option,quantity,note});
    closeProduct();updateCount();toast('Producto agregado al pedido');
  }
  function cartRowSaved(p) {
    const el=make('div','mj-cart-row');
    el.append(make('strong','',p.cantidad+' × '+p.nombre_producto));
    el.append(make('small','',cop(moneyNum(p.precio_unitario)*p.cantidad)));
    if(p.observaciones) el.append(make('small','', 'Obs.: '+p.observaciones));
    el.append(make('small','',p.estado_comanda==='enviada'?'Marcado como enviado (sin confirmar impresión)':'Comanda pendiente'));
    return el;
  }
  function renderCart() {
    const old=$('mj-saved'),cur=$('mj-draft'),tot=$('mj-cart-summary');
    old.replaceChildren();cur.replaceChildren();tot.replaceChildren();
    if(saved.length){old.append(make('div','mj-cart-heading','YA GUARDADOS EN SUPABASE'));
      saved.forEach(p=>old.append(cartRowSaved(p)));}
    cur.append(make('div','mj-cart-heading','PRODUCTOS NUEVOS (SIN GUARDAR)'));
    if(!draft.length)cur.append(make('p','mj-muted','No hay productos nuevos.'));
    draft.forEach((i,index)=>{
      const line=make('div','mj-cart-row');
      line.append(make('strong','',i.product.name),make('small','',cop(i.product.price)+' por unidad'));
      if(i.note)line.append(make('small','','Obs.: '+i.note));
      const buttons=make('div','mj-cart-control');
      const minus=make('button','mj-line-button','−');minus.type='button';
      const plus=make('button','mj-line-button','+');plus.type='button';
      minus.setAttribute('aria-label','Reducir cantidad');
      plus.setAttribute('aria-label','Aumentar cantidad');
      minus.addEventListener('click',()=>{i.quantity--;if(i.quantity===0)draft.splice(index,1);renderCart();});
      plus.addEventListener('click',()=>{i.quantity=Math.min(99,i.quantity+1);renderCart();});
      buttons.append(minus,make('span','',i.quantity),plus,
        make('strong','',cop(moneyNum(i.product.price)*i.quantity)));
      line.append(buttons);cur.append(line);
    });
    if(fee())tot.append(totalLine('Domicilio',fee()));
    tot.append(totalLine('Total del pedido',totalSaved()+totalDraft()+fee()));
    updateCount();
  }
  function totalLine(label,amount){
    const l=make('div','mj-total-line');l.append(make('span','',label),make('strong','',cop(amount)));return l;
  }
  function checkCustomer() {
    if(current.tipo==='mesa')return {};
    const name=$('mj-name').value.trim();
    if(!name)throw Error('Escribe el nombre del cliente.');
    if(current.tipo==='para_llevar')return {nombre_cliente:name};
    const phone=$('mj-phone').value.trim(),address=$('mj-address').value.trim();
    const price=Number($('mj-fee').value);
    if(!phone || !address)throw Error('Completa el teléfono y dirección del domicilio.');
    if(!Number.isFinite(price)||price<0||price>1000000)throw Error('Revisa el costo del domicilio.');
    return {nombre_cliente:name,telefono_cliente:phone,direccion_cliente:address,costo_domicilio:price};
  }
  async function saveItems() {
    if(busy||!current||!draft.length)return;
    busy=true;updateCount();$('mj-save-status').textContent='Guardando productos...';
    try{
      if(!current.id){
        const customer=checkCustomer();
        const payload={tipo:current.tipo,mesa_id:current.mesa_id,...customer};
        const r=await db.from('majjos_orders').insert(payload).select('id').single();
        if(r.error){
          // Evitar crear dos pedidos abiertos para una misma mesa si otro mesero la abrió.
          if(current.tipo==='mesa'){
            const found=await db.from('majjos_orders').select('id')
              .eq('tipo','mesa').eq('mesa_id',current.mesa_id)
              .eq('estado','abierto').maybeSingle();
            if(found.error || !found.data)throw r.error;
            current.id=found.data.id;
          }else throw r.error;
        }else current.id=r.data.id;
      }
      const lines=draft.map(i=>({
        order_id:current.id,product_id:i.product.id,nombre_producto:i.product.name,
        cantidad:i.quantity,precio_unitario:i.product.price,adiciones:[],
        observaciones:i.note||null
      }));
      const inserted=await db.from('majjos_order_items').insert(lines);
      if(inserted.error)throw inserted.error;
      draft=[];await refreshSaved();fillCustomer();
      renderCart();updateCount();
      $('mj-save-status').textContent='Productos guardados. La comanda todavía NO se ha impreso.';
      $('mj-order-status').textContent='Pedido guardado en Supabase; pendiente de comanda.';
      toast('Producto guardado');
    }catch(error){
      $('mj-save-status').textContent='No se pudo guardar: '+error.message;
      toast('Revisa el error de guardado');
    }finally{busy=false;updateCount();}
  }
  function closeOrder(){
    if(busy)return;
    if(draft.length&&!confirm('Tienes productos sin guardar. ¿Salir y descartarlos?'))return;
    serial++;setHome();refreshHome();
  }
  function stopMesero(){
    serial++;active=false;app.hidden=true;current=null;draft=[];saved=[];
    $('mj-config').hidden=true;$('mj-cart').hidden=true;
    document.body.style.overflow='';
  }
  async function startMesero(){
    const u=await db.auth.getUser();
    if(u.error||!u.data?.user){stopMesero();return;}
    const s=await db.from('majjos_staff').select('rol,activo')
      .eq('user_id',u.data.user.id).maybeSingle();
    if(s.error||!s.data?.activo||s.data?.rol!=='mesero'){
      stopMesero();return;
    }
    if(active)return;
    active=true;app.hidden=false;document.body.style.overflow='hidden';
    setHome();await refreshHome();
  }

  $('mj-refresh').addEventListener('click',()=>refreshHome());
  $('mj-pickup').addEventListener('click',()=>openOrder('para_llevar'));
  $('mj-delivery').addEventListener('click',()=>openOrder('domicilio'));
  $('mj-back').addEventListener('click',closeOrder);
  $('mj-search').addEventListener('input',renderProducts);
  $('mj-fee').addEventListener('input',updateCount);
  $('mj-config-close').addEventListener('click',closeProduct);
  $('mj-config-cancel').addEventListener('click',closeProduct);
  $('mj-minus').addEventListener('click',()=>{quantity=Math.max(1,quantity-1);drawOptions();});
  $('mj-plus').addEventListener('click',()=>{quantity=Math.min(99,quantity+1);drawOptions();});
  $('mj-add').addEventListener('click',addProduct);
  $('mj-open-cart').addEventListener('click',()=>{renderCart();$('mj-save-status').textContent='';$('mj-cart').hidden=false;});
  $('mj-cart-close').addEventListener('click',()=>{$('mj-cart').hidden=true;});
  $('mj-continue').addEventListener('click',()=>{$('mj-cart').hidden=true;});
  $('mj-save').addEventListener('click',saveItems);
  $('mj-logout').addEventListener('click',()=>{stopMesero();$('salir')?.click();});
  db.auth.onAuthStateChange(event=>{
    if(event==='SIGNED_OUT')stopMesero();
    else if(event==='INITIAL_SESSION'||event==='SIGNED_IN')setTimeout(()=>startMesero().catch(console.error),0);
  });
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden && active && !current)refreshHome();
  });
  setTimeout(()=>startMesero().catch(console.error),400);
})();
