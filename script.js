// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  /**
   * Mobile navigation toggle
   */
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  hamburger?.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true' || false;
    hamburger.setAttribute('aria-expanded', !expanded);
    navLinks.classList.toggle('open');
  });

  /**
   * Video modal logic
   */
  const modal = document.getElementById('video-modal');
  const modalVideo = document.getElementById('modal-video');
  const modalClose = document.querySelector('.modal-close');
  const overlay = document.querySelector('.modal-overlay');

  // Function to open modal
  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    // Play the video from the start when opened
    if (modalVideo) {
      modalVideo.currentTime = 0;
      modalVideo.play();
    }
  }
  // Function to close modal
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (modalVideo) {
      modalVideo.pause();
    }
  }

  // Open modal when hero showreel trigger is clicked
  const heroTrigger = document.querySelector('.showreel-trigger');
  heroTrigger?.addEventListener('click', openModal);

  // Open modal when clicking any video card
  document.querySelectorAll('.video-card').forEach(card => {
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

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  /**
   * Reveal animations on scroll using IntersectionObserver
   */
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
  });
  revealElements.forEach(el => revealObserver.observe(el));
});