import type { TableColumn } from '@backstage/core-components';
import type { TranslationFunction } from '@backstage/core-plugin-api/alpha';
import type { MergeRequestSchema } from '@gitbeaker/rest';
import { Box, Typography } from '@material-ui/core';
import Link from '@material-ui/core/Link';
import React from 'react';
import type { gitlabTranslationRef } from '../../../translation';

import { getStatusIconType } from './Icons';

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
