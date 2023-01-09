import React from 'react';
import { Grid, Box } from '@material-ui/core';
import { Link } from '@backstage/core-components';
import { Person } from '../Person';
import { PersonData, PeopleLink } from '../../../../types';
import { makeStyles } from '@material-ui/core/styles';
import ArrowIcon from '@material-ui/icons/ArrowForward';

interface PeopleListProps {
    peopleObj: PersonData[];
    deepLink?: PeopleLink;
}

const useStyles = makeStyles((theme) => ({
    link: {
        color: 'inherit',
        textDecoration: 'none',
        marginRight: theme.spacing(1),
    },
    box: {
        marginTop: theme.spacing(2),
    },
}));

export const PeopleList = ({ peopleObj, deepLink }: PeopleListProps) => {
    const classes = useStyles();
    return (
        <>
            <Grid container spacing={1} justifyContent="flex-start">
                {peopleObj.map((person: PersonData) => (
                    <Grid key={person.name} item>
                        <Person person={person} />
                    </Grid>
                ))}
            </Grid>
            {deepLink && (
                <Grid container spacing={1} justifyContent="flex-end">
                    <Box
                        className={classes.box}
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
                </Grid>
            )}
        </>
    );
};
