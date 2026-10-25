/**
 * SaqyFly Carousel Component
 * Supports both Image and Video slides, Touch Swipe, Keyboard, Controls & Auto-Pause
 */

document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');
  const counter = document.getElementById('carouselCounter');

  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.carousel-slide'));
  let currentIndex = 0;
  const totalSlides = slides.length;

  // Create indicator dots
  dotsContainer.innerHTML = '';
  slides.forEach((_, idx) => {
    const dot = document.createElement('button');
    dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
    dot.addEventListener('click', () => goToSlide(idx));
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.querySelectorAll('.carousel-dot'));

  function pauseAllVideos() {
    slides.forEach(slide => {
      const vid = slide.querySelector('video');
      if (vid && !vid.paused) {
        vid.pause();
      }
    });
  }

  function updateSlide() {
    pauseAllVideos();
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
    if (counter) {
      counter.textContent = `${currentIndex + 1} / ${totalSlides}`;
    }
  }

  function goToSlide(index) {
    currentIndex = (index + totalSlides) % totalSlides;
    updateSlide();
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const carousel = document.getElementById('carousel');
    if (!carousel) return;
    const rect = carousel.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowLeft') {
      goToSlide(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      goToSlide(currentIndex + 1);
    }
  });

  // Mobile Touch Swipe
  let startX = 0;
  let endX = 0;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    endX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', () => {
    const diff = startX - endX;
    if (Math.abs(diff) > 40 && endX !== 0) {
      if (diff > 0) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(currentIndex - 1);
      }
    }
    startX = 0;
    endX = 0;
  });

  updateSlide();
});