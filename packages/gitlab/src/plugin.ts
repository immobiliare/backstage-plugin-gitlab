import {
    createComponentExtension,
    createPlugin,
    createRoutableExtension,
    identityApiRef,
} from '@backstage/core-plugin-api';

import {
    configApiRef,
    createApiFactory,
    createRouteRef,
    discoveryApiRef,
    gitlabAuthApiRef,
} from '@backstage/core-plugin-api';
import { GitlabCIApiRef, GitlabCIClient } from './api';

export const rootRouteRef = createRouteRef({
    id: 'Gitlab',
});

export const gitlabPlugin = createPlugin({
    id: 'Gitlab',
    apis: [
        createApiFactory({
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
    ],
});

export const EntityGitlabContent = gitlabPlugin.provide(
    createRoutableExtension({
        name: 'EntityGitlabContent',
        component: () =>
            import('./components/GitlabCI').then((m) => m.GitlabCI),
        mountPoint: rootRouteRef,
    })
);

export const EntityGitlabLanguageCard = gitlabPlugin.provide(
    createComponentExtension({
        name: 'EntityGitlabLanguageCard',
        component: {
            lazy: () =>
                import('./components/widgets/index').then(
                    (m) => m.LanguagesCard
                ),
        },
    })
);

export const EntityGitlabPeopleCard = gitlabPlugin.provide(
    createComponentExtension({
        name: 'EntityGitlabPeopleCard',
        component: {
            lazy: () =>
                import('./components/widgets/index').then((m) => m.PeopleCard),
        },
    })
);

export const EntityGitlabMergeRequestsTable = gitlabPlugin.provide(
    createComponentExtension({
        name: 'EntityGitlabMergeRequestsTable',
        component: {
            lazy: () =>
                import('./components/widgets/index').then(
                    (m) => m.MergeRequestsTable
                ),
        },
    })
);

export const EntityGitlabMergeRequestStatsCard = gitlabPlugin.provide(
    createComponentExtension({
        name: 'EntityGitlabMergeRequestStatsCard',
        component: {
            lazy: () =>
                import('./components/widgets/index').then(
                    (m) => m.MergeRequestStats
                ),
        },
    })
);

export const EntityGitlabPipelinesTable = gitlabPlugin.provide(
    createComponentExtension({
        name: 'EntityGitlabPipelinesTable',
        component: {
            lazy: () =>
                import('./components/widgets/index').then(
                    (m) => m.PipelinesTable
                ),
        },
    })
);

export const EntityGitlabReleasesCard = gitlabPlugin.provide(
    createComponentExtension({
        name: 'EntityGitlabReleasesCard',
        component: {
            lazy: () =>
                import('./components/widgets/index').then(
                    (m) => m.ReleasesCard
                ),
        },
    })
);

export const EntityGitlabCoverageCard = gitlabPlugin.provide(
    createComponentExtension({
        name: 'EntityGitlabCoverageCard',
        component: {
            lazy: () =>
                import('./components/widgets/index').then(
                    (m) => m.CoverageCard
                ),
        },
    })
);

export const EntityGitlabIssuesTable = gitlabPlugin.provide(
    createComponentExtension({
        name: 'EntityGitlabIssuesTable',
        component: {
            lazy: () =>
                import('./components/widgets/index').then((m) => m.IssuesTable),
        },
    })
);

export const EntityGitlabReadmeCard = gitlabPlugin.provide(
    createComponentExtension({
        name: 'EntityGitlabReadmeCard',
        component: {
            lazy: () =>
                import('./components/widgets/index').then((m) => m.ReadmeCard),
        },
    })
);
