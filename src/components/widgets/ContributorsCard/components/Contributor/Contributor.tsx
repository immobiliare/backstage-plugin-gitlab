import React from 'react';
import { Avatar, Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ContributorData } from '../../../../types';

type Props = {
  contributor: ContributorData;
};

const LightTooltip = withStyles({
  tooltip: {
    backgroundColor: 'white',
    border: '1px solid lightgrey',
    color: '#333',
    minWidth: '320px',
  },
})(Tooltip);

export const Contributor = ({ contributor }: Props) => (
    <LightTooltip
    title={contributor.name}>
    <Avatar
        key={contributor.name}
        alt={contributor.name}
        src={contributor.avatar_url}
    />
</LightTooltip>
);