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
