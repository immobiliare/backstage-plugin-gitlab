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
import { createStatusColumn, createPipelineIDColumn } from './columns';
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
        {
            ...createPipelineIDColumn(),
            width: '120px',
        },
        {
            ...createStatusColumn(),
            width: '80px',
        },
        {
            title: 'Branch',
            field: 'ref',
            width: '300px',
        },
        { title: 'Created', field: 'created_date', width: '150px' },
        { title: 'Duration', field: 'duration', width: '150px' },
    ];

    const title = 'Pipelines';

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

        const summary = await GitlabCIAPI.getPipelineSummary(projectDetails.id);

        if (!summary) throw new Error('Pipeline summary is undefined!');
        return { summary, projectName: projectDetails.name };
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
