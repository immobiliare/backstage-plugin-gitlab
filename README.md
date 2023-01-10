<p align="center">
  <img src="https://avatars.githubusercontent.com/u/10090828?s=200&v=4" width="200px" alt="logo"/>
</p>
<h1 align="center">Backstage Plugin GitLab</h1>

![release workflow](https://img.shields.io/github/workflow/status/immobiliare/backstage-plugin-gitlab/Release)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier?style=flat-square)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)
![npm (scoped)](https://img.shields.io/npm/v/@immobiliarelabs/backstage-plugin-gitlab?style=flat-square)
![license](https://img.shields.io/github/license/immobiliare/backstage-plugin-gitlab)

> [Backstage](https://backstage.io/) plugins to interact with [GitLab](https://gitlab.com/)

## Setup

1. If you have a standalone app (you didn't clone this repo), then do

```bash
# From your Backstage root directory
cd packages/app
yarn add @immobiliarelabs/backstage-plugin-gitlab
```

2. Add a new GitLab tab to the entity page.

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

3. Add the GitLab cards to the Overview tab on the entity page(Optional).

```tsx
// packages/app/src/components/catalog/EntityPage.tsx

import {
    isGitlabAvailable,
    EntityGitlabContent,
    EntityGitlabLanguageCard,
    EntityGitlabPeopleCard,
    EntityGitlabMergeRequestsTable,
    EntityGitlabMergeRequestStatsCard,
    EntityGitlabPipelinesTable,
} from '@immobiliarelabs/backstage-plugin-gitlab';

//Farther down at the overviewContent declaration
//You can add only selected widgets or all of them.
const overviewContent = (
    <Grid container spacing={3} alignItems="stretch">
        <EntitySwitch>
            <EntitySwitch.Case if={isGitlabAvailable}>
                <Grid item md={6}>
                    <EntityGitlabPeopleCard />
                    <EntityGitlabLanguageCard />
                    <EntityGitlabMergeRequestStatsCard />
                    <EntityGitlabPipelinesTable />
                    <EntityGitlabMergeRequestsTable />
                </Grid>
            </EntitySwitch.Case>
        </EntitySwitch>
    </Grid>
);
```

4. Add integration:
   In `app-config.yaml` add the integration for gitlab:

```yaml
integrations:
    gitlab:
        - host: gitlab.com
          token: ${GITLAB_TOKEN}
```

5. Add proxy config:

```yaml
'/gitlabci':
    target: '${GITLAB_URL}/api/v4'
    allowedMethods: ['GET']
    headers:
        PRIVATE-TOKEN: '${GITLAB_TOKEN}'
```

-   Default GitLab URL: `https://gitlab.com`
-   GitLab Token should be with of scope `read_api` and can be generated from this [URL](https://gitlab.com/-/profile/personal_access_tokens)

6. (**Optional**): You can also add plugin configurations in `app-config.yaml` file:

```yaml
gitlab:
    # Default path for CODEOWNERS file
    # Default: CODEOWNERS
    defaultCodeOwnersPath: .gitlab/CODEOWNERS
    # Proxy path
    # Default: /gitlabci
    proxyPath: /gitlabci
```

7. Add a `gitlab.com/project-id` annotation to your respective `catalog-info.yaml` files, on the [format](https://backstage.io/docs/architecture-decisions/adrs-adr002#format)

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
        # You can change the CODEOWNERS path
        # if it is not passed default specified in `app-config.yaml` is used
        gitlab.com/codeowners-path: 'somewhere/CODEOWNERS'
spec:
    type: service
    # ...
```

**Note:** `spec.type` can take values in ['website','library','service'] but to render GitLab Entity, Catalog must be of type `service`

## Old/New GitLab Versions

If you have an old GitLab version, or a new one, we allow you to extend the GitLab Client as follow:

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
            new CustomGitlabCIClient({
                discoveryApi,
                baseUrl: configApi.getOptionalString('gitlab.baseUrl'),
                proxyPath: configApi.getOptionalString('gitlab.proxyPath'),
                codeOwnersPath: configApi.getOptionalString(
                    'gitlab.defaultCodeOwnersPath'
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

see [here](./src/api/GitlabCIClient.ts).

## Features

-   List top 20 builds for a project
-   List top 20 Merge Requests for a project
-   List top 20 Issues for a project
-   View Contributors for a project
-   View Languages used for a project
-   View Pipeline status for a project
-   Works for both project and personal tokens
-   Pagination for builds
-   Pagination for Merge Requests
-   Merge Requests Statistics
-   Support for Olds/New GitLab APIs version

## Screenshots

<img src="https://raw.githubusercontent.com/immobiliare/backstage-plugin-gitlab/main/src/assets/backstage_gitlab_pipeline_information.png"  alt="Contributors Languages Pipeline Status"/>
<img src="https://raw.githubusercontent.com/immobiliare/backstage-plugin-gitlab/main/src/assets/backstage_gitlab_mr_and_issues.png"  alt="Merge Request Information"/>

## Support & Contribute

Made with ❤️ by [ImmobiliareLabs](https://github.com/immobiliare) & [Contributors](./CONTRIBUTING.md#contributors)

We'd love for you to contribute to Backstage GitLab Plugin!
If you have any questions on how to use Backstage GitLab Plugin, bugs and enhancement please feel free to reach out by opening a [GitHub Issue](https://github.com/immobiliare/backstage-plugin-gitlab/issues).

## License

This plugin is based on the original work of [loblaw-sre/backstage-plugin-gitlab](https://github.com/loblaw-sre/backstage-plugin-gitlab) by @satrox28 and @Balasundaram.

This plugin is under [Apache 2.0 license](LICENSE), see [NOTICE](NOTICE) for copyright.
