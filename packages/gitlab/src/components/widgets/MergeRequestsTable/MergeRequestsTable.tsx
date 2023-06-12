import React from 'react';
import { Table, TableColumn, Progress } from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';
import { useAsync } from 'react-use';
import {
    gitlabInstance,
    gitlabProjectId,
    gitlabProjectSlug,
} from '../../gitlabAppData';
import { GitlabCIApiRef } from '../../../api';
import { useApi } from '@backstage/core-plugin-api';
import { getElapsedTime, getDuration } from '../../utils';
import { createTitleColumn } from './columns';
import type { MergeRequestSchema } from '@gitbeaker/rest';

type MergeRequestDenseTableProps = {
    data: MergeRequestSchema[];
    projectName: string;
};

export const MergeRequestDenseTable = ({
    data,
    projectName,
}: MergeRequestDenseTableProps) => {
    const columns: TableColumn[] = [
        { title: 'ID', field: 'id' },
        createTitleColumn(),
        { title: 'Creator', field: 'author' },
        { title: 'State', field: 'state' },
        { title: 'Created At', field: 'created_date' },
        { title: 'Duration', field: 'duration' },
    ];
    const title = 'Gitlab Merge Request Status: ' + projectName;
    const mappedData = data.map((mergeRequest) => {
        return {
            id: mergeRequest.id,
            state: mergeRequest.state,
            author: mergeRequest.author.username,
            title: mergeRequest.title,
            web_url: mergeRequest.web_url,
            created_date: getElapsedTime(mergeRequest.created_at),
            duration: getDuration(
                mergeRequest.created_at,
                mergeRequest.updated_at
            ),
        };
    });

    return (
        <Table
            title={title}
            options={{ search: true, paging: true }}
            columns={columns}
            data={mappedData || []}
        />
    );
};

export const MergeRequestsTable = ({}) => {
    const project_id = gitlabProjectId();
    const project_slug = gitlabProjectSlug();
    const gitlab_instance = gitlabInstance();

    const GitlabCIAPI = useApi(GitlabCIApiRef).build(
        gitlab_instance || 'gitlab.com'
    );

    const { value, loading, error } = useAsync(async (): Promise<{
        data: MergeRequestSchema[];
        projectName: string;
    }> => {
        const projectDetails = await GitlabCIAPI.getProjectDetails(
            project_slug || project_id
        );

        if (!projectDetails)
            throw new Error('wrong project_slug or project_id');

        const projectId = project_id || projectDetails.id;

        const [summary, projectName] = await Promise.all([
            GitlabCIAPI.getMergeRequestsSummary(projectId),
            GitlabCIAPI.getProjectName(projectId),
        ]);

        if (!summary || !projectName)
            throw new Error(
                'Merge request summary or project_name are undefined!'
            );

        return { data: summary, projectName };
    }, []);

    if (loading) {
        return <Progress />;
    } else if (error) {
        return <Alert severity="error">{error.message}</Alert>;
    } else if (!value) {
        return (
            <Alert severity="error">
                {'Merge request data are not available.'}
            </Alert>
        );
    }

    return <MergeRequestDenseTable {...value} />;
};
