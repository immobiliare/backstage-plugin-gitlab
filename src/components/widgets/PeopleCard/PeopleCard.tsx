import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import { InfoCard, Progress } from '@backstage/core-components';
import { GitlabCIApiRef } from '../../../api';
import { useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import {
    gitlabAppData,
    gitlabAppSlug,
    gitlabCodeOwnerPath,
} from '../../gitlabAppData';
import { PeopleList } from './components/PeopleList';
import { PersonData, FileOwnership, ProjectDetail } from '../../types';
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
    link: {
        color: 'inherit',
        textDecoration: 'none',
        marginTop: theme.spacing(2),
    },
}));

export const PeopleCard = ({}) => {
    const classes = useStyles();
    const GitlabCIAPI = useApi(GitlabCIApiRef);
    const { project_id } = gitlabAppData();
    const { project_slug } = gitlabAppSlug();
    const { codeowners_path } = gitlabCodeOwnerPath();
    /* TODO: to change the below logic to get contributors data*/
    const { value, loading, error } = useAsync(async (): Promise<{
        contributors: PersonData[] | undefined;
        owners: PersonData[];
        projectDetails: ProjectDetail;
    }> => {
        const projectDetails: any = await GitlabCIAPI.getProjectDetails(
            project_slug != '' ? project_slug : project_id
        );
        const projectId = project_id || projectDetails?.id;
        const gitlabObj = await GitlabCIAPI.getContributorsSummary(projectId);
        const contributorData: PersonData[] | undefined =
            gitlabObj?.getContributorsData;
        const projectDetailsData: ProjectDetail = {
            project_web_url: projectDetails?.web_url,
            project_default_branch: projectDetails?.default_branch,
        };
        // CODE OWNERS
        const codeOwners: PersonData[] = await GitlabCIAPI.getCodeOwners(
            project_id,
            projectDetailsData.project_default_branch,
            codeowners_path
        );
        return {
            contributors: contributorData!,
            owners: codeOwners,
            projectDetails: projectDetailsData!,
        };
    }, []);

    const project_web_url = value?.projectDetails.project_web_url;
    const project_default_branch = value?.projectDetails.project_default_branch;
    const contributorsLink = GitlabCIAPI.getContributorsLink(
        project_web_url,
        project_default_branch
    );
    const ownersLink = GitlabCIAPI.getOwnersLink(
        project_web_url,
        project_default_branch,
        codeowners_path
    );

    const contributorsDeepLink = {
        link: contributorsLink,
        title: 'go to Contributors',
        onClick: (e: Event) => {
            e.preventDefault();
            window.open(contributorsLink);
        },
    };
    const ownersDeepLink = {
        link: ownersLink,
        title: 'go to Owners File',
        onClick: (e: Event) => {
            e.preventDefault();
            window.open(ownersLink);
        },
    };

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
        <InfoCard title="People" className={classes.infoCard}>
            <h2 className={classes.subTitle}>Owners</h2>
            <PeopleList
                peopleObj={value?.owners || []}
                deepLink={ownersDeepLink}
            />
            <Divider className={classes.divider}></Divider>
            <h1 className={classes.subTitle}>Contributors</h1>
            <PeopleList
                peopleObj={value?.contributors || []}
                deepLink={contributorsDeepLink}
            />
        </InfoCard>
    );
};
