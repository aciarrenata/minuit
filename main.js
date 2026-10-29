const header = document.querySelector('.header');
const menuBoton = document.querySelector('.menu-boton');

if (menuBoton) {
  menuBoton.addEventListener('click', function () {
    header.classList.toggle('abierto');
  });
}

const formReserva = document.querySelector('#form-reserva');

if (formReserva) {
  const campoFecha = document.querySelector('#fecha');
  const hoy = new Date();
  hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
  campoFecha.min = hoy.toISOString().slice(0, 10);

  const mensajeGracias = document.querySelector('#gracias-reserva');
  const textoGracias = document.querySelector('#gracias-texto');

  formReserva.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const nombre = document.querySelector('#nombre').value.trim().split(' ')[0];
    const hora = document.querySelector('#hora').value;
    const personas = document.querySelector('#personas').value;
    const email = document.querySelector('#email').value;
    const fecha = new Date(campoFecha.value + 'T00:00').toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    const textoPersonas = personas === '1' ? '1 persona' : personas + ' personas';

    textoGracias.innerHTML =
      nombre + ', tu mesa en MINUIT está reservada para el <strong>' + fecha +
      '</strong> a las <strong>' + hora + '</strong>, para <strong>' + textoPersonas +
      '</strong>.<br><br>Te enviamos la confirmación a <strong>' + email + '</strong>. ¡Te esperamos!';

    formReserva.classList.add('oculto');
    mensajeGracias.classList.add('visible');
    mensajeGracias.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  document.querySelector('#otra-reserva').addEventListener('click', function () {
    formReserva.reset();
    mensajeGracias.classList.remove('visible');
    formReserva.classList.remove('oculto');
  });
}

const formsSuscribite = document.querySelectorAll('.suscribite__form');

formsSuscribite.forEach(function (form) {
  form.addEventListener('submit', function (evento) {
    evento.preventDefault();
    form.reset();
    form.previousElementSibling.textContent = '¡Gracias por suscribirte! Pronto vas a recibir novedades.';
  });
});

const CLAVE_CARRITO = 'minuit-carrito';
let carrito = leerCarrito();

function leerCarrito() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || [];
  } catch (error) {
    return [];
  }
}

function guardarCarrito() {
  try {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  } catch (error) {}
  actualizarContador();
  mostrarCarrito();
}

function formatoPrecio(numero) {
  return '€\u00a0' + numero.toLocaleString('es-AR');
}

function contarExperiencias() {
  return carrito.reduce(function (suma, item) {
    return suma + item.cantidad;
  }, 0);
}

function calcularTotal() {
  return carrito.reduce(function (suma, item) {
    return suma + item.precio * item.cantidad;
  }, 0);
}

function actualizarContador() {
  document.querySelectorAll('.carrito-contador').forEach(function (contador) {
    contador.textContent = contarExperiencias();
  });
}

document.querySelectorAll('.tarjeta__boton').forEach(function (boton) {
  boton.addEventListener('click', function () {
    const tarjeta = boton.closest('.tarjeta');
    const id = tarjeta.dataset.id;
    const existente = carrito.find(function (item) {
      return item.id === id;
    });

    if (existente) {
      existente.cantidad++;
    } else {
      carrito.push({
        id: id,
        nombre: tarjeta.dataset.nombre,
        precio: Number(tarjeta.dataset.precio),
        imagen: tarjeta.querySelector('img').getAttribute('src'),
        cantidad: 1
      });
    }

    guardarCarrito();

    boton.textContent = '✓ Agregado';
    boton.classList.add('agregado');
    setTimeout(function () {
      boton.innerHTML = 'Agregar al carrito <span>→</span>';
      boton.classList.remove('agregado');
    }, 1500);
  });
});

const listaCarrito = document.querySelector('#carrito-lista');

function mostrarCarrito() {
  if (!listaCarrito) {
    return;
  }

  const mensajeVacio = document.querySelector('#carrito-vacio');
  const cajaCarrito = document.querySelector('#carrito-resumen');

  if (carrito.length === 0) {
    mensajeVacio.classList.remove('oculto');
    cajaCarrito.classList.add('oculto');
    return;
  }

  mensajeVacio.classList.add('oculto');
  cajaCarrito.classList.remove('oculto');

  listaCarrito.innerHTML = '';

  carrito.forEach(function (item) {
    listaCarrito.innerHTML +=
      '<li class="item" data-id="' + item.id + '">' +
        '<img src="' + item.imagen + '" alt="">' +
        '<div class="item__info">' +
          '<h3>' + item.nombre + '</h3>' +
          '<p>' + formatoPrecio(item.precio) + ' c/u</p>' +
        '</div>' +
        '<div class="item__cantidad">' +
          '<button type="button" data-accion="restar" aria-label="Restar uno">−</button>' +
          '<span>' + item.cantidad + '</span>' +
          '<button type="button" data-accion="sumar" aria-label="Sumar uno">+</button>' +
        '</div>' +
        '<p class="item__subtotal">' + formatoPrecio(item.precio * item.cantidad) + '</p>' +
        '<button type="button" class="item__quitar" data-accion="quitar" aria-label="Quitar">×</button>' +
      '</li>';
  });

  document.querySelector('#carrito-cantidad').textContent = contarExperiencias();
  document.querySelector('#carrito-total').textContent = formatoPrecio(calcularTotal());
}

if (listaCarrito) {
  listaCarrito.addEventListener('click', function (evento) {
    const boton = evento.target.closest('button');
    if (!boton) {
      return;
    }

    const id = boton.closest('.item').dataset.id;
    const item = carrito.find(function (elemento) {
      return elemento.id === id;
    });
    const accion = boton.dataset.accion;

    if (accion === 'sumar') {
      item.cantidad++;
    } else if (accion === 'restar') {
      item.cantidad--;
    }

    if (accion === 'quitar' || item.cantidad === 0) {
      carrito = carrito.filter(function (elemento) {
        return elemento.id !== id;
      });
    }

    guardarCarrito();
  });

  document.querySelector('#vaciar-carrito').addEventListener('click', function () {
    carrito = [];
    guardarCarrito();
  });

  document.querySelector('#finalizar-compra').addEventListener('click', abrirPago);
}

const panelPago = document.querySelector('#pago');
const formPago = document.querySelector('#form-pago');

function abrirPago() {
  const cantidad = contarExperiencias();
  const total = formatoPrecio(calcularTotal());

  document.querySelector('#pago-cantidad').textContent =
    cantidad === 1 ? '1 experiencia' : cantidad + ' experiencias';
  document.querySelector('#pago-total').textContent = total;
  document.querySelector('#boton-pagar').innerHTML = 'Pagar ' + total + ' <span>→</span>';

  panelPago.classList.add('abierto');
  document.body.classList.add('sin-scroll');
  setTimeout(function () {
    document.querySelector('#pago-nombre').focus();
  }, 400);
}

function cerrarPago() {
  panelPago.classList.remove('abierto');
  document.body.classList.remove('sin-scroll');
}

if (panelPago) {
  panelPago.querySelectorAll('[data-cerrar]').forEach(function (elemento) {
    elemento.addEventListener('click', cerrarPago);
  });

  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape') {
      cerrarPago();
    }
  });

  const campoTarjeta = document.querySelector('#pago-tarjeta');
  const campoVencimiento = document.querySelector('#pago-vencimiento');
  const campoCvv = document.querySelector('#pago-cvv');

  campoTarjeta.addEventListener('input', function () {
    const numeros = campoTarjeta.value.replace(/\D/g, '').slice(0, 16);
    campoTarjeta.value = numeros.replace(/(\d{4})(?=\d)/g, '$1 ');
  });

  campoVencimiento.addEventListener('input', function () {
    const numeros = campoVencimiento.value.replace(/\D/g, '').slice(0, 4);
    campoVencimiento.value = numeros.length > 2 ? numeros.slice(0, 2) + '/' + numeros.slice(2) : numeros;
  });

  campoCvv.addEventListener('input', function () {
    campoCvv.value = campoCvv.value.replace(/\D/g, '').slice(0, 4);
  });

  formPago.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const nombre = document.querySelector('#pago-nombre').value.trim().split(' ')[0];
    const email = document.querySelector('#pago-email').value;
    const ultimos = campoTarjeta.value.slice(-4);
    const cantidad = contarExperiencias();
    const total = calcularTotal();
    const numeroPedido = Math.floor(1000 + Math.random() * 9000);
    const textoCantidad = cantidad === 1 ? '1 experiencia' : cantidad + ' experiencias';

    document.querySelector('#gracias-compra-texto').innerHTML =
      nombre + ', tu pedido <strong>#MN' + numeroPedido + '</strong> de <strong>' + textoCantidad +
      '</strong> por un total de <strong>' + formatoPrecio(total) +
      '</strong> fue confirmado. Pagaste con la tarjeta terminada en <strong>' + ultimos +
      '</strong>.<br><br>Te enviamos todos los detalles a <strong>' + email + '</strong>. ¡Nos vemos en París!';

    carrito = [];
    guardarCarrito();
    formPago.reset();
    cerrarPago();

    document.querySelector('#carrito-contenido').classList.add('oculto');
    const mensajeCompra = document.querySelector('#gracias-compra');
    mensajeCompra.classList.add('visible');
    mensajeCompra.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

actualizarContador();
mostrarCarrito();