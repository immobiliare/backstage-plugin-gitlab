import React from 'react';
import { Box, Typography, Link } from '@material-ui/core';
import {
    StatusPending,
    StatusRunning,
    StatusOK,
    StatusAborted,
    StatusError,
} from '@backstage/core-components';
import { TableColumn } from '@backstage/core-components';
import type { PipelineSchema } from '@gitbeaker/rest';
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';
import { gitlabTranslationRef } from '../../../translation';

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

export function createStatusColumn(
    t: TranslationFunction<typeof gitlabTranslationRef.T>
): TableColumn<Record<string, unknown>> {
    return {
        title: t('pipelinesTable.columnsTitle.status'),
        render: (row: Partial<PipelineSchema>) => (
            <Box display="flex" alignItems="center">
                <GitlabCIStateIndicator state={row.status} />
                <Typography variant="caption">{row.status}</Typography>
            </Box>
        ),
    };
}

export function createWebURLColumn(
    t: TranslationFunction<typeof gitlabTranslationRef.T>
): TableColumn<Record<string, unknown>> {
    return {
        title: t('pipelinesTable.columnsTitle.webURL'),
        render: (row: Partial<PipelineSchema>) => (
            <Link
                href={`${row.web_url}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                {row.web_url}
            </Link>
        ),
    };
}
