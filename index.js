// --- CONFIGURATION ---
const API_CONFIG = {
    KEY: '69ac2d5df8a30694620f698937bf84e3', 
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE: 'https://image.tmdb.org/t/p/w500'
};

// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = 'https://ijqaftsyaxbqwgprkwxs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcWFmdHN5YXhicXdncHJrd3hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMTYzODIsImV4cCI6MjEwNDg5MjM4Mn0.spPD3I8aZZAQeIcYr7ej4V3H94P1A_eFjcuS2VLIqog';

// Initialize Supabase Client safely
const supabaseClient = (typeof window.supabase !== 'undefined' && window.supabase.createClient) 
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
    : null;

// Mixed Dataset (Movies & TV Shows Fallback)
const FALLBACK_MEDIA = [
    { id: '101', title: 'Blade Runner 2049', release_date: '2017-10-06', vote_average: 8.7, type: 'Movie', poster_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500&auto=format&fit=crop', overview: 'A young Blade Runner\'s discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard.', genres: 'Sci-Fi · Drama' },
    { id: '102', title: 'Cyberpunk: Edgerunners', release_date: '2022-09-13', vote_average: 8.3, type: 'TV Show', poster_path: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=500&auto=format&fit=crop', overview: 'A street kid trying to survive in a technology and body modification-obsessed city of the future.', genres: 'Anime · Sci-Fi' },
    { id: '103', title: 'Dune: Part Two', release_date: '2024-03-01', vote_average: 8.5, type: 'Movie', poster_path: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500&auto=format&fit=crop', overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', genres: 'Sci-Fi · Adventure' },
    { id: '104', title: 'The Matrix', release_date: '1999-03-31', vote_average: 8.7, type: 'Movie', poster_path: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=500&auto=format&fit=crop', overview: 'A computer hacker learns from mysterious rebels about the true nature of his reality.', genres: 'Sci-Fi · Action' }
];

// --- STATE MANAGEMENT ---
let activeFilter = 'all';
let currentUser = null;
let isSignUpMode = false;
let userEntries = {}; 
let activeMediaData = null;

// --- HELPER FUNCTIONS ---
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function getInitials(name) {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
}

function updateProfileUI(user) {
    const usernameEl = document.getElementById('profileUsername');
    const profileAvatarLg = document.querySelector('.profile-avatar-lg');
    
    if (user) {
        const username = user.user_metadata?.username || user.email.split('@')[0];
        if (usernameEl) usernameEl.textContent = username;
        if (profileAvatarLg) profileAvatarLg.textContent = getInitials(username);
    } else {
        if (usernameEl) usernameEl.textContent = 'Guest User';
        if (profileAvatarLg) profileAvatarLg.textContent = 'JS';
    }
}

// --- PROFILE RECALCULATION & LIVE STATS ---
function updateProfileStats() {
    const entries = Object.values(userEntries);
    
    // Total & Status Counts
    const totalMedia = entries.length;
    const completedMovies = entries.filter(e => e.type === 'Movie' && e.status === 'Completed').length;
    const tvTracked = entries.filter(e => e.type === 'TV Show' && e.status !== 'Dropped').length;
    
    // Days Watched (estimated hours converted to days)
    const totalHours = entries.reduce((acc, curr) => {
        const count = Number(curr.progress) || (curr.type === 'Movie' ? 1 : 10);
        return acc + (count * 2); 
    }, 0);
    const daysWatched = (totalHours / 24).toFixed(1);

    // Mean Score
    const scoredEntries = entries.filter(e => Number(e.score) > 0);
    const meanScore = scoredEntries.length > 0 
        ? (scoredEntries.reduce((acc, curr) => acc + Number(curr.score), 0) / scoredEntries.length).toFixed(1)
        : '0.0';

    // Update Profile Stat Boxes
    const statNums = document.querySelectorAll('.profile-stat-box .stat-num');
    if (statNums.length >= 3) {
        statNums[0].textContent = totalMedia;
        statNums[1].textContent = daysWatched;
        statNums[2].textContent = meanScore;
    }

    // Update Progress Bars
    const progressGroup = document.querySelectorAll('.stat-progress-group');
    if (progressGroup.length >= 2) {
        progressGroup[0].querySelector('.progress-info span:last-child').textContent = `${completedMovies} Completed`;
        progressGroup[0].querySelector('.progress-bar-fill').style.width = `${Math.min(100, (completedMovies / 10) * 100)}%`;

        progressGroup[1].querySelector('.progress-info span:last-child').textContent = `${tvTracked} Tracked`;
        progressGroup[1].querySelector('.progress-bar-fill').style.width = `${Math.min(100, (tvTracked / 10) * 100)}%`;
    }

    // Genre Breakdown Calculations
    const genreCounts = {};
    entries.forEach(item => {
        if (item.genres) {
            item.genres.split('·').forEach(g => {
                const genre = g.trim();
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            });
        }
    });

    const genreChipsRow = document.querySelector('.genre-chips-row');
    if (genreChipsRow && Object.keys(genreCounts).length > 0) {
        genreChipsRow.innerHTML = Object.entries(genreCounts).map(([genre, count]) => `
            <div class="genre-chip">
                <span class="chip-label">${escapeHtml(genre)}</span>
                <span class="chip-count">${count} Entries</span>
            </div>
        `).join('');
    }

    // Favorite Media Grid Update
    const favGrid = document.querySelector('.profile-media-mini-grid');
    const favorites = entries.filter(e => e.isFavorite);
    if (favGrid && favorites.length > 0) {
        favGrid.innerHTML = favorites.map(item => `
            <div class="movie-card">
                <div class="poster-wrapper">
                    <img src="${item.poster_path}" alt="${escapeHtml(item.title)}">
                    <div class="rating-badge"><i class="fa-solid fa-star"></i> ${item.score || '8.0'}</div>
                </div>
                <div class="movie-title">${escapeHtml(item.title)}</div>
            </div>
        `).join('');
    }
}

// --- AUTHENTICATION FUNCTIONS ---
async function signUp(email, password, username) {
    if (!supabaseClient) return console.warn('Supabase client not initialized');
    const { data, error } = await supabaseClient.auth.signUp({ 
        email, 
        password,
        options: { data: { username: username || email.split('@')[0] } }
    });
    
    if (error) return alert('Signup error: ' + error.message);
    
    if (data.user) {
        await supabaseClient.from('profiles').insert([
            { id: data.user.id, username: username || email.split('@')[0], avatar_color: '#6366f1' }
        ]);
        alert('Account created! Check your email for verification.');
    }
}

async function signIn(email, password) {
    if (!supabaseClient) return console.warn('Supabase client not initialized');
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return alert('Login error: ' + error.message);
    console.log('Logged in successfully:', data.user);
}

async function signOut() {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.auth.signOut();
    if (error) console.error('Logout error:', error.message);
    else alert('Signed out successfully.');
}

// --- WATCHLIST & ENTRY DATABASE OPERATIONS ---
async function saveMediaEntry() {
    if (!activeMediaData) return;

    const favBtn = document.getElementById('modalFavoriteBtn');
    const entry = {
        id: String(activeMediaData.id || activeMediaData.title),
        media_id: String(activeMediaData.id || activeMediaData.title),
        title: activeMediaData.title,
        type: activeMediaData.type,
        poster_path: activeMediaData.poster_path || activeMediaData.posterUrl,
        genres: activeMediaData.genres || 'Sci-Fi',
        status: document.getElementById('entryStatus')?.value || 'Plan to Watch',
        score: document.getElementById('entryScore')?.value || 0,
        progress: document.getElementById('entryProgress')?.value || 0,
        startDate: document.getElementById('entryStartDate')?.value || '',
        finishDate: document.getElementById('entryFinishDate')?.value || '',
        rewatches: document.getElementById('entryRewatches')?.value || 0,
        notes: document.getElementById('entryNotes')?.value || '',
        isPrivate: document.getElementById('entryPrivate')?.checked || false,
        isFavorite: favBtn ? favBtn.classList.contains('active') : false
    };

    userEntries[entry.id] = entry;

    if (supabaseClient && currentUser) {
        const { error } = await supabaseClient.from('watchlists').upsert([
            {
                user_id: currentUser.id,
                media_id: entry.media_id,
                title: entry.title,
                poster_path: entry.poster_path,
                media_type: entry.type,
                rating: Number(entry.score) || null,
                status: entry.status,
                notes: entry.notes
            }
        ]);
        if (error) console.error('Supabase Save Error:', error.message);
    }

    updateProfileStats();
    closeMediaModal();
    alert(`Saved "${entry.title}" to your library!`);
}

async function deleteMediaEntry() {
    if (!activeMediaData) return;
    const id = String(activeMediaData.id || activeMediaData.title);

    delete userEntries[id];

    if (supabaseClient && currentUser) {
        await supabaseClient.from('watchlists').delete().eq('user_id', currentUser.id).eq('media_id', id);
    }

    updateProfileStats();
    closeMediaModal();
}

async function addToWatchlist(item) {
    if (!supabaseClient) return;
    if (!currentUser) return alert('Please log in to save items!');

    const { data, error } = await supabaseClient.from('watchlists').insert([
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
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
        .from('watchlists')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching watchlist:', error.message);
    } else if (data) {
        data.forEach(item => {
            userEntries[item.media_id] = {
                id: item.media_id,
                title: item.title,
                type: item.media_type,
                poster_path: item.poster_path,
                score: item.rating || 0,
                status: item.status || 'Completed',
                notes: item.notes || ''
            };
        });
        updateProfileStats();
    }
}

// --- API FETCH & RENDER MEDIA ---
async function fetchAndRenderMovies(filterCategory = activeFilter) {
    const gridContainer = document.getElementById('madeForYouGrid');
    if (!gridContainer) return;

    let mediaList = [];

    try {
        let endpoint = `${API_CONFIG.BASE_URL}/trending/${filterCategory === 'Movie' ? 'movie' : filterCategory === 'TV Show' ? 'tv' : 'all'}/week?api_key=${API_CONFIG.KEY}`;
        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            mediaList = data.results.map(item => {
                const isMovie = (item.media_type === 'movie') || Boolean(item.title);
                return {
                    id: String(item.id),
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

    gridContainer.innerHTML = mediaList.map(item => {
        const titleEscaped = escapeHtml(item.title);
        const yearFormatted = item.release_date ? item.release_date.split('-')[0] : 'N/A';
        const ratingFormatted = item.vote_average ? Number(item.vote_average).toFixed(1) : '8.0';

        return `
            <div class="movie-card" 
                 data-id="${item.id}"
                 data-title="${titleEscaped}" 
                 data-year="${yearFormatted}"
                 data-type="${item.type}"
                 data-rating="${ratingFormatted}"
                 data-overview="${escapeHtml(item.overview)}"
                 data-genres="${escapeHtml(item.genres)}">
                <div class="poster-wrapper">
                    <img src="${item.poster_path}" alt="${titleEscaped}" loading="lazy">
                    <div class="rating-badge"><i class="fa-solid fa-star"></i> ${ratingFormatted}</div>
                    <div class="status-badge">${item.type}</div>
                </div>
                <div class="movie-info">
                    <div>
                        <div class="movie-title">${titleEscaped}</div>
                        <div class="movie-meta">${yearFormatted} · ${item.type}</div>
                    </div>
                    <div class="action-circle"><i class="fa-solid fa-plus"></i></div>
                </div>
            </div>
        `;
    }).join('');
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
                    <span class="user-name">${escapeHtml(post.user.name)}</span>
                    <span class="user-handle">@${escapeHtml(post.user.username)} · ${post.timestamp}</span>
                </div>
                <button class="more-btn"><i class="fa-solid fa-ellipsis"></i></button>
            </div>
            <div class="feed-content">
                <p class="activity-text">
                    ${post.action} ${post.rating ? `<span class="rating-highlight"><i class="fa-solid fa-star"></i> ${post.rating}/10</span>` : ''}
                </p>
                ${post.media ? `
                    <div class="media-card" 
                         data-title="${escapeHtml(post.media.title)}"
                         data-year="${post.media.year}"
                         data-type="${post.media.type}"
                         data-rating="${post.rating || '8.5'}"
                         data-overview="High intensity anime set in Night City."
                         data-genres="Anime · Sci-Fi">
                        <img src="${post.media.posterUrl}" alt="${escapeHtml(post.media.title)}">
                        <div class="media-info">
                            <h4>${escapeHtml(post.media.title)}</h4>
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
                <span class="user-name">${escapeHtml(user.name)}</span>
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

// --- MODAL CONTROLLERS ---
function openMediaModal(data) {
    activeMediaData = data;
    const modal = document.getElementById('mediaModal');
    if (!modal) return;

    const id = String(data.id || data.title);
    const existing = userEntries[id] || {};

    const posterSrc = data.poster_path || data.posterUrl || '';
    const posterImg = document.getElementById('modalPoster');
    if (posterImg) posterImg.src = posterSrc;

    const titleEl = document.getElementById('modalTitle');
    if (titleEl) titleEl.textContent = data.title || 'Untitled';

    const subEl = document.getElementById('modalSubheading');
    if (subEl) subEl.textContent = `${data.type || 'Media'} · ${data.year || '2024'}`;

    const banner = document.getElementById('modalBanner');
    if (banner && posterSrc) {
        banner.style.backgroundImage = `url('${posterSrc}')`;
    }

    // Populate Fields from Existing Entry or Defaults
    if (document.getElementById('entryStatus')) document.getElementById('entryStatus').value = existing.status || 'Plan to Watch';
    if (document.getElementById('entryScore')) document.getElementById('entryScore').value = existing.score || 0;
    if (document.getElementById('entryProgress')) document.getElementById('entryProgress').value = existing.progress || 0;
    if (document.getElementById('entryStartDate')) document.getElementById('entryStartDate').value = existing.startDate || '';
    if (document.getElementById('entryFinishDate')) document.getElementById('entryFinishDate').value = existing.finishDate || '';
    if (document.getElementById('entryRewatches')) document.getElementById('entryRewatches').value = existing.rewatches || 0;
    if (document.getElementById('entryNotes')) document.getElementById('entryNotes').value = existing.notes || '';
    if (document.getElementById('entryPrivate')) document.getElementById('entryPrivate').checked = Boolean(existing.isPrivate);

    const favBtn = document.getElementById('modalFavoriteBtn');
    if (favBtn) {
        const isFav = Boolean(existing.isFavorite);
        favBtn.classList.toggle('active', isFav);
        const icon = favBtn.querySelector('i');
        if (icon) icon.className = isFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    }

    modal.classList.add('active');
}

function closeMediaModal() {
    const modal = document.getElementById('mediaModal');
    if (modal) modal.classList.remove('active');
}

// --- MAIN INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    const avatarEl = document.querySelector('.avatar');
    const profileDropdown = document.getElementById('profileDropdown');
    const authModal = document.getElementById('authModal');
    const authForm = document.getElementById('authForm');
    const authTitle = document.getElementById('authTitle');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authToggleBtn = document.getElementById('authToggleBtn');
    const authToggleText = document.getElementById('authToggleText');
    const usernameGroup = document.getElementById('usernameGroup');

    // Modal Form Buttons
    document.getElementById('modalSaveTopBtn')?.addEventListener('click', saveMediaEntry);
    document.getElementById('entryDeleteBtn')?.addEventListener('click', deleteMediaEntry);
    
    document.getElementById('modalFavoriteBtn')?.addEventListener('click', function() {
        this.classList.toggle('active');
        const icon = this.querySelector('i');
        if (icon) icon.className = this.classList.contains('active') ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    });

    // 1. Supabase Auth State Change Listener
    if (supabaseClient) {
        supabaseClient.auth.onAuthStateChange((event, session) => {
            currentUser = session ? session.user : null;
            if (currentUser) {
                console.log('Active user authenticated:', currentUser.id);
                if (avatarEl) avatarEl.textContent = getInitials(currentUser.email);
                updateProfileUI(currentUser);
                fetchUserWatchlist(currentUser.id);
            } else {
                console.log('No user authenticated');
                if (avatarEl) avatarEl.textContent = 'JS';
                updateProfileUI(null);
                if (profileDropdown) profileDropdown.classList.remove('active');
            }
        });
    }

    // 2. Auth & Dropdown Controls
    if (avatarEl) {
        avatarEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentUser) {
                if (profileDropdown) profileDropdown.classList.toggle('active');
            } else if (authModal) {
                authModal.classList.add('active');
            }
        });
    }

    document.getElementById('dropdownLogout')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (profileDropdown) profileDropdown.classList.remove('active');
        signOut();
    });

    document.getElementById('dropdownProfile')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (profileDropdown) profileDropdown.classList.remove('active');
        switchView('profileView');
    });

    document.getElementById('dropdownNotifications')?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Notifications coming soon!');
        if (profileDropdown) profileDropdown.classList.remove('active');
    });

    document.getElementById('dropdownSettings')?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Settings coming soon!');
        if (profileDropdown) profileDropdown.classList.remove('active');
    });

    if (authToggleBtn) {
        authToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            isSignUpMode = !isSignUpMode;

            if (authTitle) authTitle.textContent = isSignUpMode ? 'Create Account' : 'Welcome to Seenverse';
            if (authSubmitBtn) authSubmitBtn.textContent = isSignUpMode ? 'Sign Up' : 'Sign In';
            if (authToggleText) authToggleText.textContent = isSignUpMode ? 'Already have an account?' : "Don't have an account?";
            authToggleBtn.textContent = isSignUpMode ? 'Sign In' : 'Sign Up';
            if (usernameGroup) usernameGroup.style.display = isSignUpMode ? 'block' : 'none';
        });
    }

    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('authEmail')?.value;
            const password = document.getElementById('authPassword')?.value;
            const username = document.getElementById('authUsername')?.value;

            if (isSignUpMode) {
                await signUp(email, password, username);
            } else {
                await signIn(email, password);
            }
            if (authModal) authModal.classList.remove('active');
        });
    }

    // 3. Navigation & View Switching
    const navLinks = document.querySelectorAll(".nav-links a, .mobile-nav-link");
    const views = document.querySelectorAll(".view-section");

    function switchView(targetId, filter = 'all') {
        views.forEach(view => view.classList.remove("active"));
        const targetView = document.getElementById(targetId);
        if (targetView) targetView.classList.add("active");

        navLinks.forEach(l => {
            const matchesTarget = l.getAttribute("data-target") === targetId;
            const linkFilter = l.getAttribute("data-filter") || 'all';
            const isMatch = matchesTarget && (targetId !== 'homeView' || linkFilter === filter);
            l.classList.toggle("active", isMatch);
        });

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

    // 4. Global Event Delegation
    document.addEventListener('click', (e) => {
        // Profile Sub-tab Switcher
        const profileTab = e.target.closest('.profile-tab');
        if (profileTab) {
            e.preventDefault();
            document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
            profileTab.classList.add('active');
            return;
        }

        // Dismiss Profile Dropdown on Click Outside
        if (profileDropdown && !e.target.closest('.avatar-wrapper')) {
            profileDropdown.classList.remove('active');
        }

        // Close Modals
        if (e.target.closest('#modalCloseBtn') || e.target.id === 'mediaModal') {
            closeMediaModal();
            return;
        }

        if (e.target.closest('#authModalCloseBtn') || e.target.id === 'authModal') {
            if (authModal) authModal.classList.remove('active');
            return;
        }

        // Category Filter Tabs
        const filterBtn = e.target.closest('.filter-btn');
        if (filterBtn) {
            const filter = filterBtn.getAttribute('data-filter') || 'all';
            activeFilter = filter;
            
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

        // Watchlist + Button (Direct Add)
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

        // Open Detail Modal on Card Click
        const card = e.target.closest('.movie-card, .media-card');
        if (card) {
            openMediaModal({
                id: card.dataset.id || card.dataset.title,
                title: card.dataset.title || card.querySelector('.movie-title, h4')?.textContent || 'Title',
                year: card.dataset.year || '2024',
                type: card.dataset.type || 'Movie',
                rating: card.dataset.rating || '8.0',
                overview: card.dataset.overview || 'Overview details...',
                genres: card.dataset.genres || 'Sci-Fi',
                poster_path: card.querySelector('img')?.src || ''
            });
        }
    });

    // 5. Initial Load
    fetchAndRenderMovies('all');
    initSocialData();
});