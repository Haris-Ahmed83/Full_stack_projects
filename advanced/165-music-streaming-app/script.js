document.addEventListener('DOMContentLoaded', () => {
    // --- Sample Data --- 
    const tracks = [
        { id: 't1', title: 'Acoustic Breeze', artist: 'Zenith Waves', album: 'Morning Calm', duration: '3:45', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover: 'https://picsum.photos/id/100/600/600' },
        { id: 't2', title: 'City Lights', artist: 'Urban Echoes', album: 'Neon Dreams', duration: '4:10', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover: 'https://picsum.photos/id/101/600/600' },
        { id: 't3', title: 'Forest Whisper', artist: 'Nature Sounds Co.', album: 'Deep Woods', duration: '2:55', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', cover: 'https://picsum.photos/id/102/600/600' },
        { id: 't4', title: 'Retro Groove', artist: 'Funkadelic Duo', album: '80s Rewind', duration: '3:30', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', cover: 'https://picsum.photos/id/103/600/600' },
        { id: 't5', title: 'Starry Night', artist: 'Cosmic Harmonies', album: 'Galactic Melodies', duration: '5:00', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', cover: 'https://picsum.photos/id/104/600/600' },
        { id: 't6', title: 'Rainy Day Lullaby', artist: 'Cloudy Dreams', album: 'Ambient Moods', duration: '4:20', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', cover: 'https://picsum.photos/id/105/600/600' },
        { id: 't7', title: 'Sunny Morning', artist: 'Good Vibes Only', album: 'Positive Jams', duration: '3:15', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', cover: 'https://picsum.photos/id/106/600/600' },
        { id: 't8', title: 'Mystic Journey', artist: 'Ancient Rhythms', album: 'World Fusion', duration: '6:00', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', cover: 'https://picsum.photos/id/107/600/600' },
    ];

    const playlists = [
        { id: 'p1', name: 'Chill Mix', trackIds: ['t1', 't3', 't6'] },
        { id: 'p2', name: 'Upbeat Anthems', trackIds: ['t2', 't4', 't7'] },
        { id: 'p3', name: 'Focus & Study', trackIds: ['t1', 't3', 't5', 't6'] },
    ];

    // --- Global State --- 
    const audio = new Audio();
    let currentTrackIndex = -1;
    let currentQueue = []; // Array of track objects for the current playback queue
    let isPlaying = false;
    let currentVolume = 0.7; // Default volume
    let lastVolume = 0.7; // To store volume before muting

    // --- DOM Elements --- 
    const appContainer = document.querySelector('.app-container');
    const playPauseButton = document.getElementById('play-pause-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeMuteButton = document.getElementById('volume-mute-button');
    const volumeMaxButton = document.getElementById('volume-max-button');
    const progressSlider = document.getElementById('progress-slider');
    const currentTimeSpan = document.getElementById('current-time');
    const durationSpan = document.getElementById('duration');
    const playerCover = document.getElementById('player-cover');
    const playerTitle = document.getElementById('player-title');
    const playerArtist = document.getElementById('player-artist');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const playlistsList = document.getElementById('playlists-list');
    const currentQueueList = document.getElementById('current-queue-list');

    const views = document.querySelectorAll('.view');
    const navItems = document.querySelectorAll('.nav-item');
    const exploreTracksList = document.getElementById('explore-tracks-list');
    const allTracksList = document.getElementById('all-tracks-list');
    const searchResultsList = document.getElementById('search-results-list');
    const playlistDetailView = document.getElementById('playlist-detail-view');
    const playlistDetailTitle = document.getElementById('playlist-detail-title');
    const playlistDetailTracks = document.getElementById('playlist-detail-tracks');

    // --- Utility Functions --- 
    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    function getTrackById(id) {
        return tracks.find(track => track.id === id);
    }

    function switchView(viewId) {
        // Hide all views
        views.forEach(view => view.classList.remove('active'));
        // Show the selected view
        document.getElementById(viewId).classList.add('active');

        // Update active navigation item
        navItems.forEach(item => item.classList.remove('active'));
        const activeNavItem = document.querySelector(`.nav-item[data-view="${viewId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    }

    function renderTracks(container, tracksToRender, displayMode = 'grid') {
        container.innerHTML = ''; // Clear previous tracks
        container.classList.remove('grid', 'list');
        container.classList.add(displayMode);

        if (tracksToRender.length === 0) {
            container.innerHTML = '<p class="no-results-message">No tracks found.</p>';
            return;
        }

        tracksToRender.forEach(track => {
            const trackElement = document.createElement('div');
            trackElement.dataset.trackId = track.id;

            if (displayMode === 'grid') {
                trackElement.classList.add('track-card');
                trackElement.innerHTML = `
                    <img src="${track.cover}" alt="${track.album} cover">
                    <div class="title">${track.title}</div>
                    <div class="artist">${track.artist}</div>
                `;
            } else { // list mode
                trackElement.classList.add('track-item');
                trackElement.innerHTML = `
                    <img src="${track.cover}" alt="${track.album} cover">
                    <div class="details">
                        <div class="title">${track.title}</div>
                        <div class="artist">${track.artist}</div>
                    </div>
                    <div class="duration">${track.duration}</div>
                `;
            }
            
            // Add active class if this track is currently playing
            if (currentQueue[currentTrackIndex] && currentQueue[currentTrackIndex].id === track.id) {
                trackElement.classList.add('active');
            }
            container.appendChild(trackElement);
        });

        // Add click listener to play track
        container.querySelectorAll('[data-track-id]').forEach(element => {
            element.addEventListener('click', (event) => {
                const trackId = event.currentTarget.dataset.trackId;
                const clickedTrackIndex = tracksToRender.findIndex(t => t.id === trackId);
                if (clickedTrackIndex !== -1) {
                    currentQueue = [...tracksToRender]; // Set the current list as the new queue
                    currentTrackIndex = clickedTrackIndex;
                    loadTrack(currentQueue[currentTrackIndex].id, true);
                }
            });
        });
    }

    function renderPlaylists() {
        playlistsList.innerHTML = '';
        if (playlists.length === 0) {
            playlistsList.innerHTML = '<li class="no-results-message">No playlists yet.</li>';
            return;
        }

        playlists.forEach(playlist => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.classList.add('nav-item');
            a.dataset.view = 'playlist-detail-view';
            a.dataset.playlistId = playlist.id;
            a.innerHTML = `<i class="fas fa-list"></i> ${playlist.name}`;
            li.appendChild(a);
            playlistsList.appendChild(li);
        });
    }

    function renderQueue() {
        currentQueueList.innerHTML = '';
        if (currentQueue.length === 0) {
            currentQueueList.innerHTML = '<p class="no-results-message">Queue is empty. Add some songs!</p>';
            return;
        }

        renderTracks(currentQueueList, currentQueue, 'list');
    }

    // --- Player Logic --- 
    function loadTrack(trackId, playImmediately = true) {
        const track = getTrackById(trackId);
        if (!track) {
            console.error('Track not found:', trackId);
            return;
        }

        audio.src = track.src;
        playerCover.src = track.cover;
        playerTitle.textContent = track.title;
        playerArtist.textContent = track.artist;
        progressSlider.value = 0;
        currentTimeSpan.textContent = '0:00';
        durationSpan.textContent = track.duration;

        // Update active track highlight in any displayed list
        document.querySelectorAll('.track-item, .track-card').forEach(el => el.classList.remove('active'));
        const activeTrackElements = document.querySelectorAll(`[data-track-id="${trackId}"]`);
        activeTrackElements.forEach(el => el.classList.add('active'));

        if (playImmediately) {
            audio.play().then(() => {
                isPlaying = true;
                playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
            }).catch(error => {
                console.error('Error playing audio:', error);
                isPlaying = false;
                playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
            });
        } else {
            isPlaying = false;
            playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    function playPauseToggle() {
        if (!audio.src) { // If no track is loaded, load the first one from explore/queue
            if (currentQueue.length > 0) {
                currentTrackIndex = 0;
                loadTrack(currentQueue[currentTrackIndex].id, true);
            } else if (tracks.length > 0) {
                currentQueue = [...tracks];
                currentTrackIndex = 0;
                loadTrack(currentQueue[currentTrackIndex].id, true);
            }
            return;
        }

        if (isPlaying) {
            audio.pause();
            playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            audio.play().catch(error => console.error('Error playing audio:', error));
            playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        }
        isPlaying = !isPlaying;
    }

    function playNext() {
        if (currentQueue.length === 0) return;
        currentTrackIndex = (currentTrackIndex + 1) % currentQueue.length;
        loadTrack(currentQueue[currentTrackIndex].id, true);
        renderQueue(); // Update queue view to highlight next track
    }

    function playPrevious() {
        if (currentQueue.length === 0) return;
        currentTrackIndex = (currentTrackIndex - 1 + currentQueue.length) % currentQueue.length;
        loadTrack(currentQueue[currentTrackIndex].id, true);
        renderQueue(); // Update queue view to highlight previous track
    }

    function setVolume() {
        audio.volume = volumeSlider.value;
        currentVolume = audio.volume;
        // Update volume icon based on volume level
        if (audio.volume === 0) {
            volumeMuteButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else if (audio.volume < 0.5) {
            volumeMuteButton.innerHTML = '<i class="fas fa-volume-down"></i>';
        } else {
            volumeMuteButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    }

    function toggleMute() {
        if (audio.volume > 0) {
            lastVolume = audio.volume; // Store current volume
            audio.volume = 0;
            volumeSlider.value = 0;
            volumeMuteButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            audio.volume = lastVolume > 0 ? lastVolume : 0.7; // Restore or default
            volumeSlider.value = audio.volume;
            if (audio.volume < 0.5) {
                volumeMuteButton.innerHTML = '<i class="fas fa-volume-down"></i>';
            } else {
                volumeMuteButton.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
        }
        currentVolume = audio.volume;
    }

    // --- Event Listeners --- 

    // Player controls
    playPauseButton.addEventListener('click', playPauseToggle);
    prevButton.addEventListener('click', playPrevious);
    nextButton.addEventListener('click', playNext);

    // Volume control
    volumeSlider.addEventListener('input', setVolume);
    volumeMuteButton.addEventListener('click', toggleMute);
    volumeMaxButton.addEventListener('click', () => {
        audio.volume = 1;
        volumeSlider.value = 1;
        setVolume();
    });

    // Progress bar
    audio.addEventListener('timeupdate', () => {
        if (!isNaN(audio.duration)) {
            progressSlider.value = audio.currentTime;
            currentTimeSpan.textContent = formatTime(audio.currentTime);
        }
    });

    audio.addEventListener('durationchange', () => {
        if (!isNaN(audio.duration)) {
            progressSlider.max = audio.duration;
            durationSpan.textContent = formatTime(audio.duration);
        }
    });

    progressSlider.addEventListener('input', () => {
        audio.currentTime = progressSlider.value;
    });

    audio.addEventListener('ended', () => {
        playNext();
    });

    // Search functionality
    const performSearch = () => {
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm.trim() === '') {
            searchResultsList.innerHTML = '<p class="no-results-message">Start typing to search for music.</p>';
            switchView('home-view');
            return;
        }
        const filteredTracks = tracks.filter(track =>
            track.title.toLowerCase().includes(searchTerm) ||
            track.artist.toLowerCase().includes(searchTerm) ||
            track.album.toLowerCase().includes(searchTerm)
        );
        switchView('search-results-view');
        renderTracks(searchResultsList, filteredTracks, 'list');
    };

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        } else if (searchInput.value.trim() === '') {
            // If search input is cleared, go back to home view
            switchView('home-view');
        }
    });

    // Navigation and Playlist Clicks (Delegation)
    appContainer.addEventListener('click', (event) => {
        const navItem = event.target.closest('.nav-item');
        if (navItem) {
            event.preventDefault();
            const viewId = navItem.dataset.view;
            const playlistId = navItem.dataset.playlistId;

            if (playlistId) {
                // Handle playlist detail view
                const selectedPlaylist = playlists.find(p => p.id === playlistId);
                if (selectedPlaylist) {
                    playlistDetailTitle.textContent = selectedPlaylist.name;
                    const playlistTracks = selectedPlaylist.trackIds.map(id => getTrackById(id));
                    renderTracks(playlistDetailTracks, playlistTracks, 'list');
                    switchView('playlist-detail-view');
                }
            } else if (viewId) {
                switchView(viewId);
                // Specific actions for views
                if (viewId === 'library-view') {
                    renderTracks(allTracksList, tracks, 'list');
                } else if (viewId === 'queue-view') {
                    renderQueue();
                } else if (viewId === 'home-view') {
                    renderTracks(exploreTracksList, tracks, 'grid');
                }
            }
        }
    });

    // --- Initialization --- 
    function initializeApp() {
        renderPlaylists();
        renderTracks(exploreTracksList, tracks, 'grid'); // Display all tracks on home view initially
        audio.volume = currentVolume;
        volumeSlider.value = currentVolume;
        setVolume(); // Set initial volume icon
        switchView('home-view'); // Ensure home view is active on load
    }

    initializeApp();
});
