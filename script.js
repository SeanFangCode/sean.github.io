document.addEventListener('DOMContentLoaded', function () {
    // Fetch the external HTML file content
    fetch('section-body.html')
        .then(response => response.text())
        .then(data => {
            // Insert the fetched content into the section-body div
            const sectionBody = document.querySelector('.section-body');
            sectionBody.innerHTML = data;

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

// Start the cycle
updateCoordinates();
