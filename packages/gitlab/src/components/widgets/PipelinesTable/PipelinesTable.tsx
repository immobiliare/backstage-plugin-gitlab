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
import { createStatusColumn, createWebURLColumn } from './columns';
import { getDuration, getElapsedTime } from '../../utils';
import type { PipelineSchema } from '@gitbeaker/rest';

export type PipelineDenseTableProps = {
    projectName: string;
    summary: PipelineSchema[];
};

export const PipelineDenseTable = ({
    projectName,
    summary,
}: PipelineDenseTableProps) => {
    const columns: TableColumn[] = [
        { title: 'Pipeline_ID', field: 'id' },
        createStatusColumn(),
        { title: 'Branch', field: 'ref' },
        createWebURLColumn(),
        { title: 'Created At', field: 'created_date' },
        { title: 'Duration', field: 'duration' },
    ];
    const title = 'Gitlab Pipelines: ' + projectName;

    const data = summary.map((pipelineObject) => {
        return {
            id: pipelineObject.id,
            status: pipelineObject.status,
            ref: pipelineObject.ref,
            web_url: pipelineObject.web_url,
            created_date: getElapsedTime(pipelineObject.created_at),
            duration: getDuration(
                pipelineObject.created_at,
                pipelineObject.updated_at
            ),
        };
    });

    return (
        <Table
            title={title}
            options={{ search: true, paging: true }}
            columns={columns}
            data={data || []}
        />
    );
};

export const PipelinesTable = ({}) => {
    const project_id = gitlabProjectId();
    const project_slug = gitlabProjectSlug();
    const gitlab_instance = gitlabInstance();

    const GitlabCIAPI = useApi(GitlabCIApiRef).build(
        gitlab_instance || 'gitlab.com'
    );

    const { value, loading, error } = useAsync(async () => {
        const projectDetails = await GitlabCIAPI.getProjectDetails(
            project_slug || project_id
        );
        if (!projectDetails)
            throw new Error('wrong project_slug or project_id');
        const projectId = project_id || projectDetails.id;

        const [summary, projectName] = await Promise.all([
            GitlabCIAPI.getPipelineSummary(projectId),
            GitlabCIAPI.getProjectName(projectId),
        ]);

        if (!summary || !projectName)
            throw new Error(
                'Merge request summary or project_name are undefined!'
            );
        return { summary, projectName };
    }, []);

    if (loading) {
        return <Progress />;
    } else if (error) {
        return <Alert severity="error">{error.message}</Alert>;
    } else if (!value) {
        return (
            <Alert severity="error">{'pipeline value is not defined!'}</Alert>
        );
    }

    return <PipelineDenseTable {...value} />;
};
