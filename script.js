// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  /**
   * Mobile navigation toggle
   */
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!expanded));
      navLinks.classList.toggle('open');
    });
    // Close mobile nav when a link is clicked
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /**
   * Video modal logic
   */
  const modal = document.getElementById('video-modal');
  const modalVideo = document.getElementById('modal-video');
  const modalClose = document.querySelector('.modal-close');
  const overlay = document.querySelector('.modal-overlay');

  function openModal() {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    if (modalVideo) {
      modalVideo.currentTime = 0;
      modalVideo.play();
    }
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (modalVideo) {
      modalVideo.pause();
    }
  }

  // --- Seamless marquee duplicator (Desktop only) ---
  const marqueeTrack = document.getElementById('marqueeTrack');
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (marqueeTrack && !isMobile) {
    const items = Array.from(marqueeTrack.children);
    const clones = items.map(node => {
      const clone = node.cloneNode(true);
      clone.setAttribute('data-clone', 'true');
      return clone;
    });
    clones.forEach(node => marqueeTrack.appendChild(node));
  }

  // Attach open modal only to video cards that are intended as buttons
  document.querySelectorAll('.video-card[role="button"]').forEach((card) => {
    card.addEventListener('click', openModal);
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal();
      }
    });
  });
  // Close modal on overlay or close button
  modalClose?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', closeModal);
  // Close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('open')) closeModal();
  });

  /**
   * Reveal animations using IntersectionObserver
   */
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealElements.forEach((el) => revealObserver.observe(el));

  /**
   * Autoplay helper for background hero video
   */
  const bgVideo = document.getElementById('bgVideo');
  if (bgVideo) {
    const tryPlay = () => {
      const playPromise = bgVideo.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // If autoplay is blocked, start on first user interaction
          const resume = () => {
            bgVideo.play();
            cleanup();
          };
          const cleanup = () => {
            window.removeEventListener('touchstart', resume);
            window.removeEventListener('click', resume);
          };
          window.addEventListener('touchstart', resume, { once: true });
          window.addEventListener('click', resume, { once: true });
        });
      }
    };
    if (bgVideo.readyState >= 2) {
      tryPlay();
    } else {
      bgVideo.addEventListener('canplay', tryPlay, { once: true });
    }
  }

  /**
   * Smart hide/show header on scroll (with creative reveal)
   */
  (() => {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    const prefersReduced = false;
    let lastY = window.scrollY || 0;
    let hidden = false;
    let ticking = false;
    const THRESHOLD = 12;
    const TOP_LOCK = 10;
    const ANIM_OUT_MS = 320;
    const REVEAL_MS = 450;

    const clearTempClasses = () => {
      nav.classList.remove('nav--anim', 'nav--reveal');
    };

    const onScroll = () => {
      const y = window.scrollY || 0;
      if (y < TOP_LOCK) {
        if (hidden) {
          nav.classList.remove('nav--hidden');
          hidden = false;
        }
        clearTempClasses();
        lastY = y;
        ticking = false;
        return;
      }
      const delta = y - lastY;
      if (Math.abs(delta) > THRESHOLD) {
        if (delta > 0 && !hidden) {
          nav.classList.add('nav--anim');
          nav.classList.add('nav--hidden');
          hidden = true;
          setTimeout(() => nav.classList.remove('nav--anim'), ANIM_OUT_MS + 40);
        } else if (delta < 0 && hidden) {
          nav.classList.remove('nav--hidden');
          nav.classList.add('nav--reveal');
          hidden = false;
          setTimeout(() => nav.classList.remove('nav--reveal'), REVEAL_MS + 40);
        }
        lastY = y;
      }
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    }, { passive: true });
  })();

  // --- Performance: lazy-load & play-only-visible marquee videos ---
  (function () {
    const track = document.getElementById('marqueeTrack');
    if (!track) return;

    const videos = track.querySelectorAll('video.video-card');

    const loadAndPlay = (el) => {
      if (!el.src && el.dataset.src) el.src = el.dataset.src;
      const p = el.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };
    const pauseVideo = (el) => { try { el.pause(); } catch (_) {} };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        if (entry.isIntersecting) {
          loadAndPlay(el);
        } else {
          pauseVideo(el);
        }
      });
    }, { root: null, rootMargin: '200px 0px', threshold: 0.01 });

    videos.forEach(v => io.observe(v));

    // Save battery: pause all when page hidden
    document.addEventListener('visibilitychange', () => {
      videos.forEach(v => document.hidden ? pauseVideo(v) : loadAndPlay(v));
    });
  })();
});
