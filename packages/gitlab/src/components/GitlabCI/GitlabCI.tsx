import { Content, Page } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import React from 'react';
import {
    PeopleCard,
    IssuesTable,
    LanguagesCard,
    MergeRequestsTable,
    MergeRequestStats,
    PipelinesTable,
    ReleasesCard,
    ReleasesCardProps,
    CoverageCard,
    MergeRequestsAssignedToMeCard,
    MergeRequestsAssignedToReviewCard,
    MergeRequestsForTeamBoard,
} from '../widgets';

export type GitlabPageProps = {
    release?: ReleasesCardProps;
};

export const GitlabCI = (props: GitlabPageProps) => (
    <Page themeId="tool">
        <Content>
            <Grid container spacing={6} direction="row" alignItems="stretch">
                <Grid item sm={12} md={3} lg={3}>
                    <PeopleCard />
                </Grid>
                <Grid item sm={12} md={3} lg={3}>
                    <LanguagesCard />
                </Grid>
                <Grid item sm={12} md={3} lg={3}>
                    <MergeRequestStats />
                </Grid>
                <Grid item sm={12} md={3} lg={3}>
                    <ReleasesCard {...props.release} />
                </Grid>
                <Grid item md={12}>
                    <PipelinesTable />
                </Grid>
                <Grid item md={12}>
                    <MergeRequestsTable />
                </Grid>
                <Grid item md={12}>
                    <MergeRequestsForTeamBoard />
                </Grid>
                <Grid item sm={12} md={3} lg={3}>
                    <MergeRequestsAssignedToMeCard />
                </Grid>
                <Grid item sm={12} md={3} lg={3}>
                    <MergeRequestsAssignedToReviewCard />
                </Grid>
                <Grid item md={12}>
                    <IssuesTable />
                </Grid>
                <Grid item md={12}>
                    <CoverageCard />
                </Grid>
            </Grid>
        </Content>
    </Page>
);
