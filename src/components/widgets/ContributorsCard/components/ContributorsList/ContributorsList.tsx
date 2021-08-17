import React from 'react';
import { Grid } from '@material-ui/core';
import { Contributor } from '../Contributor';
import { ContributorData } from '../../../../types';

type Props = {
  contributors: ContributorData[];
};
  
export const ContributorsList = ({ contributors }: Props) => (
        <Grid container spacing={1} justifyContent="flex-start">
          {contributors.map(contributor => (
            <Grid key={contributor.name} item>
                <Contributor contributor={contributor} />
            </Grid>
          ))}
        </Grid>
);