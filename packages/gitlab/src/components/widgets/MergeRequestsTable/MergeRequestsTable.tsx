import React, { useState } from 'react';
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
import { getElapsedTime } from '../../utils';
import { createTitleColumn } from './columns';
import { MenuItem, Select, Box, Typography } from '@material-ui/core';
import type { MergeRequestSchema } from '@gitbeaker/rest';

type MergeRequestDenseTableProps = {
    data: MergeRequestSchema[];
    projectName: string;
    filterState: string;
    onFilterChange: (value: string) => void;
};

export const MergeRequestDenseTable = ({
    data,
    projectName,
    filterState,
    onFilterChange,
}: MergeRequestDenseTableProps) => {
    const columns: TableColumn[] = [
        createTitleColumn(),
        { title: 'Creator', field: 'author' },
        { title: 'Created At', field: 'created_date' },

    ];

    const title = (
        <Box display="flex" justifyContent="space-between" alignItems="center">
            {/* Dropdown for selecting MR state */}
            <Select
                value={filterState}
                onChange={(event) => onFilterChange(event.target.value)}
                style={{ marginRight: 16 }}
            >
                <MenuItem value="opened">Opened</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="merged">Merged</MenuItem>
            </Select>
            <Typography variant="h6">Merge Requests</Typography>
        </Box>
    );


    const filteredData = data.filter(
        (mergeRequest) => mergeRequest.state === filterState
    );

    const mappedData = filteredData.map((mergeRequest) => {

        const author = mergeRequest.author ? mergeRequest.author.username : 'N/A';


        return {
            id: mergeRequest.id,
            state: mergeRequest.state,
            author,
            title: mergeRequest.title,
            web_url: mergeRequest.web_url,
            created_date: getElapsedTime(mergeRequest.created_at),
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

    const [filterState, setFilterState] = useState('opened');

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

        const summary = await GitlabCIAPI.getMergeRequestsSummary(
            projectDetails.id
        );

        if (!summary) throw new Error('Merge request summary is undefined!');

        return { data: summary, projectName: projectDetails.name };
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

    return (
        <MergeRequestDenseTable
            data={value.data}
            projectName={value.projectName}
            filterState={filterState}
            onFilterChange={setFilterState}
        />
    );
};
