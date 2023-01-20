import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { gitlabPlugin, EntityGitlabContent } from '../src/plugin';
import { GitlabCIApiRef, GitlabCIClient } from '../src/api';
import { mockedGitlabReqToRes, projectId } from './mock-gitlab/api-v4-v15.7.0';
import { configApiRef, discoveryApiRef } from '@backstage/core-plugin-api';

createDevApp()
    .registerPlugin(gitlabPlugin)
    .registerApi({
        api: GitlabCIApiRef,
        deps: { configApi: configApiRef, discoveryApi: discoveryApiRef },
        factory: ({ configApi }) => {
            const cli = GitlabCIClient.setupAPI({
                discoveryApi: {
                    getBaseUrl: () => Promise.resolve('https://gitlab.com'),
                },
                codeOwnersPath: configApi.getOptionalString(
                    'gitlab.defaultCodeOwnersPath'
                ),
            }).build(0);

            // Here we mock the client requests to GitLab
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            cli.callApi = async function (
                path: string,
                query: { [key in string]: any }
            ) {
                const response =
                    mockedGitlabReqToRes[
                        `${path}?${new URLSearchParams(query).toString()}`
                    ];
                return response || null;
            };
            return {
                build: (gitlabInstance: string) => cli,
            };
        },
    })
    .addPage({
        element: (
            <EntityProvider
                entity={{
                    metadata: {
                        annotations: {
                            'gitlab.com/project-id': `${projectId}`,
                            'gitlab.com/codeowners-path': `CODEOWNERS`,
                        },
                        name: 'backstage',
                    },
                    apiVersion: 'backstage.io/v1alpha1',
                    kind: 'Component',
                }}
            >
                {' '}
                <EntityGitlabContent />
            </EntityProvider>
        ),
        title: 'Root Page',
        path: '/backstage-plugin-gitlab',
    })
    .render();
