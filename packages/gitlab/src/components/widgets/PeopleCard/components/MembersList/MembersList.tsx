import { Link } from '@backstage/core-components';
import { Box, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ArrowIcon from '@material-ui/icons/ArrowForward';
import React from 'react';
import type { MemberCardEntityData, PeopleLink } from '../../../../types';
import { MemberCardEntity } from '../MemberCardEntity';

interface MembersListProps {
    title: string;
    memberObj: MemberCardEntityData[];
    deepLink?: PeopleLink;
}

const useStyles = makeStyles((theme) => ({
    link: {
        color: 'inherit',
        textDecoration: 'none',
        marginRight: theme.spacing(1),
        marginTop: theme.spacing(0),
    },
    box: {
        marginTop: theme.spacing(0),
        marginBottom: theme.spacing(1),
    },
    boxLink: {
        marginTop: theme.spacing(0),
    },
    title: {
        marginTop: theme.spacing(0),
        marginBottom: theme.spacing(0),
    },
}));

export const MembersList = ({
    title,
    memberObj: peopleObj,
    deepLink,
}: MembersListProps) => {
    const classes = useStyles();
    return (
        <>
            <Box
                className={classes.box}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
            >
                <h2 className={classes.title}>{title}</h2>
                {deepLink && (
                    <Box
                        className={classes.boxLink}
                        display="flex"
                        alignItems="center"
                    >
                        <Link
                            className={classes.link}
                            to={deepLink.link}
                            onClick={deepLink.onClick}
                        >
                            {deepLink.title}
                        </Link>
                        <ArrowIcon fontSize="small"></ArrowIcon>
                    </Box>
                )}
            </Box>
            <Grid container spacing={1} justifyContent="flex-start">
                {peopleObj?.map((memberCardEntity: MemberCardEntityData) => (
                    <Grid key={memberCardEntity.name} item>
                        <MemberCardEntity memberCardEntity={memberCardEntity} />
                    </Grid>
                ))}
            </Grid>
        </>
    );
};
