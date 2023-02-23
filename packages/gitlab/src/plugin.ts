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
            },
            factory: ({ configApi, discoveryApi, identityApi }) =>
                GitlabCIClient.setupAPI({
                    discoveryApi,
                    identityApi,
                    codeOwnersPath: configApi.getOptionalString(
                        'gitlab.defaultCodeOwnersPath'
                    ),
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

export const EntityGitlabIssuesTable = gitlabPlugin.provide(
    createComponentExtension({
        name: 'EntityGitlabIssuesTable',
        component: {
            lazy: () =>
                import('./components/widgets/index').then((m) => m.IssuesTable),
        },
    })
);
