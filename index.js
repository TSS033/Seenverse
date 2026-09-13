// --- CONFIGURATION ---
const API_CONFIG = {
    KEY: '69ac2d5df8a30694620f698937bf84e3', 
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE: 'https://image.tmdb.org/t/p/w500'
};

// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = 'https://ijqaftsyaxbqwgprkwxs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcWFmdHN5YXhicXdncHJrd3hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMTYzODIsImV4cCI6MjEwNDg5MjM4Mn0.spPD3I8aZZAQeIcYr7ej4V3H94P1A_eFjcuS2VLIqog';

// Initialize Supabase Client (requires CDN script tag in index.html)
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Mixed Dataset (Movies & TV Shows Fallback)
const FALLBACK_MEDIA = [
    {
        title: 'Blade Runner 2049',
        release_date: '2017-10-06',
        vote_average: 8.7,
        type: 'Movie',
        poster_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500&auto=format&fit=crop',
        overview: 'A young Blade Runner\'s discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard.',
        genres: 'Sci-Fi · Drama'
    },
    {
        title: 'Cyberpunk: Edgerunners',
        release_date: '2022-09-13',
        vote_average: 8.3,
        type: 'TV Show',
        poster_path: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=500&auto=format&fit=crop',
        overview: 'A street kid trying to survive in a technology and body modification-obsessed city of the future.',
        genres: 'Anime · Sci-Fi'
    },
    {
        title: 'Dune: Part Two',
        release_date: '2024-03-01',
        vote_average: 8.5,
        type: 'Movie',
        poster_path: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500&auto=format&fit=crop',
        overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
        genres: 'Sci-Fi · Adventure'
    },
    {
        title: 'Stranger Things',
        release_date: '2016-07-15',
        vote_average: 8.6,
        type: 'TV Show',
        poster_path: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=500&auto=format&fit=crop',
        overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments and terrifying supernatural forces.',
        genres: 'Sci-Fi · Horror'
    }
];

let activeFilter = 'all';
let currentUser = null;

// --- HELPER FUNCTIONS ---
function getInitials(name) {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
}

// --- AUTHENTICATION FUNCTIONS ---
async function signUp(email, password, username) {
    if (!supabase) return console.warn('Supabase client not initialized');
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) return console.error('Signup error:', error.message);
    
    if (data.user) {
        await supabase.from('profiles').insert([
            { id: data.user.id, username: username, avatar_color: '#6366f1' }
        ]);
        alert('Account created! Check your email for verification.');
    }
}

async function signIn(email, password) {
    if (!supabase) return console.warn('Supabase client not initialized');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return console.error('Login error:', error.message);
    console.log('Logged in successfully:', data.user);
}

async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error.message);
}

// --- WATCHLIST DATABASE OPERATIONS ---
async function addToWatchlist(item) {
    if (!supabase) return;
    if (!currentUser) return alert('Please log in to save items!');

    const { data, error } = await supabase.from('watchlists').insert([
        {
            user_id: currentUser.id,
            media_id: String(item.id || item.title),
            title: item.title,
            poster_path: item.poster_path,
            media_type: item.type,
            rating: Number(item.rating) || null
        }
    ]);

    if (error) {
        console.error('Error saving item:', error.message);
    } else {
        alert(`${item.title} added to your library!`);
    }
}

async function fetchUserWatchlist(userId) {
    if (!supabase) return;
    const { data, error } = await supabase
        .from('watchlists')
        .select('*')
        .eq('user_id', userId);

    if (error) console.error('Error fetching watchlist:', error.message);
    else console.log('User Watchlist:', data);
}

// --- API FETCH & RENDER MEDIA ---
async function fetchAndRenderMovies(filterCategory = activeFilter) {
    const gridContainer = document.getElementById('madeForYouGrid');
    if (!gridContainer) return;

    let mediaList = [];

    try {
        let endpoint = '';
        
        // Target dynamic TMDB endpoints based on category filter
        if (filterCategory === 'Movie') {
            endpoint = `${API_CONFIG.BASE_URL}/trending/movie/week?api_key=${API_CONFIG.KEY}`;
        } else if (filterCategory === 'TV Show') {
            endpoint = `${API_CONFIG.BASE_URL}/trending/tv/week?api_key=${API_CONFIG.KEY}`;
        } else {
            endpoint = `${API_CONFIG.BASE_URL}/trending/all/week?api_key=${API_CONFIG.KEY}`;
        }

        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            mediaList = data.results.map(item => {
                const isMovie = (item.media_type === 'movie') || item.title;
                return {
                    id: item.id,
                    title: isMovie ? item.title : item.name,
                    release_date: isMovie ? item.release_date : item.first_air_date,
                    vote_average: item.vote_average,
                    type: isMovie ? 'Movie' : 'TV Show',
                    poster_path: item.poster_path ? (API_CONFIG.IMAGE_BASE + item.poster_path) : '',
                    overview: item.overview || 'No description available.',
                    genres: isMovie ? 'Sci-Fi · Action' : 'Drama · Sci-Fi'
                };
            });
        } else {
            throw new Error('No results from API');
        }
    } catch (error) {
        console.error("Error fetching live data from TMDB, using fallback dataset:", error);
        mediaList = FALLBACK_MEDIA;
        if (filterCategory !== 'all') {
            mediaList = mediaList.filter(item => item.type.toLowerCase() === filterCategory.toLowerCase());
        }
    }

    gridContainer.innerHTML = mediaList.map(item => `
        <div class="movie-card" 
             data-id="${item.id || ''}"
             data-title="${item.title}" 
             data-year="${item.release_date ? item.release_date.split('-')[0] : 'N/A'}"
             data-type="${item.type}"
             data-rating="${item.vote_average ? Number(item.vote_average).toFixed(1) : '8.0'}"
             data-overview="${item.overview ? item.overview.replace(/"/g, '&quot;') : 'No description available.'}"
             data-genres="${item.genres || 'Sci-Fi'}">
            <div class="poster-wrapper">
                <img src="${item.poster_path}" alt="${item.title}" loading="lazy">
                <div class="rating-badge"><i class="fa-solid fa-star"></i> ${item.vote_average ? Number(item.vote_average).toFixed(1) : 'N/A'}</div>
                <div class="status-badge">${item.type}</div>
            </div>
            <div class="movie-info">
                <div>
                    <div class="movie-title">${item.title}</div>
                    <div class="movie-meta">${item.release_date ? item.release_date.split('-')[0] : 'N/A'} · ${item.type}</div>
                </div>
                <div class="action-circle"><i class="fa-solid fa-plus"></i></div>
            </div>
        </div>
    `).join('');
}

// --- SOCIAL FEED ---
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
                         data-overview="High intensity anime set in Night City."
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
                type: 'TV Show',
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

    document.getElementById('modalPoster').src = data.posterUrl || '';
    document.getElementById('modalTitle').textContent = data.title || 'Untitled';
    document.getElementById('modalSubheading').textContent = `${data.type || 'Media'} · ${data.year || 'N/A'}`;
    document.getElementById('modalOverview').textContent = data.overview || 'No description available.';
    document.getElementById('modalRating').textContent = data.rating || 'N/A';
    document.getElementById('modalRuntime').textContent = data.runtime || '2h 10m';
    document.getElementById('modalGenres').textContent = data.genres || 'Sci-Fi';

    modal.classList.add('active');
}

function closeMediaModal() {
    const modal = document.getElementById('mediaModal');
    if (modal) modal.classList.remove('active');
}

// --- MAIN INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {

    // 1. Listen for Supabase Authentication State Changes
    if (supabase) {
        supabase.auth.onAuthStateChange((event, session) => {
            currentUser = session ? session.user : null;
            if (currentUser) {
                console.log('Active user authenticated:', currentUser.id);
                fetchUserWatchlist(currentUser.id);
            } else {
                console.log('No user authenticated');
            }
        });
    }

    // 2. Navigation & Filter Handling
    const navLinks = document.querySelectorAll(".nav-links a, .mobile-nav-link");
    const views = document.querySelectorAll(".view-section");

    function switchView(targetId, filter = 'all') {
        // Toggle Active Sections
        views.forEach(view => view.classList.remove("active"));
        const targetView = document.getElementById(targetId);
        if (targetView) targetView.classList.add("active");

        // Strict Nav Highlight Matching
        navLinks.forEach(l => {
            const matchesTarget = l.getAttribute("data-target") === targetId;
            const linkFilter = l.getAttribute("data-filter") || 'all';

            // Only mark active if view target matches AND filter matches (for homeView sub-navigation)
            const isMatch = matchesTarget && (targetId !== 'homeView' || linkFilter === filter);
            l.classList.toggle("active", isMatch);
        });

        // Handle Home view rendering and inner tabs sync
        if (targetId === 'homeView') {
            activeFilter = filter;
            fetchAndRenderMovies(filter);
            document.querySelectorAll('.filter-btn').forEach(btn => {
                const btnFilter = btn.getAttribute('data-filter') || 'all';
                btn.classList.toggle('active', btnFilter === filter);
            });
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("data-target");
            const filter = link.getAttribute("data-filter") || 'all';
            if (targetId) switchView(targetId, filter);
        });
    });

    // 3. Global Event Delegation
    document.addEventListener('click', (e) => {
        // Modal Close
        if (e.target.closest('#modalCloseBtn') || e.target.id === 'mediaModal') {
            closeMediaModal();
            return;
        }

        // Category Filter Tabs Inside Home Section
        const filterBtn = e.target.closest('.filter-btn');
        if (filterBtn) {
            const filter = filterBtn.getAttribute('data-filter') || 'all';
            activeFilter = filter;
            
            // Sync Top Nav Highlighting when clicking in-page filter buttons
            navLinks.forEach(l => {
                const matchesTarget = l.getAttribute("data-target") === 'homeView';
                const linkFilter = l.getAttribute("data-filter") || 'all';
                l.classList.toggle("active", matchesTarget && linkFilter === filter);
            });

            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            filterBtn.classList.add('active');
            fetchAndRenderMovies(filter);
            return;
        }

        // Follow Button
        const followBtn = e.target.closest('.btn-follow');
        if (followBtn) {
            e.stopPropagation();
            followBtn.classList.toggle('following');
            followBtn.textContent = followBtn.classList.contains('following') ? 'Following' : 'Follow';
            return;
        }

        // Like Button
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

        // Watchlist + Button (Add to Supabase Database)
        const actionCircle = e.target.closest('.action-circle');
        if (actionCircle) {
            e.stopPropagation();
            actionCircle.classList.toggle('added');
            const isAdded = actionCircle.classList.contains('added');
            actionCircle.innerHTML = isAdded ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-plus"></i>';
            
            const card = actionCircle.closest('.movie-card');
            if (card && isAdded) {
                addToWatchlist({
                    id: card.dataset.id,
                    title: card.dataset.title,
                    poster_path: card.querySelector('img')?.src,
                    type: card.dataset.type,
                    rating: card.dataset.rating
                });
            }
            return;
        }

        // Modal Controls
        const statusBtn = e.target.closest('.status-btn');
        if (statusBtn) {
            document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
            statusBtn.classList.add('active');
            return;
        }

        const rateBtn = e.target.closest('.rate-num');
        if (rateBtn) {
            document.querySelectorAll('.rate-num').forEach(b => b.classList.remove('active'));
            rateBtn.classList.add('active');
            return;
        }

        // Card Click -> Open Modal
        const card = e.target.closest('.movie-card, .media-card');
        if (card) {
            openMediaModal({
                title: card.dataset.title || card.querySelector('.movie-title, h4')?.textContent || 'Title',
                year: card.dataset.year || '2024',
                type: card.dataset.type || 'Movie',
                rating: card.dataset.rating || '8.0',
                overview: card.dataset.overview || 'Overview details...',
                genres: card.dataset.genres || 'Sci-Fi',
                posterUrl: card.querySelector('img')?.src || ''
            });
        }
    });

    // 4. Initial Load
    fetchAndRenderMovies('all');
    initSocialData();
});