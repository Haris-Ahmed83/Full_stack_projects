document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const currentSectionTitle = document.getElementById('current-section-title');
    const toggleSidebarBtn = document.querySelector('.toggle-sidebar-btn');
    const sidebar = document.querySelector('.sidebar');

    // Dashboard elements
    const dashboardPostCount = document.getElementById('dashboard-post-count');
    const dashboardPublishedCount = document.getElementById('dashboard-published-count');
    const dashboardUserCount = document.getElementById('dashboard-user-count');

    // Posts section elements
    const postsListContainer = document.getElementById('posts-list-container');
    const postFormContainer = document.getElementById('post-form-container');
    const addPostBtn = document.getElementById('add-new-post-btn');
    const cancelPostBtn = document.getElementById('cancel-post-btn');
    const postForm = document.getElementById('post-form');
    const postIdInput = document.getElementById('post-id');
    const postTitleInput = document.getElementById('post-title');
    const postImageUrlInput = document.getElementById('post-image-url');
    const postContentEditor = document.getElementById('post-content'); // WYSIWYG editor area
    const postStatusSelect = document.getElementById('post-status');
    const postFormTitle = document.getElementById('post-form-title');

    // WYSIWYG toolbar buttons
    const wysiwygToolbar = document.querySelector('.wysiwyg-toolbar');

    // Media section elements
    const mediaListContainer = document.getElementById('media-list-container');

    // Users section elements
    const usersListBody = document.getElementById('users-list-body');

    // --- Data Storage (simulated backend with localStorage) ---
    let posts = [];
    let users = [];

    // Helper to save data to localStorage
    const saveData = (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    };

    // Helper to load data from localStorage or return default
    const loadData = (key, defaultData) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultData;
    };

    // Default sample data
    const defaultPosts = [
        {
            id: '1',
            title: 'Welcome to the CMS Admin Panel',
            content: '<h3>Hello, World!</h3><p>This is your first post in the Content Management System. You can edit or delete this post, or create new ones using the editor.</p><p>Explore the features like creating new posts, managing users, and the media library (simplified).</p>',
            imageUrl: 'https://picsum.photos/seed/cms1/600/400',
            status: 'published',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: '2',
            title: 'Getting Started with Your Content',
            content: '<h3>Content Creation Tips</h3><p>Remember to use clear headings, concise paragraphs, and relevant images to make your content engaging.</p><ul><li>Plan your content structure.</li><li>Use keywords for SEO.</li><li>Proofread carefully.</li></ul>',
            imageUrl: 'https://picsum.photos/seed/cms2/600/400',
            status: 'draft',
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            updatedAt: new Date(Date.now() - 86400000).toISOString()
        }
    ];

    const defaultUsers = [
        { id: 'u1', name: 'Admin User', email: 'admin@example.com', role: 'Administrator' },
        { id: 'u2', name: 'Jane Doe', email: 'jane.doe@example.com', role: 'Editor' },
        { id: 'u3', name: 'John Smith', email: 'john.smith@example.com', role: 'Author' }
    ];

    // --- Initialization ---
    const initializeData = () => {
        posts = loadData('cms_posts', defaultPosts);
        users = loadData('cms_users', defaultUsers);
        renderDashboard();
        renderPostsList();
        renderMediaList();
        renderUsersList();
    };

    // --- Navigation & UI Control ---
    const showSection = (sectionId) => {
        // Hide all sections
        contentSections.forEach(section => section.classList.remove('active'));
        // Show the target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            currentSectionTitle.textContent = targetSection.querySelector('.section-header h3') ? targetSection.querySelector('.section-header h3').textContent : sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
        }

        // Update active nav link
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Hide post form if navigating away from posts or to posts list
        if (sectionId !== 'posts' || (sectionId === 'posts' && postsListContainer.classList.contains('active'))) {
            postFormContainer.classList.add('hidden');
            postsListContainer.classList.remove('hidden');
        }

        // Close sidebar on mobile after navigation
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
    };

    // Event listeners for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.dataset.section;
            showSection(sectionId);
        });
    });

    // Toggle sidebar on mobile
    toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Hide sidebar if clicking outside when active on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('active') &&
            !sidebar.contains(e.target) && !toggleSidebarBtn.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });

    // --- Dashboard Section ---
    const renderDashboard = () => {
        dashboardPostCount.textContent = posts.length;
        dashboardPublishedCount.textContent = posts.filter(p => p.status === 'published').length;
        dashboardUserCount.textContent = users.length;
    };

    // --- Posts Section (CRUD) ---

    // Render the list of posts
    const renderPostsList = () => {
        postsListContainer.innerHTML = ''; // Clear existing posts
        if (posts.length === 0) {
            postsListContainer.innerHTML = '<p>No posts found. Click "Add New Post" to create one.</p>';
            return;
        }

        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by newest first

        posts.forEach(post => {
            const postCard = document.createElement('div');
            postCard.classList.add('card');
            postCard.innerHTML = `
                ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" class="post-thumbnail">` : ''}
                <h3>${post.title}</h3>
                <p>${post.content.substring(0, 100).replace(/<[^>]*>?/gm, '')}...</p>
                <div class="post-meta">
                    <span>Status: <strong>${post.status.charAt(0).toUpperCase() + post.status.slice(1)}</strong></span>
                    <span>Created: ${new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="post-actions">
                    <button class="btn btn-secondary edit-post-btn" data-id="${post.id}">Edit</button>
                    <button class="btn btn-danger delete-post-btn" data-id="${post.id}">Delete</button>
                </div>
            `;
            postsListContainer.appendChild(postCard);
        });

        // Attach event listeners to edit/delete buttons
        document.querySelectorAll('.edit-post-btn').forEach(button => {
            button.addEventListener('click', (e) => editPost(e.target.dataset.id));
        });
        document.querySelectorAll('.delete-post-btn').forEach(button => {
            button.addEventListener('click', (e) => deletePost(e.target.dataset.id));
        });
    };

    // Show the post creation/edit form
    const showPostForm = (post = null) => {
        postsListContainer.classList.add('hidden');
        postFormContainer.classList.remove('hidden');

        if (post) {
            // Editing existing post
            postFormTitle.textContent = 'Edit Post';
            postIdInput.value = post.id;
            postTitleInput.value = post.title;
            postImageUrlInput.value = post.imageUrl || '';
            postContentEditor.innerHTML = post.content;
            postStatusSelect.value = post.status;
        } else {
            // Creating new post
            postFormTitle.textContent = 'Create New Post';
            postForm.reset(); // Clear form fields
            postIdInput.value = '';
            postContentEditor.innerHTML = ''; // Clear WYSIWYG editor content
            postStatusSelect.value = 'draft';
        }
    };

    // Handle form submission (create or update)
    postForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = postIdInput.value;
        const title = postTitleInput.value.trim();
        const imageUrl = postImageUrlInput.value.trim();
        const content = postContentEditor.innerHTML.trim(); // Get rich text content
        const status = postStatusSelect.value;

        if (!title || !content) {
            alert('Title and content are required!');
            return;
        }

        if (id) {
            // Update existing post
            const postIndex = posts.findIndex(p => p.id === id);
            if (postIndex > -1) {
                posts[postIndex] = {
                    ...posts[postIndex],
                    title,
                    imageUrl,
                    content,
                    status,
                    updatedAt: new Date().toISOString()
                };
                alert('Post updated successfully!');
            }
        } else {
            // Create new post
            const newPost = {
                id: Date.now().toString(), // Simple unique ID
                title,
                imageUrl,
                content,
                status,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            posts.push(newPost);
            alert('Post created successfully!');
        }

        saveData('cms_posts', posts);
        renderPostsList();
        renderDashboard(); // Update dashboard counts
        postFormContainer.classList.add('hidden'); // Hide form
        postsListContainer.classList.remove('hidden'); // Show list
    });

    // Event listeners for post actions
    addPostBtn.addEventListener('click', () => showPostForm());
    cancelPostBtn.addEventListener('click', () => {
        postFormContainer.classList.add('hidden');
        postsListContainer.classList.remove('hidden');
    });

    const editPost = (id) => {
        const postToEdit = posts.find(p => p.id === id);
        if (postToEdit) {
            showPostForm(postToEdit);
        }
    };

    const deletePost = (id) => {
        if (confirm('Are you sure you want to delete this post?')) {
            posts = posts.filter(p => p.id !== id);
            saveData('cms_posts', posts);
            renderPostsList();
            renderDashboard(); // Update dashboard counts
            alert('Post deleted successfully!');
        }
    };

    // --- WYSIWYG Editor Functionality ---
    wysiwygToolbar.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const command = button.dataset.command;
        if (!command) return;

        // Ensure the editable area is focused for execCommand to work
        postContentEditor.focus();

        switch (command) {
            case 'createLink':
                const url = prompt('Enter the URL:');
                if (url) {
                    document.execCommand(command, false, url);
                }
                break;
            case 'h1':
                document.execCommand('formatBlock', false, '<h1>');
                break;
            case 'h2':
                document.execCommand('formatBlock', false, '<h2>');
                break;
            default:
                document.execCommand(command, false, null);
                break;
        }
    });

    // --- Media Library Section ---
    const renderMediaList = () => {
        mediaListContainer.innerHTML = '';
        const uniqueImageUrls = new Set();
        posts.forEach(post => {
            if (post.imageUrl) {
                uniqueImageUrls.add(post.imageUrl);
            }
            // Also extract images from content if any
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = post.content;
            tempDiv.querySelectorAll('img').forEach(img => {
                if (img.src) uniqueImageUrls.add(img.src);
            });
        });

        if (uniqueImageUrls.size === 0) {
            mediaListContainer.innerHTML = '<p>No images found in posts yet. Add an image URL to a post to see it here.</p>';
            return;
        }

        uniqueImageUrls.forEach(url => {
            const mediaCard = document.createElement('div');
            mediaCard.classList.add('card');
            mediaCard.innerHTML = `
                <img src="${url}" alt="Media item" class="post-thumbnail">
                <p>${url.split('/').pop()}</p>
                <div class="post-actions">
                    <button class="btn btn-secondary" onclick="navigator.clipboard.writeText('${url}')">Copy URL</button>
                </div>
            `;
            mediaListContainer.appendChild(mediaCard);
        });
    };

    // --- User Management Section ---
    const renderUsersList = () => {
        usersListBody.innerHTML = ''; // Clear existing users
        if (users.length === 0) {
            usersListBody.innerHTML = '<tr><td colspan="5">No users found.</td></tr>';
            return;
        }

        users.forEach(user => {
            const userRow = document.createElement('tr');
            userRow.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td class="action-buttons">
                    <button class="btn btn-secondary btn-sm" data-id="${user.id}">Edit</button>
                    <button class="btn btn-danger btn-sm" data-id="${user.id}">Delete</button>
                </td>
            `;
            usersListBody.appendChild(userRow);
        });

        // Note: Edit/Delete for users are placeholders in this simplified version
        document.querySelectorAll('#users-list-body .btn-secondary').forEach(button => {
            button.addEventListener('click', (e) => alert(`Editing user: ${e.target.dataset.id}`));
        });
        document.querySelectorAll('#users-list-body .btn-danger').forEach(button => {
            button.addEventListener('click', (e) => {
                if (confirm(`Are you sure you want to delete user: ${e.target.dataset.id}?`)) {
                    users = users.filter(u => u.id !== e.target.dataset.id);
                    saveData('cms_users', users);
                    renderUsersList();
                    renderDashboard();
                    alert('User deleted (simulated)!');
                }
            });
        });
    };

    // --- Initial Load ---
    initializeData();
    showSection('dashboard'); // Default view on load
});
