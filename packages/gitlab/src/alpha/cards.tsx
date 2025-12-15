import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import React from 'react';
import { compatWrapper } from '@backstage/core-compat-api';
import { isGitlabAvailable } from '../components';

export const gitlabReadmeCard = EntityCardBlueprint.make({
    name: 'readme',
    params: {
        filter: isGitlabAvailable,
        loader: async () =>
            import('../components/widgets/ReadmeCard').then((m) =>
                compatWrapper(<m.ReadmeCard />)
            ),
    },
});

export const gitlabCoverageCard = EntityCardBlueprint.make({
    name: 'coverage',
    params: {
        filter: isGitlabAvailable,
        loader: async () =>
            import('../components/widgets/CoverageCard').then((m) =>
                compatWrapper(<m.CoverageCard />)
            ),
    },
});

export const gitlabReleasesCard = EntityCardBlueprint.make({
    name: 'releases',
    params: {
        filter: isGitlabAvailable,
        loader: async () =>
            import('../components/widgets/ReleasesCard').then((m) =>
                compatWrapper(<m.ReleasesCard />)
            ),
    },
});

export const gitlabMergeRequestsStatsCard = EntityCardBlueprint.make({
    name: 'merge-requests-stats',
    params: {
        filter: isGitlabAvailable,
        loader: async () =>
            import('../components/widgets/MergeRequestStats').then((m) =>
                compatWrapper(<m.MergeRequestStats />)
            ),
    },
});

export const gitlabPeopleCard = EntityCardBlueprint.make({
    name: 'people',
    params: {
        filter: isGitlabAvailable,
        loader: async () =>
            import('../components/widgets/PeopleCard').then((m) =>
                compatWrapper(<m.PeopleCard />)
            ),
    },
});

export const gitlabLanguagesCard = EntityCardBlueprint.make({
    name: 'languages',
    params: {
        filter: isGitlabAvailable,
        loader: async () =>
            import('../components/widgets/LanguagesCard').then((m) =>
                compatWrapper(<m.LanguagesCard />)
            ),
    },
});
