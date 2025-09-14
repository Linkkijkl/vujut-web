// Sponsor layout
let sponsors = new Masonry( ".sponsors .masonry", {
    columnWidth: ".grid-sizer",
    gutter: ".gutter-sizer",
    itemSelector: ".sponsor",
    percentPosition: true,
});

// Reload masonry after images load fully
let debounceTimeout = null;
const DEBOUNCE_TIME = 200;
for (const sponsor of document.querySelectorAll('.sponsors img')) {
    sponsor.addEventListener('load', () => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        debounceTimeout = setTimeout(() => {
            sponsors.layout();
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
