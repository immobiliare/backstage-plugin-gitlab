import React from 'react';
import { Avatar, Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { PersonData } from '../../../../types';

type Props = {
    person: PersonData;
};

const LightTooltip = withStyles({
    tooltip: {
        backgroundColor: 'white',
        border: '1px solid lightgrey',
        color: '#333',
        minWidth: '320px',
    },
})(Tooltip);

export const Person = ({ person }: Props) => (
    <LightTooltip title={person.name}>
        <Avatar key={person.name} alt={person.name} src={person.avatar_url} />
    </LightTooltip>
);
