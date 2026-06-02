const scrollToTopBtn = document.getElementById('scrollToTopBtn');

// The element to observe. When this element is no longer intersecting the viewport,
// it means the user has scrolled down past the initial view.
// We'll use the document.body as our sentinel.
const topOfPageSentinel = document.body;

if (scrollToTopBtn && topOfPageSentinel
