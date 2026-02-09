// Collaborator layout
let collaborators = new Masonry( ".collaborators .masonry", {
    columnWidth: ".grid-sizer",
    gutter: ".gutter-sizer",
    itemSelector: ".collaborator",
    percentPosition: true,
});

// Reload masonry after images load fully
let debounceTimeout = null;
const DEBOUNCE_TIME = 200;
for (const collaborator of document.querySelectorAll('.collaborators img')) {
    collaborator.addEventListener('load', () => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        debounceTimeout = setTimeout(() => {
            collaborators.layout();
        }, DEBOUNCE_TIME);
    }, {once: true});
}

// Set scroll offset based on height of navbar
window.addEventListener('load', () => {
    // Get navbar height
    let navbar = document.querySelector('.navbar');
    let bottomLocation = navbar.getBoundingClientRect().bottom;

    // Set scroll offset
    document.styleSheets[0].insertRule(`:target { scroll-margin-top: ${bottomLocation}px; }`);
});

// Set ticket sales button behaviour
window.addEventListener('load', () => {
    document.querySelector('#sales-button')?.addEventListener('click', (e) => {
        const location = e.target.getAttribute('data-href');
        if (location != '') {
            window.open(location);
        }
    });
})