import { Content, Page } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import React from 'react';
import {
    CoverageCard,
    IssuesTable,
    LanguagesCard,
    MergeRequestStats,
    MergeRequestsTable,
    PeopleCard,
    PipelinesTable,
    ReleasesCard,
    type ReleasesCardProps,
} from '../widgets';

export type GitlabPageProps = {
    release?: ReleasesCardProps;
};

export const GitlabCI = (props: GitlabPageProps) => (
    <Page themeId="tool">
        <Content>
            <Grid container spacing={6} direction="row" alignItems="stretch">
                <Grid item sm={12} md={6}>
                    <PeopleCard />
                </Grid>
                <Grid item sm={12} md={6}>
                    <LanguagesCard />
                </Grid>
                <Grid item sm={12} md={6}>
                    <MergeRequestStats />
                </Grid>
                <Grid item sm={12} md={6}>
                    <ReleasesCard {...props.release} />
                </Grid>
                <Grid item md={12}>
                    <PipelinesTable />
                </Grid>
                <Grid item md={12}>
                    <MergeRequestsTable />
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
