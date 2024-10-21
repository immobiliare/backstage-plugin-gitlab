import {
    createFrontendPlugin,
    PageBlueprint,
    ApiBlueprint,
    createApiFactory,
} from '@backstage/frontend-plugin-api';
import React from 'react';

import { rootRouteRef } from './routes';
import {
    compatWrapper,
    convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { GitlabCIApiRef, GitlabCIClient } from './api';
import {
    configApiRef,
    discoveryApiRef,
    gitlabAuthApiRef,
    identityApiRef,
} from '@backstage/core-plugin-api';

const gitlabAPI = ApiBlueprint.make({
    params: {
        factory: createApiFactory({
            api: GitlabCIApiRef,
            deps: {
                configApi: configApiRef,
                discoveryApi: discoveryApiRef,
                identityApi: identityApiRef,
                gitlabAuthApi: gitlabAuthApiRef,
            },
            factory: ({
                configApi,
                discoveryApi,
                identityApi,
                gitlabAuthApi,
            }) =>
                GitlabCIClient.setupAPI({
                    discoveryApi,
                    identityApi,
                    codeOwnersPath: configApi.getOptionalString(
                        'gitlab.defaultCodeOwnersPath'
                    ),
                    readmePath: configApi.getOptionalString(
                        'gitlab.defaultReadmePath'
                    ),
                    gitlabAuthApi,
                    useOAuth: configApi.getOptionalBoolean('gitlab.useOAuth'),
                }),
        }),
    },
});

export default createFrontendPlugin({
    id: 'Gitlab',
    // bind all the extensions to the plugin
    extensions: [gitlabAPI],
});

export const EntityGitlabContent = PageBlueprint.make({
    name: 'EntityGitlabContent',
    params: {
        // you can reuse the existing routeRef
        // by wrapping into the convertLegacyRouteRef.
        routeRef: convertLegacyRouteRef(rootRouteRef),
        defaultPath: '/gitlab',
        // these inputs usually match the props required by the component.
        loader: () =>
            import('./components/GitlabCI').then((m) =>
                compatWrapper(<m.GitlabCI />)
            ),
    },
});

export {
    LanguagesCard as EntityGitlabLanguageCard,
    PeopleCard as EntityGitlabPeopleCard,
    MergeRequestsTable as EntityGitlabMergeRequestsTable,
    MergeRequestStats as EntityGitlabMergeRequestStatsCard,
    PipelinesTable as EntityGitlabPipelinesTable,
    ReleasesCard as EntityGitlabReleasesCard,
    CoverageCard as EntityGitlabCoverageCard,
    IssuesTable as EntityGitlabIssuesTable,
    ReadmeCard as EntityGitlabReadmeCard,
} from './components/widgets/index';
