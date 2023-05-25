import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import {
    InfoCard,
    Progress,
    MarkdownContent,
} from '@backstage/core-components';
import { GitlabCIApiRef } from '../../../api';
import { useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import {
    gitlabProjectId,
    gitlabProjectSlug,
    gitlabReadmePath,
    gitlabInstance,
} from '../../gitlabAppData';
import { ProjectDetail } from '../../types';

const useStyles = makeStyles((theme) => ({
    infoCard: {
        marginBottom: theme.spacing(3),
        '& + .MuiAlert-root': {
            marginTop: theme.spacing(3),
        },
    },
}));

export const ReadmeCard = ({}) => {
    const classes = useStyles();
    const project_id = gitlabProjectId();
    const project_slug = gitlabProjectSlug();
    const gitlab_instance = gitlabInstance();
    const readme_path = gitlabReadmePath();

    const GitlabCIAPI = useApi(GitlabCIApiRef).build(
        gitlab_instance || 'gitlab.com'
    );

    const { value, loading, error } = useAsync(async (): Promise<{
        readme: string | undefined;
    }> => {
        const projectDetails: any = await GitlabCIAPI.getProjectDetails(
            project_slug || project_id
        );
        const projectId = project_id || projectDetails?.id;
        const projectDetailsData: ProjectDetail = {
            project_web_url: projectDetails?.web_url,
            project_default_branch: projectDetails?.default_branch,
        };
        let readmeData: string | undefined = undefined;
        try {
            readmeData = await GitlabCIAPI.getReadme(
                projectId,
                projectDetailsData.project_default_branch,
                readme_path
            );
        } catch (error) {
            readmeData = undefined;
        }
        return {
            readme: readmeData,
        };
    }, []);

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
        <InfoCard title="README" className={classes.infoCard}>
            <MarkdownContent
                content={value?.readme || 'No README found'}
                dialect="gfm"
            />
        </InfoCard>
    );
};
