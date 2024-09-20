import React from 'react';
import { Box, Link } from '@material-ui/core';
import {
    StatusPending,
    StatusRunning,
    StatusOK,
    StatusAborted,
    StatusError,
} from '@backstage/core-components';
import { TableColumn } from '@backstage/core-components';
import type { PipelineSchema } from '@gitbeaker/rest';


export const GitlabCIStateIndicator = ({
    state,
}: {
    state: string | undefined;
}) => {
    switch (state) {
        case 'pending':
            return <StatusPending />;
        case 'in_progress':
            return <StatusRunning />;
        case 'success':
            return <StatusOK />;
        case 'ERROR':
        case 'failed':
            return <StatusError />;
        default:
            return <StatusAborted />;
    }
};


export function createStatusColumn(): TableColumn<Record<string, unknown>> {
    return {
        title: 'Status',
        render: (row: Partial<PipelineSchema>) => (
            <Box display="flex" alignItems="center">
                <GitlabCIStateIndicator state={row.status} />
            </Box>
        ),
    };
}


export function createPipelineIDColumn(): TableColumn<Record<string, unknown>> {
    return {
        title: 'Pipeline_ID',
        render: (row: Partial<PipelineSchema>) => (
            <Link
                href={row.web_url}
                target="_blank"
                rel="noopener noreferrer"
            >
                {row.id}
            </Link>
        ),
    };
}
