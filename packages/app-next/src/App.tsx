/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import { createApp } from '@backstage/frontend-defaults';
import {
    ApiBlueprint,
    configApiRef,
    createFrontendModule,
    SignInPageBlueprint,
} from '@backstage/frontend-plugin-api';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';

import { navigationExtension } from './components/Sidebar';
import { SignInPage } from '@backstage/core-components';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';

import gitlabPlugin from '@immobiliarelabs/backstage-plugin-gitlab/alpha';
import { Entity } from '@backstage/catalog-model';
import {
    mockedGitlabReqToRes,
    projectId,
} from '../../gitlab/dev/mock-gitlab/api-v4-v15.7.0';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import {
    GitlabCIApiRef,
    GitlabCIClient,
} from '@immobiliarelabs/backstage-plugin-gitlab';

const signInPage = SignInPageBlueprint.make({
    params: {
        loader: async () => (props) =>
            <SignInPage {...props} providers={['guest']} />,
    },
});

const devEntity: Entity = {
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

const catalogApi = catalogApiMock({ entities: [devEntity] });

const catalogPluginOverrides = createFrontendModule({
    pluginId: 'catalog',
    extensions: [
        ApiBlueprint.make({
            params: (defineParams) =>
                defineParams({
                    api: catalogApiRef,
                    deps: {},
                    factory: () => catalogApi,
                }),
        }),
    ],
});

const gitlabDevApi = ApiBlueprint.make({
    name: 'gitlab',
    params: (defineParams) =>
        defineParams({
            api: GitlabCIApiRef,
            deps: { configApi: configApiRef },
            factory({ configApi }) {
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
        }),
});

export const app = createApp({
    features: [
        catalogPlugin,
        userSettingsPlugin,
        gitlabPlugin,
        catalogPluginOverrides,
        createFrontendModule({
            pluginId: 'app',
            extensions: [signInPage, navigationExtension, gitlabDevApi],
        }),
    ],
});

export default app.createRoot();
