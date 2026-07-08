document.addEventListener('DOMContentLoaded', () => {
    // Select all post elements on the page
    const posts = document.querySelectorAll('.post');

    posts.forEach(post => {
        // --- Like Button Functionality ---
        const likeButton = post.querySelector('.like-button');
        const likeIcon = likeButton ? likeButton.querySelector('i') : null; // Assumes a FontAwesome icon
        const likesCountSpan = post.querySelector('.likes-count span');
        let currentLikes = parseInt(likesCountSpan ? likesCountSpan.textContent : '0');

        if (likeButton && likeIcon && likesCountSpan) {
            likeButton.addEventListener('click', () => {
                if (likeIcon.classList.contains('far')) { // Currently not liked (outline heart)
                    likeIcon.classList.remove('far');
                    likeIcon.classList.add('fas', 'liked'); // Solid heart, add 'liked' class for styling (e
