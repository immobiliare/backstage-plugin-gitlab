import React from 'react';
import { Grid } from '@material-ui/core';
import {
  Page,
  Content,
  ContentHeader,
} from '@backstage/core-components';
import {
  ContributorsCard,
  LanguagesCard,
  MergeRequestsTable,
  PipelinesTable,
} from '../widgets';

export const GitlabCI = () => (
  <Page themeId="tool">
    <Content>
      <ContentHeader title="Gitlab Plugin">
      </ContentHeader>
      <Grid container spacing={6} direction="row" alignItems="stretch">
        <Grid item sm={12} md={6} lg={6}>
          <ContributorsCard />
        </Grid>
          <Grid item sm={12} md={6} lg={6}>
          <LanguagesCard />
          </Grid>
        <Grid item md={12}>
          <PipelinesTable />
        </Grid>
        <Grid item md={12}>          
          <MergeRequestsTable />
        </Grid>
      </Grid>
    </Content>
  </Page>
);