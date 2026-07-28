// DOM Elements
const usernameInput = document.getElementById('username-input');
const searchButton = document.getElementById('search-button');
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');

const profileSummarySection = document.getElementById('profile-summary');
const profileAvatar = document.getElementById('profile-avatar');
const profileName = document.getElementById('profile-name');
const profileLogin = document.getElementById('profile-login');
const profileBio = document.getElementById('profile-bio');
const followersCount = document.getElementById('followers-count');
const followingCount = document.getElementById('following-count');

const statsCardsSection = document.getElementById('stats-cards');
const reposCount = document.getElementById('repos-count');
const gistsCount = document.getElementById('gists-count');
const contributionsCount = document.getElementById('contributions-count');

const contributionsGraphSection = document.getElementById('contributions-graph');
const contributionCalendar = document.getElementById('contribution-calendar');

const repositoriesListSection = document.getElementById('repositories-list');
const repoGrid = document.getElementById('repo-grid');

// GitHub GraphQL API endpoint
const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';

// GraphQL Query for user profile data
// Fetches basic user info, stats, 6 most starred public repos, and contribution calendar.
// Note: Unauthenticated requests have strict rate limits (60 requests/hour/IP).
// For higher limits or private data, a Personal Access Token (PAT) would be needed (e.g., in headers: { 'Authorization': 'Bearer YOUR_PAT' }).
const GITHUB_PROFILE_QUERY = `
  query GitHubProfile($username: String!) {
    user(login: $username) {
      name
      login
      avatarUrl
      bio
      followers {
        totalCount
      }
      following {
        totalCount
      }
      repositories(first: 6, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
        totalCount
        nodes {
          name
          description
          primaryLanguage {
            name
            color
          }
          stargazers {
            totalCount
          }
          url
        }
      }
      gists {
        totalCount
      }
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              color
            }
          }
        }
      }
    }
  }
`;

/**
 * Displays the loading spinner.
 */
function showLoading() {
    loadingSpinner.style.display = 'block';
    errorMessage.style.display = 'none';
    clearResults();
}

/**
 * Hides the loading spinner.
 */
function hideLoading() {
    loadingSpinner.style.display = 'none';
}

/**
 * Displays an error message.
 * @param {string} message - The error message to display.
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    clearResults();
}

/**
 * Clears all previously displayed profile data sections.
 */
function clearResults() {
    profileSummarySection.classList.add('hidden');
    statsCardsSection.classList.add('hidden');
    contributionsGraphSection.classList.add('hidden');
    repositoriesListSection.classList.add('hidden');
    repoGrid.innerHTML = ''; // Clear previous repositories
    contributionCalendar.innerHTML = ''; // Clear previous calendar
}

/**
 * Fetches GitHub profile data for a given username using GraphQL.
 * @param {string} username - The GitHub username to fetch.
 */
async function fetchGitHubProfile(username) {
    showLoading();
    try {
        const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': 'Bearer YOUR_GITHUB_PAT' // Uncomment and add your PAT for higher rate limits
            },
            body: JSON.stringify({
                query: GITHUB_PROFILE_QUERY,
                variables: { username }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Check for GraphQL errors
        if (result.errors) {
            // GitHub API might return errors even with 200 OK for certain cases (e.g., user not found)
            const firstError = result.errors[0];
            if (firstError.type === 'NOT_FOUND' || firstError.message.includes('Could not resolve to a User with the login')) {
                showError(`User '${username}' not found.`);
            } else {
                showError(`GraphQL Error: ${firstError.message}`);
            }
            return;
        }

        const userData = result.data.user;

        if (!userData) {
            showError(`User '${username}' not found or profile is private.`);
            return;
        }

        displayProfile(userData);

    } catch (error) {
        console.error('Error fetching GitHub profile:', error);
        showError(`Failed to fetch profile: ${error.message}. Please try again later.`);
    } finally {
        hideLoading();
    }
}

/**
 * Renders the fetched GitHub profile data into the UI.
 * @param {object} userData - The user data object from the GraphQL API.
 */
function displayProfile(userData) {
    // Display Profile Summary
    profileAvatar.src = userData.avatarUrl;
    profileName.textContent = userData.name || userData.login; // Use login if name is null
    profileLogin.textContent = `@${userData.login}`;
    profileBio.textContent = userData.bio || 'No bio available.';
    followersCount.textContent = userData.followers.totalCount;
    followingCount.textContent = userData.following.totalCount;
    profileSummarySection.classList.remove('hidden');

    // Display Stats Cards
    reposCount.textContent = userData.repositories.totalCount;
    gistsCount.textContent = userData.gists.totalCount;
    contributionsCount.textContent = userData.contributionsCollection.contributionCalendar.totalContributions;
    statsCardsSection.classList.remove('hidden');

    // Display Contributions Graph
    renderContributionCalendar(userData.contributionsCollection.contributionCalendar.weeks);
    contributionsGraphSection.classList.remove('hidden');

    // Display Repositories List
    renderRepositories(userData.repositories.nodes);
    repositoriesListSection.classList.remove('hidden');
}

/**
 * Renders the contribution calendar grid.
 * @param {Array<object>} weeks - Array of week objects containing contribution days.
 */
function renderContributionCalendar(weeks) {
    contributionCalendar.innerHTML = ''; // Clear previous calendar

    // GitHub's contribution calendar typically starts with the first day of the week (Sunday) 
    // and fills empty days with placeholders for alignment. 
    // We'll reverse the weeks to display from left to right (oldest to newest).
    const allContributionDays = [];
    weeks.forEach(week => {
        week.contributionDays.forEach(day => allContributionDays.push(day));
    });

    // Determine the number of empty days at the beginning to align the first day of the week (Sunday)
    // The first day of the data might not be a Sunday. We need to pad it.
    // GitHub's API usually returns full weeks, but the first week might be partial.
    // Let's find the day of the week for the very first day in the data.
    if (allContributionDays.length > 0) {
        const firstDayDate = new Date(allContributionDays[0].date);
        const dayOfWeek = firstDayDate.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday

        // Add empty cells for days before the first actual contribution day to align with Sunday
        for (let i = 0; i < dayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('contribution-day', 'empty');
            contributionCalendar.appendChild(emptyDay);
        }
    }

    allContributionDays.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.classList.add('contribution-day');
        dayElement.style.backgroundColor = day.color; // Use GitHub's provided color
        dayElement.setAttribute('data-tooltip', 
            `${day.contributionCount} contributions on ${new Date(day.date).toDateString()}`
        );

        // Optional: Add data-count attribute for custom CSS based on count ranges if needed
        if (day.contributionCount > 0 && day.contributionCount < 10) dayElement.setAttribute('data-count', '1-9');
        else if (day.contributionCount >= 10 && day.contributionCount < 20) dayElement.setAttribute('data-count', '10-19');
        else if (day.contributionCount >= 20 && day.contributionCount < 30) dayElement.setAttribute('data-count', '20-29');
        else if (day.contributionCount >= 30) dayElement.setAttribute('data-count', '30+');
        else dayElement.setAttribute('data-count', '0');

        contributionCalendar.appendChild(dayElement);
    });
}


/**
 * Renders the list of repositories.
 * @param {Array<object>} repositories - Array of repository objects.
 */
function renderRepositories(repositories) {
    repoGrid.innerHTML = ''; // Clear previous repositories

    if (repositories.length === 0) {
        repoGrid.innerHTML = '<p style="text-align: center; opacity: 0.8;">No public repositories found.</p>';
        return;
    }

    repositories.forEach(repo => {
        const repoCard = document.createElement('div');
        repoCard.classList.add('repo-card');

        repoCard.innerHTML = `
            <h3><a href="${repo.url}" target="_blank" rel="noopener noreferrer">${repo.name}</a></h3>
            <p class="repo-description">${repo.description || 'No description provided.'}</p>
            <div class="repo-meta">
                ${repo.primaryLanguage ? 
                    `<span class="repo-language">
                        <span class="lang-color-dot" style="background-color: ${repo.primaryLanguage.color || '#cccccc'}"></span>
                        ${repo.primaryLanguage.name}
                    </span>` : ''
                }
                <span class="repo-stars">${repo.stargazers.totalCount}</span>
            </div>
        `;
        repoGrid.appendChild(repoCard);
    });
}

// Event Listeners
searchButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        fetchGitHubProfile(username);
    } else {
        showError('Please enter a GitHub username.');
    }
});

usernameInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchButton.click();
    }
});

// Initial search on page load with a default user
document.addEventListener('DOMContentLoaded', () => {
    fetchGitHubProfile(usernameInput.value);
});
