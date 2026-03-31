import { Avatar, Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import type { PeopleCardEntityData } from '../../../../types';

type Props = {
    peopleCardEntity: PeopleCardEntityData;
};

const LightTooltip = withStyles({
    tooltip: {
        backgroundColor: 'white',
        border: '1px solid lightgrey',
        color: '#333',
        minWidth: '320px',
    },
})(Tooltip);

export const PeopleCardEntity = ({ peopleCardEntity }: Props) => {
    return (
        <LightTooltip title={peopleCardEntity.name}>
            <a href={peopleCardEntity.web_url} target="_blank" rel="noopener">
                <Avatar
                    key={peopleCardEntity.name}
                    alt={peopleCardEntity.name}
                    src={peopleCardEntity.avatar_url}
                />
            </a>
        </LightTooltip>
    );
};
