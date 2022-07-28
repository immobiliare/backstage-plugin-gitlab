import { Content, Page } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import React from 'react';
import {
  ContributorsCard,
  IssuesTable,
  LanguagesCard,
  MergeRequestsTable,
  MergeRequestStats,
  PipelinesTable,
} from '../widgets';

export const GitlabCI = () => (
  <Page themeId="tool">
    <Content>
      <Grid container spacing={6} direction="row" alignItems="stretch">
        <Grid item sm={12} md={6} lg={4}>
          <ContributorsCard />
        </Grid>
        <Grid item sm={12} md={6} lg={4}>
          <LanguagesCard />
        </Grid>
        <Grid item sm={12} md={6} lg={4}>
          <MergeRequestStats />
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
      </Grid>
    </Content>
  </Page>
);
