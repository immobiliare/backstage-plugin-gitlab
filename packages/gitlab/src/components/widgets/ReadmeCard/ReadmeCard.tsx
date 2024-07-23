import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ReactMarkdown from 'react-markdown';
import Alert from '@material-ui/lab/Alert';
import {
    InfoCard,
    Progress,
    InfoCardVariants,
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
import gfm from 'remark-gfm';
import toc from 'remark-toc';
// @ts-ignore
import removeComments from 'remark-remove-comments';

import gemoji from 'remark-gemoji';
import { parseGitLabReadme } from '../../utils';

const useStyles = makeStyles((theme) => ({
    infoCard: {
        marginBottom: theme.spacing(3),
        '& + .MuiAlert-root': {
            marginTop: theme.spacing(3),
        },
    },
    // https://github.com/backstage/backstage/blob/master/packages/core-components/src/components/MarkdownContent/MarkdownContent.tsx#L28
    markdown: {
        '& table': {
            borderCollapse: 'collapse',
            border: `1px solid ${theme.palette.border}`,
        },
        '& th, & td': {
            border: `1px solid ${theme.palette.border}`,
            padding: theme.spacing(1),
        },
        '& td': {
            wordBreak: 'break-word',
            overflow: 'hidden',
            verticalAlign: 'middle',
            lineHeight: '1',
            margin: 0,
            padding: theme.spacing(3, 2, 3, 2.5),
            borderBottom: 0,
        },
        '& th': {
            backgroundColor: theme.palette.background.paper,
        },
        '& tr': {
            backgroundColor: theme.palette.background.paper,
        },
        '& tr:nth-child(odd)': {
            backgroundColor: theme.palette.background.default,
        },

        '& a': {
            color: theme.palette.link,
        },
        '& img': {
            maxWidth: '100%',
        },
    },
}));

type Props = {
    variant?: InfoCardVariants;
    markdownClasses?: string;
};

export const ReadmeCard = (props: Props) => {
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
        const projectDetails = await GitlabCIAPI.getProjectDetails(
            project_slug || project_id
        );

        if (!projectDetails)
            throw new Error('wrong project_slug or project_id');

        let readmeData: string | undefined = undefined;
        try {
            readmeData = await GitlabCIAPI.getReadme(
                projectDetails.id,
                projectDetails.default_branch,
                readme_path
            );
        } catch (error) {
            readmeData = undefined;
        }

        return {
            readme: readmeData ? parseGitLabReadme(readmeData) : undefined,
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
        <InfoCard
            title="README"
            className={classes.infoCard}
            variant={props.variant}
        >
            <ReactMarkdown
                className={`${classes.markdown} ${
                    props.markdownClasses ?? ''
                }`.trim()}
                remarkPlugins={[
                    gfm,
                    gemoji,
                    [toc, { heading: '<!-- injected_toc -->' }], // tells remark-toc to look for toc injected by parseGitLabReadme
                    removeComments, // removes HTML comments, including the one we injected
                ]}
                children={value?.readme ?? 'No README found'}
            />
        </InfoCard>
    );
};
