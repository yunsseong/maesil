import './style.css'
import i18n from './i18n.js'

// Initialize i18n and app
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize i18n first
  await i18n.init();

  // Language switch button
  const langSwitch = document.querySelector('.lang-switch');
  if (langSwitch) {
    langSwitch.addEventListener('click', () => {
      i18n.toggle();
    });
  }
});

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
      observer.unobserve(entry.target); // Only animate once
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  const revealElements = document.querySelectorAll('.scroll-reveal');
  revealElements.forEach(el => observer.observe(el));

  // Product Carousel
  const track = document.querySelector('.carousel-track');
  const slides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.querySelector('.carousel-arrow-prev');
  const nextBtn = document.querySelector('.carousel-arrow-next');
  const dots = document.querySelectorAll('.carousel-dot');

  let currentIndex = 0;
  const totalSlides = slides.length;

  function updateCarousel() {
    const gap = 40; // matches CSS gap
    const slideWidth = track.parentElement.offsetWidth;
    const offset = currentIndex * (slideWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });

    // Update button states
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === totalSlides - 1;
  }

  function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    currentIndex = index;
    updateCarousel();
  }

  prevBtn.addEventListener('click', () => {
    goToSlide(currentIndex - 1);
  });

  nextBtn.addEventListener('click', () => {
    goToSlide(currentIndex + 1);
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
    });
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
        // Swipe left - go next
        goToSlide(currentIndex + 1);
      } else {
        // Swipe right - go prev
        goToSlide(currentIndex - 1);
      }
    }
  }

  // Handle resize
  window.addEventListener('resize', updateCarousel);

  // Initialize
  updateCarousel();
});
