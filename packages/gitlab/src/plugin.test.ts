import { gitlabPlugin } from './plugin';
import { parseCodeOwners, parseGitLabReadme } from './components/utils';

const CODEOWNERS = `
# Lines starting with '#' are comments.
# Each line is a file pattern followed by one or more owners.

# These owners will be the default owners for everything in the repo.
*       @antoniomuso

# Order is important. The last matching pattern has the most precedence.
# So if a pull request only touches javascript files, only these owners
# will be requested to review.
*.js    @octocat @github/js

# You can also use email addresses if you prefer.
# docs/*  docs@example.com
`;

const CODEOWNERS2 = `# Specify a default Code Owner by using a wildcard:
* @amusolino`;

const README = `## TOC
[TOC]
[[_TOC_]]
## Heading 1
 [[_TOC_]] `;

describe('gitlabPlugin', () => {
    it('should export plugin', () => {
        expect(gitlabPlugin).toBeDefined();
    });

    it('parse codeOwners works', async () => {
        expect(parseCodeOwners(CODEOWNERS)).toEqual([
            {
                owners: ['@antoniomuso'],
                path: '*',
                rule: '*       @antoniomuso',
            },
            {
                owners: ['@octocat', '@github/js'],
                path: '*.js',
                rule: '*.js    @octocat @github/js',
            },
        ]);
    });

    it('parse codeOwners works', async () => {
        expect(parseCodeOwners(CODEOWNERS2)).toEqual([
            {
                owners: ['@amusolino'],
                path: '*',
                rule: '* @amusolino',
            },
        ]);
    });

    it('parseGitLabReadme converts GLFM TOC into a header', async () => {
        expect(parseGitLabReadme(README)).toEqual(
            [
                `## TOC`,
                `## <!-- injected_toc -->`,
                `## <!-- injected_toc -->`,
                `## Heading 1`,
                `## <!-- injected_toc -->`,
            ].join('\n')
        );
    });
});
