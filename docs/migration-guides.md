# Migration Guides

## v2 -> v3

Now, this plugin has the backend part that allows the use of multiple GitLab integrations and has the Processor that deprecates the annotations `gitlab.com/project-id` and `gitlab.com/project-slug` that are not more needed because they are now automatically filled by it. 

You can migrate by following these steps:

1. Remove the proxy. (**Optional**) and `proxyPath` configuration:

`app-config.yaml`

```diff
proxy:
- '/gitlabci':
-     target: '${GITLAB_URL}/api/v4'
-     allowedMethods: ['GET']
-     headers:
-         PRIVATE-TOKEN: '${GITLAB_TOKEN}'


gitlab:
-     proxyPath: /gitlabci
```

2. Install the backend package:

```shell
# From your Backstage root directory
yarn --cwd packages/backend add @immobiliarelabs/backstage-plugin-gitlab-backend
```

3. Add the GitLab Filler Processor, this allows auto-filling of the annotations like the project id and slug:

`packages/backend/src/plugins/catalog.ts`

```ts
// packages/backend/src/plugins/catalog.ts
import { GitlabFillerProcessor } from '@immobiliarelabs/backstage-plugin-gitlab-backend';

export default async function createPlugin(
    env: PluginEnvironment
): Promise<Router> {
    const builder = await CatalogBuilder.create(env);
    //...
    // Add this line
    builder.addProcessor(new GitlabFillerProcessor(env.config));
    //...
    const { processingEngine, router } = await builder.build();
    await processingEngine.start();
    return router;
}
```

4. Add the `gitlab` route by creating the file `packages/backend/src/plugins/gitlab.ts`:

`packages/backend/src/plugins/gitlab.ts`

```ts
// packages/backend/src/plugins/gitlab.ts
import { PluginEnvironment } from '../types';
import { Router } from 'express-serve-static-core';
import { createRouter } from '@immobiliarelabs/backstage-plugin-gitlab-backend';

export default async function createPlugin(
    env: PluginEnvironment
): Promise<Router> {
    return createRouter({
        logger: env.logger,
        config: env.config,
    });
}
```

then you have to add the route as follows:

`packages/backend/src/index.ts`

```ts
// packages/backend/src/index.ts
import gitlab from './plugins/gitlab';

async function main() {
    //...
    const gitlabEnv = useHotMemoize(module, () => createEnv('gitlab'));
    //...
    apiRouter.use('/gitlab', await gitlab(gitlabEnv));
    //...
}
```

5. (**Optional**) Add the `allowedKinds` configuration.

`app-config.yaml`

```yaml
# app-config.yaml
# ...
gitlab:
    # Entity Kinds to witch the plugin works, if you want to render gitlab
    # information for one Kind you have to add it in this list.
    # Default: ['Component']
    allowedKinds: ['Component', 'Resource']
```

6. If you have extended the GitLab API for the support of a new or old GitLab version:

`packages/app/src/api.ts`

```diff
import { GitlabCIApiRef } from '@immobiliarelabs/backstage-plugin-gitlab';
import { CustomGitlabCIClient } from '@immobiliarelabs/backstage-plugin-gitlab';
import { discoveryApiRef, configApiRef } from '@backstage/core-plugin-api';
import { CustomGitlabCIClient } from 'packages/app/src/myCustomClient.ts';

export const apis: AnyApiFactory[] = [
    createApiFactory({
        api: GitlabCIApiRef,
        deps: { configApi: configApiRef, discoveryApi: discoveryApiRef },
        factory: ({ configApi, discoveryApi }) =>
-             new CustomGitlabCIClient({
+             CustomGitlabCIClient.setupAPI({
                discoveryApi,
-               baseUrl: configApi.getOptionalString('gitlab.baseUrl'),
-               proxyPath: configApi.getOptionalString('gitlab.proxyPath'),
                codeOwnersPath: configApi.getOptionalString(
                    'gitlab.defaultCodeOwnersPath'
                ),
            }),
    }),
];
```
