/* ══════════════════════════════════════
   app.js — Sharada do Brunson
   JavaScript Global: Dark Mode, Menu, Back-to-Top,
   Form Validation, Toasts, Social Share
══════════════════════════════════════ */

/* ─────────────────────────────────────
   1. DARK MODE TOGGLE
───────────────────────────────────── */
const ThemeManager = (() => {
  const STORAGE_KEY = 'sharada-theme';

  function getTheme() {
    return localStorage.getItem(STORAGE_KEY) ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('dark-toggle');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.title = theme === 'dark' ? 'Activar modo claro' : 'Activar modo escuro';
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function toggle() {
    const current = getTheme();
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  function init() {
    applyTheme(getTheme());
    const btn = document.getElementById('dark-toggle');
    if (btn) btn.addEventListener('click', toggle);
  }

  return { init, toggle };
})();


/* ─────────────────────────────────────
   2. MENU DE NAVEGAÇÃO RESPONSIVO
───────────────────────────────────── */
const NavManager = (() => {
  function init() {
    const toggle = document.querySelector('.nav-toggle');
    const links  = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // Fecha ao clicar em link
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', false);
      });
    });

    // Marca link activo
    const path = window.location.pathname.split('/').pop() || 'index.html';
    links.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === path || href === '../' + path) a.classList.add('active');
    });
  }
  return { init };
})();


/* ─────────────────────────────────────
   3. BOTÃO VOLTAR AO TOPO
───────────────────────────────────── */
const BackToTop = (() => {
  function init() {
    const btn = document.getElementById('btn-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 300);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  return { init };
})();


/* ─────────────────────────────────────
   4. SISTEMA DE TOASTS (notificações)
───────────────────────────────────── */
const Toast = (() => {
  function show(message, type = 'info', duration = 3500) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
    container.appendChild(el);

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(30px)';
      el.style.transition = '0.3s ease';
      setTimeout(() => el.remove(), 300);
    }, duration);
  }
  return { show };
})();


/* ─────────────────────────────────────
   5. VALIDAÇÃO DE FORMULÁRIOS (funções próprias)
───────────────────────────────────── */
const FormValidator = (() => {

  /* Valida formato de email */
  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return re.test(String(email).toLowerCase());
  }

  /* Valida comprimento mínimo */
  function isMinLength(value, min) {
    return String(value).trim().length >= min;
  }

  /* Valida que dois valores são iguais */
  function areEqual(a, b) {
    return String(a) === String(b);
  }

  /* Valida que o campo não está vazio */
  function isNotEmpty(value) {
    return String(value).trim().length > 0;
  }

  /* Valida senha forte: mín. 8 chars, 1 número, 1 letra */
  function isStrongPassword(pass) {
    return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(pass);
  }

  /* Mostra erro num campo */
  function showFieldError(field, message) {
    clearFieldError(field);
    field.classList.add('field-error');
    const err = document.createElement('span');
    err.className = 'field-error-msg';
    err.textContent = message;
    field.parentNode.appendChild(err);
  }

  /* Limpa erro de um campo */
  function clearFieldError(field) {
    field.classList.remove('field-error');
    const prev = field.parentNode.querySelector('.field-error-msg');
    if (prev) prev.remove();
  }

  /* Valida formulário de Login */
  function validateLogin(form) {
    const email = form.querySelector('#login-email');
    const pass  = form.querySelector('#login-pass');
    let valid = true;

    if (!isNotEmpty(email.value)) {
      showFieldError(email, 'O email é obrigatório.');
      valid = false;
    } else if (!isValidEmail(email.value)) {
      showFieldError(email, 'Introduza um email válido.');
      valid = false;
    } else { clearFieldError(email); }

    if (!isNotEmpty(pass.value)) {
      showFieldError(pass, 'A senha é obrigatória.');
      valid = false;
    } else if (!isMinLength(pass.value, 6)) {
      showFieldError(pass, 'A senha deve ter pelo menos 6 caracteres.');
      valid = false;
    } else { clearFieldError(pass); }

    return valid;
  }

  /* Valida formulário de Registo */
  function validateRegisto(form) {
    const nome    = form.querySelector('#reg-name');
    const email   = form.querySelector('#reg-email');
    const pass    = form.querySelector('#reg-pass');
    const pass2   = form.querySelector('#reg-pass2');
    let valid = true;

    if (!isNotEmpty(nome.value)) {
      showFieldError(nome, 'O nome é obrigatório.'); valid = false;
    } else if (!isMinLength(nome.value, 2)) {
      showFieldError(nome, 'O nome deve ter pelo menos 2 caracteres.'); valid = false;
    } else { clearFieldError(nome); }

    if (!isValidEmail(email.value)) {
      showFieldError(email, 'Introduza um email válido.'); valid = false;
    } else { clearFieldError(email); }

    if (!isStrongPassword(pass.value)) {
      showFieldError(pass, 'Senha fraca. Use 8+ caracteres com letras e números.'); valid = false;
    } else { clearFieldError(pass); }

    if (!areEqual(pass.value, pass2.value)) {
      showFieldError(pass2, 'As senhas não coincidem.'); valid = false;
    } else { clearFieldError(pass2); }

    return valid;
  }

  /* Valida formulário de Contacto */
  function validateContacto(form) {
    const nome    = form.querySelector('#ct-name');
    const email   = form.querySelector('#ct-email');
    const msg     = form.querySelector('#ct-msg');
    let valid = true;

    if (!isNotEmpty(nome.value)) {
      showFieldError(nome, 'O nome é obrigatório.'); valid = false;
    } else { clearFieldError(nome); }

    if (!isValidEmail(email.value)) {
      showFieldError(email, 'Email inválido.'); valid = false;
    } else { clearFieldError(email); }

    if (!isMinLength(msg.value, 10)) {
      showFieldError(msg, 'A mensagem deve ter pelo menos 10 caracteres.'); valid = false;
    } else { clearFieldError(msg); }

    return valid;
  }

  function init() {
    // Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateLogin(loginForm)) {
          Toast.show('Login efectuado com sucesso!', 'success');
          setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
        } else {
          Toast.show('Corrija os erros antes de continuar.', 'error');
        }
      });
    }

    // Registo
    const regForm = document.getElementById('reg-form');
    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateRegisto(regForm)) {
          Toast.show('Conta criada com sucesso! Bem-vindo!', 'success');
          setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
        } else {
          Toast.show('Corrija os erros antes de continuar.', 'error');
        }
      });
    }

    // Contacto
    const ctForm = document.getElementById('contacto-form');
    if (ctForm) {
      ctForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateContacto(ctForm)) {
          Toast.show('Mensagem enviada com sucesso!', 'success');
          ctForm.reset();
        } else {
          Toast.show('Corrija os erros antes de enviar.', 'error');
        }
      });
    }
  }

  return { init, isValidEmail, isMinLength, areEqual, isNotEmpty, isStrongPassword };
})();


/* ─────────────────────────────────────
   6. INTEGRAÇÃO COM REDES SOCIAIS
───────────────────────────────────── */
const SocialShare = (() => {
  function share(platform) {
    const url   = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('Sharada do Brunson — Jogo de Enigmas e Desafios!');
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter:  `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${title}%20${url}`
    };
    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  }

  function init() {
    document.querySelectorAll('[data-share]').forEach(btn => {
      btn.addEventListener('click', () => share(btn.dataset.share));
    });
  }
  return { init, share };
})();


/* ─────────────────────────────────────
   7. CARROSSEL / SLIDER
───────────────────────────────────── */
const Carousel = (() => {
  function init(selector) {
    const carousels = document.querySelectorAll(selector || '.carousel');
    carousels.forEach(carousel => {
      const track  = carousel.querySelector('.carousel-track');
      const slides = carousel.querySelectorAll('.carousel-slide');
      const prev   = carousel.querySelector('.carousel-prev');
      const next   = carousel.querySelector('.carousel-next');
      const dots   = carousel.querySelectorAll('.carousel-dot');
      if (!track || slides.length === 0) return;

      let current = 0;

      function goTo(idx) {
        current = (idx + slides.length) % slides.length;
        track.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
        slides.forEach((s, i) => s.setAttribute('aria-hidden', i !== current));
      }

      if (prev) prev.addEventListener('click', () => goTo(current - 1));
      if (next) next.addEventListener('click', () => goTo(current + 1));
      dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

      // Swipe touch
      let startX = 0;
      track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
      track.addEventListener('touchend',   e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
      });

      // Auto-play
      let timer = setInterval(() => goTo(current + 1), 4500);
      carousel.addEventListener('mouseenter', () => clearInterval(timer));
      carousel.addEventListener('mouseleave', () => { timer = setInterval(() => goTo(current + 1), 4500); });

      goTo(0);
    });
  }
  return { init };
})();


/* ─────────────────────────────────────
   8. INICIALIZAÇÃO GLOBAL
───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  NavManager.init();
  BackToTop.init();
  FormValidator.init();
  SocialShare.init();
  Carousel.init();
  MapManager.init();
});

/* ─────────────────────────────────────
   9. MAPA INTERATIVO (LEAFLET)
───────────────────────────────────── */
const MapManager = (() => {
  function init() {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;

    // Se a div tem a classe map__box, indica que é o mapa do Restaurante Sabor & Arte em Luanda
    if (mapEl.classList.contains('map__box')) {
      const initLeaflet = () => {
        if (typeof L === 'undefined') return;
        const lat = -8.85761;
        const lon = 13.28194;
        
        // Inicializa o mapa com Leaflet
        const map = L.map('map', { 
          zoomControl: true,
          scrollWheelZoom: false // Evita zoom acidental ao fazer scroll
        }).setView([lat, lon], 17);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        // Adiciona um marcador personalizado
        const marker = L.marker([lat, lon]).addTo(map);
        marker.bindPopup("<b>Restaurante Sabor & Arte</b><br>Universidade Católica de Angola, Luanda.").openPopup();

        // Ocultar e remover o placeholder de carregamento
        const placeholder = document.querySelector('.map__placeholder');
        if (placeholder) {
          placeholder.style.opacity = '0';
          setTimeout(() => placeholder.remove(), 500);
        }
      };

      // Carregar Leaflet dinamicamente se necessário
      if (typeof L === 'undefined') {
        const leafletCss = document.createElement('link');
        leafletCss.rel = 'stylesheet';
        leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(leafletCss);

        const leafletJs = document.createElement('script');
        leafletJs.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        leafletJs.onload = initLeaflet;
        document.body.appendChild(leafletJs);
      } else {
        initLeaflet();
      }
    }
  }
  return { init };
})();
