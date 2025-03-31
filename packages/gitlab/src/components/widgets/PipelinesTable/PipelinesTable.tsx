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
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { gitlabTranslationRef } from '../../../translation';

export type PipelineDenseTableProps = {
    projectName: string;
    summary: PipelineSchema[];
};

export const PipelineDenseTable = ({
    projectName,
    summary,
}: PipelineDenseTableProps) => {
    const { t } = useTranslationRef(gitlabTranslationRef);
    const columns: TableColumn[] = [
        { title: t('pipelinesTable.columnsTitle.pipelineID'), field: 'id' },
        createStatusColumn(t),
        { title: t('pipelinesTable.columnsTitle.branch'), field: 'ref' },
        createWebURLColumn(t),
        {
            title: t('pipelinesTable.columnsTitle.createdAt'),
            field: 'created_date',
        },
        { title: t('pipelinesTable.columnsTitle.duration'), field: 'duration' },
    ];
    const title = t('pipelinesTable.title', { projectName });

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

        if (!summary) throw new Error('Merge request summary is undefined!');
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
