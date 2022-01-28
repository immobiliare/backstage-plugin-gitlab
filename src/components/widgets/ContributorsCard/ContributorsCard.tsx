import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import { InfoCard, Progress } from '@backstage/core-components';
import { GitlabCIApiRef } from '../../../api';
import { useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import { gitlabAppData, gitlabAppSlug } from '../../gitlabAppData';
import { ContributorsList } from './components/ContributorsList';
import { ContributorData } from '../../types';

const useStyles = makeStyles((theme) => ({
	infoCard: {
		marginBottom: theme.spacing(3),
		'& + .MuiAlert-root': {
			marginTop: theme.spacing(3),
		},
	},
}));

export const ContributorsCard = ({}) => {
	const classes = useStyles();
	const GitlabCIAPI = useApi(GitlabCIApiRef);
	const { project_id } = gitlabAppData();
	const { project_slug } = gitlabAppSlug();
	/* TODO: to change the below logic to get contributors data*/
	const { value, loading, error } = useAsync(async (): Promise<
		ContributorData
	> => {
		let projectDetails: any = await GitlabCIAPI.getProjectDetails(project_slug != '' ? project_slug : project_id);
		let projectId = project_id ? project_id : projectDetails?.id;
		const gitlabObj = await GitlabCIAPI.getContributorsSummary(projectId);
		const data = gitlabObj?.getContributorsData;
		let renderData: any = { data };
		renderData.project_web_url = projectDetails?.web_url;
		renderData.project_default_branch = projectDetails?.default_branch;
		return renderData!;
	}, []);

	const project_web_url = value?.project_web_url; 
	const project_default_branch = value?.project_default_branch; 
	
	if (loading) {
		return <Progress />;
	} else if (error) {
		return (
			<Alert severity='error' className={classes.infoCard}>
				{error.message}
			</Alert>
		);
	}
	return (
		<InfoCard title='Contributors'
		deepLink={{
			link: `${project_web_url}/-/graphs/${project_default_branch}`,
			title: 'People',
			onClick: e => {
			  e.preventDefault();
			  window.open(`${project_web_url}/-/graphs/${project_default_branch}`);
			},
		  }} className={classes.infoCard}>
			<ContributorsList contributorsObj={value || { data: [] }} />
		</InfoCard>
	);
};