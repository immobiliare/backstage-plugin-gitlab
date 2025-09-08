import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import {
    gitlabPlugin,
    EntityGitlabContent,
    EntityGitlabReadmeCard,
} from '../src/plugin';
import { GitlabCIApiRef, GitlabCIClient } from '../src/api';
import { mockedGitlabReqToRes, projectId } from './mock-gitlab/api-v4-v15.7.0';
import { configApiRef } from '@backstage/core-plugin-api';
import { GraphQLQuery } from '../src/api/GitlabCIApi';

const devEntity = {
    metadata: {
        annotations: {
            'gitlab.com/project-id': `${projectId}`,
            'gitlab.com/codeowners-path': `CODEOWNERS`,
            'gitlab.com/readme-path': `README.md`,
        },
        name: 'backstage',
    },
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
};

createDevApp()
    .registerPlugin(gitlabPlugin)
    .registerApi({
        api: GitlabCIApiRef,
        deps: { configApi: configApiRef },
        factory: ({ configApi }) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            const cli = GitlabCIClient.setupAPI({
                discoveryApi: {
                    getBaseUrl: () => Promise.resolve('https://gitlab.com'),
                },
                codeOwnersPath: configApi.getOptionalString(
                    'gitlab.defaultCodeOwnersPath'
                ),
                readmePath: configApi.getOptionalString(
                    'gitlab.defaultReadmePath'
                ),
            }).build('0');

            // Here we mock the client requests to GitLab
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            cli.callApi = async function (
                path: string,
                query: { [key in string]: string }
            ) {
                const response =
                    mockedGitlabReqToRes[
                        `${path}?${new URLSearchParams(query).toString()}`
                    ];
                return response || undefined;
            };

            // Here we mock the client requests to GitLab
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            cli.callGraphQLApi = async function (query: GraphQLQuery) {
                const queries = query.query.match(/query [\w]+\(/);
                if (!queries) return undefined;

                const response = mockedGitlabReqToRes[queries[0]];

                return response || undefined;
            };

            return {
                build: () => cli,
            };
        },
    })
    .addPage({
        element: (
            <EntityProvider entity={devEntity}>
                <EntityGitlabContent />
            </EntityProvider>
        ),
        title: 'Root Page',
        path: '/backstage-plugin-gitlab',
    })
    .addPage({
        element: (
            <EntityProvider entity={devEntity}>
                <EntityGitlabReadmeCard />
            </EntityProvider>
        ),
        title: 'Readme Card',
    })
    .render();
