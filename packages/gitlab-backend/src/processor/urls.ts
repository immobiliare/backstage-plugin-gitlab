import { join } from 'path';

// Converts
// from: https://gitlab.com/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/filepath
// to:   https://gitlab.com/api/v4/projects/teams/teamA/subgroupA/repoA
export function buildProjectUrl(target: string): URL {
    try {
        const url = new URL(target);

        const repoPathIdentifier = url.pathname
            .split('/blob/')
            .splice(0, 1)
            .join('/')
            .split('/-')
            .splice(0, 1)
            .join('/');

        url.pathname = join(
            'api/v4/projects',
            encodeURIComponent(repoPathIdentifier.slice(1))
        );
        return url;
    } catch (e) {
        throw new Error(`Incorrect url: ${target}, ${e}`);
    }
}

// from: https://gitlab.com/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/filepath
// to:   groupA/teams/teamA/subgroupA/repoA
/**
 *
 * @param target https://gitlab.com/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/filepath
 * @returns repo path ex. groupA/teams/teamA/subgroupA/repoA
 */
export function getProjectPath(target: string): string {
    const url = new URL(target);

    return url.pathname
        .split('/blob/')
        .splice(0, 1)
        .join('/')
        .split('/-')
        .splice(0, 1)
        .join('/')
        .slice(1);
}
