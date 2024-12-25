document.addEventListener('DOMContentLoaded', function() {
    // Fetch the external HTML file content
    fetch('section-body.html')
        .then(response => response.text())
        .then(data => {
            // Insert the fetched content into the section-body div
            document.querySelector('.section-body').innerHTML = data;
        })
        .catch(error => console.error('Error loading content:', error));
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
    { lat: 53.2548, lng: 23.4781 }, // Coordinate 1
    { lat: 41.1736, lng: -73.0998 }, // Coordinate 2
    { lat: 41.2491, lng: -72.5436 }  // Coordinate 3
];

const percentageTimings = [
    { range: [0, 16], hold: true },   // Hold Coordinate 1
    { range: [16, 32], hold: false }, // Transition to Coordinate 2
    { range: [32, 48], hold: true },  // Hold Coordinate 2
    { range: [48, 64], hold: false }, // Transition to Coordinate 3
    { range: [64, 80], hold: true },  // Hold Coordinate 3
    { range: [80, 100], hold: false } // Transition back to Coordinate 1
];

const totalDuration = 20000; // 20 seconds
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

        const steps = 25; // Increase for smoother transitions
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