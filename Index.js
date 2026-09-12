const API_CONFIG = {
    // PASTE YOUR API KEY HERE:
    KEY: 'YOUR_API_KEY_HERE', 
    
    // Base URL for fetching trending or recommended movies
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE: 'https://image.tmdb.org/t/p/w500'
};

// Fetch data from the API and render it
async function fetchAndRenderMovies() {
    if (API_CONFIG.KEY === 'YOUR_API_KEY_HERE') {
        console.log("No API Key detected. Displaying hardcoded fallback items.");
        return; 
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/discover/movie?api_key=${API_CONFIG.KEY}&with_genres=878`);
        const data = await response.json();

        const gridContainer = document.getElementById('madeForYouGrid');
        gridContainer.innerHTML = ''; // Clear hardcoded items

        const moviesToRender = data.results.slice(0, 6);

        moviesToRender.forEach(movie => {
            const cardHTML = `
                <div class="movie-card">
                    <div class="poster-wrapper">
                        <img src="${API_CONFIG.IMAGE_BASE}${movie.poster_path}" alt="${movie.title}">
                        <div class="rating-badge">★ ${movie.vote_average.toFixed(1)}</div>
                        <div class="status-badge">PLAN TO WATCH</div>
                    </div>
                    <div class="movie-info">
                        <div>
                            <div class="movie-title">${movie.title}</div>
                            <div class="movie-meta">${movie.release_date.split('-')[0]} · Movie</div>
                        </div>
                        <div class="action-circle">+</div>
                    </div>
                </div>
            `;
            gridContainer.innerHTML += cardHTML;
        });
    } catch (error) {
        console.error("Error fetching movies from API:", error);
    }
}

// Initialize the fetch when the page loads
document.addEventListener('DOMContentLoaded', fetchAndRenderMovies);