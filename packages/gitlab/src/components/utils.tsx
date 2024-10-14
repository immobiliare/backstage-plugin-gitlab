import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import { FileOwnership } from './types';
dayjs.extend(relativeTime);
dayjs.extend(duration);

export const getElapsedTime = (start: string) => {
    return dayjs(start).fromNow();
};

export const getDuration = (start: string, end: string) => {
    if (!end || !start) {
        return 'NA';
    }

    const end_time = dayjs(end); //todays date
    const start_time = dayjs(start); // another date
    const duration = dayjs.duration(
        end_time.diff(start_time, 'seconds'),
        'seconds'
    );

    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    const output = `${days ? days + 'd ' : ''}${hours ? hours + 'h ' : ''}${
        minutes ? minutes + 'm ' : ''
    }${seconds ? seconds + 's' : ''}`;

    if (!output) return '0s';

    return output;
};

/*
The following code is a modification of https://github.com/jjmschofield/github-codeowners 

Copyright (c) 2020 Jack Schofield (https://github.com/jjmschofield)

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

export const parseCodeOwners = (str: string): FileOwnership[] => {
    try {
        const lines = str.replace(/\r/g, '').split('\n');

        const owned = [];

        for (const line of lines) {
            if (!line || line.startsWith('#')) {
                continue;
            }

            owned.push(parseCodeOwnerLine(line));
        }

        return owned;
    } catch (error) {
        console.log(`failed to load codeowners`, error);
        throw error;
    }
};

const parseCodeOwnerLine = (rule: string): FileOwnership => {
    // Split apart on spaces
    const parts = rule.split(/\s+/);

    // The first part is expected to be the path
    const path = parts[0];

    let teamNames: string[] = [];

    // Remaining parts are expected to be team names (if any)
    if (parts.length > 1) {
        teamNames = parts.slice(1, parts.length);
        for (const name of teamNames) {
            if (!codeOwnerRegex.test(name)) {
                throw new Error(
                    `${name} is not a valid owner name in rule ${rule}`
                );
            }
        }
    }

    return {
        rule,
        path,
        owners: teamNames,
    };
};

// matches RCF 5322 compliant email addresses - taken from https://emailregex.com/
const codeOwnersEmailRegex =
    /(^(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$)/;

// matches gitlab usernames - taken from https://gitlab.com/gitlab-org/gitlab/-/blob/master/lib/gitlab/path_regex.rb#L127-135
const codeOwnersGitlabUsernameRegex =
    /(^@[a-zA-Z0-9_\.][a-zA-Z0-9_\-\.]{0,254}[a-zA-Z0-9_\-]|[a-zA-Z0-9_]$)/;

// ensures that only the following patterns are allowed @octocat @github/js docs@example.com @octo.cat
const codeOwnerRegex = new RegExp(
    codeOwnersGitlabUsernameRegex.source + '|' + codeOwnersEmailRegex.source
);

// Remark does not fully support GLFM, but remark-toc can generate a TOC, but it requires a # heading, whereas GLFM does not.
export const parseGitLabReadme = (readme: string): string => {
    const lines = readme.split('\n');

    const modifiedLines = lines.map((line) => {
        if (/^\[TOC\]|\[\[_TOC_\]\]$/.test(line.trim())) {
            return `## <!-- injected_toc -->`; // remark-toc turns this into a TOC but keeps the heading, then remark-remove-comments makes the heading invisible
        }
        return line;
    });

    return modifiedLines.join('\n');
};
