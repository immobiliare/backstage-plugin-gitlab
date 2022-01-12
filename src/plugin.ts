import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

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
      deps: { configApi: configApiRef, discoveryApi: discoveryApiRef },
      factory: ({ configApi, discoveryApi }) =>
        new GitlabCIClient({
          discoveryApi,
          baseUrl: configApi.getOptionalString('gitlab.baseUrl'),
        }),
    }),
  ],
});

export const EntityGitlabContent = gitlabPlugin.provide(
  createRoutableExtension({
    component: () =>
    import('./Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);
