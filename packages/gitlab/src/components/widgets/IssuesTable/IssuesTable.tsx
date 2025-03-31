import {
    Avatar,
    Progress,
    StatusAborted,
    StatusOK,
    StatusPending,
    Table,
    TableColumn,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import Alert from '@material-ui/lab/Alert';
import React from 'react';
import { useAsync } from 'react-use';
import { GitlabCIApiRef } from '../../../api';
import {
    gitlabInstance,
    gitlabProjectId,
    gitlabProjectSlug,
} from '../../gitlabAppData';
import { getElapsedTime } from '../../utils';
import type { IssueSchema } from '@gitbeaker/rest';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { gitlabTranslationRef } from '../../../translation';
import { Box, Typography } from '@material-ui/core';
import Link from '@material-ui/core/Link';

export function AuthorColumn(
    issueObject: IssueSchema
): TableColumn<Record<string, unknown>> {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
                customStyles={{ width: 32, height: 32 }}
                picture={issueObject.author.avatar_url}
                displayName={issueObject.author.username}
            />
            <Typography variant="body2" noWrap>
                <Box ml={1} component="span">
                    <Link href={issueObject.author.web_url} target="_blank">
                        {issueObject.author.username}
                    </Link>
                </Box>
            </Typography>
        </Box>
    );
}

const IssueTitle = (
    issueObject: IssueSchema
): TableColumn<Record<string, unknown>> => {
    return (
        <Typography variant="body2" noWrap>
            <Box ml={1} component="span">
                <Link href={issueObject.web_url} target="_blank">
                    {issueObject.title}
                </Link>
            </Box>
        </Typography>
    );
};

export const DenseTable = ({
    issuesObjects,
    projectName,
}: {
    issuesObjects: IssueSchema[];
    projectName: string | undefined;
}) => {
    const { t } = useTranslationRef(gitlabTranslationRef);

    const IssueStateIndicator = (
        issueObject: IssueSchema
    ): TableColumn<Record<string, unknown>> => {
        switch (issueObject.state) {
            case 'opened':
                return (
                    <StatusPending>
                        {t('issuesTable.status.open')}
                    </StatusPending>
                );
            case 'closed':
                return <StatusOK>{t('issuesTable.status.close')}</StatusOK>;
            default:
                return <StatusAborted />;
        }
    };

    const columns: TableColumn<IssueSchema>[] = [
        { title: t('issuesTable.columnsTitle.issueId'), field: 'id' },
        { title: t('issuesTable.columnsTitle.title'), render: IssueTitle },
        { title: t('issuesTable.columnsTitle.author'), render: AuthorColumn },
        { title: t('issuesTable.columnsTitle.createdAt'), field: 'created_at' },
        { title: t('issuesTable.columnsTitle.issueType'), field: 'type' },
        {
            title: t('issuesTable.columnsTitle.issueStatus'),
            render: IssueStateIndicator,
        },
    ];

    const title = t('issuesTable.title', { projectName: projectName || '' });

    const data = issuesObjects.map((issue) => ({
        ...issue,
        created_at: getElapsedTime(issue.created_at),
    }));

    return (
        <Table
            title={title}
            options={{ search: true, paging: true }}
            columns={columns}
            data={data}
        />
    );
};

export const IssuesTable = ({}) => {
    const project_id = gitlabProjectId();
    const project_slug = gitlabProjectSlug();
    const gitlab_instance = gitlabInstance();

    const GitlabCIAPI = useApi(GitlabCIApiRef).build(
        gitlab_instance || 'gitlab.com'
    );

    const { value, loading, error } = useAsync(async (): Promise<{
        data: IssueSchema[];
        projectName: string;
    }> => {
        const projectDetails = await GitlabCIAPI.getProjectDetails(
            project_slug || project_id
        );
        if (!projectDetails)
            throw new Error('wrong project_slug or project_id');

        const summary = await GitlabCIAPI.getIssuesSummary(projectDetails.id);

        if (!summary) {
            throw new Error('gitlab issues is undefined!');
        }
        const renderData = {
            data: summary,
            projectName: projectDetails.name,
        };

        return renderData;
    }, []);

    if (loading) {
        return <Progress />;
    } else if (error) {
        return <Alert severity="error">{error.message}</Alert>;
    }

    return (
        <DenseTable
            issuesObjects={value?.data || []}
            projectName={value?.projectName}
        />
    );
};
