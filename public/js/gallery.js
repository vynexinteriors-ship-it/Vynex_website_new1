// Gallery Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  
  let currentImageIndex = 0;
  let filteredItems = Array.from(galleryItems);

  // Filter functionality
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const filterValue = this.getAttribute('data-filter');

      // Filter items
      filteredItems = Array.from(galleryItems).filter(item => {
        if (filterValue === 'all') {
          return true;
        }
        const itemCategory = item.getAttribute('data-category');
        return itemCategory.includes(filterValue);
      });

      galleryItems.forEach(item => {
        if (filteredItems.includes(item)) {
          item.style.display = 'block';
          setTimeout(() => item.style.opacity = '1', 10);
        } else {
          item.style.opacity = '0';
          setTimeout(() => item.style.display = 'none', 300);
        }
      });
    });
  });

  // Gallery item click - open lightbox
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', function() {
      if (this.style.display !== 'none') {
        const img = this.querySelector('.gallery-item-image');
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt;
        lightbox.classList.add('show');
        currentImageIndex = Array.from(galleryItems).indexOf(this);
      }
    });
  });

  // Close lightbox
  lightboxClose.addEventListener('click', function() {
    lightbox.classList.remove('show');
  });

  // Lightbox background click
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) {
      lightbox.classList.remove('show');
    }
  });

  // Navigate previous image
  lightboxPrev.addEventListener('click', function() {
    if (filteredItems.length === 0) return;
    
    let currentIndex = filteredItems.findIndex(item => 
      item.querySelector('.gallery-item-image').src === lightboxImage.src
    );
    
    currentIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    const prevImg = filteredItems[currentIndex].querySelector('.gallery-item-image');
    lightboxImage.src = prevImg.src;
    lightboxImage.alt = prevImg.alt;
  });

  // Navigate next image
  lightboxNext.addEventListener('click', function() {
    if (filteredItems.length === 0) return;
    
    let currentIndex = filteredItems.findIndex(item => 
      item.querySelector('.gallery-item-image').src === lightboxImage.src
    );
    
    currentIndex = (currentIndex + 1) % filteredItems.length;
    const nextImg = filteredItems[currentIndex].querySelector('.gallery-item-image');
    lightboxImage.src = nextImg.src;
    lightboxImage.alt = nextImg.alt;
  });

  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('show')) return;

    if (e.key === 'ArrowLeft') {
      lightboxPrev.click();
    } else if (e.key === 'ArrowRight') {
      lightboxNext.click();
    } else if (e.key === 'Escape') {
      lightbox.classList.remove('show');
    }
  });
});
