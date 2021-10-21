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
		ContributorData[]
	> => {
		const projectDetails = await GitlabCIAPI.getProjectDetails(project_slug);
		let projectId = project_id ? project_id : projectDetails?.id;
		const gitlabObj = await GitlabCIAPI.getContributorsSummary(projectId);
		const data = gitlabObj?.getContributorsData;
		return data!;
	}, []);

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
		<InfoCard title='Contributors'>
			<ContributorsList contributors={value || []} />
		</InfoCard>
	);
};
