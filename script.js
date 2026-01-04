// Cloudflare Image Transformation helper
function getCfImageUrl(originalPath, isPortrait = false) {
    const isMobile = window.innerWidth < 768;
    const size = isMobile ? 640 : 1920;
    const dimension = isPortrait ? `height=${size}` : `width=${size}`;
    return `/cdn-cgi/image/${dimension},quality=80,format=webp/${originalPath}`;
}

// Update image URLs dynamically based on viewport and orientation
function updateImageUrls() {
    document.querySelectorAll('img[data-cf-src]').forEach(img => {
        const originalPath = img.getAttribute('data-cf-src');
        let isPortrait = img.getAttribute('data-portrait') === 'true';
        
        // If not explicitly marked, detect orientation after image loads
        if (!img.hasAttribute('data-portrait') && !img.hasAttribute('data-cf-checked')) {
            const detectOrientation = function() {
                // Only run orientation detection once
                if (this.hasAttribute('data-cf-checked')) return;
                
                const aspectRatio = this.naturalWidth / this.naturalHeight;
                if (aspectRatio < 1) { // Height > Width = portrait
                    this.setAttribute('data-portrait', 'true');
                    this.setAttribute('data-cf-checked', 'true');
                    this.src = getCfImageUrl(originalPath, true);
                } else {
                    this.setAttribute('data-portrait', 'false');
                    this.setAttribute('data-cf-checked', 'true');
                    this.src = getCfImageUrl(originalPath, false);
                }
            };
            
            // If image is already loaded, detect immediately
            if (img.complete && img.naturalWidth > 0) {
                detectOrientation.call(img);
            } else {
                // Otherwise, wait for load
                img.onload = detectOrientation;
                // Set initial URL with landscape assumption
                img.src = getCfImageUrl(originalPath, false);
            }
        } else {
            // Image already has data-portrait attribute (either detected or explicit)
            img.src = getCfImageUrl(originalPath, isPortrait);
        }
    });
    
    // Initialize lightbox listeners for all clickable images
    initLightboxListeners();
}

// Set images immediately (before DOMContentLoaded) for faster loading
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateImageUrls);
} else {
    updateImageUrls();
}

// Handle window resize with debounce
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateImageUrls, 250);
});

document.addEventListener('DOMContentLoaded', function () {
    // Fetch the external HTML file content
    fetch('section-body.html')
        .then(response => response.text())
        .then(data => {
            // Insert the fetched content into the section-body div
            const sectionBody = document.querySelector('.section-body');
            sectionBody.innerHTML = data;

            // Update image URLs after content is loaded
            updateImageUrls();

            // Dispatch a custom event to indicate content is loaded
            const contentLoadedEvent = new Event('contentLoaded');
            sectionBody.dispatchEvent(contentLoadedEvent);
        })
        .catch(error => console.error('Error loading content:', error));
});
document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById("background-video");
    const animationDuration = 47000; // Total animation duration in milliseconds
    const videoDuration = 30000; // Video duration in milliseconds

    setInterval(() => {
        const currentTime = performance.now() % animationDuration; // Current time in the animation loop

        if (currentTime <= videoDuration) {
            // Play the video during the first 30 seconds
            if (video.paused) video.play();
        } else {
            // Pause the video during the remaining 17 seconds
            if (!video.paused) video.pause();
        }

        // Reset the video at the start of the animation loop
        if (currentTime < 100) {
            video.currentTime = 0;
        }
    }, 100); // Check and sync every 100ms
});


function loadSection(event) {
    event.preventDefault(); // Prevent the default link behavior

    // Get the section URL from the data-section attribute
    const sectionUrl = event.target.getAttribute('data-section');

    // Fetch the content from the section URL
    fetch(sectionUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            // Insert the fetched content into the content container
            document.getElementById('section-body').innerHTML = data;
            
            // Update image URLs after new content is loaded
            updateImageUrls();
        })
        .catch(error => {
            console.error('Error loading section:', error);
        });
}
// Menu
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');

burger.addEventListener('click', () => {
    const isActive = menu.classList.toggle('active');
    burger.checked = isActive;
});

// Close menu when clicking a link
const menuLinks = document.querySelectorAll('.menu a');
menuLinks.forEach(link => {
    link.addEventListener('click', () => {
        burger.checked = false;
        menu.classList.remove('active');
    });
});

window.addEventListener('scroll', () => {
    burger.checked = false;
    menu.classList.remove('active');
});

const coordinates = [
    { lat: 41.8375, lng: -72.7891 }, // Coordinate 1
    { lat: 53.2548, lng: 23.4781 }, // Coordinate 2
    { lat: 41.1736, lng: -73.0998 }, // Coordinate 3
    { lat: 41.2491, lng: -72.5436 }  // Coordinate 4
];

const percentageTimings = [
    { range: [0, 63.60], hold: true },      // Hold at 30s
    { range: [63.60, 68.09], hold: false }, // Transition (2s)
    { range: [68.09, 74.47], hold: true },  // Hold (3s)
    { range: [74.47, 78.72], hold: false }, // Transition (2s)
    { range: [78.72, 85.11], hold: true },  // Hold (3s)
    { range: [85.11, 89.36], hold: false }, // Transition (2s)
    { range: [89.36, 95.74], hold: true },  // Hold (3s)
    { range: [95.74, 100.00], hold: false } // Transition (2s)
];
const totalDuration = 47000; // 20 seconds
const subtextElement = document.querySelector('.subtext');
let currentPhaseIndex = 0; // Tracks which phase (hold or transition) we're in

function updateCoordinates() {
    const phase = percentageTimings[currentPhaseIndex];
    const [startPercent, endPercent] = phase.range;

    // Calculate phase duration
    const phaseDuration = ((endPercent - startPercent) / 100) * totalDuration;

    if (phase.hold) {
        // Hold the current coordinate
        const currentIndex = Math.floor(currentPhaseIndex / 2) % coordinates.length; // Use integer division to map phases to coordinates
        const currentCoord = coordinates[currentIndex];
        subtextElement.textContent = `${currentCoord.lat.toFixed(4)}°, ${currentCoord.lng.toFixed(4)}°`;
    } else {
        // Transition to the next coordinate
        const currentIndex = Math.floor(currentPhaseIndex / 2) % coordinates.length;
        const nextIndex = (currentIndex + 1) % coordinates.length;
        const startCoord = coordinates[currentIndex];
        const nextCoord = coordinates[nextIndex];

        const steps = 15; // Increase for smoother transitions
        const interval = phaseDuration / steps;
        let step = 0;

        function count() {
            const progress = step / steps;
            const lat = startCoord.lat + (nextCoord.lat - startCoord.lat) * progress;
            const lng = startCoord.lng + (nextCoord.lng - startCoord.lng) * progress;

            subtextElement.textContent = `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
            step++;
            if (step <= steps) {
                setTimeout(count, interval);
            }
        }

        count();
    }

    // Schedule the next phase AFTER the current phase completes
    setTimeout(() => {
        currentPhaseIndex = (currentPhaseIndex + 1) % percentageTimings.length; // Increment phase index
        updateCoordinates();
    }, phaseDuration);
}

// ==================== LIGHTBOX FUNCTIONALITY ====================

function initLightboxListeners() {
    // Get all clickable images (masonry images and about pictures, but not background images)
    const clickableImages = Array.from(document.querySelectorAll('.masonry-img, #about-pic'));
    
    // Remove duplicate listeners by clearing and re-adding
    clickableImages.forEach((img, index) => {
        // Remove old listener if exists
        const newImg = img.cloneNode(true);
        img.parentNode.replaceChild(newImg, img);
        
        // Add click listener
        newImg.addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox(newImg);
        });
    });
}

function openLightbox(imgElement) {
    const modal = document.getElementById('lightbox-modal');
    const lightboxImage = modal.querySelector('.lightbox-image');
    const originalPath = imgElement.getAttribute('data-cf-src');
    
    // Determine if portrait - check data attribute first, then detect from image
    let isPortrait = imgElement.getAttribute('data-portrait') === 'true';
    
    // If not explicitly marked, detect from the actual image dimensions
    if (!imgElement.hasAttribute('data-portrait') && imgElement.complete && imgElement.naturalWidth > 0) {
        const aspectRatio = imgElement.naturalWidth / imgElement.naturalHeight;
        isPortrait = aspectRatio < 1; // Height > Width = portrait
    }
    
    // Use the same URL as the masonry images (with Cloudflare resizing)
    const imageUrl = getCfImageUrl(originalPath, isPortrait);
    lightboxImage.src = imageUrl;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Lightbox event listeners
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('lightbox-modal');
    const closeBtn = document.querySelector('.lightbox-close');
    
    // Close lightbox
    closeBtn.addEventListener('click', closeLightbox);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeLightbox();
    });
    
    // Keyboard navigation (only ESC to close)
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeLightbox();
    });
    
    // Initialize lightbox for initial content
    initLightboxListeners();
});

// Start the cycle
updateCoordinates();
