// --- CONFIGURATION ---
const API_CONFIG = {
    KEY: '69ac2d5df8a30694620f698937bf84e3', 
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE: 'https://image.tmdb.org/t/p/w500',
    BACKDROP_BASE: 'https://image.tmdb.org/t/p/w780'
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
    { id: '101', title: 'Blade Runner 2049', release_date: '2017-10-06', vote_average: 8.7, type: 'Movie', poster_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500&auto=format&fit=crop', backdrop_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop', overview: 'A young Blade Runner\'s discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard.', genres: 'Sci-Fi · Drama' },
    { id: '102', title: 'Cyberpunk: Edgerunners', release_date: '2022-09-13', vote_average: 8.3, type: 'TV Show', poster_path: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=500&auto=format&fit=crop', backdrop_path: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop', overview: 'A street kid trying to survive in a technology and body modification-obsessed city of the future.', genres: 'Anime · Sci-Fi' },
    { id: '103', title: 'Dune: Part Two', release_date: '2024-03-01', vote_average: 8.5, type: 'Movie', poster_path: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500&auto=format&fit=crop', backdrop_path: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop', overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', genres: 'Sci-Fi · Adventure' },
    { id: '104', title: 'The Matrix', release_date: '1999-03-31', vote_average: 8.7, type: 'Movie', poster_path: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=500&auto=format&fit=crop', backdrop_path: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop', overview: 'A computer hacker learns from mysterious rebels about the true nature of his reality.', genres: 'Sci-Fi · Action' }
];

// Baseline Genre Data
const BASE_GENRES = [
    { name: 'Action', count: 328, score: 72.14, days: 123, hours: 15, posters: ['https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=200&auto=format&fit=crop'] },
    { name: 'Fantasy', count: 289, score: 70.75, days: 105, hours: 3, posters: ['https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=200&auto=format&fit=crop'] },
    { name: 'Adventure', count: 218, score: 70.91, days: 99, hours: 19, posters: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=200&auto=format&fit=crop'] },
    { name: 'Comedy', count: 162, score: 69.26, days: 71, hours: 6, posters: ['https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=200&auto=format&fit=crop'] },
    { name: 'Drama', count: 117, score: 73.40, days: 56, hours: 13, posters: ['https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=200&auto=format&fit=crop'] },
    { name: 'Sci-Fi', count: 95, score: 76.50, days: 42, hours: 8, posters: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=200&auto=format&fit=crop'] }
];

// --- STATE MANAGEMENT ---
let activeFilter = 'all';
let currentUser = null;
let isSignUpMode = false;
let userEntries = {}; 
let activeMediaData = null;
let activeProfileTab = 'overview';
let activeListFilter = 'all';
let currentMovieGenreSort = 'count';
let currentTvGenreSort = 'count';

// --- SEARCH & FILTER STATE ---
let searchState = {
    query: '',
    selectedGenres: [],
    yearFrom: null,
    yearTo: null,
    minRating: 0,
    sortBy: 'new-old',
    currentResults: []
};

// --- LOCAL STORAGE PERSISTENCE HELPERS ---
function saveEntriesToLocalStorage() {
    try {
        localStorage.setItem('streamhub_userEntries', JSON.stringify(userEntries));
    } catch (e) {
        console.error("Failed to save entries to localStorage", e);
    }
}

function loadEntriesFromLocalStorage() {
    try {
        const saved = localStorage.getItem('streamhub_userEntries');
        if (saved) {
            userEntries = JSON.parse(saved);
        }
    } catch (e) {
        console.error("Failed to load entries from localStorage", e);
    }
}

function saveViewState(viewId, filter = 'all') {
    localStorage.setItem('streamhub_activeView', viewId);
    localStorage.setItem('streamhub_activeFilter', filter);
    localStorage.setItem('streamhub_activeProfileTab', activeProfileTab);
}

// --- HELPER FUNCTIONS ---
function normalizeString(str) {
    if (!str) return '';
    return String(str)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ''); // Removes spaces, hyphens, and special characters
}

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
    
    const totalMedia = entries.length;
    const completedMovies = entries.filter(e => e.type === 'Movie' && e.status === 'Completed').length;
    const tvTracked = entries.filter(e => e.type === 'TV Show' && e.status !== 'Dropped').length;
    
    const totalHours = entries.reduce((acc, curr) => {
        const count = Number(curr.progress) || (curr.type === 'Movie' ? 1 : 10);
        return acc + (count * 2); 
    }, 0);
    const daysWatched = (totalHours / 24).toFixed(1);

    const scoredEntries = entries.filter(e => Number(e.score) > 0);
    const meanScore = scoredEntries.length > 0 
        ? (scoredEntries.reduce((acc, curr) => acc + Number(curr.score), 0) / scoredEntries.length).toFixed(1)
        : '0.0';

    const statNums = document.querySelectorAll('.profile-stat-box .stat-num');
    if (statNums.length >= 3) {
        statNums[0].textContent = totalMedia;
        statNums[1].textContent = daysWatched;
        statNums[2].textContent = meanScore;
    }

    const progressGroup = document.querySelectorAll('.stat-progress-group');
    if (progressGroup.length >= 2) {
        progressGroup[0].querySelector('.progress-info span:last-child').textContent = `${completedMovies} Completed`;
        progressGroup[0].querySelector('.progress-bar-fill').style.width = `${Math.min(100, (completedMovies / 10) * 100)}%`;

        progressGroup[1].querySelector('.progress-info span:last-child').textContent = `${tvTracked} Tracked`;
        progressGroup[1].querySelector('.progress-bar-fill').style.width = `${Math.min(100, (tvTracked / 10) * 100)}%`;
    }

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

    const favGrid = document.querySelector('.profile-media-mini-grid');
    const favorites = entries.filter(e => e.isFavorite);
    if (favGrid) {
        if (favorites.length > 0) {
            favGrid.innerHTML = favorites.map(item => `
                <div class="movie-card" 
                     data-id="${item.id}" 
                     data-title="${escapeHtml(item.title)}" 
                     data-type="${escapeHtml(item.type)}" 
                     data-rating="${item.score || '8.0'}"
                     data-genres="${escapeHtml(item.genres || '')}"
                     data-backdrop="${item.backdrop_path || ''}">
                    <div class="poster-wrapper">
                        <img src="${item.poster_path}" alt="${escapeHtml(item.title)}">
                        <div class="rating-badge"><i class="fa-solid fa-star"></i> ${item.score || '8.0'}</div>
                    </div>
                    <div class="movie-title">${escapeHtml(item.title)}</div>
                </div>
            `).join('');
        } else {
            favGrid.innerHTML = `<p class="muted-text">No favorites added yet.</p>`;
        }
    }
}

// --- PROFILE SUB-TAB CONTROLLER ---
function initProfileSubTabs() {
    const profileTabs = document.querySelectorAll('.profile-tab');
    const tabContents = document.querySelectorAll('.profile-tab-content');

    profileTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = tab.getAttribute('data-profile-tab');
            if (!targetTab) return;

            activeProfileTab = targetTab;
            localStorage.setItem('streamhub_activeProfileTab', activeProfileTab);

            profileTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            tabContents.forEach(content => {
                content.classList.toggle('active', content.id === `tab-${targetTab}`);
            });

            renderProfileSubView(targetTab);
        });
    });
}

function renderProfileSubView(tabName = activeProfileTab) {
    switch (tabName) {
        case 'medialist':
            renderMediaListTable();
            break;
        case 'favorites':
            renderFavoritesPage();
            break;
        case 'stats':
            renderStatsPage();
            break;
        case 'social':
            renderProfileSocialRows();
            break;
        case 'overview':
        default:
            updateProfileStats();
            break;
    }
}

// --- STATS SUB-SECTION SWITCHER ---
function switchStatsSubSection(subName) {
    const sideBtns = document.querySelectorAll('.stats-side-btn');
    sideBtns.forEach(btn => {
        const btnSub = btn.getAttribute('data-stats-sub');
        btn.classList.toggle('active', btnSub === subName);
    });

    const sections = document.querySelectorAll('.stats-sub-section');
    sections.forEach(sec => {
        sec.style.display = 'none';
        sec.classList.remove('active');
    });

    if (subName === 'movie-overview') {
        const sec = document.getElementById('statsMovieOverviewSection');
        if (sec) { sec.style.display = 'block'; sec.classList.add('active'); }
        renderMovieStats();
    } else if (subName === 'movie-genres') {
        const sec = document.getElementById('statsMovieGenresSection');
        if (sec) { sec.style.display = 'block'; sec.classList.add('active'); }
        renderGenresStatsGrid('movie', currentMovieGenreSort);
    } else if (subName === 'tv-overview') {
        const sec = document.getElementById('statsTvOverviewSection');
        if (sec) { sec.style.display = 'block'; sec.classList.add('active'); }
        renderTvStats();
    } else if (subName === 'tv-genres') {
        const sec = document.getElementById('statsTvGenresSection');
        if (sec) { sec.style.display = 'block'; sec.classList.add('active'); }
        renderGenresStatsGrid('tv', currentTvGenreSort);
    }
}

// --- STATS INTERACTION & NAVIGATION CONTROLLER ---
function initStatsTabControls() {
    // 1. Sidebar Stats Buttons (Movies & TV Shows Sub-Sections)
    document.querySelectorAll('.stats-side-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const sub = btn.getAttribute('data-stats-sub');
            if (sub) switchStatsSubSection(sub);
        });
    });

    // 2. Genre Sorting Pills (Movies vs TV Shows)
    document.querySelectorAll('.genres-pill-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const type = btn.getAttribute('data-type') || 'movie';
            const sort = btn.getAttribute('data-sort') || 'count';

            const container = btn.closest('.genres-sort-pills');
            if (container) {
                container.querySelectorAll('.genres-pill-btn').forEach(b => b.classList.remove('active'));
            }
            btn.classList.add('active');

            if (type === 'movie') {
                currentMovieGenreSort = sort;
                renderGenresStatsGrid('movie', currentMovieGenreSort);
            } else {
                currentTvGenreSort = sort;
                renderGenresStatsGrid('tv', currentTvGenreSort);
            }
        });
    });

    // 3. Chart Toggle Pills (.pill-btn: Titles Watched, Hours Watched, Mean Score)
    document.querySelectorAll('.chart-toggle-pills').forEach(pillGroup => {
        pillGroup.addEventListener('click', (e) => {
            const pillBtn = e.target.closest('.pill-btn');
            if (!pillBtn) return;

            e.preventDefault();
            pillGroup.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
            pillBtn.classList.add('active');

            const selectedMetric = pillBtn.textContent.trim();
            const chartCard = pillBtn.closest('.chart-card');
            if (chartCard) {
                updateChartMetricView(chartCard, selectedMetric);
            }
        });
    });

    // 4. Metric Pills Click Navigation (.metric-pill & .profile-stat-box)
    document.querySelectorAll('.metric-pill, .profile-stat-box').forEach(pill => {
        pill.addEventListener('click', () => {
            const label = pill.querySelector('.metric-lbl, .stat-lbl')?.textContent.toLowerCase() || '';

            // Switch to Stats Sub-Tab if currently in another profile tab
            const statsTabBtn = document.querySelector('.profile-tab[data-profile-tab="stats"]');
            if (statsTabBtn && activeProfileTab !== 'stats') {
                statsTabBtn.click();
            }

            // Scroll to the corresponding metric chart
            setTimeout(() => {
                if (label.includes('score')) {
                    document.getElementById('movieScoreChartContainer')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (label.includes('episodes') || label.includes('watched') || label.includes('days') || label.includes('hours')) {
                    document.getElementById('tvEpisodeCountChartContainer')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (label.includes('titles') || label.includes('media') || label.includes('total')) {
                    document.getElementById('movieReleaseYearChart')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 50);
        });
    });
}

function updateChartMetricView(chartCard, metricLabel) {
    const chartContainer = chartCard.querySelector('.bar-chart-container, .line-chart-wrapper');
    if (!chartContainer) return;

    const isMovie = chartContainer.id.startsWith('movie');
    const entries = Object.values(userEntries).filter(e => e.type === (isMovie ? 'Movie' : 'TV Show'));

    if (chartContainer.id === 'movieScoreChartContainer' || chartContainer.id === 'tvScoreChartContainer') {
        renderScoreChart(chartContainer.id, entries, metricLabel);
    } else if (chartContainer.id === 'tvEpisodeCountChartContainer') {
        renderEpisodeCountChart(chartContainer.id, entries, metricLabel);
    } else if (chartContainer.id === 'movieReleaseYearChart' || chartContainer.id === 'tvReleaseYearChart') {
        renderReleaseYearChart(chartContainer.id, entries, metricLabel);
    } else if (chartContainer.id === 'movieWatchYearChart' || chartContainer.id === 'tvWatchYearChart') {
        renderWatchYearChart(chartContainer.id, entries, metricLabel);
    }
}

// --- GENRES PAGE RENDERER (SEPARATED FOR MOVIES & TV SHOWS) ---
function renderGenresStatsGrid(mediaType = 'movie', sortBy = 'count') {
    const gridId = mediaType === 'movie' ? 'movieGenresCardsGrid' : 'tvGenresCardsGrid';
    const grid = document.getElementById(gridId);
    if (!grid) return;

    let data = BASE_GENRES.map(g => ({ ...g, posters: [...g.posters] }));
    const targetType = mediaType === 'movie' ? 'Movie' : 'TV Show';

    const entries = Object.values(userEntries).filter(e => e.type === targetType);
    
    if (entries.length > 0) {
        const genreMap = {};
        entries.forEach(item => {
            if (item.genres) {
                item.genres.split('·').forEach(gStr => {
                    const gName = gStr.trim();
                    if (!genreMap[gName]) {
                        genreMap[gName] = { name: gName, count: 0, totalScore: 0, scoreCount: 0, days: 0, hours: 0, posters: [] };
                    }
                    genreMap[gName].count += 1;
                    if (item.score > 0) {
                        genreMap[gName].totalScore += Number(item.score);
                        genreMap[gName].scoreCount += 1;
                    }
                    const hrs = (Number(item.progress) || 1) * 2;
                    genreMap[gName].hours += hrs;
                    if (item.poster_path && !genreMap[gName].posters.includes(item.poster_path)) {
                        genreMap[gName].posters.unshift(item.poster_path);
                    }
                });
            }
        });

        data = Object.values(genreMap).map(g => {
            const totalHours = g.hours;
            const days = Math.floor(totalHours / 24);
            const hours = totalHours % 24;
            const score = g.scoreCount > 0 ? (g.totalScore / g.scoreCount) * 10 : 70;
            return {
                name: g.name,
                count: g.count,
                score: score,
                days: days,
                hours: hours,
                posters: g.posters.length > 0 ? g.posters : BASE_GENRES[0].posters
            };
        });
    }

    if (sortBy === 'score') {
        data.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'time') {
        data.sort((a, b) => (b.days * 24 + b.hours) - (a.days * 24 + a.hours));
    } else {
        data.sort((a, b) => b.count - a.count);
    }

    grid.innerHTML = data.map((genre, idx) => `
        <div class="genre-card">
            <div class="genre-card-header">
                <h3>${escapeHtml(genre.name)}</h3>
                <span class="genre-rank-badge">${idx + 1}</span>
            </div>
            <div class="genre-card-stats">
                <div class="genre-stat">
                    <div class="genre-stat-val">${genre.count}</div>
                    <div class="genre-stat-lbl">Count</div>
                </div>
                <div class="genre-stat">
                    <div class="genre-stat-val">${genre.score.toFixed(1)}%</div>
                    <div class="genre-stat-lbl">Mean Score</div>
                </div>
                <div class="genre-stat">
                    <div class="genre-stat-val">${genre.days}d ${genre.hours}h</div>
                    <div class="genre-stat-lbl">Time Watched</div>
                </div>
            </div>
            <div class="genre-card-posters">
                ${genre.posters.slice(0, 4).map(p => `<img src="${p}" alt="${escapeHtml(genre.name)}">`).join('')}
            </div>
        </div>
    `).join('');
}

// --- MOVIE STATS RENDERER ---
function renderMovieStats() {
    const movies = Object.values(userEntries).filter(e => e.type === 'Movie');

    const totalMovies = movies.length;
    const totalHours = movies.reduce((acc, curr) => acc + 2, 0); 
    const daysWatched = (totalHours / 24).toFixed(1);

    const scored = movies.filter(e => Number(e.score) > 0);
    const meanScore = scored.length > 0 ? (scored.reduce((a, b) => a + Number(b.score), 0) / scored.length).toFixed(1) : '0.0';

    if (document.getElementById('movieStatTotal')) document.getElementById('movieStatTotal').textContent = totalMovies;
    if (document.getElementById('movieStatHours')) document.getElementById('movieStatHours').textContent = totalHours;
    if (document.getElementById('movieStatDays')) document.getElementById('movieStatDays').textContent = daysWatched;
    if (document.getElementById('movieStatMeanScore')) document.getElementById('movieStatMeanScore').textContent = meanScore;

    renderScoreChart('movieScoreChartContainer', movies);
    
    const statusContainer = document.getElementById('movieStatusDonutContainer');
    if (statusContainer) {
        const data = [
            { label: 'Completed', count: movies.filter(e => e.status === 'Completed').length, color: '#68d391' },
            { label: 'Watching', count: movies.filter(e => e.status === 'Watching').length, color: '#3db4f2' },
            { label: 'Planning', count: movies.filter(e => e.status === 'Plan to Watch').length, color: '#f6ad55' },
            { label: 'Dropped', count: movies.filter(e => e.status === 'Dropped').length, color: '#fc8181' }
        ];
        const donut = createDonutChartSVG(data);
        statusContainer.innerHTML = donut.svgHtml + donut.legendHtml;
    }

    const countryContainer = document.getElementById('movieCountryDonutContainer');
    if (countryContainer) {
        const data = [
            { label: 'USA', count: Math.ceil(totalMovies * 0.7) || 1, color: '#319795' },
            { label: 'UK / Other', count: Math.floor(totalMovies * 0.3) || 0, color: '#b794f4' }
        ];
        const donut = createDonutChartSVG(data);
        countryContainer.innerHTML = donut.svgHtml + donut.legendHtml;
    }

    renderReleaseYearChart('movieReleaseYearChart', movies);
    renderWatchYearChart('movieWatchYearChart', movies);
}

// --- TV SHOW STATS RENDERER ---
function renderTvStats() {
    const tvShows = Object.values(userEntries).filter(e => e.type === 'TV Show');

    const totalShows = tvShows.length;
    const episodesWatched = tvShows.reduce((acc, curr) => acc + (Number(curr.progress) || 0), 0);
    const totalHours = episodesWatched * 1;
    const daysWatched = (totalHours / 24).toFixed(1);

    const scored = tvShows.filter(e => Number(e.score) > 0);
    const meanScore = scored.length > 0 ? (scored.reduce((a, b) => a + Number(b.score), 0) / scored.length).toFixed(1) : '0.0';

    if (document.getElementById('tvStatTotal')) document.getElementById('tvStatTotal').textContent = totalShows;
    if (document.getElementById('tvStatEpisodes')) document.getElementById('tvStatEpisodes').textContent = episodesWatched;
    if (document.getElementById('tvStatDays')) document.getElementById('tvStatDays').textContent = daysWatched;
    if (document.getElementById('tvStatMeanScore')) document.getElementById('tvStatMeanScore').textContent = meanScore;

    renderScoreChart('tvScoreChartContainer', tvShows);
    renderEpisodeCountChart('tvEpisodeCountChartContainer', tvShows);

    const statusContainer = document.getElementById('tvStatusDonutContainer');
    if (statusContainer) {
        const data = [
            { label: 'Completed', count: tvShows.filter(e => e.status === 'Completed').length, color: '#68d391' },
            { label: 'Watching', count: tvShows.filter(e => e.status === 'Watching').length, color: '#3db4f2' },
            { label: 'Planning', count: tvShows.filter(e => e.status === 'Plan to Watch').length, color: '#f6ad55' },
            { label: 'Dropped', count: tvShows.filter(e => e.status === 'Dropped').length, color: '#fc8181' }
        ];
        const donut = createDonutChartSVG(data);
        statusContainer.innerHTML = donut.svgHtml + donut.legendHtml;
    }

    const countryContainer = document.getElementById('tvCountryDonutContainer');
    if (countryContainer) {
        const data = [
            { label: 'Japan', count: Math.ceil(totalShows * 0.6) || 1, color: '#b794f4' },
            { label: 'USA', count: Math.floor(totalShows * 0.4) || 0, color: '#319795' }
        ];
        const donut = createDonutChartSVG(data);
        countryContainer.innerHTML = donut.svgHtml + donut.legendHtml;
    }

    renderReleaseYearChart('tvReleaseYearChart', tvShows);
    renderWatchYearChart('tvWatchYearChart', tvShows);
}

// --- SHARED CHART HELPERS ---
function renderScoreChart(containerId, entries, mode = 'Titles Watched') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scoreCounts = Array(10).fill(0);
    entries.forEach(e => {
        const val = Math.round(Number(e.score));
        if (val >= 1 && val <= 10) {
            let mult = 1;
            if (mode === 'Hours Watched') mult = (Number(e.progress) || 1) * 2;
            else if (mode === 'Mean Score') mult = val;
            scoreCounts[val - 1] += mult;
        }
    });

    const maxCount = Math.max(...scoreCounts, 1);
    container.innerHTML = scoreCounts.map((count, idx) => `
        <div class="chart-bar-col">
            <span class="bar-count-lbl">${count > 0 ? count : ''}</span>
            <div class="bar-fill-inner" style="height: ${Math.round((count / maxCount) * 100)}%;"></div>
            <span class="bar-x-lbl">${idx + 1}</span>
        </div>
    `).join('');
}

function renderEpisodeCountChart(containerId, entries, mode = 'Titles Watched') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const epRanges = [
        { label: '1-12', min: 1, max: 12, count: 0 },
        { label: '13-24', min: 13, max: 24, count: 0 },
        { label: '25-50', min: 25, max: 50, count: 0 },
        { label: '51-100', min: 51, max: 100, count: 0 },
        { label: '100+', min: 101, max: Infinity, count: 0 }
    ];

    entries.forEach(e => {
        const prog = Number(e.progress) || 0;
        const r = epRanges.find(range => prog >= range.min && prog <= range.max);
        if (r) {
            let mult = 1;
            if (mode === 'Hours Watched') mult = prog * 2;
            else if (mode === 'Mean Score') mult = Number(e.score) || 1;
            r.count += mult;
        }
    });

    const maxEpCount = Math.max(...epRanges.map(r => r.count), 1);
    container.innerHTML = epRanges.map(r => `
        <div class="chart-bar-col">
            <span class="bar-count-lbl">${r.count > 0 ? r.count : ''}</span>
            <div class="bar-fill-inner" style="height: ${Math.round((r.count / maxEpCount) * 100)}%;"></div>
            <span class="bar-x-lbl">${r.label}</span>
        </div>
    `).join('');
}

function renderReleaseYearChart(containerId, entries, mode = 'Titles Watched') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const yearCounts = {};
    entries.forEach(e => {
        const y = e.year || (e.release_date ? e.release_date.split('-')[0] : '2024');
        let val = 1;
        if (mode === 'Hours Watched') val = (Number(e.progress) || 1) * 2;
        else if (mode === 'Mean Score') val = Number(e.score) || 0;
        yearCounts[y] = (yearCounts[y] || 0) + val;
    });

    const points = Object.keys(yearCounts).sort().map(y => ({ label: y, value: yearCounts[y] }));
    const fallbackPoints = [
        { label: '2020', value: 2 },
        { label: '2021', value: 4 },
        { label: '2022', value: 3 },
        { label: '2023', value: 7 },
        { label: '2024', value: 5 }
    ];

    container.innerHTML = createLineChartSVG(points.length > 0 ? points : fallbackPoints);
}

function renderWatchYearChart(containerId, entries, mode = 'Titles Watched') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const watchCounts = {};
    entries.forEach(e => {
        const wy = e.finishDate ? e.finishDate.split('-')[0] : '2024';
        let val = 1;
        if (mode === 'Hours Watched') val = (Number(e.progress) || 1) * 2;
        else if (mode === 'Mean Score') val = Number(e.score) || 0;
        watchCounts[wy] = (watchCounts[wy] || 0) + val;
    });

    const points = Object.keys(watchCounts).sort().map(y => ({ label: y, value: watchCounts[y] }));
    const fallbackWatch = [
        { label: '2022', value: 1 },
        { label: '2023', value: 3 },
        { label: '2024', value: 6 }
    ];

    container.innerHTML = createLineChartSVG(points.length > 0 ? points : fallbackWatch);
}

function createDonutChartSVG(data) {
    const total = data.reduce((acc, d) => acc + d.count, 0);
    if (total === 0) {
        return {
            svgHtml: `<svg class="donut-chart-svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="3.8"/></svg>`,
            legendHtml: `<div class="donut-legend-list"><div class="muted-text">No data</div></div>`
        };
    }

    let cumulativePercent = 0;
    const slices = data.filter(d => d.count > 0).map(item => {
        const percent = (item.count / total) * 100;
        const strokeDasharray = `${percent} ${100 - percent}`;
        const strokeDashoffset = 100 - cumulativePercent + 25;
        cumulativePercent += percent;
        return `<circle cx="18" cy="18" r="15.9155" fill="none" stroke="${item.color}" stroke-width="3.8" stroke-dasharray="${strokeDasharray}" stroke-dashoffset="${strokeDashoffset}"/>`;
    }).join('');

    const svgHtml = `<svg class="donut-chart-svg" viewBox="0 0 36 36">${slices}</svg>`;
    const legendHtml = `<div class="donut-legend-list">` + data.filter(d => d.count > 0).map(item => {
        const pct = Math.round((item.count / total) * 100);
        return `
            <div class="legend-item-row">
                <span class="legend-label">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${item.color}; display: inline-block;"></span>
                    ${escapeHtml(item.label)}
                </span>
                <span class="legend-badge" style="background-color: ${item.color}22; color: ${item.color}">${item.count} (${pct}%)</span>
            </div>
        `;
    }).join('') + `</div>`;

    return { svgHtml, legendHtml };
}

function createLineChartSVG(dataPoints) {
    if (!dataPoints || dataPoints.length === 0) return `<p class="muted-text py-3 text-center">No trend data available.</p>`;

    const width = 600;
    const height = 160;
    const padding = 30;

    const values = dataPoints.map(d => d.value);
    const maxVal = Math.max(...values, 1);
    const stepX = (width - padding * 2) / Math.max(1, dataPoints.length - 1);

    const points = dataPoints.map((dp, idx) => {
        const x = padding + idx * stepX;
        const y = height - padding - ((dp.value / maxVal) * (height - padding * 2));
        return { x, y, value: dp.value, label: dp.label };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const cp1x = curr.x + (next.x - curr.x) / 2;
        const cp1y = curr.y;
        const cp2x = curr.x + (next.x - curr.x) / 2;
        const cp2y = next.y;
        pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }

    const nodesHtml = points.map(p => `
        <circle class="chart-node" cx="${p.x}" cy="${p.y}" r="4.5" />
        <text class="chart-val-lbl" x="${p.x}" y="${p.y - 10}">${p.value}</text>
        <text class="chart-x-lbl" x="${p.x}" y="${height - 5}">${p.label}</text>
    `).join('');

    return `
        <svg class="line-chart-svg" viewBox="0 0 ${width} ${height}">
            <path class="chart-line-path" d="${pathD}" />
            ${nodesHtml}
        </svg>
    `;
}

function renderStatsPage() {
    renderMovieStats();
    renderTvStats();

    // Default active section switch
    const activeSideBtn = document.querySelector('.stats-side-btn.active');
    const defaultSub = activeSideBtn ? activeSideBtn.getAttribute('data-stats-sub') : 'movie-overview';
    switchStatsSubSection(defaultSub);
}

// --- MEDIA LIST TABLE RENDERER ---
function renderMediaListTable() {
    const tableBody = document.getElementById('mediaListTableBody');
    if (!tableBody) return;

    const searchTerm = normalizeString(document.getElementById('listSearchInput')?.value || '');
    const formatFilter = document.getElementById('listFormatFilter')?.value || 'all';

    let entries = Object.values(userEntries);

    if (activeListFilter !== 'all') {
        entries = entries.filter(e => e.status === activeListFilter);
    }

    if (formatFilter !== 'all') {
        entries = entries.filter(e => e.type === formatFilter);
    }

    if (searchTerm) {
        entries = entries.filter(e => normalizeString(e.title).includes(searchTerm));
    }

    if (entries.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center muted-text py-4">No media found in this list category.</td></tr>`;
        return;
    }

    tableBody.innerHTML = entries.map(item => `
        <tr class="media-row-item" data-id="${item.id}">
            <td>
                <div class="table-media-cell">
                    <img src="${item.poster_path}" alt="${escapeHtml(item.title)}" class="table-thumb">
                    <span class="font-weight-600">${escapeHtml(item.title)}</span>
                </div>
            </td>
            <td class="text-center font-weight-600 text-cyan">${item.score > 0 ? item.score : '-'}</td>
            <td class="text-center muted-text">${item.progress || 0} / ${item.type === 'Movie' ? '1' : '12'}</td>
            <td class="text-center muted-text">${escapeHtml(item.type)}</td>
        </tr>
    `).join('');
}

// --- FAVORITES PAGE RENDERER ---
function renderFavoritesPage() {
    const favGrid = document.getElementById('favoritesFullGrid');
    if (!favGrid) return;

    const favorites = Object.values(userEntries).filter(e => e.isFavorite);

    if (favorites.length === 0) {
        favGrid.innerHTML = `<p class="muted-text">No favorite media added yet. Open a title and click the heart icon to save it here!</p>`;
        return;
    }

    favGrid.innerHTML = favorites.map(item => `
        <div class="movie-card" 
             data-id="${item.id}" 
             data-title="${escapeHtml(item.title)}" 
             data-type="${escapeHtml(item.type)}" 
             data-rating="${item.score || '8.0'}"
             data-genres="${escapeHtml(item.genres || '')}"
             data-backdrop="${item.backdrop_path || ''}">
            <div class="poster-wrapper">
                <img src="${item.poster_path}" alt="${escapeHtml(item.title)}">
                <div class="rating-badge"><i class="fa-solid fa-star"></i> ${item.score || '8.0'}</div>
            </div>
            <div class="movie-title">${escapeHtml(item.title)}</div>
        </div>
    `).join('');
}

// --- PROFILE SOCIAL ROWS RENDERER ---
function renderProfileSocialRows() {
    const followingGrid = document.getElementById('followingUserGrid');
    const sampleFollowing = [
        { name: 'Sarah Jenkins', username: 'sjenkins', avatarColor: '#4f46e5' },
        { name: 'Marcus Chen', username: 'mchen', avatarColor: '#10b981' }
    ];

    if (followingGrid) {
        const followingLbl = document.getElementById('followingCountLbl');
        if (followingLbl) followingLbl.textContent = `${sampleFollowing.length} Users`;

        followingGrid.innerHTML = sampleFollowing.map(u => `
            <div class="user-mini-card">
                <div class="user-avatar" style="background-color: ${u.avatarColor};">${getInitials(u.name)}</div>
                <div class="user-meta">
                    <span class="user-name">${escapeHtml(u.name)}</span>
                    <span class="user-handle">@${escapeHtml(u.username)}</span>
                </div>
            </div>
        `).join('');
    }

    const followersGrid = document.getElementById('followersUserGrid');
    const sampleFollowers = [
        { name: 'Elena Rostova', username: 'erostova', avatarColor: '#e06d53' }
    ];

    if (followersGrid) {
        const followersLbl = document.getElementById('followersCountLbl');
        if (followersLbl) followersLbl.textContent = `${sampleFollowers.length} Users`;

        followersGrid.innerHTML = sampleFollowers.map(u => `
            <div class="user-mini-card">
                <div class="user-avatar" style="background-color: ${u.avatarColor};">${getInitials(u.name)}</div>
                <div class="user-meta">
                    <span class="user-name">${escapeHtml(u.name)}</span>
                    <span class="user-handle">@${escapeHtml(u.username)}</span>
                </div>
            </div>
        `).join('');
    }

    const userPostsFeed = document.getElementById('myUserPostsFeed');
    const username = currentUser?.user_metadata?.username || 'Guest User';
    const userPostsLbl = document.getElementById('userPostsCountLbl');

    if (userPostsFeed) {
        if (userPostsLbl) userPostsLbl.textContent = `1 Post`;
        userPostsFeed.innerHTML = `
            <div class="feed-card">
                <div class="feed-header">
                    <div class="user-avatar" style="background-color: #6366f1;">${getInitials(username)}</div>
                    <div class="user-meta">
                        <span class="user-name">${escapeHtml(username)}</span>
                        <span class="user-handle">Just now</span>
                    </div>
                </div>
                <div class="feed-content">
                    <p class="activity-text">Updated watchlist entry and ratings.</p>
                </div>
            </div>
        `;
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
        backdrop_path: activeMediaData.backdrop_path || activeMediaData.backdropUrl || '',
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
    saveEntriesToLocalStorage();

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
    renderProfileSubView(activeProfileTab);
    closeMediaModal();
    alert(`Saved "${entry.title}" to your library!`);
}

async function deleteMediaEntry() {
    if (!activeMediaData) return;
    const id = String(activeMediaData.id || activeMediaData.title);

    delete userEntries[id];
    saveEntriesToLocalStorage();

    if (supabaseClient && currentUser) {
        await supabaseClient.from('watchlists').delete().eq('user_id', currentUser.id).eq('media_id', id);
    }

    updateProfileStats();
    renderProfileSubView(activeProfileTab);
    closeMediaModal();
}

async function addToWatchlist(item) {
    const entry = {
        id: String(item.id || item.title),
        media_id: String(item.id || item.title),
        title: item.title,
        type: item.type || 'Movie',
        poster_path: item.poster_path,
        score: Number(item.rating) || 0,
        status: 'Plan to Watch'
    };
    userEntries[entry.id] = entry;
    saveEntriesToLocalStorage();

    if (supabaseClient && currentUser) {
        await supabaseClient.from('watchlists').insert([
            {
                user_id: currentUser.id,
                media_id: entry.media_id,
                title: entry.title,
                poster_path: entry.poster_path,
                media_type: entry.type,
                rating: Number(entry.score) || null
            }
        ]);
    }

    updateProfileStats();
    alert(`${item.title} added to your library!`);
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
            const existing = userEntries[item.media_id] || {};
            userEntries[item.media_id] = {
                ...existing,
                id: item.media_id,
                title: item.title,
                type: item.media_type || existing.type || 'Movie',
                poster_path: item.poster_path || existing.poster_path,
                score: item.rating !== null ? item.rating : (existing.score || 0),
                status: item.status || existing.status || 'Plan to Watch',
                notes: item.notes || existing.notes || ''
            };
        });
        saveEntriesToLocalStorage();
        updateProfileStats();
        renderProfileSubView(activeProfileTab);
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
                    backdrop_path: item.backdrop_path ? (API_CONFIG.BACKDROP_BASE + item.backdrop_path) : '',
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
                 data-backdrop="${item.backdrop_path || ''}"
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

// --- SEARCH, FILTER & SORT CONTROLLER ---
function initSearchControls() {
    const filterPanel = document.getElementById('advancedFilterPanel');
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    const searchInput = document.getElementById('globalSearchInput');
    const searchSubmitBtn = document.getElementById('globalSearchSubmitBtn');
    const minRatingSlider = document.getElementById('filterMinRating');
    const minRatingDisplay = document.getElementById('minRatingValDisplay');
    const sortSelect = document.getElementById('sortResultsSelect');

    // 1. Toggle Filter Panel Dropdown
    filterToggleBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        filterPanel?.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (filterPanel && !filterPanel.contains(e.target) && e.target !== filterToggleBtn) {
            filterPanel.classList.remove('active');
        }
    });

    document.getElementById('closeFilterPanelBtn')?.addEventListener('click', () => {
        filterPanel?.classList.remove('active');
    });

    // 2. Multi-genre Selection Chips
    document.querySelectorAll('#filterGenreChips .chip-option').forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('selected');
            const genre = chip.getAttribute('data-genre');
            if (chip.classList.contains('selected')) {
                if (!searchState.selectedGenres.includes(genre)) searchState.selectedGenres.push(genre);
            } else {
                searchState.selectedGenres = searchState.selectedGenres.filter(g => g !== genre);
            }
        });
    });

    // 3. Min Rating Live Label
    minRatingSlider?.addEventListener('input', (e) => {
        if (minRatingDisplay) minRatingDisplay.textContent = Number(e.target.value).toFixed(1);
    });

    // 4. Trigger Search on Button Click or Enter Key
    searchSubmitBtn?.addEventListener('click', triggerSearchExecution);
    searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') triggerSearchExecution();
    });

    document.getElementById('applyFiltersBtn')?.addEventListener('click', () => {
        filterPanel?.classList.remove('active');
        triggerSearchExecution();
    });

    // 5. Reset Filters Button
    document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
        searchState.selectedGenres = [];
        searchState.yearFrom = null;
        searchState.yearTo = null;
        searchState.minRating = 0;
        
        document.querySelectorAll('#filterGenreChips .chip-option').forEach(c => c.classList.remove('selected'));
        if (document.getElementById('filterYearFrom')) document.getElementById('filterYearFrom').value = '';
        if (document.getElementById('filterYearTo')) document.getElementById('filterYearTo').value = '';
        if (minRatingSlider) minRatingSlider.value = 0;
        if (minRatingDisplay) minRatingDisplay.textContent = '0.0';
        updateFilterIndicator();
    });

    // 6. Sort Selector Listener
    sortSelect?.addEventListener('change', (e) => {
        searchState.sortBy = e.target.value;
        if (searchState.currentResults.length > 0) {
            applySortAndRenderResults();
        }
    });
}

function updateFilterIndicator() {
    const activeDot = document.getElementById('filterActiveDot');
    const hasActiveFilters = searchState.selectedGenres.length > 0 || 
                             searchState.yearFrom || 
                             searchState.yearTo || 
                             searchState.minRating > 0;

    if (activeDot) activeDot.style.display = hasActiveFilters ? 'block' : 'none';
}

// --- EXECUTE SEARCH ENGINE (INTEGRATED FUZZY SEARCH WITH FUSE.JS) ---
async function triggerSearchExecution() {
    const queryInput = document.getElementById('globalSearchInput')?.value.trim() || '';
    const yFrom = parseInt(document.getElementById('filterYearFrom')?.value) || null;
    const yTo = parseInt(document.getElementById('filterYearTo')?.value) || null;
    const minRating = parseFloat(document.getElementById('filterMinRating')?.value) || 0;

    searchState.query = queryInput;
    searchState.yearFrom = yFrom;
    searchState.yearTo = yTo;
    searchState.minRating = minRating;

    updateFilterIndicator();

    let rawMediaList = [];

    // Fetch from TMDB API if query exists
    if (queryInput.length > 0) {
        try {
            const endpoint = `${API_CONFIG.BASE_URL}/search/multi?api_key=${API_CONFIG.KEY}&query=${encodeURIComponent(queryInput)}`;
            const response = await fetch(endpoint);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                rawMediaList = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv').map(item => {
                    const isMovie = item.media_type === 'movie';
                    return {
                        id: String(item.id),
                        title: isMovie ? item.title : item.name,
                        release_date: isMovie ? item.release_date : item.first_air_date,
                        vote_average: item.vote_average || 0,
                        type: isMovie ? 'Movie' : 'TV Show',
                        poster_path: item.poster_path ? (API_CONFIG.IMAGE_BASE + item.poster_path) : '',
                        backdrop_path: item.backdrop_path ? (API_CONFIG.BACKDROP_BASE + item.backdrop_path) : '',
                        overview: item.overview || 'No overview available.',
                        genres: isMovie ? 'Sci-Fi · Action' : 'Drama · Sci-Fi'
                    };
                });
            }
        } catch (e) {
            console.error("API search failed, falling back to local dataset:", e);
        }
    }

    // Merge API results or fallback dataset with existing user library entries
    if (rawMediaList.length === 0) {
        const localArray = Object.values(userEntries);
        rawMediaList = localArray.length > 0 ? localArray : FALLBACK_MEDIA;
    }

    // --- FUZZY MATCHING WITH WEIGHTED FUSE.JS ENGINE ---
    let filteredList = rawMediaList;

    if (searchState.query) {
        if (typeof Fuse !== 'undefined') {
            const fuseOptions = {
                includeScore: true,
                threshold: 0.35,        // 0.35 provides balanced typo tolerance
                distance: 100,          // Distance to search within titles
                minMatchCharLength: 2,
                ignoreLocation: true,   // Matches anywhere in the title
                keys: [
                    { name: 'title', weight: 0.8 },
                    { name: 'genres', weight: 0.2 }
                ]
            };

            const fuse = new Fuse(rawMediaList, fuseOptions);
            const fuseResults = fuse.search(searchState.query);
            filteredList = fuseResults.map(res => res.item);
        } else {
            // Fallback normalized substring check if Fuse library fails to load
            const queryNorm = normalizeString(searchState.query);
            filteredList = rawMediaList.filter(item => normalizeString(item.title).includes(queryNorm));
        }
    }

    // Apply Secondary Filters (Min Rating, Year Range, Selected Genres)
    filteredList = filteredList.filter(item => {
        // Rating Match
        const rating = Number(item.vote_average || item.score || 0);
        if (rating < searchState.minRating) return false;

        // Year Match
        const releaseYear = parseInt(item.release_date ? item.release_date.split('-')[0] : item.year) || 0;
        if (searchState.yearFrom && releaseYear < searchState.yearFrom) return false;
        if (searchState.yearTo && releaseYear > searchState.yearTo) return false;

        // Genre Match
        if (searchState.selectedGenres.length > 0 && item.genres) {
            const itemGenres = item.genres.split('·').map(g => g.trim());
            const hasMatchingGenre = searchState.selectedGenres.some(g => itemGenres.includes(g));
            if (!hasMatchingGenre) return false;
        }

        return true;
    });

    searchState.currentResults = filteredList;
    switchView('searchResultsView');
    applySortAndRenderResults();
}

// --- APPLY SORTING & RENDER RESULTS GRID ---
function applySortAndRenderResults() {
    let sorted = [...searchState.currentResults];
    const sortBy = searchState.sortBy;

    if (sortBy === 'new-old') {
        sorted.sort((a, b) => {
            const yA = parseInt(a.release_date ? a.release_date.split('-')[0] : a.year) || 0;
            const yB = parseInt(b.release_date ? b.release_date.split('-')[0] : b.year) || 0;
            return yB - yA;
        });
    } else if (sortBy === 'highest-rated') {
        sorted.sort((a, b) => {
            const rA = Number(a.vote_average || a.score || 0);
            const rB = Number(b.vote_average || b.score || 0);
            return rB - rA;
        });
    }

    const grid = document.getElementById('searchResultsGrid');
    const countLabel = document.getElementById('searchResultsCount');
    const titleLabel = document.getElementById('searchResultsTitle');

    if (titleLabel) {
        titleLabel.textContent = searchState.query ? `Results for "${searchState.query}"` : 'Filtered Results';
    }

    if (countLabel) {
        countLabel.textContent = `Showing ${sorted.length} ${sorted.length === 1 ? 'title' : 'titles'}`;
    }

    if (!grid) return;

    if (sorted.length === 0) {
        grid.innerHTML = `<div class="muted-text py-5 text-center" style="grid-column: 1/-1;">No matching movies or TV shows found matching your criteria.</div>`;
        return;
    }

    grid.innerHTML = sorted.map(item => `
        <div class="movie-card" 
             data-id="${item.id}"
             data-title="${escapeHtml(item.title)}" 
             data-year="${item.release_date ? item.release_date.split('-')[0] : 'N/A'}"
             data-type="${item.type}"
             data-rating="${Number(item.vote_average || item.score || 8.0).toFixed(1)}"
             data-overview="${escapeHtml(item.overview || '')}"
             data-backdrop="${item.backdrop_path || ''}"
             data-genres="${escapeHtml(item.genres || '')}">
            <div class="poster-wrapper">
                <img src="${item.poster_path || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500&auto=format&fit=crop'}" alt="${escapeHtml(item.title)}" loading="lazy">
                <div class="rating-badge"><i class="fa-solid fa-star"></i> ${Number(item.vote_average || item.score || 8.0).toFixed(1)}</div>
                <div class="status-badge">${item.type}</div>
            </div>
            <div class="movie-info">
                <div>
                    <div class="movie-title">${escapeHtml(item.title)}</div>
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

    const bannerUrl = data.backdrop_path || data.backdropUrl || posterSrc;
    const banner = document.getElementById('modalBanner');
    if (banner && bannerUrl) {
        banner.style.backgroundImage = `url('${bannerUrl}')`;
    }

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

// --- MAIN INITIALIZATION & VIEW SWITCHER ---
function switchView(targetId, filter = 'all') {
    const navLinks = document.querySelectorAll(".nav-links a, .mobile-nav-link");
    const views = document.querySelectorAll(".view-section");

    views.forEach(view => view.classList.remove("active"));
    const targetView = document.getElementById(targetId);
    if (targetView) targetView.classList.add("active");

    saveViewState(targetId, filter);

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
    } else if (targetId === 'profileView') {
        renderProfileSubView(activeProfileTab);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

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

    // 1. Load LocalStorage Entries
    loadEntriesFromLocalStorage();

    // 2. Initialize Tab & Search Controls
    initProfileSubTabs();
    initStatsTabControls();
    initSearchControls();

    // Restore active sub-tab if stored
    const savedSubTab = localStorage.getItem('streamhub_activeProfileTab');
    if (savedSubTab) {
        activeProfileTab = savedSubTab;
        document.querySelectorAll('.profile-tab').forEach(tab => {
            const t = tab.getAttribute('data-profile-tab');
            tab.classList.toggle('active', t === activeProfileTab);
        });
        document.querySelectorAll('.profile-tab-content').forEach(c => {
            c.classList.toggle('active', c.id === `tab-${activeProfileTab}`);
        });
        renderProfileSubView(activeProfileTab);
    }

    // 3. Setup Listeners
    document.querySelectorAll('.list-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.list-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeListFilter = btn.getAttribute('data-status-filter') || 'all';
            const titleEl = document.getElementById('currentListCategoryTitle');
            if (titleEl) titleEl.textContent = activeListFilter === 'all' ? 'All Entries' : activeListFilter;
            renderMediaListTable();
        });
    });

    document.getElementById('listSearchInput')?.addEventListener('input', renderMediaListTable);
    document.getElementById('listFormatFilter')?.addEventListener('change', renderMediaListTable);

    document.getElementById('modalSaveTopBtn')?.addEventListener('click', saveMediaEntry);
    document.getElementById('entryDeleteBtn')?.addEventListener('click', deleteMediaEntry);
    
    document.getElementById('modalFavoriteBtn')?.addEventListener('click', function() {
        this.classList.toggle('active');
        const icon = this.querySelector('i');
        if (icon) icon.className = this.classList.contains('active') ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    });

    // Supabase Auth State Change Listener
    if (supabaseClient) {
        supabaseClient.auth.onAuthStateChange((event, session) => {
            currentUser = session ? session.user : null;
            if (currentUser) {
                if (avatarEl) avatarEl.textContent = getInitials(currentUser.email);
                updateProfileUI(currentUser);
                fetchUserWatchlist(currentUser.id);
            } else {
                if (avatarEl) avatarEl.textContent = 'JS';
                updateProfileUI(null);
                if (profileDropdown) profileDropdown.classList.remove('active');
            }
        });
    }

    // Auth & Profile Controls
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

    if (authToggleBtn) {
        authToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            isSignUpMode = !isSignUpMode;
            if (authTitle) authTitle.textContent = isSignUpMode ? 'Create Account' : 'Welcome to StreamHub';
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

    // Navigation Click Handlers
    const navLinks = document.querySelectorAll(".nav-links a, .mobile-nav-link");
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("data-target");
            const filter = link.getAttribute("data-filter") || 'all';
            if (targetId) switchView(targetId, filter);
        });
    });

    // Delegation Handlers
    document.addEventListener('click', (e) => {
        if (profileDropdown && !e.target.closest('.avatar-wrapper')) {
            profileDropdown.classList.remove('active');
        }

        if (e.target.closest('#modalCloseBtn') || e.target.id === 'mediaModal') {
            closeMediaModal();
            return;
        }

        if (e.target.closest('#authModalCloseBtn') || e.target.id === 'authModal') {
            if (authModal) authModal.classList.remove('active');
            return;
        }

        const filterBtn = e.target.closest('.filter-btn');
        if (filterBtn) {
            const filter = filterBtn.getAttribute('data-filter') || 'all';
            activeFilter = filter;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            filterBtn.classList.add('active');
            fetchAndRenderMovies(filter);
            return;
        }

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

        const mediaRowItem = e.target.closest('.media-row-item');
        if (mediaRowItem) {
            const id = mediaRowItem.dataset.id;
            const existing = userEntries[id];
            if (existing) {
                openMediaModal(existing);
                return;
            }
        }

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
                poster_path: card.querySelector('img')?.src || '',
                backdrop_path: card.dataset.backdrop || card.querySelector('img')?.src || ''
            });
        }
    });

    // 4. Restore Saved View State on page load
    const savedView = localStorage.getItem('streamhub_activeView') || 'homeView';
    const savedFilter = localStorage.getItem('streamhub_activeFilter') || 'all';
    
    switchView(savedView, savedFilter);
    initSocialData();
    updateProfileStats();
});