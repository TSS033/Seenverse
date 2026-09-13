const API_CONFIG = {
    KEY: 'YOUR_API_KEY_HERE', 
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE: 'https://image.tmdb.org/t/p/w500'
};

// --- API FETCHING LOGIC ---
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

// --- DOM EVENT INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Select navigation links and view sections
    const navLinks = document.querySelectorAll(".nav-links a, .mobile-nav-link");
    const views = document.querySelectorAll(".view-section");

    // 2. Tab / View switching handler
    function switchView(targetId) {
        // Hide all view sections
        views.forEach(view => view.classList.remove("active"));

        // Reveal selected view section
        const targetView = document.getElementById(targetId);
        if (targetView) {
            targetView.classList.add("active");
        }

        // Update active link highlighting across top and mobile navigation
        navLinks.forEach(link => {
            if (link.getAttribute("data-target") === targetId) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });

        // Smooth scroll back to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 3. Attach click event listeners
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("data-target");
            if (targetId) {
                switchView(targetId);
            }
        });
    });

    // 4. Load dynamic content
    fetchAndRenderMovies();
});