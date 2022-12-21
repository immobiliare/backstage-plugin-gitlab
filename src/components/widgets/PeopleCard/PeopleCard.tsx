import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import { InfoCard, Progress } from '@backstage/core-components';
import { GitlabCIApiRef } from '../../../api';
import { useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import { gitlabAppData, gitlabAppSlug } from '../../gitlabAppData';
import { PeopleList } from './components/PeopleList';
import { PersonData, FileOwnership } from '../../types';
import { CodeOwners } from '../../../api/GitlabCIApi';
import { Divider } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    infoCard: {
        marginBottom: theme.spacing(3),
        '& + .MuiAlert-root': {
            marginTop: theme.spacing(3),
        },
    },
    subTitle: {
        marginTop: theme.spacing(0),
    },
    divider: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
}));

export const PeopleCard = ({}) => {
    const classes = useStyles();
    const GitlabCIAPI = useApi(GitlabCIApiRef);
    const { project_id } = gitlabAppData();
    const { project_slug } = gitlabAppSlug();
    /* TODO: to change the below logic to get contributors data*/
    const { value, loading, error } = useAsync(async (): Promise<{
        contributors: PersonData;
        owners: FileOwnership[];
    }> => {
        const projectDetails: any = await GitlabCIAPI.getProjectDetails(
            project_slug != '' ? project_slug : project_id
        );
        const projectId = project_id || projectDetails?.id;
        const gitlabObj = await GitlabCIAPI.getContributorsSummary(projectId);
        const data = gitlabObj?.getContributorsData;
        const renderData: any = { data };
        renderData.project_web_url = projectDetails?.web_url;
        renderData.project_default_branch = projectDetails?.default_branch;
        const codeOwners: CodeOwners = await GitlabCIAPI.getCodeOwners(
            project_id,
            renderData.project_default_branch,
            'CODEOWNERS'
        );
        const dataOwners: FileOwnership[] = codeOwners?.getCodeOwners;
        return { contributors: renderData!, owners: dataOwners };
    }, []);

    const project_web_url = value?.contributors.project_web_url;
    const project_default_branch = value?.contributors.project_default_branch;

    if (loading) {
        return <Progress />;
    } else if (error) {
        return (
            <Alert severity="error" className={classes.infoCard}>
                {error.message}
            </Alert>
        );
    }
    return (
        <InfoCard
            title="People"
            deepLink={{
                link: `${project_web_url}/-/graphs/${project_default_branch}`,
                title: 'People',
                onClick: (e) => {
                    e.preventDefault();
                    window.open(
                        `${project_web_url}/-/graphs/${project_default_branch}`
                    );
                },
            }}
            className={classes.infoCard}
        >
            <h2 className={classes.subTitle}>Owners</h2>
            <PeopleList peopleObj={value?.contributors || { data: [] }} />
            <Divider className={classes.divider}></Divider>
            <h1 className={classes.subTitle}>Contributors</h1>
            <PeopleList peopleObj={value?.contributors || { data: [] }} />
        </InfoCard>
    );
};
