import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import React from 'react';
import { compatWrapper } from '@backstage/core-compat-api';

export const gitlabReadmeCard = EntityCardBlueprint.make({
    name: 'readme',
    params: {
        loader: async () =>
            import('../components/widgets/ReadmeCard').then((m) =>
                compatWrapper(<m.ReadmeCard />)
            ),
    },
});

export const gitlabCoverageCard = EntityCardBlueprint.make({
    name: 'coverage',
    params: {
        loader: async () =>
            import('../components/widgets/CoverageCard').then((m) =>
                compatWrapper(<m.CoverageCard />)
            ),
    },
});

export const gitlabReleasesCard = EntityCardBlueprint.make({
    name: 'releases',
    params: {
        loader: async () =>
            import('../components/widgets/ReleasesCard').then((m) =>
                compatWrapper(<m.ReleasesCard />)
            ),
    },
});

export const gitlabMergeRequestsStatsCard = EntityCardBlueprint.make({
    name: 'merge-requests-stats',
    params: {
        loader: async () =>
            import('../components/widgets/MergeRequestStats').then((m) =>
                compatWrapper(<m.MergeRequestStats />)
            ),
    },
});

export const gitlabPeopleCard = EntityCardBlueprint.make({
    name: 'people',
    params: {
        loader: async () =>
            import('../components/widgets/PeopleCard').then((m) =>
                compatWrapper(<m.PeopleCard />)
            ),
    },
});

export const gitlabLanguagesCard = EntityCardBlueprint.make({
    name: 'languages',
    params: {
        loader: async () =>
            import('../components/widgets/LanguagesCard').then((m) =>
                compatWrapper(<m.LanguagesCard />)
            ),
    },
});
