import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import {
    InfoCard,
    InfoCardVariants,
    Progress,
} from '@backstage/core-components';
import { GitlabCIApiRef } from '../../../api';
import { useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import {
    gitlabProjectId,
    gitlabProjectSlug,
    gitlabCodeOwnerPath,
    gitlabInstance,
} from '../../gitlabAppData';
import { PeopleList } from './components/PeopleList';
import { MembersList } from './components/MembersList';
import { PeopleCardEntityData, PeopleLink } from '../../types';
import { MemberCardEntityData } from '../../types';
import { Divider } from '@material-ui/core';
import { ProjectSchema } from '@gitbeaker/rest';

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

type Props = {
    variant?: InfoCardVariants;
    disableMembersList?: boolean;
};

export const PeopleCard = (props: Props) => {
    const classes = useStyles();
    const project_id = gitlabProjectId();
    const project_slug = gitlabProjectSlug();
    const gitlab_instance = gitlabInstance();
    const codeowners_path = gitlabCodeOwnerPath();

    const GitlabCIAPI = useApi(GitlabCIApiRef).build(
        gitlab_instance || 'gitlab.com'
    );
    /* TODO: to change the below logic to get contributors data*/
    const { value, loading, error } = useAsync(async (): Promise<{
        contributors: PeopleCardEntityData[] | undefined;
        members: MemberCardEntityData[] | undefined;
        owners: PeopleCardEntityData[] | undefined;
        projectDetails: ProjectSchema;
    }> => {
        const projectDetails = await GitlabCIAPI.getProjectDetails(
            project_slug || project_id
        );
        if (!projectDetails)
            throw new Error('wrong project_slug or project_id');

        const contributorData = await GitlabCIAPI.getContributorsSummary(
            projectDetails.id
        );

        const memberData = await GitlabCIAPI.getMembersSummary(
            projectDetails.id
        );

        // CODE OWNERS
        let codeOwners: PeopleCardEntityData[] | undefined = [];
        try {
            codeOwners = await GitlabCIAPI.getCodeOwners(
                projectDetails.id,
                projectDetails?.default_branch,
                codeowners_path
            );
        } catch (error) {
            codeOwners = undefined;
        }
        return {
            contributors: contributorData!,
            members: memberData!,
            owners: codeOwners,
            projectDetails,
        };
    }, []);

    const project_web_url = value?.projectDetails?.web_url;
    const project_default_branch = value?.projectDetails?.default_branch;

    let contributorsDeepLink: PeopleLink | undefined;
    let membersDeepLink: PeopleLink | undefined;
    let ownersDeepLink: PeopleLink | undefined;
    if (project_web_url && project_default_branch) {
        const contributorsLink = GitlabCIAPI.getContributorsLink(
            project_web_url,
            project_default_branch
        );
        contributorsDeepLink = {
            link: contributorsLink,
            title: 'go to Contributors',
            onClick: (e) => {
                e.preventDefault();
                window.open(contributorsLink);
            },
        };

        const membersLink = GitlabCIAPI.getMembersLink(project_web_url);
        membersDeepLink = {
            link: membersLink,
            title: 'go to Members',
            onClick: (e) => {
                e.preventDefault();
                window.open(membersLink);
            },
        };

        const ownersLink = GitlabCIAPI.getOwnersLink(
            project_web_url,
            project_default_branch,
            codeowners_path
        );
        ownersDeepLink = {
            link: ownersLink,
            title: 'go to Owners File',
            onClick: (e) => {
                e.preventDefault();
                window.open(ownersLink);
            },
        };
    }

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
            className={classes.infoCard}
            variant={props.variant}
        >
            {value?.owners && (
                <>
                    <PeopleList
                        title="Owners"
                        peopleObj={value?.owners}
                        deepLink={ownersDeepLink}
                    />
                    <Divider className={classes.divider}></Divider>
                </>
            )}

            <PeopleList
                title="Contributors"
                peopleObj={value?.contributors || []}
                deepLink={contributorsDeepLink}
            />

            {props.disableMembersList || (
                <>
                    <Divider className={classes.divider}></Divider>
                    <MembersList
                        title="Members"
                        memberObj={value?.members || []}
                        deepLink={membersDeepLink}
                    />
                </>
            )}
        </InfoCard>
    );
};
