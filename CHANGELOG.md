# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [5.0.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v5.0.0-alpha.0...v5.0.0) (2023-03-09)

**Note:** Version bump only for package root

# [5.0.0-alpha.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v4.0.1...v5.0.0-alpha.0) (2023-03-08)

### Features

-   **api:** identify gitlab instances by hostname ([dff875d](https://github.com/immobiliare/backstage-plugin-gitlab/commit/dff875d2c3e7750b7ca8a48ce0bd04ff2db8c283)), closes [#118](https://github.com/immobiliare/backstage-plugin-gitlab/issues/118)
-   **releasescard:** add releases widget ([8f25374](https://github.com/immobiliare/backstage-plugin-gitlab/commit/8f25374b464a32db9c4511707ac44f7b6f0117bb))

### BREAKING CHANGES

-   **api:** Annotations `gitlab.com/instance` require the hostname of the gitlab instance, replacing index numbers. The processor now creates annotations with hostnames. GitLabCIApiRef calls using /api/gitlab/{number}/ are not resolved and return 404 not found.

Signed-off-by: Manuel Stein <manuel.stein@nokia-bell-labs.com>

-   **releasescard:** GitlabCIApi type has the new method getReleaseSummary

Signed-off-by: Manuel Stein <manuel.stein@nokia-bell-labs.com>

## [4.0.1](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v4.0.0...v4.0.1) (2023-03-06)

### Bug Fixes

-   handle error when target is not well formatted url ([ca49ad4](https://github.com/immobiliare/backstage-plugin-gitlab/commit/ca49ad45fce3b54e6baa5d1455e65a9936fdaee5))

# [4.0.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v4.0.0-alpha.0...v4.0.0) (2023-02-23)

### Bug Fixes

-   removed backstage Authorization header to the forwarded backstage request ([e72aafa](https://github.com/immobiliare/backstage-plugin-gitlab/commit/e72aafab889ba1a3af000819daf73107c12ea566))

# [4.0.0-alpha.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v3.0.2...v4.0.0-alpha.0) (2023-02-22)

### Features

-   Add authentication header if needed ([dea3a59](https://github.com/immobiliare/backstage-plugin-gitlab/commit/dea3a59d64f52cff69ac5fbd2bd42b3502635ec6))
-   disable project bots from being returned from the /users get request, corrected the mock data as to what it was before ([8f0be47](https://github.com/immobiliare/backstage-plugin-gitlab/commit/8f0be4794ee73302c1ab474af4cf6c486ae39441))
-   without_project_bots to the users API call, this should exclude bots from projects and groups and in the contributors card ([d8de182](https://github.com/immobiliare/backstage-plugin-gitlab/commit/d8de182f61cec358eb43b4d2fd4eb4452d0ab80b))

### BREAKING CHANGES

-   the GitlabCIClient constructor has a new parameter identityApi

## [3.0.2](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v3.0.1...v3.0.2) (2023-02-15)

### Bug Fixes

-   **table:** added empty array to table data in mr and pipeline tables ([a7c9862](https://github.com/immobiliare/backstage-plugin-gitlab/commit/a7c9862027c53e03b184731ae8312bd35aedf7bc))

## [3.0.1](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v3.0.0...v3.0.1) (2023-01-25)

**Note:** Version bump only for package root

# [3.0.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v3.0.0-alpha.2...v3.0.0) (2023-01-25)

### Bug Fixes

-   reduce gitlab groups request size ([287a40e](https://github.com/immobiliare/backstage-plugin-gitlab/commit/287a40e1ae433cf5f130a56fd90dba9872c3d5ca))

# [3.0.0-alpha.2](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v3.0.0-alpha.1...v3.0.0-alpha.2) (2023-01-24)

### Bug Fixes

-   removed baseUrl from types ([878ff81](https://github.com/immobiliare/backstage-plugin-gitlab/commit/878ff8139b33ada4ca4b6c4278069b947e9cdf70))
-   **yarn:** fix yarn version ([587a086](https://github.com/immobiliare/backstage-plugin-gitlab/commit/587a0860df800e8cf2766aaaab8f82ac6fd30263))

### Features

-   **peopleCard:** added groups support to ownersfile ([23b6b14](https://github.com/immobiliare/backstage-plugin-gitlab/commit/23b6b1465978a3acd3c32c9c646454894c3ebd52))

### BREAKING CHANGES

-   **peopleCard:** Renamed Type PersonData into PeopleCardEntityData

# [3.0.0-alpha.1](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v3.0.0-alpha.0...v3.0.0-alpha.1) (2023-01-24)

### Features

-   removed baseUrl ([55289a4](https://github.com/immobiliare/backstage-plugin-gitlab/commit/55289a46f6e6cb4d60d70b4dff0c9047493cb0f2))

### BREAKING CHANGES

-   removed baseUrl and proxyPath

# [3.0.0-alpha.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v2.1.1...v3.0.0-alpha.0) (2023-01-23)

### Bug Fixes

-   allow extensions ([38a6fc1](https://github.com/immobiliare/backstage-plugin-gitlab/commit/38a6fc18319d2cf49a28680ba2e7eacfc5fdda7b))
-   **backend:** allows only GET method ([e3b314f](https://github.com/immobiliare/backstage-plugin-gitlab/commit/e3b314f93ca59f2bea8058767e9aed09e1fae458))
-   build ([e788b01](https://github.com/immobiliare/backstage-plugin-gitlab/commit/e788b01c6fcda512e4acd389f7cf070bece7e457))
-   **front-end:** dev test ([810c9e2](https://github.com/immobiliare/backstage-plugin-gitlab/commit/810c9e2a0cbaf6b3b60a5a8cf9ea3410ae8a5d78))
-   typo allowKinds into allowedKinds ([ebaad6e](https://github.com/immobiliare/backstage-plugin-gitlab/commit/ebaad6ee90cec89fb008491f18dd38988cfdc2da))

### Features

-   added the new annotation instance ([22f80e6](https://github.com/immobiliare/backstage-plugin-gitlab/commit/22f80e654f8c909d063fec332bec1f5d8b58c48b))
-   backend plugin ([3597c2c](https://github.com/immobiliare/backstage-plugin-gitlab/commit/3597c2cd4a0f92d411ba579579d9f3f1df204cc7))
-   **processor:** added indexing feature ([1374ea0](https://github.com/immobiliare/backstage-plugin-gitlab/commit/1374ea09bf8ada12af0b592ccb37d042381eda2f))
-   updated API call in client ([6300447](https://github.com/immobiliare/backstage-plugin-gitlab/commit/63004472690ee621527ac6d985f34157d6a3db0e))

### BREAKING CHANGES

-   proxy is not more used, you have to use backend plugin with the processor.

# [4.0.0-alpha.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v2.1.1...v4.0.0-alpha.0) (2023-01-20)

### Bug Fixes

-   allow extensions ([38a6fc1](https://github.com/immobiliare/backstage-plugin-gitlab/commit/38a6fc18319d2cf49a28680ba2e7eacfc5fdda7b))
-   **backend:** allows only GET method ([e3b314f](https://github.com/immobiliare/backstage-plugin-gitlab/commit/e3b314f93ca59f2bea8058767e9aed09e1fae458))
-   build ([e788b01](https://github.com/immobiliare/backstage-plugin-gitlab/commit/e788b01c6fcda512e4acd389f7cf070bece7e457))
-   **front-end:** dev test ([810c9e2](https://github.com/immobiliare/backstage-plugin-gitlab/commit/810c9e2a0cbaf6b3b60a5a8cf9ea3410ae8a5d78))
-   typo allowKinds into allowedKinds ([ebaad6e](https://github.com/immobiliare/backstage-plugin-gitlab/commit/ebaad6ee90cec89fb008491f18dd38988cfdc2da))

### Features

-   added the new annotation instance ([22f80e6](https://github.com/immobiliare/backstage-plugin-gitlab/commit/22f80e654f8c909d063fec332bec1f5d8b58c48b))
-   backend plugin ([3597c2c](https://github.com/immobiliare/backstage-plugin-gitlab/commit/3597c2cd4a0f92d411ba579579d9f3f1df204cc7))
-   **processor:** added indexing feature ([1374ea0](https://github.com/immobiliare/backstage-plugin-gitlab/commit/1374ea09bf8ada12af0b592ccb37d042381eda2f))
-   updated API call in client ([6300447](https://github.com/immobiliare/backstage-plugin-gitlab/commit/63004472690ee621527ac6d985f34157d6a3db0e))

### BREAKING CHANGES

-   proxy is not more used, you have to use backend plugin with the processor.
