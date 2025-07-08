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
// If subpath is specified it is removed from the output ex.
// subPath = '/gitlab' or 'gitlab'
// from: https://gitlab.com/gitlab/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/filepath
// to:   groupA/teams/teamA/subgroupA/repoA
/**
 *
 * @param target https://gitlab.com/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/filepath
 * @returns repo path ex. groupA/teams/teamA/subgroupA/repoA
 */
export function getProjectPath(target: string, subPath?: string): string {
    const url = new URL(target);

    const out = url.pathname
        .split('/blob/')
        .splice(0, 1)
        .join('/')
        .split('/-')
        .splice(0, 1)
        .join('/')
        .slice(1);

    // Remove starting / from subpath
    subPath = subPath?.startsWith('/') ? subPath.slice(1) : subPath;
    if (subPath && out.startsWith(subPath)) {
        // Remove subpath from output
        return out.replace(subPath, '').split('/').filter(Boolean).join('/');
    }

    return out;
}
