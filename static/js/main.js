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
            sponsors.masonry();
        }, DEBOUNCE_TIME);
    }, {once: true});
}
