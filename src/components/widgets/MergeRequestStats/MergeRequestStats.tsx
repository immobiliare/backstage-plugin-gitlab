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
import { gitlabAppData, gitlabAppSlug } from '../../gitlabAppData';
import { GitlabCIApiRef } from '../../../api';
import { useApi } from '@backstage/core-plugin-api';
import {
	InfoCard,
	StructuredMetadataTable,
	InfoCardVariants,
} from '@backstage/core-components';
import { MergeRequest } from '../../types';
import moment from 'moment';
import { Entity } from '@backstage/catalog-model';

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

export type MergeStats = {
	avgTimeUntilMerge: string;
	mergedToTotalRatio: string;
};

type Props = {
	entity?: Entity;
	variant?: InfoCardVariants;
};

const MergeRequestStats = (props: Props) => {
	const [count, setCount] = useState<number>(20);
	const classes = useStyles();
	const { project_id } = gitlabAppData();
	const { project_slug } = gitlabAppSlug();

	const GitlabCIAPI = useApi(GitlabCIApiRef);
	const mergeStat: MergeRequestStatsCount = {
		avgTimeUntilMerge: 0,
		closedCount: 0,
		mergedCount: 0,
	};
	const { value, loading, error } = useAsync(async (): Promise<MergeStats> => {
		let projectDetails: any = await GitlabCIAPI.getProjectDetails(project_slug);
		let projectId = project_id ? project_id : projectDetails?.id;
		const gitlabObj = await GitlabCIAPI.getMergeRequestsStatusSummary(
			projectId,
			count,
		);
		const data = gitlabObj?.getMergeRequestsStatusData;
		let renderData: any = { data };
		renderData.project_name = await GitlabCIAPI.getProjectName(projectId);
		if (renderData.data) {
			renderData.data.forEach((element: MergeRequest) => {
				mergeStat.avgTimeUntilMerge += element.merged_at
					? new Date(element.merged_at).getTime() -
					  new Date(element.created_at).getTime()
					: 0;
				mergeStat.mergedCount += element.merged_at ? 1 : 0;
				mergeStat.closedCount += element.closed_at ? 1 : 0;
			});
		}

		if (mergeStat.mergedCount === 0)
			return {
				avgTimeUntilMerge: 'Never',
				mergedToTotalRatio: '0%',
			};

		const avgTimeUntilMergeDiff = moment.duration(
			mergeStat.avgTimeUntilMerge / mergeStat.mergedCount,
		);

		const avgTimeUntilMerge = avgTimeUntilMergeDiff.humanize();

		/*if(mergeStat.closedCount === 0) return {
            avgTimeUntilMerge: avgTimeUntilMerge,
            mergedToClosedRatio: '0%',
        }*/
		return {
			avgTimeUntilMerge: avgTimeUntilMerge,
			mergedToTotalRatio: `${Math.round(
				(mergeStat.mergedCount / count) * 100,
			)}%`,
		};
	}, [count]);

	if (loading) {
		return <Progress />;
	} else if (error) {
		return <Alert severity='error'>{error.message}</Alert>;
	}

	return value ? (
		<InfoCard
			title='Merge requests statistics'
			className={classes.infoCard}
			variant={props.variant}
		>
			{/*   <Box position="relative">
                    <div> <b>Average time of MR until merge :</b> {value.avgTimeUntilMerge}</div>
                    <div> <b>Merged to closed ratio :</b> {value.mergedToClosedRatio}</div>
                    <>Number of MRs : 20</>
                </Box>*/}

			<Box position='relative'>
				<StructuredMetadataTable metadata={value} />
				<Box display='flex' justifyContent='flex-end'>
					<FormControl>
						<Select
							value={count}
							onChange={(event) => setCount(Number(event.target.value))}
						>
							<MenuItem value={10}>10</MenuItem>
							<MenuItem value={20}>20</MenuItem>
							<MenuItem value={50}>50</MenuItem>
							<MenuItem value={100}>100</MenuItem>
						</Select>
						<FormHelperText>Number of MRs</FormHelperText>
					</FormControl>
				</Box>
			</Box>
		</InfoCard>
	) : (
		<InfoCard title='Merge Request Statistics' />
	);
};

export default MergeRequestStats;
