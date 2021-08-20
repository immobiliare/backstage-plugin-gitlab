import React from 'react';
import { Progress } from '@backstage/core-components';
import { Box, makeStyles } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useAsync } from 'react-use';
import { gitlabAppData } from '../../gitlabAppData';
import { GitlabCIApiRef } from '../../../api';
import { useApi } from '@backstage/core-plugin-api';
import { InfoCard} from '@backstage/core-components';
import {MergeRequest} from "../../types";
import moment from 'moment';

const useStyles = makeStyles(theme => ({
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

export type MergeStats = {
    avgTimeUntilMerge: string;
    mergedToClosedRatio: string;
};


export const MergeRequestStats = ({}) => {
    const classes = useStyles();
    const { project_id } = gitlabAppData();
    const GitlabCIAPI = useApi(GitlabCIApiRef);
    const mergeStat: MergeRequestStatsCount = {avgTimeUntilMerge:0, closedCount:0, mergedCount:0};
    const { value, loading, error } = useAsync(async (): Promise<MergeStats> => {
        const gitlabObj = await GitlabCIAPI.getMergeRequestsStatusSummary(project_id, 5);
        const data = gitlabObj?.getMergeRequestsStatusData;
        let renderData: any = { data }
        renderData.project_name = await GitlabCIAPI.getProjectName(project_id);
        console.log(renderData.data)
        if(renderData.data){
            renderData.data.forEach((element : MergeRequest) => {
                mergeStat.avgTimeUntilMerge += element.merged_at
                        ? new Date(element.merged_at).getTime() -
                        new Date(element.created_at).getTime()
                        : 0;
                mergeStat.mergedCount += element.merged_at ? 1 : 0;
                mergeStat.closedCount += element.closed_at ? 1 : 0;
            })
        }

        if(mergeStat.mergedCount === 0) return {
            avgTimeUntilMerge: 'Never',
            mergedToClosedRatio: '0%',
        }

        const avgTimeUntilMergeDiff = moment.duration(
            mergeStat.avgTimeUntilMerge / mergeStat.mergedCount,
        );

        const avgTimeUntilMerge = avgTimeUntilMergeDiff.humanize();

        if(mergeStat.closedCount === 0) return {
            avgTimeUntilMerge: avgTimeUntilMerge,
            mergedToClosedRatio: '0%',
        }
        return {
            avgTimeUntilMerge: avgTimeUntilMerge,
            mergedToClosedRatio: `${Math.round(
                (mergeStat.mergedCount / mergeStat.closedCount) * 100,
            )}%`,
        }
    });

    if (loading) {
        return <Progress />;
    } else if (error) {
        return <Alert severity="error">{error.message}</Alert>;
    }


    return value ? (
        <InfoCard
            title="Merge requests statistics" className={classes.infoCard} >
                <Box position="relative">
                    <div> <b>Average time of MR until merge :</b> {value.avgTimeUntilMerge}</div>
                    <div> <b>Merged to closed ratio :</b> {value.mergedToClosedRatio}</div>
                    <>Number of MRs : 20</>
                </Box>
        </InfoCard>
    ) : (
        <InfoCard title="Merge Request Statistics" />
    );
};