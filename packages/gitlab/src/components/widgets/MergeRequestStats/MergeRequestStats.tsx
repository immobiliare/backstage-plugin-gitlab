import React, { useState } from 'react';
import { Progress } from '@backstage/core-components';
import {
    Box,
    makeStyles,
    FormControl,
    FormHelperText,
    Select,
    MenuItem,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useAsync } from 'react-use';
import {
    gitlabInstance,
    gitlabProjectId,
    gitlabProjectSlug,
} from '../../gitlabAppData';
import { GitlabCIApiRef } from '../../../api';
import { useApi } from '@backstage/core-plugin-api';
import {
    InfoCard,
    StructuredMetadataTable,
    InfoCardVariants,
} from '@backstage/core-components';
import dayjs from 'dayjs';
import { Entity } from '@backstage/catalog-model';
import { MergeRequestSchema } from '@gitbeaker/rest';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { gitlabTranslationRef } from '../../../translation';

const useStyles = makeStyles((theme) => ({
    infoCard: {
        marginBottom: theme.spacing(3),
        '& + .MuiAlert-root': {
            marginTop: theme.spacing(3),
        },
        '& .MuiCardContent-root': {
            padding: theme.spacing(2, 1, 2, 2),
        },
        '& td': {
            whiteSpace: 'normal',
        },
    },
}));

export type MergeRequestStatsCount = {
    avgTimeUntilMerge: number;
    closedCount: number;
    mergedCount: number;
};

type Props = {
    entity?: Entity;
    variant?: InfoCardVariants;
};

function evalStats(mergeRequestStatusData: MergeRequestSchema[]) {
    let sumOfDiff = 0;
    let closedCount = 0;
    let mergedCount = 0;

    mergeRequestStatusData?.forEach((element) => {
        sumOfDiff += element.merged_at
            ? new Date(element.merged_at).getTime() -
              new Date(element.created_at).getTime()
            : 0;
        mergedCount += element.merged_at ? 1 : 0;
        closedCount += element.closed_at ? 1 : 0;
    });

    const avgTimeUntilMergeDiff = dayjs.duration(sumOfDiff / mergedCount);

    return {
        avgTimeUntilMerge: avgTimeUntilMergeDiff,
        mergedCount,
        closedCount,
    };
}

const MergeRequestStats = (props: Props) => {
    const [count, setCount] = useState<number>(20);
    const classes = useStyles();
    const project_id = gitlabProjectId();
    const project_slug = gitlabProjectSlug();
    const gitlab_instance = gitlabInstance();
    const { t } = useTranslationRef(gitlabTranslationRef);

    const GitlabCIAPI = useApi(GitlabCIApiRef).build(
        gitlab_instance || 'gitlab.com'
    );

    const { value, loading, error } = useAsync(async () => {
        const projectDetails = await GitlabCIAPI.getProjectDetails(
            project_slug || project_id
        );
        if (!projectDetails)
            throw new Error('wrong project_slug or project_id');

        const mergeRequestStatusData =
            await GitlabCIAPI.getMergeRequestsStatusSummary(
                projectDetails.id,
                count
            );

        if (!mergeRequestStatusData)
            throw new Error('getMergeRequestsStatusSummary error');

        const stats = evalStats(mergeRequestStatusData);

        if (stats.mergedCount === 0)
            return {
                avgTimeUntilMerge: 'Never',
                mergedToTotalRatio: '0%',
            };

        return {
            avgTimeUntilMerge: stats.avgTimeUntilMerge.humanize(),
            mergedToTotalRatio: `${Math.round(
                (stats.mergedCount / count) * 100
            )}%`,
        };
    }, [count]);

    if (loading) {
        return <Progress />;
    } else if (error) {
        return <Alert severity="error">{error.message}</Alert>;
    }

    return value ? (
        <InfoCard
            title={t('mergeRequestStats.title')}
            className={classes.infoCard}
            variant={props.variant}
        >
            {/*   <Box position="relative">
                    <div> <b>Average time of MR until merge :</b> {value.avgTimeUntilMerge}</div>
                    <div> <b>Merged to closed ratio :</b> {value.mergedToClosedRatio}</div>
                    <>Number of MRs : 20</>
                </Box>*/}

            <Box position="relative">
                <StructuredMetadataTable
                    metadata={value}
                    options={{
                        titleFormat: (key) =>
                            t(
                                `mergeRequestStats.${key}` as
                                    | 'mergeRequestStats.avgTimeUntilMerge'
                                    | 'mergeRequestStats.mergedToTotalRatio'
                            ),
                    }}
                />
                <Box display="flex" justifyContent="flex-end">
                    <FormControl>
                        <Select
                            value={count}
                            onChange={(event) =>
                                setCount(Number(event.target.value))
                            }
                        >
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={20}>20</MenuItem>
                            <MenuItem value={50}>50</MenuItem>
                            <MenuItem value={100}>100</MenuItem>
                        </Select>
                        <FormHelperText>
                            {t('mergeRequestStats.helperText')}
                        </FormHelperText>
                    </FormControl>
                </Box>
            </Box>
        </InfoCard>
    ) : (
        <InfoCard
            title={t('mergeRequestStats.title')}
            variant={props.variant}
        />
    );
};

export default MergeRequestStats;
