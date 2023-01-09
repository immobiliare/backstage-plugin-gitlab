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

export const Person = ({ person }: Props) => {
    return (
        <LightTooltip title={person.name}>
            <a href={person.web_url} target="_blank">
                <Avatar
                    key={person.name}
                    alt={person.name}
                    src={person.avatar_url}
                />
            </a>
        </LightTooltip>
    );
};
