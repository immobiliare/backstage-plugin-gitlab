<p align="center">
  <img src="https://avatars.githubusercontent.com/u/10090828?s=200&v=4" width="200px" alt="logo"/>
</p>
<h1 align="center">Backstage Plugin GitLab</h1>

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier?style=flat-square)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)
![npm (scoped)](https://img.shields.io/npm/v/@immobiliarelabs/backstage-plugin-gitlab?style=flat-square)
![license](https://img.shields.io/github/license/immobiliare/backstage-plugin-gitlab)

> [Backstage](https://backstage.io/) plugins to interact with [GitLab](https://gitlab.com/)

## Table of contents

<!-- toc -->

-   [Features](#features)
-   [Screenshots](#screenshots)
-   [Setup](#setup)
-   [Annotations](#annotations)
    -   [Code owners file](#code-owners-file)
-   [Old/New GitLab Versions](#oldnew-gitlab-versions)
-   [Migration guides](#migration-guides)
-   [Support & Contribute](#support--contribute)
-   [License](#license)

<!-- tocstop -->

## Features

-   List top 20 builds for a project
-   List top 20 Merge Requests for a project
-   List top 20 Issues for a project
-   List last releases
-   View Code Owners for a project
-   View Contributors for a project
-   View Languages used for a project
-   View Pipeline status for a project
-   View README for a project
-   Works for both project and personal tokens
-   Pagination for builds
-   Pagination for Merge Requests
-   Merge Requests Statistics
-   Support for Olds/New GitLab APIs version
-   Support for multi GitLab Instance

## Screenshots

<img src="https://raw.githubusercontent.com/immobiliare/backstage-plugin-gitlab/main/assets/backstage_gitlab_pipeline_information.png"  alt="Contributors Languages Pipeline Status"/>
<img src="https://raw.githubusercontent.com/immobiliare/backstage-plugin-gitlab/main/assets/backstage_gitlab_mr_and_issues.png"  alt="Merge Request Information"/>

## Setup

1. Install packages:

```bash
# From your Backstage root directory
yarn --cwd packages/app add @immobiliarelabs/backstage-plugin-gitlab
yarn --cwd packages/backend add @immobiliarelabs/backstage-plugin-gitlab-backend
```

2. Add a new GitLab tab to the entity page.

> NOTE: By default the EntityGitlabContent does not load the README, see the Optional section.

`packages/app/src/components/catalog/EntityPage.tsx`

```tsx
// packages/app/src/components/catalog/EntityPage.tsx

import {
    isGitlabAvailable,
    EntityGitlabContent,
} from '@immobiliarelabs/backstage-plugin-gitlab';

// Farther down at the serviceEntityPage declaration
const serviceEntityPage = (
    <EntityLayout>
        {/* Place the following section where you want the tab to appear */}
        <EntityLayout.Route
            if={isGitlabAvailable}
            path="/gitlab"
            title="Gitlab"
        >
            <EntityGitlabContent />
        </EntityLayout.Route>
    </EntityLayout>
);
```

3. (**Optional**) Add the GitLab cards to the Overview tab on the entity page.

`packages/app/src/components/catalog/EntityPage.tsx`

```tsx
// packages/app/src/components/catalog/EntityPage.tsx

import {
    isGitlabAvailable,
    EntityGitlabContent,
    EntityGitlabLanguageCard,
    EntityGitlabMergeRequestsTable,
    EntityGitlabMergeRequestStatsCard,
    EntityGitlabPeopleCard,
    EntityGitlabPipelinesTable,
    EntityGitlabReadmeCard,
} from '@immobiliarelabs/backstage-plugin-gitlab';

//Farther down at the overviewContent declaration
//You can add only selected widgets or all of them.
const overviewContent = (
    <Grid container spacing={3} alignItems="stretch">
        <EntitySwitch>
            <EntitySwitch.Case if={isGitlabAvailable}>
                <Grid item md={12}>
                    <EntityGitlabReadmeCard />
                </Grid>
                <Grid item sm={12} md={3} lg={3}>
                    <EntityGitlabPeopleCard />
                </Grid>
                <Grid item sm={12} md={3} lg={3}>
                    <EntityGitlabLanguageCard />
                </Grid>
                <Grid item sm={12} md={3} lg={3}>
                    <EntityGitlabMergeRequestStatsCard />
                </Grid>
                <Grid item sm={12} md={3} lg={3}>
                    <EntityGitlabReleasesCard />
                </Grid>
                <Grid item md={12}>
                    <EntityGitlabPipelinesTable />
                </Grid>
                <Grid item md={12}>
                    <EntityGitlabMergeRequestsTable />
                </Grid>
            </EntitySwitch.Case>
        </EntitySwitch>
    </Grid>
);
```

4. Add the integration:
   `app-config.yaml` add the integration for gitlab:

```yaml
integrations:
    gitlab:
        - host: gitlab.com
          token: ${GITLAB_TOKEN}
```

**Note:** You can have more than one GitLab instance.

5. Add the GitLab Filler Processor, this allows auto-filling of the annotations like the project id and slug:

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

This allows auto-filling of the annotations.

6. Add the `gitlab` route by creating the file `packages/backend/src/plugins/gitlab.ts`:

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

7. (**Optional**): You can also add plugin configurations in `app-config.yaml` file:

`app-config.yaml`

```yaml
# app-config.yaml
# ...
gitlab:
    # Default path for CODEOWNERS file
    # Default: CODEOWNERS
    defaultCodeOwnersPath: .gitlab/CODEOWNERS
    # Default path for README file
    # Default: README.md
    defaultReadmePath: .gitlab/README.md
    # Entity Kinds to witch the plugin works, if you want to render gitlab
    # information for one Kind you have to add it in this list.
    # Default: ['Component']
    allowedKinds: ['Component', 'Resource']
    # This parameter controls SSL Certs verification
    # Default: true
    proxySecure: false
```

## Annotations

By default, the plugin automatically shows the project info corresponding to the location of the `catalog.yaml` file. But you could need some time to force another project, you can do it with the annotations `gitlab.com/project-id` or `gitlab.com/project-slug`:

```yaml
# Example catalog-info.yaml entity definition file
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
    # ...
    annotations:
        gitlab.com/project-id: 'project-id' #1234. This must be in quotes and can be found under Settings --> General
        # or
        gitlab.com/project-slug: 'project-slug' # group_name/project_name
spec:
    type: service
    # ...
```

### Code owners file

The plugins support also the `gitlab.com/codeowners-path` annotation:

```yaml
# Example catalog-info.yaml entity definition file
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
    # ...
    annotations:
        # You can change the CODEOWNERS path
        # if it is not passed default specified in `app-config.yaml` is used
        gitlab.com/codeowners-path: 'somewhere/CODEOWNERS'
spec:
    type: service
    # ...
```

## Old/New GitLab Versions

If you have an old GitLab version, or a new one, we allow you to extend the GitLab Client as follows:

`packages/app/src/api.ts`

```ts
import { GitlabCIApiRef } from '@immobiliarelabs/backstage-plugin-gitlab';
import { CustomGitlabCIClient } from '@immobiliarelabs/backstage-plugin-gitlab';
import { discoveryApiRef, configApiRef } from '@backstage/core-plugin-api';
import { CustomGitlabCIClient } from 'packages/app/src/myCustomClient.ts';

export const apis: AnyApiFactory[] = [
    createApiFactory({
        api: GitlabCIApiRef,
        deps: { configApi: configApiRef, discoveryApi: discoveryApiRef },
        factory: ({ configApi, discoveryApi }) =>
            CustomGitlabCIClient.setupAPI({
                discoveryApi,
                codeOwnersPath: configApi.getOptionalString(
                    'gitlab.defaultCodeOwnersPath'
                ),
                readmePath: configApi.getOptionalString(
                    'gitlab.defaultReadmePath'
                ),
            }),
    }),
];
```

`packages/app/src/myCustomClient.ts`

```ts
import { GitlabCIClient } from '@immobiliarelabs/backstage-plugin-gitlab';

export class CustomGitlabCIClient extends GitlabCIClient {
    // Override methods
    async getPipelineSummary(projectID: string | undefined): Promise<PipelineSummary | undefined> {
        this.callApi(...)
        .
        .
        .
    }
}
```

see [here](./packages/gitlab/src/api/GitlabCIClient.ts).

## Migration guides

If you have an old gitlab-plugin version, you can consult the [migration guide](./docs/migration-guides.md).

## Support & Contribute

Made with ❤️ by [ImmobiliareLabs](https://github.com/immobiliare) & [Contributors](./CONTRIBUTING.md#contributors)

We'd love for you to contribute to Backstage GitLab Plugin! [Here](./CONTRIBUTING.md) some tips on how to contribute.
If you have any questions on how to use Backstage GitLab Plugin, bugs and enhancement please feel free to reach out by opening a [GitHub Issue](https://github.com/immobiliare/backstage-plugin-gitlab/issues).

## License

This plugin is based on the original work of [loblaw-sre/backstage-plugin-gitlab](https://github.com/loblaw-sre/backstage-plugin-gitlab) by @satrox28 and @Balasundaram.

This plugin is under [Apache 2.0 license](LICENSE), see [NOTICE](NOTICE) for copyright.
