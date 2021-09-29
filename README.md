# Backstage Gitlab Plugin

[![Version](https://img.shields.io/npm/v/@loblaw/backstage-plugin-gitlab.svg)](https://www.npmjs.com/package/@loblaw/backstage-plugin-gitlab)
![Contributions welcome](https://img.shields.io/badge/contributions-welcome-orange.svg)
[![Downloads](https://img.shields.io/npm/dm/@loblaw/backstage-plugin-gitlab.svg)](https://www.npmjs.com/package/@loblaw/backstage-plugin-gitlab)
[![License](https://img.shields.io/badge/license-Apache_License_2.0-blue.svg)](https://opensource.org/licenses/Apache_License_2.0)
![Stars Badge](https://img.shields.io/github/stars/loblaw-sre/backstage-plugin-gitlab)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/loblaw-sre/backstage-plugin-gitlab)

![Build Status](https://github.com/loblaw-sre/backstage-plugin-gitlab/workflows/Node.js%20Package/badge.svg)
![](https://img.shields.io/github/commit-activity/m/loblaw-sre/backstage-plugin-gitlab)
![](https://img.shields.io/github/contributors/loblaw-sre/backstage-plugin-gitlab)
![](https://img.shields.io/github/last-commit/loblaw-sre/backstage-plugin-gitlab)

![Language](https://img.shields.io/github/languages/top/loblaw-sre/backstage-plugin-gitlab?color=green&logo=typescript&logoColor=blue)
![](https://img.shields.io/github/issues/loblaw-sre/backstage-plugin-gitlab)
![](https://img.shields.io/github/issues-closed/loblaw-sre/backstage-plugin-gitlab)
[![Repo Size](https://img.shields.io/github/repo-size/loblaw-sre/backstage-plugin-gitlab)](https://github.com/loblaw-sre/backstage-plugin-gitlab)
[![](https://img.shields.io/github/languages/code-size/loblaw-sre/backstage-plugin-gitlab)](https://github.com/loblaw-sre/backstage-plugin-gitlab)
[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Floblaw-sre%2Fbackstage-plugin-gitlab&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=Visitors&edge_flat=false)](https://hits.seeyoufarm.com)


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

import { isGitlabAvailable, EntityGitlabContent } from '@loblaw/backstage-plugin-gitlab';
// Farther down at the serviceEntityPage declaration
const serviceEntityPage = (
<EntityLayout>
    {/* Place the following section where you want the tab to appear */}
    <EntityLayout.Route if={isGitlabAvailable} path="/gitlab" title="Gitlab">
       <EntityGitlabContent />
    </EntityLayout.Route>
```

3. Add integration:
In `app-config.yaml` add the integration for gitlab:
```
integrations:
  gitlab:
    - host: gitlab.com
      token: ${GITLAB_TOKEN}
```

5. Add proxy config:

```
  '/gitlabci':
    target: '${GITLAB_URL}/api/v4'
    allowedMethods: ['GET']
    headers:
      PRIVATE-TOKEN: '${GITLAB_TOKEN}'
```

* Default GitLab URL: `https://gitlab.com`
* GitLab Token should be with of scope `read_api` and can be generated from this [URL](https://gitlab.com/-/profile/personal_access_tokens)

5. Add a `gitlab.com/project-id` annotation to your respective `catalog-info.yaml` files, on the [format](https://backstage.io/docs/architecture-decisions/adrs-adr002#format)

```yaml
# Example catalog-info.yaml entity definition file
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  # ...
  annotations:
      gitlab.com/project-id: 'project-id' #1234. This must be in quotes and can be found under Settings --> General
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
