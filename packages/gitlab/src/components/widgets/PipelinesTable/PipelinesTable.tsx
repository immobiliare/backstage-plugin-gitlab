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
import { PipelineObject } from '../../types';
import { getDuration, getElapsedTime } from '../../utils';

export const DenseTable = ({ pipelineObjects }: any) => {
    const columns: TableColumn[] = [
        { title: 'Pipeline_ID', field: 'id' },
        createStatusColumn(),
        { title: 'Branch', field: 'ref' },
        createWebURLColumn(),
        { title: 'Created At', field: 'created_date' },
        { title: 'Duration', field: 'duration' },
    ];
    const title = 'Gitlab Pipelines: ' + pipelineObjects?.project_name;

    const data = pipelineObjects.data.map((pipelineObject: PipelineObject) => {
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
            data={data}
        />
    );
};

export const PipelinesTable = ({}) => {
    const project_id = gitlabProjectId();
    const project_slug = gitlabProjectSlug();
    const gitlab_instance = gitlabInstance();

    const GitlabCIAPI = useApi(GitlabCIApiRef).build(gitlab_instance || '0');

    const { value, loading, error } = useAsync(async (): Promise<
        PipelineObject[]
    > => {
        const projectDetails: any = await GitlabCIAPI.getProjectDetails(
            project_slug
        );
        const projectId = project_id || projectDetails?.id;
        const gitlabObj = await GitlabCIAPI.getPipelineSummary(projectId);
        const data = gitlabObj?.getPipelinesData;
        const renderData: any = { data };

        renderData.project_name = await GitlabCIAPI.getProjectName(projectId);
        return renderData;
    }, []);

    if (loading) {
        return <Progress />;
    } else if (error) {
        return <Alert severity="error">{error.message}</Alert>;
    }

    return <DenseTable pipelineObjects={value || []} />;
};
