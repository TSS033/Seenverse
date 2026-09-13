const API_CONFIG = {
    KEY: 'YOUR_API_KEY_HERE', 
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE: 'https://image.tmdb.org/t/p/w500'
};

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
                        <img src="${API_CONFIG.IMAGE_BASE}${movie.poster_path}" alt="${movie.title}">
                        <div class="rating-badge"><i class="fa-solid fa-star"></i> ${movie.vote_average.toFixed(1)}</div>
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

document.addEventListener("DOMContentLoaded", () => {
    const desktopLinks = document.querySelectorAll(".nav-links a");
    const mobileLinks = document.querySelectorAll(".mobile-nav-link");
    const views = document.querySelectorAll(".view-section");

    function switchView(targetId) {
        views.forEach(view => view.classList.remove("active"));
        const targetView = document.getElementById(targetId);
        if (targetView) targetView.classList.add("active");

        desktopLinks.forEach(l => {
            if (l.getAttribute("data-target") === targetId) {
                l.classList.add("active");
            } else {
                l.classList.remove("active");
            }
        });

        mobileLinks.forEach(l => {
            if (l.getAttribute("data-target") === targetId) {
                l.classList.add("active");
            } else {
                l.classList.remove("active");
            }
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    desktopLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("data-target");
            if (targetId) switchView(targetId);
        });
    });

    mobileLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("data-target");
            if (targetId) switchView(targetId);
        });
    });

    fetchAndRenderMovies();
});
// Helper to generate dynamic user avatars with initial letters
function getInitials(name) {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
}

// Render dynamic user activity posts
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

// Render dynamic "People to Follow" list
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

// Example API fetch integration point
async function fetchSocialData() {
    try {
        // Replace endpoint URLs with your backend API paths
        // const feedResponse = await fetch('/api/social/feed');
        // const postsData = await feedResponse.json();
        // renderSocialFeed(postsData);

        // const followResponse = await fetch('/api/social/suggested-users');
        // const usersData = await followResponse.json();
        // renderPeopleToFollow(usersData);
    } catch (error) {
        console.error("Failed to load social feed data:", error);
    }
}