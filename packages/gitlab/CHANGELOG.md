# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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

**Note:** Version bump only for package @immobiliarelabs/backstage-plugin-gitlab

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

**Note:** Version bump only for package @immobiliarelabs/backstage-plugin-gitlab

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
-   build ([e788b01](https://github.com/immobiliare/backstage-plugin-gitlab/commit/e788b01c6fcda512e4acd389f7cf070bece7e457))
-   **front-end:** dev test ([810c9e2](https://github.com/immobiliare/backstage-plugin-gitlab/commit/810c9e2a0cbaf6b3b60a5a8cf9ea3410ae8a5d78))
-   typo allowKinds into allowedKinds ([ebaad6e](https://github.com/immobiliare/backstage-plugin-gitlab/commit/ebaad6ee90cec89fb008491f18dd38988cfdc2da))

### Features

-   added the new annotation instance ([22f80e6](https://github.com/immobiliare/backstage-plugin-gitlab/commit/22f80e654f8c909d063fec332bec1f5d8b58c48b))
-   backend plugin ([3597c2c](https://github.com/immobiliare/backstage-plugin-gitlab/commit/3597c2cd4a0f92d411ba579579d9f3f1df204cc7))
-   updated API call in client ([6300447](https://github.com/immobiliare/backstage-plugin-gitlab/commit/63004472690ee621527ac6d985f34157d6a3db0e))

### BREAKING CHANGES

-   proxy is not more used, you have to use backend plugin with the processor.

## [2.1.1](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v2.1.0...v2.1.1) (2023-01-17)

### Bug Fixes

-   code owners and issues do not work with project slug ([de2e045](https://github.com/immobiliare/backstage-plugin-gitlab/commit/de2e045208378e593f595318b7271267eb2737d8))
-   missing details if project slug is undefined ([e2f06f2](https://github.com/immobiliare/backstage-plugin-gitlab/commit/e2f06f2564c68601b9ebc2730e250eddf479eda8))

## [2.1.1-next.1](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v2.1.0...v2.1.1-next.1) (2023-01-17)

### Bug Fixes

-   code owners and issues do not work with project slug ([de2e045](https://github.com/immobiliare/backstage-plugin-gitlab/commit/de2e045208378e593f595318b7271267eb2737d8))
-   missing details if project slug is undefined ([e2f06f2](https://github.com/immobiliare/backstage-plugin-gitlab/commit/e2f06f2564c68601b9ebc2730e250eddf479eda8))

# [2.1.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v2.0.0...v2.1.0) (2023-01-13)

### Bug Fixes

-   upgrade @backstage/core-components from 0.12.1 to 0.12.2 ([a7d9f4a](https://github.com/immobiliare/backstage-plugin-gitlab/commit/a7d9f4a819b5f7ec7fb7c46464bb53ec79faa9ad))
-   upgrade @backstage/plugin-catalog-react from 1.2.2 to 1.2.3 ([c75d205](https://github.com/immobiliare/backstage-plugin-gitlab/commit/c75d2058e6183c5eec4de2709cfd145d9d156d3c))

### Features

-   **CODEOWNERS:** handled missing file ([d2c61da](https://github.com/immobiliare/backstage-plugin-gitlab/commit/d2c61da4cca0c66a24fbbb5d8fc1a54da9c96202))

# [2.1.0-next.1](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v2.0.0...v2.1.0-next.1) (2023-01-13)

### Bug Fixes

-   upgrade @backstage/core-components from 0.12.1 to 0.12.2 ([a7d9f4a](https://github.com/immobiliare/backstage-plugin-gitlab/commit/a7d9f4a819b5f7ec7fb7c46464bb53ec79faa9ad))
-   upgrade @backstage/plugin-catalog-react from 1.2.2 to 1.2.3 ([c75d205](https://github.com/immobiliare/backstage-plugin-gitlab/commit/c75d2058e6183c5eec4de2709cfd145d9d156d3c))

### Features

-   **CODEOWNERS:** handled missing file ([d2c61da](https://github.com/immobiliare/backstage-plugin-gitlab/commit/d2c61da4cca0c66a24fbbb5d8fc1a54da9c96202))

# [2.0.0](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v1.0.0...v2.0.0) (2023-01-10)

### Bug Fixes

-   **api:** code owner api ([bd0ab22](https://github.com/immobiliare/backstage-plugin-gitlab/commit/bd0ab226711a2e2648f482456b68c660468c0351))
-   default filepath ([46bf66c](https://github.com/immobiliare/backstage-plugin-gitlab/commit/46bf66c5baec3f993b616300376ec66fe6dca441))
-   formatted durations ([66000a8](https://github.com/immobiliare/backstage-plugin-gitlab/commit/66000a86fb8969e414e2084b945b521cb1d66e2f))
-   moved get owners details in getCodeOwners ([73b29d3](https://github.com/immobiliare/backstage-plugin-gitlab/commit/73b29d3596c4ed6802826903ddac0855bf208c03))
-   **PeopleCard:** moved link right to title ([d1eb225](https://github.com/immobiliare/backstage-plugin-gitlab/commit/d1eb2255da6b4088ebc5815e4a407182c2962a00))
-   tsc build errors ([5db5e6d](https://github.com/immobiliare/backstage-plugin-gitlab/commit/5db5e6d482b16f7d0d689cc3fbffe16c2c313607))

### Features

-   added api extendibility ([fcc2087](https://github.com/immobiliare/backstage-plugin-gitlab/commit/fcc2087fbc8fb55db9c18e5556c4fd2fa6ded289))
-   added bottom links for cards and links in avatars ([26551d6](https://github.com/immobiliare/backstage-plugin-gitlab/commit/26551d6d04307b5fd487b2f4921036767c212ee6))
-   added code ownership ([d093713](https://github.com/immobiliare/backstage-plugin-gitlab/commit/d093713b42e815596d81b0a91ea3a6d277d2eb51))
-   added codeowners annotation and new configuration variables ([279ea26](https://github.com/immobiliare/backstage-plugin-gitlab/commit/279ea266a8deb95ada2d10fb1826ee61e63135d3))
-   **PeopleCard:** Changed from contributors to people card ([d52e4a6](https://github.com/immobiliare/backstage-plugin-gitlab/commit/d52e4a657cc0974b19adcb7bfae9295fa68396ae))
-   setup dev environment and added proxy path attribute ([300f04f](https://github.com/immobiliare/backstage-plugin-gitlab/commit/300f04ffbec8896565578a6133bacdd03e957be3))

### BREAKING CHANGES

-   **PeopleCard:** contributor card was removed and converted into people card

# [2.0.0-next.1](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v1.1.0-next.1...v2.0.0-next.1) (2023-01-10)

### Bug Fixes

-   **api:** code owner api ([bd0ab22](https://github.com/immobiliare/backstage-plugin-gitlab/commit/bd0ab226711a2e2648f482456b68c660468c0351))
-   default filepath ([46bf66c](https://github.com/immobiliare/backstage-plugin-gitlab/commit/46bf66c5baec3f993b616300376ec66fe6dca441))
-   formatted durations ([66000a8](https://github.com/immobiliare/backstage-plugin-gitlab/commit/66000a86fb8969e414e2084b945b521cb1d66e2f))
-   moved get owners details in getCodeOwners ([73b29d3](https://github.com/immobiliare/backstage-plugin-gitlab/commit/73b29d3596c4ed6802826903ddac0855bf208c03))
-   **PeopleCard:** moved link right to title ([d1eb225](https://github.com/immobiliare/backstage-plugin-gitlab/commit/d1eb2255da6b4088ebc5815e4a407182c2962a00))
-   tsc build errors ([5db5e6d](https://github.com/immobiliare/backstage-plugin-gitlab/commit/5db5e6d482b16f7d0d689cc3fbffe16c2c313607))

### Features

-   added bottom links for cards and links in avatars ([26551d6](https://github.com/immobiliare/backstage-plugin-gitlab/commit/26551d6d04307b5fd487b2f4921036767c212ee6))
-   added code ownership ([d093713](https://github.com/immobiliare/backstage-plugin-gitlab/commit/d093713b42e815596d81b0a91ea3a6d277d2eb51))
-   added codeowners annotation and new configuration variables ([279ea26](https://github.com/immobiliare/backstage-plugin-gitlab/commit/279ea266a8deb95ada2d10fb1826ee61e63135d3))
-   **PeopleCard:** Changed from contributors to people card ([d52e4a6](https://github.com/immobiliare/backstage-plugin-gitlab/commit/d52e4a657cc0974b19adcb7bfae9295fa68396ae))

### BREAKING CHANGES

-   **PeopleCard:** contributor card was removed and converted into people card

# [1.1.0-next.2](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v1.1.0-next.1...v1.1.0-next.2) (2023-01-10)

### Bug Fixes

-   **api:** code owner api ([b1111c6](https://github.com/immobiliare/backstage-plugin-gitlab/commit/b1111c6842bb0d82e04058d5a8e57b2b4aa8ed4a))
-   formatted durations ([66000a8](https://github.com/immobiliare/backstage-plugin-gitlab/commit/66000a86fb8969e414e2084b945b521cb1d66e2f))
-   moved get owners details in getCodeOwners ([f3013ee](https://github.com/immobiliare/backstage-plugin-gitlab/commit/f3013ee4e79de340e10e2844144e72ecf64cac05))
-   **PeopleCard:** moved link right to title ([6275e1a](https://github.com/immobiliare/backstage-plugin-gitlab/commit/6275e1a247b91b84ccfed971a0a6c9cf5ad0b26f))
-   tsc build errors ([4d3a25e](https://github.com/immobiliare/backstage-plugin-gitlab/commit/4d3a25e0cd79aa23753c1b662566528c114fd154))

### Features

-   added bottom links for cards and links in avatars ([0bbf949](https://github.com/immobiliare/backstage-plugin-gitlab/commit/0bbf949314cf39e3344505fcaf9426a660aa0d2b))
-   added code ownership ([d093713](https://github.com/immobiliare/backstage-plugin-gitlab/commit/d093713b42e815596d81b0a91ea3a6d277d2eb51))
-   added codeowners annotation and new configuration variables ([279ea26](https://github.com/immobiliare/backstage-plugin-gitlab/commit/279ea266a8deb95ada2d10fb1826ee61e63135d3))
-   **PeopleCard:** Changed from contributors to people card ([3118b5f](https://github.com/immobiliare/backstage-plugin-gitlab/commit/3118b5f74b9fe93bb1428864fab632ac8991d665))

# [1.1.0-next.1](https://github.com/immobiliare/backstage-plugin-gitlab/compare/v1.0.0...v1.1.0-next.1) (2022-12-15)

### Features

-   added api extendibility ([fcc2087](https://github.com/immobiliare/backstage-plugin-gitlab/commit/fcc2087fbc8fb55db9c18e5556c4fd2fa6ded289))
-   setup dev environment and added proxy path attribute ([300f04f](https://github.com/immobiliare/backstage-plugin-gitlab/commit/300f04ffbec8896565578a6133bacdd03e957be3))

# 1.0.0 (2022-12-07)

### Bug Fixes

-   build ([002ed20](https://github.com/immobiliare/backstage-plugin-gitlab/commit/002ed206e436d6d093196fc4cf9198293e9164a1))
-   license ([7d8d3dd](https://github.com/immobiliare/backstage-plugin-gitlab/commit/7d8d3dd256bfdff315673e95bb484cf8e77bfdd7))
-   link gitlab on readme ([2205099](https://github.com/immobiliare/backstage-plugin-gitlab/commit/22050991708e6caf596cb87463752a23c442acac))
-   version rc ([b8a3d80](https://github.com/immobiliare/backstage-plugin-gitlab/commit/b8a3d801a7b3360d45fb41ed7f41a6348950f8b7))

### Features

-   bump dependencies version and refactor code ([93a0fdc](https://github.com/immobiliare/backstage-plugin-gitlab/commit/93a0fdc4eae5603bced54b16820e3b73dc48a08c))
-   release 0.1.0 ([dcc28d5](https://github.com/immobiliare/backstage-plugin-gitlab/commit/dcc28d5d6c629711f949891e6c4e380db000665b))
-   release 0.1.24 ([de5767c](https://github.com/immobiliare/backstage-plugin-gitlab/commit/de5767c707f48218fa74a651ec581abc08a17293))

# 1.0.0-next.1 (2022-12-07)

### Bug Fixes

-   build ([002ed20](https://github.com/immobiliare/backstage-plugin-gitlab/commit/002ed206e436d6d093196fc4cf9198293e9164a1))
-   license ([7d8d3dd](https://github.com/immobiliare/backstage-plugin-gitlab/commit/7d8d3dd256bfdff315673e95bb484cf8e77bfdd7))
-   version rc ([b8a3d80](https://github.com/immobiliare/backstage-plugin-gitlab/commit/b8a3d801a7b3360d45fb41ed7f41a6348950f8b7))

### Features

-   bump dependencies version and refactor code ([93a0fdc](https://github.com/immobiliare/backstage-plugin-gitlab/commit/93a0fdc4eae5603bced54b16820e3b73dc48a08c))
-   release 0.1.0 ([dcc28d5](https://github.com/immobiliare/backstage-plugin-gitlab/commit/dcc28d5d6c629711f949891e6c4e380db000665b))
-   release 0.1.24 ([de5767c](https://github.com/immobiliare/backstage-plugin-gitlab/commit/de5767c707f48218fa74a651ec581abc08a17293))
