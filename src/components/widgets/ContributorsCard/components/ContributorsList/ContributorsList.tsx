import React from 'react';
import { Grid } from '@material-ui/core';
import { Contributor } from '../Contributor';
import { ContributorData } from '../../../../types';

export const ContributorsList = ({contributorsObj}: any ) => {
  const data = contributorsObj.data.map((contributor: ContributorData) => {
		return {
			name: contributor.name,
			email: contributor.email,
      avatar_url: contributor.avatar_url,
    };
	});
  return (
        <Grid container spacing={1} justifyContent="flex-start">
          {data.map((contributor: ContributorData) => (
            <Grid key={contributor.name} item>
                <Contributor contributor={contributor} />
            </Grid>
          ))}
        </Grid>
  );
}