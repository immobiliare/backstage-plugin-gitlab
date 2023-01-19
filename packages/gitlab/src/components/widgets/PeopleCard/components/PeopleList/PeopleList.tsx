import React from 'react';
import { Grid, Box } from '@material-ui/core';
import { Link } from '@backstage/core-components';
import { Person } from '../Person';
import { PersonData, PeopleLink } from '../../../../types';
import { makeStyles } from '@material-ui/core/styles';
import ArrowIcon from '@material-ui/icons/ArrowForward';

interface PeopleListProps {
    title: string;
    peopleObj: PersonData[];
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

export const PeopleList = ({ title, peopleObj, deepLink }: PeopleListProps) => {
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
                {peopleObj?.map((person: PersonData) => (
                    <Grid key={person.name} item>
                        <Person person={person} />
                    </Grid>
                ))}
            </Grid>
        </>
    );
};
