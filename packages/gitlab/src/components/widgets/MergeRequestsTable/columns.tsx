import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { TableColumn } from '@backstage/core-components';
import type { MergeRequestSchema } from '@gitbeaker/rest';
import { getStatusIconType } from './Icons';
import Link from '@material-ui/core/Link';
import { gitlabTranslationRef } from '../../../translation';
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';

export function createTitleColumn(
    t: TranslationFunction<typeof gitlabTranslationRef.T>
): TableColumn<Record<string, unknown>> {
    return {
        title: t('mergeRequestsTable.columnsTitle.title'),
        field: 'title',
        highlight: true,
        render: (row: Partial<MergeRequestSchema>) => (
            <Typography variant="body2" noWrap>
                {getStatusIconType(row as MergeRequestSchema)}
                <Box ml={1} component="span">
                    <Link href={row.web_url} target="_blank">
                        {row.title}
                    </Link>
                </Box>
            </Typography>
        ),
    };
}
