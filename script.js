(() => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#main-nav');
  const navigationLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
  const backToTop = document.querySelector('.back-to-top');
  const revealTargets = document.querySelectorAll('.about, .services, .adoption-feature, .adoption-steps, .prevention .section-heading, .disease-card, .vaccine-callout, .news .section-heading, .news-card, .site-footer');
  let activeScrollFrame = null;

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
    link.addEventListener('click', event => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        event.preventDefault();
        const scrollOffset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - scrollOffset;
        if (activeScrollFrame !== null) cancelAnimationFrame(activeScrollFrame);

        const startPosition = window.scrollY;
        const distance = Math.max(0, targetPosition) - startPosition;
        const duration = Math.min(1800, Math.max(1000, Math.abs(distance) * .3));
        let startTime = null;

        const animateScroll = timestamp => {
          if (startTime === null) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          const easedProgress = .5 - Math.cos(Math.PI * progress) / 2;
          window.scrollTo(0, startPosition + distance * easedProgress);

          if (progress < 1) {
            activeScrollFrame = requestAnimationFrame(animateScroll);
          } else {
            activeScrollFrame = null;
          }
        };

        activeScrollFrame = requestAnimationFrame(animateScroll);
        history.pushState(null, '', link.getAttribute('href'));
      }
      closeMenu();
    });
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

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach(target => target.classList.add('is-revealed'));
  } else {
    revealTargets.forEach(target => target.classList.add('reveal-on-scroll'));
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -4% 0px', threshold: 0 });

    const revealVisibleTargets = () => {
      revealTargets.forEach(target => {
        const bounds = target.getBoundingClientRect();
        if (bounds.top < window.innerHeight * .96 && bounds.bottom > 0) {
          target.classList.add('is-revealed');
          revealObserver.unobserve(target);
        }
      });
    };

    revealTargets.forEach(target => revealObserver.observe(target));
    revealVisibleTargets();
    window.addEventListener('scroll', revealVisibleTargets, { passive: true });
  }

  function updateBackToTop() {
    backToTop?.classList.toggle('is-visible', window.scrollY > 500);
  }

  window.addEventListener('scroll', updateBackToTop, { passive: true });
  updateBackToTop();
})();
