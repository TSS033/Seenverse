// --- CONFIGURATION ---
const API_CONFIG = {
    KEY: 'YOUR_API_KEY_HERE', 
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE: 'https://image.tmdb.org/t/p/w500'
};

// --- HELPER FUNCTIONS ---
function getInitials(name) {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
}

// --- API FETCH & RENDER MOVIES ---
async function fetchAndRenderMovies() {
    if (API_CONFIG.KEY === 'YOUR_API_KEY_HERE') {
        console.log("No API Key detected. Displaying hardcoded fallback items.");
        return; 
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/discover/movie?api_key=${API_CONFIG.KEY}&with_genres=878`);
        const data = await response.json();

        const gridContainer = document.getElementById('madeForYouGrid');
        if (!gridContainer) return;
        gridContainer.innerHTML = ''; 

        const moviesToRender = data.results.slice(0, 6);

        moviesToRender.forEach(movie => {
            const cardHTML = `
                <div class="movie-card">
                    <div class="poster-wrapper">
                        <img src="${movie.poster_path ? API_CONFIG.IMAGE_BASE + movie.poster_path : 'https://via.placeholder.com/500x750'}" alt="${movie.title}">
                        <div class="rating-badge"><i class="fa-solid fa-star"></i> ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</div>
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
            `;
            gridContainer.innerHTML += cardHTML;
        });
    } catch (error) {
        console.error("Error fetching movies from API:", error);
    }
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
                    <div class="media-card">
                        <img src="${post.media.posterUrl}" alt="${post.media.title}">
                        <div class="media-info">
                            <h4>${post.media.title}</h4>
                            <p>${post.media.year} · ${post.media.type}</p>
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="feed-actions">
                <button class="action-btn like-btn"><i class="fa-regular fa-heart"></i> ${post.likesCount || 'Like'}</button>
                <button class="action-btn"><i class="fa-regular fa-comment"></i> ${post.commentsCount || 'Comment'}</button>
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

// Populates initial social UI if feed containers are present
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

    if (posterEl) posterEl.src = data.posterUrl;
    if (titleEl) titleEl.textContent = data.title;
    if (subheadEl) subheadEl.textContent = `${data.type} · ${data.year}`;
    if (overviewEl) overviewEl.textContent = data.overview;
    if (ratingEl) ratingEl.textContent = data.rating;
    if (runtimeEl) runtimeEl.textContent = data.runtime || '2h 10m';
    if (genresEl) genresEl.textContent = data.genres || 'Drama · Sci-Fi';

    modal.classList.add('active');
}

function closeMediaModal() {
    const modal = document.getElementById('mediaModal');
    if (modal) modal.classList.remove('active');
}

// --- MAIN APPLICATION INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Navigation setup
    const desktopLinks = document.querySelectorAll(".nav-links a");
    const mobileLinks = document.querySelectorAll(".mobile-nav-link");
    const views = document.querySelectorAll(".view-section");

    function switchView(targetId) {
        views.forEach(view => view.classList.remove("active"));
        const targetView = document.getElementById(targetId);
        if (targetView) targetView.classList.add("active");

        desktopLinks.forEach(l => {
            l.classList.toggle("active", l.getAttribute("data-target") === targetId);
        });

        mobileLinks.forEach(l => {
            l.classList.toggle("active", l.getAttribute("data-target") === targetId);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    [...desktopLinks, ...mobileLinks].forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("data-target");
            if (targetId) switchView(targetId);
        });
    });

    // 2. Modal Interactions & Event Delegation
    document.getElementById('modalCloseBtn')?.addEventListener('click', closeMediaModal);

    document.getElementById('mediaModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'mediaModal') {
            closeMediaModal();
        }
    });

    // Card click delegation for opening modal
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.movie-card, .media-card');
        if (card && !e.target.closest('.action-circle')) {
            const title = card.querySelector('.movie-title, h4')?.textContent || 'Title';
            const meta = card.querySelector('.movie-meta, p')?.textContent || '2024 · Movie';
            const posterUrl = card.querySelector('img')?.src || '';
            const rating = card.querySelector('.rating-badge')?.textContent?.trim() || '8.0';

            const metaParts = meta.split('·');
            const year = metaParts[0]?.trim() || '2025';
            const type = metaParts[1]?.trim() || 'Movie';

            openMediaModal({
                title: title,
                type: type,
                year: year,
                posterUrl: posterUrl,
                rating: rating,
                overview: 'A detective traces a missing memory through the rain-soaked districts of a divided city.',
                genres: 'Sci-Fi · Cyberpunk'
            });
        }
    });

    // Modal Status & Rating button selectors
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });

    document.querySelectorAll('.rate-num').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.rate-num').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });

    // 3. Render API Data & Initial Feed State
    fetchAndRenderMovies();
    initSocialData();
});