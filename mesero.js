/* MAJJOS Personal — módulo de prueba para tomar pedidos en mesa.
   Requiere index.html original con el cliente Supabase `db` ya inicializado.
   Versión inicial: NO imprime, NO procesa cobros, NO aplica promociones ni adiciones.
*/
(() => {
  'use strict';

  const estilos = document.createElement('style');
  estilos.textContent = `
    #listaMesas .mesa { cursor:pointer; touch-action:manipulation; }
    #listaMesas .mesa:focus-visible { outline:3px solid #e87524; outline-offset:3px; }
    #mp-capa[hidden] {display:none!important}
    #mp-capa { position:fixed; inset:0; z-index:99999; background:rgba(0,0,0,.83);
      display:flex; align-items:stretch; justify-content:center; }
    #mp-ventana { width:100%; max-width:660px; max-height:100dvh; overflow:auto;
      background:#171717; color:#fffaf0; padding:15px 14px 90px; }
    #mp-ventana button { margin:0; }
    #mp-cabecera { display:flex; gap:8px; align-items:center; justify-content:space-between;
      position:sticky; top:-15px; z-index:3; background:#171717; padding:12px 0;
      border-bottom:2px solid #e87524; }
    #mp-cabecera h2 {margin:0;color:#e87524;font-size:24px}
    #mp-cerrar { width:auto!important; padding:10px 14px!important; background:#393939;
      color:#fff; }
    #mp-estado {padding:12px 4px;color:#efc27e;font-size:14px;line-height:1.5;}
    #mp-aviso {margin:12px 0;padding:12px;border:1px solid #74572c;border-radius:9px;
      font-size:13px;color:#ffd598;line-height:1.5;}
    #mp-filtros {display:grid;grid-template-columns:1fr;gap:8px;margin:14px 0;}
    #mp-filtros select,#mp-filtros input {width:100%;color:#171717;background:#fffaf0;
      border:0;border-radius:8px;padding:12px;margin:0;font:inherit;}
    #mp-productos {display:grid;gap:10px;}
    .mp-producto {background:#282828;border:1px solid #414141;border-radius:12px;padding:13px;}
    .mp-producto strong {display:block;font-size:16px;margin:0 0 5px;}
    .mp-precio {color:#efbc72;font-size:14px;margin:6px 0;}
    .mp-producto select {width:100%;margin:5px 0 8px;padding:10px;
      background:#fffaf0;color:#171717;border:0;border-radius:8px;font:inherit;}
    .mp-producto button {width:100%;padding:11px;font-size:14px;}
    .mp-h3 {font-size:19px;margin:23px 0 10px;}
    .mp-linea {background:#292929;border-radius:10px;padding:12px;margin:8px 0;}
    .mp-linea strong {display:block;margin-bottom:4px;}
    .mp-linea small {color:#ddd;}
    .mp-controles {display:flex;align-items:center;gap:9px;margin:10px 0;}
    .mp-controles button {width:45px!important;min-width:45px;padding:8px!important;}
    .mp-controles span {font-size:18px;min-width:20px;text-align:center;}
    .mp-linea textarea {width:100%;min-height:55px;background:#fffaf0;color:#171717;
      padding:10px;border-radius:8px;border:0;font:inherit;resize:vertical;}
    #mp-guardar {position:sticky;bottom:0;z-index:3;min-height:53px;margin-top:15px!important;
      background:#e87524;color:#171717;border:2px solid #171717;box-shadow:0 0 15px #171717;}
    #mp-guardar:disabled {opacity:.5}
    .mp-existente {border-bottom:1px solid #444;padding:9px 0;font-size:14px;}
    .mp-existente small {display:block;color:#bbb;margin-top:3px}
  `;
  document.head.append(estilos);

  const $ = id => document.getElementById(id);
  const nodo = (tag, clase, texto) => {
    const e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto !== undefined) e.textContent = String(texto);
    return e;
  };
  const pesos = value => '$' + new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

  const capa = nodo('div');
  capa.id = 'mp-capa';
  capa.hidden = true;
  capa.innerHTML = `
    <div id="mp-ventana" role="dialog" aria-modal="true" aria-label="Tomar pedido">
      <div id="mp-cabecera">
        <h2 id="mp-titulo">Mesa</h2>
        <button id="mp-cerrar" type="button">Cerrar ✕</button>
      </div>
      <div id="mp-estado" role="status"></div>
      <div id="mp-aviso">PRUEBA: los productos se guardan en Supabase, pero esta versión
        <strong>no imprime comandas, no cobra, no aplica promociones ni adiciones</strong>.
        No la uses todavía para atender ventas reales.</div>
      <div id="mp-existentes"></div>
      <h3 class="mp-h3">Agregar productos</h3>
      <div id="mp-filtros">
        <select id="mp-categoria" aria-label="Filtrar categoría"></select>
        <input id="mp-buscar" type="search" placeholder="Buscar producto..." aria-label="Buscar producto">
      </div>
      <div id="mp-productos"></div>
      <h3 class="mp-h3">Productos por guardar</h3>
      <div id="mp-carrito"></div>
      <button id="mp-guardar" type="button" disabled>Guardar productos (sin imprimir)</button>
    </div>`;
  document.body.append(capa);

  let mesaSeleccionada = null;
  let idPedido = null;
  let catalogo = [];
  let categorias = [];
  let carrito = new Map();
  let trabajando = false;
  let apertura = 0;

  function mensaje(s) { $('mp-estado').textContent = s; }

  function cerrar() {
    if (trabajando) return;
    capa.hidden = true;
    mesaSeleccionada = null;
    document.body.style.overflow = '';
  }
  $('mp-cerrar').addEventListener('click', cerrar);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !capa.hidden) cerrar();
  });

  function marcarMesas() {
    document.querySelectorAll('#listaMesas .mesa').forEach(item => {
      item.setAttribute('role', 'button');
      item.tabIndex = 0;
      item.setAttribute('aria-label', 'Abrir pedido de ' +
        (item.querySelector('strong')?.textContent || 'mesa'));
    });
  }
  const contenedorMesas = $('listaMesas');
  if (contenedorMesas) {
    new MutationObserver(marcarMesas).observe(contenedorMesas, { childList:true });
    marcarMesas();
    const abrirDesdeTarjeta = tarjeta => {
      const texto = tarjeta?.querySelector('strong')?.textContent || '';
      const numero = Number((texto.match(/\d+/) || [])[0]);
      if (numero >= 1 && numero <= 7) abrirMesa(numero);
    };
    contenedorMesas.addEventListener('click', e => {
      abrirDesdeTarjeta(e.target.closest('.mesa'));
    });
    contenedorMesas.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const tarjeta = e.target.closest('.mesa');
      if (!tarjeta) return;
      e.preventDefault();
      abrirDesdeTarjeta(tarjeta);
    });
  }

  async function permisoMesero() {
    const userResp = await db.auth.getUser();
    if (userResp.error || !userResp.data.user) throw new Error('Inicia sesión primero.');
    const perfilResp = await db.from('majjos_staff')
      .select('rol,activo').eq('user_id',userResp.data.user.id).single();
    if (perfilResp.error || !perfilResp.data?.activo ||
        !['mesero','administrador'].includes(perfilResp.data.rol)) {
      throw new Error('Este usuario no está autorizado para tomar pedidos.');
    }
  }

  async function abrirMesa(numero) {
    if (!capa.hidden) return;
    const version = ++apertura;
    mesaSeleccionada = numero;
    idPedido = null;
    catalogo = [];
    categorias = [];
    carrito = new Map();
    capa.hidden = false;
    document.body.style.overflow = 'hidden';
    $('mp-titulo').textContent = 'Mesa ' + numero;
    $('mp-buscar').value = '';
    $('mp-productos').replaceChildren();
    $('mp-existentes').replaceChildren();
    $('mp-categoria').replaceChildren();
    mensaje('Consultando pedido y menú...');
    pintarCarrito();
    try {
      await permisoMesero();
      const respuestas = await Promise.all([
        db.from('majjos_orders').select('id,estado')
          .eq('tipo','mesa').eq('mesa_id',numero).eq('estado','abierto').maybeSingle(),
        db.from('categories').select('id,name').eq('active',true),
        db.from('products').select('id,category_id,name,description,price,sort_order')
          .eq('active',true).order('sort_order',{ascending:true})
      ]);
      if (capa.hidden || version !== apertura) return;
      for (const r of respuestas) if (r.error) throw r.error;
      idPedido = respuestas[0].data?.id || null;
      categorias = respuestas[1].data || [];
      catalogo = respuestas[2].data || [];
      const selector = $('mp-categoria');
      selector.append(nodo('option', '', 'Todas las categorías'));
      selector.options[0].value = '';
      categorias.forEach(cat => {
        const op = nodo('option', '', cat.name);
        op.value = cat.id;
        selector.append(op);
      });
      await mostrarExistentes();
      pintarCatalogo();
      pintarCarrito();
      mensaje(idPedido
        ? 'Mesa con pedido abierto. Puedes añadir productos.'
        : 'Mesa disponible. El pedido se creará al guardar productos.');
    } catch (err) {
      mensaje('No se pudo cargar la mesa: ' + err.message);
      $('mp-guardar').disabled = true;
    }
  }

  async function mostrarExistentes() {
    const box = $('mp-existentes');
    box.replaceChildren();
    if (!idPedido) return;
    const res = await db.from('majjos_order_items')
      .select('nombre_producto,cantidad,precio_unitario,observaciones,estado_comanda')
      .eq('order_id',idPedido).order('creado_en',{ascending:true});
    if (res.error) throw res.error;
    const heading = nodo('h3', 'mp-h3', 'Productos ya guardados');
    box.append(heading);
    if (!res.data.length) {
      box.append(nodo('p', '', 'Este pedido aún no tiene productos.'));
      return;
    }
    for (const item of res.data) {
      const fila = nodo('div', 'mp-existente');
      fila.append(nodo('div','', `${item.cantidad} × ${item.nombre_producto} · ${pesos(Number(item.precio_unitario) * item.cantidad)}`));
      fila.append(nodo('small','', 'Comanda: ' + (item.estado_comanda === 'enviada' ? 'marcada enviada' : 'pendiente')));
      if (item.observaciones) fila.append(nodo('small','', 'Observación: ' + item.observaciones));
      box.append(fila);
    }
  }

  function agrupados() {
    const grupos = new Map();
    const busqueda = $('mp-buscar').value.trim().toLocaleLowerCase('es');
    const cat = $('mp-categoria').value;
    for (const producto of catalogo) {
      if (cat && producto.category_id !== cat) continue;
      const coincidencia = producto.name.match(/^(.*?)\s*[-–]\s*(Solo|Con papas)$/i);
      const nombre = coincidencia ? coincidencia[1].trim() : producto.name;
      if (busqueda && !nombre.toLocaleLowerCase('es').includes(busqueda)) continue;
      const key = coincidencia ? producto.category_id + '|' + nombre.toLowerCase() : producto.id;
      if (!grupos.has(key)) grupos.set(key,{ nombre, opciones:[] });
      grupos.get(key).opciones.push(producto);
    }
    return [...grupos.values()];
  }

  function pintarCatalogo() {
    const destino = $('mp-productos');
    destino.replaceChildren();
    const productos = agrupados();
    if (!productos.length) {
      destino.append(nodo('p','','No se encontraron productos activos.'));
      return;
    }
    for (const g of productos) {
      const card = nodo('div','mp-producto');
      card.append(nodo('strong','',g.nombre));
      let select = null;
      if (g.opciones.length > 1) {
        select = nodo('select');
        select.setAttribute('aria-label','Presentación de ' + g.nombre);
        for (const p of g.opciones) {
          const op = nodo('option','',`${p.name} · ${pesos(p.price)}`);
          op.value = p.id;
          select.append(op);
        }
        card.append(select);
      } else {
        card.append(nodo('div','mp-precio',pesos(g.opciones[0].price)));
      }
      const btn = nodo('button','','+ Agregar');
      btn.type = 'button';
      btn.addEventListener('click',() => {
        const elegido = select ? g.opciones.find(p => p.id === select.value) : g.opciones[0];
        if (!elegido) return;
        const actual = carrito.get(elegido.id);
        if (actual) actual.cantidad++;
        else carrito.set(elegido.id,{producto:elegido,cantidad:1,observaciones:''});
        pintarCarrito();
      });
      card.append(btn);
      destino.append(card);
    }
  }

  function pintarCarrito() {
    const destino = $('mp-carrito');
    destino.replaceChildren();
    if (!carrito.size) destino.append(nodo('p','','Selecciona un producto para agregarlo.'));
    let total = 0;
    for (const [id,item] of carrito) {
      total += Number(item.producto.price) * item.cantidad;
      const fila = nodo('div','mp-linea');
      fila.append(nodo('strong','',item.producto.name));
      fila.append(nodo('small','',pesos(item.producto.price) + ' por unidad'));
      const controles = nodo('div','mp-controles');
      const menos = nodo('button','','−');
      menos.type = 'button';
      menos.setAttribute('aria-label','Quitar una unidad de ' + item.producto.name);
      menos.addEventListener('click',() => {
        item.cantidad--;
        if (item.cantidad <= 0) carrito.delete(id);
        pintarCarrito();
      });
      const mas = nodo('button','','+');
      mas.type = 'button';
      mas.setAttribute('aria-label','Agregar una unidad de ' + item.producto.name);
      mas.addEventListener('click',() => {item.cantidad++;pintarCarrito()});
      controles.append(menos,nodo('span','',item.cantidad),mas);
      fila.append(controles);
      const obs = nodo('textarea');
      obs.placeholder = 'Observaciones para este producto (sin cebolla, etc.)';
      obs.value = item.observaciones;
      obs.maxLength = 400;
      obs.addEventListener('input',() => {item.observaciones = obs.value;});
      fila.append(obs);
      destino.append(fila);
    }
    if (carrito.size) destino.append(nodo('p','',`Subtotal aproximado sin promociones: ${pesos(total)}`));
    $('mp-guardar').disabled = !carrito.size || trabajando || !catalogo.length;
  }

  $('mp-buscar').addEventListener('input',pintarCatalogo);
  $('mp-categoria').addEventListener('change',pintarCatalogo);
  $('mp-guardar').addEventListener('click', async () => {
    if (trabajando || !carrito.size || mesaSeleccionada === null) return;
    trabajando = true;
    pintarCarrito();
    mensaje('Guardando productos en Supabase...');
    try {
      await permisoMesero();
      let pedidoActual = idPedido;
      if (!pedidoActual) {
        // La restricción de la base impide crear dos pedidos abiertos para una mesa.
        const creado = await db.from('majjos_orders')
          .insert({tipo:'mesa',mesa_id:mesaSeleccionada})
          .select('id').single();
        if (creado.error) throw creado.error;
        pedidoActual = creado.data.id;
        idPedido = pedidoActual;
      }
      const items = [...carrito.values()].map(i => ({
        order_id:pedidoActual,
        product_id:i.producto.id,
        nombre_producto:i.producto.name,
        cantidad:i.cantidad,
        precio_unitario:i.producto.price,
        adiciones:[],
        observaciones:i.observaciones.trim() || null
      }));
      const guardados = await db.from('majjos_order_items').insert(items);
      if (guardados.error) throw guardados.error;
      carrito.clear();
      await mostrarExistentes();
      if (typeof cargarInformacion === 'function') await cargarInformacion();
      mensaje('Productos guardados. Comanda pendiente: todavía NO se imprimió ni se envió a cocina.');
    } catch (err) {
      mensaje('No se pudo guardar: ' + err.message + '. Si apareció un pedido vacío, puedes reintentar sin crearlo de nuevo.');
    } finally {
      trabajando = false;
      pintarCarrito();
    }
  });
})();
