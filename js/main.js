// SuperÁridos — interacciones básicas del sitio

document.addEventListener('DOMContentLoaded', () => {

  // Año dinámico en el footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Menú móvil
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = primaryNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Cierra el menú al elegir una opción (en mobile)
    primaryNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        primaryNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Campo condicional: cantidad de metros cúbicos (solo para venta de áridos)
  const asuntoSelect = document.getElementById('asunto');
  const cantidadField = document.getElementById('cantidadField');
  const cantidadInput = document.getElementById('cantidad');

  if (asuntoSelect && cantidadField && cantidadInput) {
    const toggleCantidad = () => {
      const show = asuntoSelect.value === 'Venta de áridos';
      cantidadField.hidden = !show;
      cantidadInput.required = show;
      if (!show) cantidadInput.value = '';
    };
    asuntoSelect.addEventListener('change', toggleCantidad);
    toggleCantidad();
  }

  // Carrito de cotización (guardado en localStorage)
  const CART_KEY = 'sa_cart';
  const cartCountEl = document.getElementById('cartCount');

  const readCart = () => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  };

  const saveCart = (cart) => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  };

  const updateCartCount = () => {
    if (cartCountEl) cartCountEl.textContent = String(readCart().length);
  };

  document.querySelectorAll('.product-card').forEach(card => {
    const minusBtn = card.querySelector('.qty-btn--minus');
    const plusBtn = card.querySelector('.qty-btn--plus');
    const qtyInput = card.querySelector('.qty-input');
    const addBtn = card.querySelector('.btn-add');
    const totalEl = card.querySelector('.product-card__total');
    const unitM3 = totalEl ? Number(totalEl.dataset.unitM3) : 0;
    const productName = card.dataset.product;

    if (!minusBtn || !plusBtn || !qtyInput || !addBtn) return;

    const updateTotal = () => {
      if (!totalEl) return;
      const cantidad = Number(qtyInput.value) || 0;
      totalEl.textContent = `= ${cantidad * unitM3} m³ totales`;
    };

    minusBtn.addEventListener('click', () => {
      const next = Number(qtyInput.value) - 1;
      qtyInput.value = Math.max(1, next);
      updateTotal();
    });

    plusBtn.addEventListener('click', () => {
      qtyInput.value = Number(qtyInput.value) + 1;
      updateTotal();
    });

    qtyInput.addEventListener('input', updateTotal);

    addBtn.addEventListener('click', () => {
      const cantidad = Number(qtyInput.value);
      if (!cantidad || cantidad <= 0) {
        qtyInput.focus();
        return;
      }

      const cart = readCart();
      cart.push({ producto: productName, cantidad });
      saveCart(cart);
      updateCartCount();

      // Confirmación breve
      addBtn.textContent = 'Agregado ✓';
      addBtn.disabled = true;
      setTimeout(() => {
        addBtn.textContent = 'Agregar al carrito';
        addBtn.disabled = false;
        qtyInput.value = 1;
        updateTotal();
      }, 1000);
    });

    updateTotal();
  });

  updateCartCount();

  // Drawer del carrito
  const cartIndicator = document.getElementById('cartIndicator');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawerClose = document.getElementById('cartDrawerClose');
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmptyEl = document.getElementById('cartEmpty');
  const cartForm = document.getElementById('cartForm');
  const cartFormNote = document.getElementById('cartFormNote');

  const renderCartItems = () => {
    if (!cartItemsEl || !cartEmptyEl) return;
    const cart = readCart();
    cartItemsEl.innerHTML = '';

    if (cart.length === 0) {
      cartItemsEl.hidden = true;
      cartEmptyEl.hidden = false;
      return;
    }

    cartItemsEl.hidden = false;
    cartEmptyEl.hidden = true;

    cart.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <div class="cart-item__info">
          <span class="cart-item__name">${item.producto}</span>
          <span class="cart-item__qty">${item.cantidad} m³</span>
        </div>
        <button type="button" class="cart-item__remove" data-index="${index}" aria-label="Quitar ${item.producto}">&times;</button>
      `;
      cartItemsEl.appendChild(li);
    });
  };

  const openCart = () => {
    if (!cartDrawer) return;
    renderCartItems();
    cartDrawer.classList.add('is-open');
    if (cartIndicator) cartIndicator.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (cartDrawerClose) cartDrawerClose.focus();
  };

  const closeCart = () => {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('is-open');
    if (cartIndicator) cartIndicator.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  if (cartIndicator) {
    cartIndicator.addEventListener('click', () => {
      if (primaryNav) primaryNav.classList.remove('is-open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
      openCart();
    });
  }
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  if (cartDrawerClose) cartDrawerClose.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartDrawer && cartDrawer.classList.contains('is-open')) closeCart();
  });

  if (cartItemsEl) {
    cartItemsEl.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.cart-item__remove');
      if (!removeBtn) return;
      const index = Number(removeBtn.dataset.index);
      const cart = readCart();
      cart.splice(index, 1);
      saveCart(cart);
      updateCartCount();
      renderCartItems();
    });
  }

  if (cartForm && cartFormNote) {
    cartForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const cart = readCart();
      if (cart.length === 0) {
        cartFormNote.textContent = 'Agrega al menos un producto antes de cotizar.';
        cartFormNote.style.color = '#B5551F';
        return;
      }

      if (!cartForm.checkValidity()) {
        cartFormNote.textContent = 'Por favor ingresa un email válido.';
        cartFormNote.style.color = '#B5551F';
        return;
      }

      // Aquí se debe conectar un servicio real de envío
      // (por ejemplo un endpoint propio, Formspree, EmailJS, etc.)
      cartFormNote.textContent = 'Muchas gracias por tu cotización. Te responderemos a la brevedad.';
      cartFormNote.style.color = '#33586A';
      saveCart([]);
      updateCartCount();
      cartForm.reset();
      renderCartItems();
      setTimeout(closeCart, 1500);
    });
  }

  // Formulario de contacto (demo local, sin backend conectado)
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');

  if (form && note) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        note.textContent = 'Por favor completa los campos obligatorios.';
        note.style.color = '#B5551F';
        return;
      }

      // Aquí se debe conectar un servicio real de envío
      // (por ejemplo un endpoint propio, Formspree, EmailJS, etc.)
      note.textContent = 'Muchas gracias por contactarnos. Te responderemos a la brevedad.';
      note.style.color = '#33586A';
      form.reset();
    });
  }

});
