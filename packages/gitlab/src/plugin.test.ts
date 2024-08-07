import { ProjectSchema } from '@gitbeaker/rest';
import {
    parseCodeOwners,
    parseGitLabReadme,
    resolveReadmeRelativelinks,
} from './components/utils';
import { gitlabPlugin } from './plugin';

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

const README_WITH_LINKS = [
    'This is relative [link](./link.md)',
    'This is absolute [link](https://gitlab.com/link.md)',
    '[Same-Line Relative Link](./link.md)',
    '[Same-Line Absolute Link](https://gitlab.com/link.md)',
    '[./link.md](./link.md)',
    '[https://gitlab.com/link.md](https://gitlab.com/link.md)',
    '[Dot Prefix Link](./link.md)',
    '[Slash Prefix Link](/link.md)',
    '[Dot Slash Prefix Link](./link.md)',
    '[No Prefix Link](link.md)',
    '[Link with Subdirectory](./subdir/link.md)',
    '[Link with Subdirectory and Anchor](./subdir/link.md#anchor)',
];

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

    it('resolveReadmeRelativelinks works', async () => {
        expect(
            resolveReadmeRelativelinks(README_WITH_LINKS.join('\n'), {
                web_url: 'https://gitlab.com/project',
                default_branch: 'main',
            } as ProjectSchema).split('\n')
        ).toEqual([
            'This is relative [link](https://gitlab.com/project/-/blob/main/link.md)',
            'This is absolute [link](https://gitlab.com/link.md)',
            '[Same-Line Relative Link](https://gitlab.com/project/-/blob/main/link.md)',
            '[Same-Line Absolute Link](https://gitlab.com/link.md)',
            '[https://gitlab.com/project/-/blob/main/link.md](https://gitlab.com/project/-/blob/main/link.md)',
            '[https://gitlab.com/link.md](https://gitlab.com/link.md)',
            '[Dot Prefix Link](https://gitlab.com/project/-/blob/main/link.md)',
            '[Slash Prefix Link](https://gitlab.com/project/-/blob/main/link.md)',
            '[Dot Slash Prefix Link](https://gitlab.com/project/-/blob/main/link.md)',
            '[No Prefix Link](https://gitlab.com/project/-/blob/main/link.md)',
            '[Link with Subdirectory](https://gitlab.com/project/-/blob/main/subdir/link.md)',
            '[Link with Subdirectory and Anchor](https://gitlab.com/project/-/blob/main/subdir/link.md#anchor)',
        ]);
    });
});
