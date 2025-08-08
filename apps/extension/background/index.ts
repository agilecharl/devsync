import axios from 'axios';
import fs from 'fs';
import { generateGitHubAppJwt } from '../../../libs/data/src/lib/generate-jwt';

export async function generateWebToken() {
  try {
    const PRIVATE_KEY = fs.readFileSync('pkcs8_key.pem', 'utf8');
    return await generateGitHubAppJwt(
      process.env.PLASMO_PUBLIC_GITHUB_APP_ID,
      PRIVATE_KEY
    );
  } catch (error) {
    console.error('JWT generation failed:', error);
    throw error;
  }
}

const GITHUB_USERNAME = process.env.PLASMO_PUBLIC_GITHUB_USERNAME;
const GITHUB_APP_ID = process.env.PLASMO_PUBLIC_GITHUB_APP_ID;
const GITHUB_TOKEN = process.env.PLASMO_PUBLIC_GITHUB_PAT;

async function getAllCommits() {
  try {
    const jwt = await generateWebToken();
    const response = await axios.get(
      `https://api.github.com/search/commits?q=author:${GITHUB_USERNAME}&sort=author-date&order=desc`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          Accept: 'application/vnd.github.cloak-preview',
        },
      }
    );
    return response.data.items;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `API Error (${error.response?.status}):`,
        error.response?.data
      );
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}

async function getUserRepos() {
  let page = 1;
  const perPage = 100;
  let allRepos: any[] = [];
  let hasMore = true;

  while (hasMore) {
    const response = await axios.get(
      `https://api.github.com/user/repos?per_page=${perPage}&affiliation=owner&page=${page}`,
      {
        headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
      }
    );
    const repos = response.data;
    allRepos = allRepos.concat(repos);

    // Check if there's a next page using Link header
    const linkHeader = response.headers.link;
    hasMore = linkHeader && linkHeader.includes('rel="next"');
    page++;
  }

  return allRepos;
}

async function getCommits() {
  let count = 0;
  const userRepos = await getUserRepos();

  for (const repo of userRepos) {
    const name = repo.name;
    if (repo.size === 0 || repo.default_branch === null) {
      console.log(`Skipping empty repository: ${name}`);
      continue;
    }
    const today = new Date().toISOString().split('T')[0];
    try {
      const res = await axios.get(
        `https://api.github.com/repos/${GITHUB_USERNAME}/${name}/commits?author=${GITHUB_USERNAME}&since=${today}T00:00:00Z`,
        {
          headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
        }
      );
      console.log(res);
      if (res.data.length > 0) {
        console.log(`${name}: ${res.data.length} commit(s)`);
        count += res.data.length;
      } else {
        console.log(`${name}: No commits today`);
      }
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 409) {
          console.log(`Repository ${name} is empty, skipping...`);
        } else if (e.response?.status === 404) {
          console.log(`Repository ${name} not found or no access, skipping...`);
        } else {
          console.error(
            `Failed to fetch commits for ${name}:`,
            e.response?.data
          );
        }
      }
      continue;
    }
  }

  return count;
}

/*
async function getCommitsWithPAT(
  username: string,
  installationAccessToken: string
) {
  const allRepos = await fetchAllInstallationRepos(installationAccessToken);
  console.log(`Found ${allRepos.length} repositories`);
  const today = new Date().toISOString().split('T')[0];
  const results: { repo: string; commits: number }[] = [];

  await Promise.all(
    allRepos.map(async (repo) => {
      const result = await fetchRepoCommitsCount(
        repo,
        username,
        installationAccessToken,
        today
      );
      if (result) {
        results.push(result);
      }
    })
  );

  const totalCommits = results.reduce((total, r) => total + r.commits, 0);
  console.log(`Total commits today: ${totalCommits}`);
  return totalCommits;
}

async function getCommits(username: string, jwt: string) {
  // For GitHub App installations, use the installation repos endpoint
  let page = 1;
  const perPage = 100;
  let allRepos: any[] = [];
  let hasMore = true;

  while (hasMore) {
    try {
      // Use installation repos endpoint instead of user repos
      const response = await axios.get(
        `https://api.github.com/installation/repositories?per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
            Accept: 'application/vnd.github+json',
          },
        }
      );

      const reposPage = response.data.repositories || response.data;
      allRepos = allRepos.concat(reposPage);
      hasMore = reposPage.length === perPage;
      page++;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          `API Error (${error.response?.status}):`,
          error.response?.data
        );
        if (error.response?.status === 403) {
          console.error('Possible causes:');
          console.error('1. GitHub App lacks repository permissions');
          console.error('2. Token has expired');
          console.error('3. App not installed for this user/organization');
        }
      }
      throw error;
    }
  }

  const results: { repo: string; commits: number }[] = [];

  for (const repo of allRepos) {
    const result = await fetchRepoCommits(username, jwt, repo);
    if (result) {
      results.push(result);
    }
  }

  console.log("Today's commits:");
  results.forEach((r) => console.log(`${r.repo}: ${r.commits} commit(s)`));

  return results.reduce((total, r) => total + r.commits, 0);
}

async function fetchRepoCommits(
  username: string,
  jwt: string,
  repo: any
): Promise<{ repo: string; commits: number } | null> {
  const name = repo.name;

  // Skip empty repositories
  if (repo.size === 0 || repo.default_branch === null) {
    console.log(`Skipping empty repository: ${name}`);
    return null;
  }

  // Get today's date in YYYY-MM-DD format
  const isoDate = new Date().toISOString().split('T')[0];

  try {
    const res = await axios.get(
      `https://api.github.com/repos/${username}/${name}/commits?author=${username}&since=${isoDate}T00:00:00Z`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    if (res.data.length > 0) {
      return { repo: name, commits: res.data.length };
    }
    return null;
  } catch (e) {
    // Handle specific error cases
    if (axios.isAxiosError(e)) {
      if (e.response?.status === 409) {
        console.log(`Repository ${name} is empty, skipping...`);
        return null;
      } else if (e.response?.status === 404) {
        console.log(`Repository ${name} not found or no access, skipping...`);
        return null;
      }
    }
    console.error(`Failed to fetch commits for ${name}:`, e);
    return { repo: name, commits: 0 };
  }
}

export async function getGithubUserCommitCount(
  username: string,
  jwt: string
): Promise<number> {
  // Get today's date in YYYY-MM-DD format (try both UTC and local time)
  const today = new Date();
  const utcDate = today.toISOString().split('T')[0];
  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split('T')[0];

  console.log('Searching for commits on dates:', { utcDate, localDate });

  // Try multiple search queries to cover timezone differences
  const queries = [
    `author:${username}+committer-date:${utcDate}`,
    `author:${username}+committer-date:${localDate}`,
    `author:${username}+author-date:${utcDate}`,
    `author:${username}+author-date:${localDate}`,
    `author:${username}+committer-date:${utcDate}..${utcDate}`,
  ];

  let totalCommits = 0;
  const seenShas = new Set<string>();

  for (const query of queries) {
    const { count, shas } = await fetchCommitsForQuery(query, jwt, seenShas);
    shas.forEach((sha) => seenShas.add(sha));
    totalCommits += count;
  }

  console.log('Total unique commits found:', totalCommits);
  return totalCommits;
}

async function fetchCommitsForQuery(
  query: string,
  jwt: string,
  seenShas: Set<string>
): Promise<{ count: number; shas: Set<string> }> {
  let count = 0;
  const newShas = new Set<string>();
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  try {
    while (hasMore) {
      const url = `https://api.github.com/search/commits?q=${query}&per_page=${perPage}&page=${page}`;
      console.log('Trying query:', query, 'page:', page);

      const response = await axios.get(url, {
        headers: {
          Accept: 'application/vnd.github.cloak-preview',
          Authorization: `Bearer ${jwt}`,
        },
      });

      const data = response.data;
      console.log(`Query result for "${query}" page ${page}:`, {
        total_count: data?.total_count,
        items_length: data?.items?.length,
      });

      if (data?.items && data.items.length > 0) {
        data.items.forEach((commit: any) => {
          if (commit.sha && !seenShas.has(commit.sha)) {
            newShas.add(commit.sha);
            count++;
          }
        });
        hasMore = data.items.length === perPage;
        page++;
      } else {
        hasMore = false;
      }
    }
  } catch (queryError) {
    if (axios.isAxiosError(queryError)) {
      // Handle specific search API errors
      if (queryError.response?.status === 422) {
        console.warn(`Invalid query: ${query}`, queryError.response.data);
      } else if (queryError.response?.status === 403) {
        console.warn('Rate limit or insufficient permissions for search API');
      }
    }
    console.warn(`Query failed: ${query}`, queryError);
  }
  return { count, shas: newShas };
}

async function getInstallationAccessToken(
  jwt: string,
  appId: string
): Promise<string> {
  try {
    // First, get the installation ID
    const installationId = await getInstallationId(jwt);

    const response = await axios.post(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {},
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );
    return response.data.token;
  } catch (error) {
    console.error('Failed to get installation access token:', error);
    throw error;
  }
}

async function getInstallationId(jwt: string): Promise<string> {
  try {
    const response = await axios.get(
      'https://api.github.com/app/installations',
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    if (response.data.length === 0) {
      throw new Error('No installations found for this GitHub App');
    }

    // Return the first installation ID
    return response.data[0].id.toString();
  } catch (error) {
    console.error('Failed to get installation ID:', error);
    throw error;
  }
}

// Alternative function using personal access token
// Fix the getCommitsWithPAT function to work with GitHub App installation tokens

async function fetchAllInstallationRepos(
  installationAccessToken: string
): Promise<any[]> {
  let page = 1;
  const perPage = 100;
  let allRepos: any[] = [];
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await axios.get(
        `https://api.github.com/installation/repositories?per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${installationAccessToken}`,
            Accept: 'application/vnd.github+json',
          },
        }
      );
      const reposPage = response.data.repositories || response.data;
      allRepos = allRepos.concat(reposPage);
      hasMore = reposPage.length === perPage;
      page++;
    } catch (error) {
      console.error('Error fetching repositories:', error);
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        console.error(
          'GitHub App may lack repository permissions or is not installed'
        );
      }
      throw error;
    }
  }
  return allRepos;
}

function isRepoSkippable(repo: any): boolean {
  return repo.size === 0 || repo.default_branch === null;
}

async function fetchRepoCommitsCount(
  repo: any,
  username: string,
  installationAccessToken: string,
  today: string
): Promise<{ repo: string; commits: number } | null> {
  if (isRepoSkippable(repo)) {
    console.log(`Skipping empty repository: ${repo.name}`);
    return null;
  }
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${repo.full_name}/commits?author=${username}&since=${today}T00:00:00Z`,
      {
        headers: {
          Authorization: `Bearer ${installationAccessToken}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );
    if (res.data.length > 0) {
      console.log(`${repo.name}: ${res.data.length} commit(s)`);
      return { repo: repo.name, commits: res.data.length };
    }
    return null;
  } catch (repoError) {
    if (axios.isAxiosError(repoError)) {
      if (repoError.response?.status === 409) {
        console.log(`Repository ${repo.name} is empty, skipping...`);
      } else if (repoError.response?.status === 404) {
        console.log(
          `Repository ${repo.name} not found or no access, skipping...`
        );
      } else {
        console.error(
          `Failed to fetch commits for ${repo.name}:`,
          repoError.response?.data
        );
      }
    }
    return null;
  }
}
*/
// Message listener with better error handling

chrome.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
  if (message.type === 'GET_COMMIT_COUNT') {
    if (!GITHUB_USERNAME) {
      sendResponse({ error: 'GITHUB_USERNAME not configured' });
      return false;
    }

    if (!GITHUB_APP_ID) {
      sendResponse({ error: 'GITHUB_APP_ID not configured' });
      return false;
    }

    // Handle async operations properly
    (async () => {
      try {
        const jwt = await generateWebToken();
        /*
        // Get installation access token
        const accessToken = await getInstallationAccessToken(
          jwt,
          GITHUB_APP_ID.toString()
        );
        */
        //const count = await getCommitsWithPAT(GITHUB_USERNAME, accessToken);
        //const count = getCommits();
        const count = await getAllCommits();
        sendResponse({ count });
      } catch (error) {
        console.error('Error in GET_COMMIT_COUNT:', error);
        sendResponse({
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    })();

    return true; // Keep connection open for async response
  }

  return false;
});

// Add error handlers for service worker
self.addEventListener('error', (event) => {
  console.error('Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
