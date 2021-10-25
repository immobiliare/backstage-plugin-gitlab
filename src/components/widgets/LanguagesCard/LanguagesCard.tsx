import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import { InfoCard, Progress } from '@backstage/core-components';
import { GitlabCIApiRef } from '../../../api';
import { useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import { gitlabAppData, gitlabAppSlug } from '../../gitlabAppData';
import { Chip, Tooltip } from '@material-ui/core';
import { colors } from './colors';

const useStyles = makeStyles((theme) => ({
	infoCard: {
		marginBottom: theme.spacing(3),
		'& + .MuiAlert-root': {
			marginTop: theme.spacing(3),
		},
	},
	barContainer: {
		height: theme.spacing(2),
		marginBottom: theme.spacing(3),
		borderRadius: '4px',
		backgroundColor: 'transparent',
		overflow: 'hidden',
	},
	bar: {
		height: '100%',
		position: 'relative',
	},
	languageDot: {
		width: '10px',
		height: '10px',
		borderRadius: '50%',
		marginRight: theme.spacing(1),
		display: 'inline-block',
	},
	label: {
		color: 'inherit',
	},
}));

export type Language = {
	[key: string]: number;
};

export const LanguagesCard = ({}) => {
	const classes = useStyles();
	let barWidth = 0;
	let languageTitle = new String();
	const GitlabCIAPI = useApi(GitlabCIApiRef);
	const { project_id } = gitlabAppData();
	const { project_slug } = gitlabAppSlug();

	const { value, loading, error } = useAsync(async (): Promise<Language> => {
		let projectDetails: any = await GitlabCIAPI.getProjectDetails(project_slug);
		let projectId = project_id ? project_id : projectDetails?.id;
		const gitlabObj = await GitlabCIAPI.getLanguagesSummary(projectId);
		const data = gitlabObj?.getLanguagesData;
		return data;
	});

	if (loading) {
		return <Progress />;
	} else if (error) {
		return (
			<Alert severity='error' className={classes.infoCard}>
				{error.message}
			</Alert>
		);
	}

	return value ? (
		<InfoCard title='Languages'>
			<div className={classes.barContainer}>
				{Object.entries(value as Language).map((language, index: number) => {
					barWidth = barWidth + language[1];
					languageTitle = language[0] + ' ' + language[1] + '%';
					return (
						<Tooltip
							title={languageTitle}
							placement='bottom-end'
							key={language[0]}
						>
							<div
								className={classes.bar}
								key={language[0]}
								style={{
									marginTop: index === 0 ? '0' : `-16px`,
									zIndex: Object.keys(value).length - index,
									backgroundColor: colors[language[0]]?.color || '#333',
									width: `${barWidth}%`,
								}}
							/>
						</Tooltip>
					);
				})}
			</div>
			{Object.entries(value as Language).map((language) => (
				<Chip
					classes={{
						label: classes.label,
					}}
					label={
						<>
							<span
								className={classes.languageDot}
								style={{
									backgroundColor: colors[language[0]]?.color || '#333',
								}}
							/>
							<b>{language[0]}</b> - {language[1]}%
						</>
					}
					variant='outlined'
					key={language[0]}
				/>
			))}
		</InfoCard>
	) : (
		<InfoCard title='Languages' />
	);
};
