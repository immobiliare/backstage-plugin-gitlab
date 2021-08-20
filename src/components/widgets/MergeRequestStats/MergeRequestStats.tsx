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
        const gitlabObj = await GitlabCIAPI.getMergeRequestsSummary(project_id);
        const data = gitlabObj?.getMergeRequestsData;
        let renderData: any = { data }
        renderData.project_name = await GitlabCIAPI.getProjectName(project_id);
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

        return {
            avgTimeUntilMerge: `${
                ((mergeStat.avgTimeUntilMerge / 3600000) / mergeStat.mergedCount).toFixed(2)
            } hrs`,
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