# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [6.0.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v6.0.0-alpha.1...v6.0.0) (2023-06-14)

**Note:** Version bump only for package @immobiliarelabs/backstage-plugin-gitlab-backend

# [6.0.0-alpha.1](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v6.0.0-alpha.0...v6.0.0-alpha.1) (2023-06-13)

**Note:** Version bump only for package @immobiliarelabs/backstage-plugin-gitlab-backend

# [6.0.0-alpha.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v5.2.1-alpha.0...v6.0.0-alpha.0) (2023-06-12)

**Note:** Version bump only for package @immobiliarelabs/backstage-plugin-gitlab-backend

## [5.2.1-alpha.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v5.2.0...v5.2.1-alpha.0) (2023-06-09)

**Note:** Version bump only for package @immobiliarelabs/backstage-plugin-gitlab-backend

# [5.2.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v5.2.0-alpha.0...v5.2.0) (2023-05-29)

**Note:** Version bump only for package @immobiliarelabs/backstage-plugin-gitlab-backend

# [5.2.0-alpha.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v5.1.0...v5.2.0-alpha.0) (2023-05-29)

### Features

-   **added-secure-prop-to-proxy-config:** added new parameter 'secure' to be able to handle ([0aa8943](https://github.com/immobiliare/backstage-plugin-gitlab/commit/0aa8943a2410018fefa76bc2295153173df254c1))

# [5.1.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v5.1.0-alpha.0...v5.1.0) (2023-05-08)

**Note:** Version bump only for package @immobiliarelabs/backstage-plugin-gitlab-backend

# [5.1.0-alpha.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v5.0.2...v5.1.0-alpha.0) (2023-05-08)

### Features

-   **scope:** BasePath ([aaab6dd](https://github.com/immobiliare/backstage-plugin-gitlab/commit/aaab6ddc5fb6f5d38f9c58a32d0c99689b8d2411))

## [5.0.2](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v5.0.1...v5.0.2) (2023-04-13)

### Bug Fixes

-   removeHeader throws an error ([9a30295](https://github.com/immobiliare/backstage-plugin-gitlab/commit/9a302957d78664bc5146ce1334f54d0e7ed0e908))

## [5.0.1](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v5.0.1-alpha.1...v5.0.1) (2023-04-11)

**Note:** Version bump only for package @immobiliarelabs/backstage-plugin-gitlab-backend

## [5.0.1-alpha.1](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v5.0.1-alpha.0...v5.0.1-alpha.1) (2023-04-11)

**Note:** Version bump only for package @immobiliarelabs/backstage-plugin-gitlab-backend

## [5.0.1-alpha.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v5.0.0...v5.0.1-alpha.0) (2023-04-07)

### Bug Fixes

-   catching the error from http-proxy-middleware ([7c5f429](https://github.com/immobiliare/backstage-plugin-gitlab/commit/7c5f429f681df6ed324fb78bb894c2d677e8f615)), closes [#143](https://github.com/immobiliare/backstage-plugin-gitlab/issues/143)

# [5.0.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v5.0.0-alpha.0...v5.0.0) (2023-03-09)

**Note:** Version bump only for package @immobiliarelabs/backstage-plugin-gitlab-backend

# [5.0.0-alpha.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v4.0.1...v5.0.0-alpha.0) (2023-03-08)

### Features

-   **api:** identify gitlab instances by hostname ([dff875d](https://github.com/immobiliare/backstage-plugin-gitlab/commit/dff875d2c3e7750b7ca8a48ce0bd04ff2db8c283)), closes [#118](https://github.com/immobiliare/backstage-plugin-gitlab/issues/118)

### BREAKING CHANGES

-   **api:** Annotations `gitlab.com/instance` require the hostname of the gitlab instance, replacing index numbers. The processor now creates annotations with hostnames. GitLabCIApiRef calls using /api/gitlab/{number}/ are not resolved and return 404 not found.

Signed-off-by: Manuel Stein <manuel.stein@nokia-bell-labs.com>

## [4.0.1](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v4.0.0...v4.0.1) (2023-03-06)

### Bug Fixes

-   handle error when target is not well formatted url ([ca49ad4](https://github.com/immobiliare/backstage-plugin-gitlab/commit/ca49ad45fce3b54e6baa5d1455e65a9936fdaee5))

# [4.0.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v4.0.0-alpha.0...v4.0.0) (2023-02-23)

### Bug Fixes

-   removed backstage Authorization header to the forwarded backstage request ([e72aafa](https://github.com/immobiliare/backstage-plugin-gitlab/commit/e72aafab889ba1a3af000819daf73107c12ea566))

# [4.0.0-alpha.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v3.0.2...v4.0.0-alpha.0) (2023-02-22)

**Note:** Version bump only for package @immobiliarelabs/backstage-plugin-gitlab-backend

## [3.0.2](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v3.0.1...v3.0.2) (2023-02-15)

**Note:** Version bump only for package @immobiliarelabs/backstage-plugin-gitlab-backend

## [3.0.1](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v3.0.0...v3.0.1) (2023-01-25)

**Note:** Version bump only for package @immobiliarelabs/backstage-plugin-gitlab-backend

# [3.0.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v3.0.0-alpha.2...v3.0.0) (2023-01-25)

**Note:** Version bump only for package @immobiliarelabs/backstage-plugin-gitlab-backend

# [3.0.0-alpha.2](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v3.0.0-alpha.1...v3.0.0-alpha.2) (2023-01-24)

### Bug Fixes

-   **yarn:** fix yarn version ([587a086](https://github.com/immobiliare/backstage-plugin-gitlab/commit/587a0860df800e8cf2766aaaab8f82ac6fd30263))

# [3.0.0-alpha.1](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v3.0.0-alpha.0...v3.0.0-alpha.1) (2023-01-24)

**Note:** Version bump only for package @immobiliarelabs/backstage-plugin-gitlab-backend

# [3.0.0-alpha.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v2.1.1...v3.0.0-alpha.0) (2023-01-23)

### Bug Fixes

-   allow extensions ([38a6fc1](https://github.com/immobiliare/backstage-plugin-gitlab/commit/38a6fc18319d2cf49a28680ba2e7eacfc5fdda7b))
-   **backend:** allows only GET method ([e3b314f](https://github.com/immobiliare/backstage-plugin-gitlab/commit/e3b314f93ca59f2bea8058767e9aed09e1fae458))
-   build ([e788b01](https://github.com/immobiliare/backstage-plugin-gitlab/commit/e788b01c6fcda512e4acd389f7cf070bece7e457))
-   typo allowKinds into allowedKinds ([ebaad6e](https://github.com/immobiliare/backstage-plugin-gitlab/commit/ebaad6ee90cec89fb008491f18dd38988cfdc2da))

### Features

-   added the new annotation instance ([22f80e6](https://github.com/immobiliare/backstage-plugin-gitlab/commit/22f80e654f8c909d063fec332bec1f5d8b58c48b))
-   backend plugin ([3597c2c](https://github.com/immobiliare/backstage-plugin-gitlab/commit/3597c2cd4a0f92d411ba579579d9f3f1df204cc7))
-   **processor:** added indexing feature ([1374ea0](https://github.com/immobiliare/backstage-plugin-gitlab/commit/1374ea09bf8ada12af0b592ccb37d042381eda2f))
-   updated API call in client ([6300447](https://github.com/immobiliare/backstage-plugin-gitlab/commit/63004472690ee621527ac6d985f34157d6a3db0e))

### BREAKING CHANGES

-   proxy is not more used, you have to use backend plugin with the processor.
