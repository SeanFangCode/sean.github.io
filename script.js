// Cloudflare image resizing only exists on the live domain. When testing
// locally (e.g. VS Code Live Server), fall back to the original files.
const USE_CF_IMAGES = /(^|\.)seanfang\.xyz$/.test(location.hostname);

// Cloudflare Image Transformation helper
function getCfImageUrl(originalPath, width) {
    if (!USE_CF_IMAGES) return originalPath;
    return `/cdn-cgi/image/width=${width},quality=80,format=auto/${originalPath}`;
}

// Turns a hardcoded /cdn-cgi/image/<options>/path URL back into /path
function stripCfUrl(url) {
    return url.replace(/\/cdn-cgi\/image\/[^/]+\//g, '/');
}

// Rewrite the hardcoded Cloudflare URLs in index.html and styles.css for local testing
function useOriginalImagesLocally() {
    if (USE_CF_IMAGES) return;
    document.querySelectorAll('img[src*="/cdn-cgi/image/"]').forEach(img => {
        img.removeAttribute('srcset');
        img.src = stripCfUrl(img.getAttribute('src'));
    });
    document.querySelectorAll('.card').forEach(card => {
        card.style.backgroundImage = stripCfUrl(getComputedStyle(card).backgroundImage);
    });
}
useOriginalImagesLocally();

const THUMB_WIDTHS = [400, 600, 800, 1200, 1600];

// Give each image a responsive srcset so the browser downloads a thumbnail
// sized to its rendered width instead of the full-resolution file.
function updateImageUrls() {
    document.querySelectorAll('img[data-cf-src]:not([srcset])').forEach(img => {
        const originalPath = img.getAttribute('data-cf-src');
        if (!USE_CF_IMAGES) {
            img.src = originalPath;
            img.srcset = originalPath; // marks the image as handled
            return;
        }
        img.sizes = img.id === 'about-pic'
            ? '20rem'
            : '(min-width: 993px) 33vw, 50vw';
        img.srcset = THUMB_WIDTHS
            .map(w => `${getCfImageUrl(originalPath, w)} ${w}w`)
            .join(', ');
        img.src = getCfImageUrl(originalPath, 800);
    });
}

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
            useOriginalImagesLocally();

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

    // iOS goes fullscreen when play() is called unless these are set
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('webkit-playsinline', '');

    let playPending = false;
    const tryPlay = () => {
        if (playPending) return;
        const p = video.play();
        if (!p) return;
        playPending = true;
        // Rejected plays (e.g. iOS Low Power Mode) are retried on the next tick or tap
        p.catch(() => {}).finally(() => { playPending = false; });
    };

    // iOS allows playback after a tap even when autoplay is blocked
    document.addEventListener('touchend', tryPlay, { once: true, passive: true });

    setInterval(() => {
        const currentTime = performance.now() % animationDuration; // Current time in the animation loop

        if (currentTime <= videoDuration) {
            // Play the video during the first 30 seconds
            if (video.paused) tryPlay();
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

function openLightbox(imgElement) {
    const modal = document.getElementById('lightbox-modal');
    const lightboxImage = modal.querySelector('.lightbox-image');
    const originalPath = imgElement.getAttribute('data-cf-src');

    // Show the already-loaded thumbnail instantly, then swap in a larger version
    lightboxImage.src = imgElement.currentSrc || imgElement.src;
    const w = Number(imgElement.getAttribute('width')) || imgElement.naturalWidth || 1;
    const h = Number(imgElement.getAttribute('height')) || imgElement.naturalHeight || 1;
    const target = Math.ceil(Math.max(window.innerWidth, window.innerHeight) * Math.min(window.devicePixelRatio || 1, 2));
    const fullWidth = Math.min(h > w ? Math.round(target * w / h) : target, 2400);
    const full = new Image();
    full.onload = () => {
        if (modal.classList.contains('active')) lightboxImage.src = full.src;
    };
    full.src = getCfImageUrl(originalPath, fullWidth);

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
    
    // One delegated listener covers images loaded later via fetch
    document.addEventListener('click', (e) => {
        const img = e.target.closest('.masonry-img, #about-pic');
        if (img) openLightbox(img);
    });
});

// Start the cycle
updateCoordinates();
