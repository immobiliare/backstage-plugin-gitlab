import React from 'react';
import { Avatar, Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { MemberCardEntityData } from '../../../../types';

type Props = {
    memberCardEntity: MemberCardEntityData;
};

const LightTooltip = withStyles({
    tooltip: {
        backgroundColor: 'white',
        border: '1px solid lightgrey',
        color: '#333',
        minWidth: '320px',
    },
})(Tooltip);

export const MemberCardEntity = ({
    memberCardEntity: memberCardEntity,
}: Props) => {
    return (
        <LightTooltip
            title={[memberCardEntity.name, memberCardEntity.access_level_label]
                .filter(Boolean)
                .join(' : ')}
        >
            <a href={memberCardEntity.web_url} target="_blank">
                <Avatar
                    key={memberCardEntity.name}
                    alt={memberCardEntity.name}
                    src={memberCardEntity.avatar_url}
                />
            </a>
        </LightTooltip>
    );
};
