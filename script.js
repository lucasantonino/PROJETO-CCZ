(() => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#main-nav');
  const navigationLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
  const backToTop = document.querySelector('.back-to-top');

  function closeMenu({ restoreFocus = false } = {}) {
    if (!menuToggle || !navigation) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
    navigation.classList.remove('is-open');
    if (restoreFocus) menuToggle.focus();
  }

  menuToggle?.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isExpanded));
    menuToggle.setAttribute('aria-label', isExpanded ? 'Abrir menu' : 'Fechar menu');
    navigation?.classList.toggle('is-open', !isExpanded);
  });

  navigationLinks.forEach(link => {
    link.addEventListener('click', () => closeMenu());
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
      closeMenu({ restoreFocus: true });
    }
  });

  const observedSections = navigationLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(section => section instanceof HTMLElement);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;

      navigationLinks.forEach(link => {
        if (link.getAttribute('href') === `#${visible.target.id}`) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-24% 0px -62% 0px', threshold: [0, .1, .25, .5] });

    observedSections.forEach(section => observer.observe(section));
  }

  function updateBackToTop() {
    backToTop?.classList.toggle('is-visible', window.scrollY > 500);
  }

  window.addEventListener('scroll', updateBackToTop, { passive: true });
  updateBackToTop();
})();
