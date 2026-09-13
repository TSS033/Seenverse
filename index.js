// --- CONFIGURATION ---
const API_CONFIG = {
    KEY: 'YOUR_API_KEY_HERE', 
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE: 'https://image.tmdb.org/t/p/w500'
};

// Fallback movie dataset when no TMDB API key is provided
const FALLBACK_MOVIES = [
    {
        title: 'Blade Runner 2049',
        release_date: '2017-10-06',
        vote_average: 8.7,
        poster_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500&auto=format&fit=crop',
        overview: 'A young Blade Runner\'s discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard.',
        genres: 'Sci-Fi · Drama'
    },
    {
        title: 'Dune: Part Two',
        release_date: '2024-03-01',
        vote_average: 8.5,
        poster_path: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500&auto=format&fit=crop',
        overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
        genres: 'Sci-Fi · Adventure'
    },
    {
        title: 'Interstellar',
        release_date: '2014-11-07',
        vote_average: 8.6,
        poster_path: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=500&auto=format&fit=crop',
        overview: 'When Earth becomes uninhabitable, a team of ex-NASA pilots travels through a wormhole in search of a new home.',
        genres: 'Sci-Fi · Drama'
    }
];

// --- HELPER FUNCTIONS ---
function getInitials(name) {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
}

// --- API FETCH & RENDER MOVIES ---
async function fetchAndRenderMovies() {
    const gridContainer = document.getElementById('madeForYouGrid');
    if (!gridContainer) return;

    let moviesToRender = [];

    if (API_CONFIG.KEY === 'YOUR_API_KEY_HERE') {
        console.log("No API Key detected. Rendering fallback items.");
        moviesToRender = FALLBACK_MOVIES;
    } else {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/discover/movie?api_key=${API_CONFIG.KEY}&with_genres=878`);
            const data = await response.json();
            moviesToRender = (data.results || []).slice(0, 6);
        } catch (error) {
            console.error("Error fetching movies from API, falling back:", error);
            moviesToRender = FALLBACK_MOVIES;
        }
    }

    gridContainer.innerHTML = moviesToRender.map(movie => `
        <div class="movie-card" 
             data-title="${movie.title}" 
             data-year="${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}"
             data-type="Movie"
             data-rating="${movie.vote_average ? Number(movie.vote_average).toFixed(1) : '8.0'}"
             data-overview="${movie.overview || 'No description available.'}"
             data-genres="${movie.genres || 'Sci-Fi'}">
            <div class="poster-wrapper">
                <img src="${movie.poster_path ? (movie.poster_path.startsWith('http') ? movie.poster_path : API_CONFIG.IMAGE_BASE + movie.poster_path) : 'https://via.placeholder.com/500x750'}" alt="${movie.title}">
                <div class="rating-badge"><i class="fa-solid fa-star"></i> ${movie.vote_average ? Number(movie.vote_average).toFixed(1) : 'N/A'}</div>
                <div class="status-badge">PLAN TO WATCH</div>
            </div>
            <div class="movie-info">
                <div>
                    <div class="movie-title">${movie.title}</div>
                    <div class="movie-meta">${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'} · Movie</div>
                </div>
                <div class="action-circle"><i class="fa-solid fa-plus"></i></div>
            </div>
        </div>
    `).join('');
}

// --- SOCIAL FEED & USER SUGGESTIONS ---
function renderSocialFeed(posts) {
    const feedContainer = document.getElementById('socialFeed');
    if (!feedContainer) return;

    feedContainer.innerHTML = posts.map(post => `
        <div class="feed-card" data-post-id="${post.id}">
            <div class="feed-header">
                <div class="user-avatar" style="background-color: ${post.user.avatarColor || '#6366f1'};">
                    ${getInitials(post.user.name)}
                </div>
                <div class="user-meta">
                    <span class="user-name">${post.user.name}</span>
                    <span class="user-handle">@${post.user.username} · ${post.timestamp}</span>
                </div>
                <button class="more-btn"><i class="fa-solid fa-ellipsis"></i></button>
            </div>
            <div class="feed-content">
                <p class="activity-text">
                    ${post.action} ${post.rating ? `<span class="rating-highlight"><i class="fa-solid fa-star"></i> ${post.rating}/10</span>` : ''}
                </p>
                ${post.media ? `
                    <div class="media-card" 
                         data-title="${post.media.title}"
                         data-year="${post.media.year}"
                         data-type="${post.media.type}"
                         data-rating="${post.rating || '8.5'}"
                         data-overview="High intensity animation set in Night City."
                         data-genres="Anime · Sci-Fi">
                        <img src="${post.media.posterUrl}" alt="${post.media.title}">
                        <div class="media-info">
                            <h4>${post.media.title}</h4>
                            <p>${post.media.year} · ${post.media.type}</p>
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="feed-actions">
                <button class="action-btn like-btn"><i class="fa-regular fa-heart"></i> <span class="like-count">${post.likesCount || 0}</span></button>
                <button class="action-btn comment-btn"><i class="fa-regular fa-comment"></i> ${post.commentsCount || 0}</button>
            </div>
        </div>
    `).join('');
}

function renderPeopleToFollow(users) {
    const followListContainer = document.getElementById('followList');
    if (!followListContainer) return;

    followListContainer.innerHTML = users.map(user => `
        <li class="follow-item" data-user-id="${user.id}">
            <div class="user-avatar" style="background-color: ${user.avatarColor || '#3b82f6'};">
                ${getInitials(user.name)}
            </div>
            <div class="user-meta">
                <span class="user-name">${user.name}</span>
                <span class="user-sub">${user.mutualsCount} mutuals</span>
            </div>
            <button class="btn-follow ${user.isFollowing ? 'following' : ''}">
                ${user.isFollowing ? 'Following' : 'Follow'}
            </button>
        </li>
    `).join('');
}

function initSocialData() {
    const samplePosts = [
        {
            id: 1,
            user: { name: 'Elena Rostova', username: 'erostova', avatarColor: '#e06d53' },
            timestamp: '2h ago',
            action: 'rated',
            rating: '9.0',
            likesCount: 14,
            commentsCount: 3,
            media: {
                title: 'Cyberpunk 2077: Edgerunners',
                year: '2022',
                type: 'Anime',
                posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=300&auto=format&fit=crop'
            }
        }
    ];

    const sampleUsers = [
        { id: 101, name: 'Marcus Chen', mutualsCount: 12, isFollowing: false, avatarColor: '#10b981' },
        { id: 102, name: 'Sarah Jenkins', mutualsCount: 5, isFollowing: true, avatarColor: '#4f46e5' }
    ];

    renderSocialFeed(samplePosts);
    renderPeopleToFollow(sampleUsers);
}

// --- MODAL CONTROLLER ---
function openMediaModal(data) {
    const modal = document.getElementById('mediaModal');
    if (!modal) return;

    const posterEl = document.getElementById('modalPoster');
    const titleEl = document.getElementById('modalTitle');
    const subheadEl = document.getElementById('modalSubheading');
    const overviewEl = document.getElementById('modalOverview');
    const ratingEl = document.getElementById('modalRating');
    const runtimeEl = document.getElementById('modalRuntime');
    const genresEl = document.getElementById('modalGenres');

    if (posterEl) posterEl.src = data.posterUrl || '';
    if (titleEl) titleEl.textContent = data.title || 'Untitled';
    if (subheadEl) subheadEl.textContent = `${data.type || 'Media'} · ${data.year || 'N/A'}`;
    if (overviewEl) overviewEl.textContent = data.overview || 'No description available.';
    if (ratingEl) ratingEl.textContent = data.rating || 'N/A';
    if (runtimeEl) runtimeEl.textContent = data.runtime || '2h 10m';
    if (genresEl) genresEl.textContent = data.genres || 'Sci-Fi';

    modal.classList.add('active');
}

function closeMediaModal() {
    const modal = document.getElementById('mediaModal');
    if (modal) modal.classList.remove('active');
}

// --- MAIN APPLICATION INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Navigation setup
    const navLinks = document.querySelectorAll(".nav-links a, .mobile-nav-link");
    const views = document.querySelectorAll(".view-section");

    function switchView(targetId) {
        views.forEach(view => view.classList.remove("active"));
        const targetView = document.getElementById(targetId);
        if (targetView) targetView.classList.add("active");

        navLinks.forEach(l => {
            l.classList.toggle("active", l.getAttribute("data-target") === targetId);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("data-target");
            if (targetId) switchView(targetId);
        });
    });

    // 2. Global Event Delegation (Handles Modals & All Interactive Buttons)
    document.addEventListener('click', (e) => {
        // Modal Close Button or Backdrop
        if (e.target.closest('#modalCloseBtn') || e.target.id === 'mediaModal') {
            closeMediaModal();
            return;
        }

        // Follow Button Toggle
        const followBtn = e.target.closest('.btn-follow');
        if (followBtn) {
            e.stopPropagation();
            followBtn.classList.toggle('following');
            followBtn.textContent = followBtn.classList.contains('following') ? 'Following' : 'Follow';
            return;
        }

        // Like Button Toggle
        const likeBtn = e.target.closest('.like-btn');
        if (likeBtn) {
            e.stopPropagation();
            likeBtn.classList.toggle('liked');
            const countEl = likeBtn.querySelector('.like-count');
            if (countEl) {
                let current = parseInt(countEl.textContent, 10) || 0;
                countEl.textContent = likeBtn.classList.contains('liked') ? current + 1 : Math.max(0, current - 1);
            }
            return;
        }

        // Action Circle (+ Add to Watchlist)
        const actionCircle = e.target.closest('.action-circle');
        if (actionCircle) {
            e.stopPropagation();
            actionCircle.classList.toggle('added');
            actionCircle.innerHTML = actionCircle.classList.contains('added') 
                ? '<i class="fa-solid fa-check"></i>' 
                : '<i class="fa-solid fa-plus"></i>';
            return;
        }

        // Modal Status Buttons
        const statusBtn = e.target.closest('.status-btn');
        if (statusBtn) {
            document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
            statusBtn.classList.add('active');
            return;
        }

        // Modal Rating Numbers
        const rateBtn = e.target.closest('.rate-num');
        if (rateBtn) {
            document.querySelectorAll('.rate-num').forEach(b => b.classList.remove('active'));
            rateBtn.classList.add('active');
            return;
        }

        // Movie / Media Card Click -> Open Modal
        const card = e.target.closest('.movie-card, .media-card');
        if (card) {
            const title = card.dataset.title || card.querySelector('.movie-title, h4')?.textContent || 'Media Title';
            const year = card.dataset.year || '2024';
            const type = card.dataset.type || 'Movie';
            const rating = card.dataset.rating || '8.0';
            const overview = card.dataset.overview || 'Overview details for this title...';
            const genres = card.dataset.genres || 'Sci-Fi · Drama';
            const posterUrl = card.querySelector('img')?.src || '';

            openMediaModal({ title, year, type, rating, overview, genres, posterUrl });
        }
    });

    // 3. Initial Execution
    fetchAndRenderMovies();
    initSocialData();
});