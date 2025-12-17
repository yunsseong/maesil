import './style.css'
import i18n from './i18n.js'

// Font loading detection
document.fonts.ready.then(() => {
  document.body.classList.add('fonts-loaded');
});

// Fallback: show content after 2 seconds even if fonts fail to load
setTimeout(() => {
  document.body.classList.add('fonts-loaded');
}, 2000);

// Scroll Reveal Animation
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Initialize everything on DOMContentLoaded (consolidated)
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize i18n first
    await i18n.init();

    // Language select dropdown
    const langSelect = document.querySelector('.lang-select');
    if (langSelect) {
      langSelect.value = i18n.currentLang;
      langSelect.addEventListener('change', (e) => {
        i18n.switchLang(e.target.value);
      });
    }

    // Scroll reveal elements
    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => observer.observe(el));

    // Product Carousel
    initCarousel();

  } catch (error) {
    console.error('앱 초기화 중 오류 발생:', error);
  }
});

// Carousel initialization (with error handling)
function initCarousel() {
  try {
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.carousel-arrow-prev');
    const nextBtn = document.querySelector('.carousel-arrow-next');
    const dots = document.querySelectorAll('.carousel-dot');

    if (!track || !slides.length || !prevBtn || !nextBtn) {
      return; // Carousel elements not found, skip initialization
    }

    let currentIndex = 0;
    const totalSlides = slides.length;

    function updateCarousel() {
      const gap = 40;
      const slideWidth = track.parentElement.offsetWidth;
      const offset = currentIndex * (slideWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;

      slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentIndex);
      });

      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });

      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === totalSlides - 1;
    }

    function goToSlide(index) {
      if (index < 0 || index >= totalSlides) return;
      currentIndex = index;
      updateCarousel();
    }

    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => goToSlide(index));
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        goToSlide(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        goToSlide(currentIndex + 1);
      }
    });

    // Touch/Swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(currentIndex - 1);
        }
      }
    }

    // Handle resize
    window.addEventListener('resize', updateCarousel);

    // Initialize
    updateCarousel();

  } catch (error) {
    console.error('캐러셀 초기화 중 오류 발생:', error);
  }
}
