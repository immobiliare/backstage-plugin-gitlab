import React, { useMemo } from 'react';
import { Table, TableColumn, Progress } from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';
import { useAsync } from 'react-use';
import {
    gitlabInstance,
    gitlabPipelineRelevantRefs,
    gitlabProjectId,
    gitlabProjectSlug,
} from '../../gitlabAppData';
import { GitlabCIApiRef } from '../../../api';
import { useApi } from '@backstage/core-plugin-api';
import { createStatusColumn, createWebURLColumn } from './columns';
import {
    convertWildcardFilterArrayToFilterFunction,
    getDuration,
    getElapsedTime,
} from '../../utils';
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

    const data = useMemo(
        () =>
            summary.map((pipelineObject) => {
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
            }),
        [summary]
    );

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
    const gitlab_relevant_refs = gitlabPipelineRelevantRefs();

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

        if (!summary) throw new Error('Merge request summary is undefined!');

        const relevantPipelines = gitlab_relevant_refs
            ? summary.filter(({ ref }) =>
                  convertWildcardFilterArrayToFilterFunction(
                      ref,
                      gitlab_relevant_refs
                  )
              )
            : summary;

        return { summary: relevantPipelines, projectName: projectDetails.name };
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
