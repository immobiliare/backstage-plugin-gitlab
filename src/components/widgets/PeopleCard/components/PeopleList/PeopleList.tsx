import React from 'react';
import { Grid } from '@material-ui/core';
import { Person } from '../Person';
import { PersonData } from '../../../../types';

export const PeopleList = ({ peopleObj }: any) => {
    const data = peopleObj.data.map((person: PersonData) => {
        return {
            name: person.name,
            email: person.email,
            avatar_url: person.avatar_url,
        };
    });
    return (
        <Grid container spacing={1} justifyContent="flex-start">
            {data.map((person: PersonData) => (
                <Grid key={person.name} item>
                    <Person person={person} />
                </Grid>
            ))}
        </Grid>
    );
};
