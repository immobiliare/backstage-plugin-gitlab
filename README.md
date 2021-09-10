# Backstage Gitlab Plugin

![npm](https://img.shields.io/npm/dt/@loblaw/backstage-plugin-gitlab)

Website: [https://gitlab.com/](https://gitlab.com/)

<img src="https://raw.githubusercontent.com/loblaw-sre/backstage-plugin-gitlab/main/src/assets/Backstage_Gitlab_Pipeline_Information.png"  alt="Contributors Languages Pipeline Status"/>
<img src="https://raw.githubusercontent.com/loblaw-sre/backstage-plugin-gitlab/main/src/assets/Backstage_Gitlab_Merge_Request_information.png"  alt="Merge Request Information"/>

## Setup

1. If you have a standalone app (you didn't clone this repo), then do

```bash
# From your Backstage root directory
cd packages/app
yarn add @loblaw/backstage-plugin-gitlab
```


2. Add the `EntityGitlabContent` extension to the entity page in your app:

```tsx
// In packages/app/src/components/catalog/EntityPage.tsx

import { EntityGitlabContent } from '@loblaw/backstage-plugin-gitlab';

// Farther down at the serviceEntityPage declaration
const serviceEntityPage = (
<EntityLayout>
    {/* Place the following section where you want the tab to appear */}
  <EntityLayout.Route path="/gitlab" title="Gitlab">
      <EntityGitlabContent />
  </EntityLayout.Route>
```

3. Add proxy config:

```
  '/gitlabci':
    target: ${GITLAB_URL}/api/v4
    allowedMethods: ['GET']
    headers:
      PRIVATE-TOKEN: '${GITLAB_TOKEN}'
```

* Default GitLab URL: `https://gitlab.com`
* GitLab Token should be with of scope `read_api` and can be generated from this [URL](https://gitlab.com/-/profile/personal_access_tokens)

4. Add a `gitlab.com/project-id` annotation to your respective `catalog-info.yaml` files, on the [format](https://backstage.io/docs/architecture-decisions/adrs-adr002#format)

```yaml
# Example catalog-info.yaml entity definition file
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  # ...
  annotations:
      gitlab.com/project-id: 'project-id' #1234
spec:
  type: service
  # ...
```

**Note:** `spec.type` can take values in ['website','library','service'] but to render GitLab Entity, Catalog must be of type `service`

## Features

- List top 20 builds for a project
- List top 20 Merge Requests for a project
- View Contributors for a project
- View Languages used for a project
- View Pipeline status for a project
- Works for both project and personal tokens
- Pagination for builds
- Pagination for Merge Requests
- Merge Requests Statistics
