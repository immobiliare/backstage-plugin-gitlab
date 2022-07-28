import { Progress, Table, TableColumn } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import Alert from '@material-ui/lab/Alert';
import React from 'react';
import { useAsync } from 'react-use';
import { GitlabCIApiRef } from '../../../api';
import { gitlabAppData, gitlabAppSlug } from '../../gitlabAppData';
import { IssueObject } from '../../types';
import { getElapsedTime } from '../../utils';
import { AuthorColumn, IssueStateIndicator, IssueTitle } from './columns';

// export type IssueObject = {
//   id: string;
//   project_id: string;
//   title: string;
//   state: IssueState;
//   type: IssueType;
//   description: string;
//   created_at: string;
//   updated_at: string;
//   author: Author;
// };

export const DenseTable = ({
	issuesObjects,
	projectName,
}: {
	issuesObjects: IssueObject[];
	projectName: string | undefined;
}) => {
	const columns: TableColumn<IssueObject>[] = [
		{ title: 'Issue ID', field: 'id' },
		{ title: 'Title', render: IssueTitle },
		{ title: 'Author', render: AuthorColumn },
		{ title: 'Created At', field: 'created_at' },
		{ title: 'Issue Type', field: 'type' },
		{ title: 'Issue Status', render: IssueStateIndicator },
	];

	const title = 'Gitlab Issues: ' + projectName;

	const data = issuesObjects.map(issue => ({
		...issue,
		created_at: getElapsedTime(issue.created_at),
	}));

	return (
		<Table
			title={title}
			options={{ search: true, paging: true }}
			columns={columns}
			data={data}
		/>
	);
};

export const IssuesTable = ({}) => {
	const { project_id } = gitlabAppData();
	const { project_slug } = gitlabAppSlug();

	const GitlabCIAPI = useApi(GitlabCIApiRef);

	const { value, loading, error } = useAsync(async (): Promise<{
		data: IssueObject[];
		projectName: string;
	}> => {
		let projectDetails: any = await GitlabCIAPI.getProjectDetails(project_slug);
		let projectId = project_id ? project_id : projectDetails?.id;
		let projectName = await GitlabCIAPI.getProjectName(projectId);
		const gitlabIssuesObject = await GitlabCIAPI.getIssuesSummary(project_id);
		const data = gitlabIssuesObject?.getIssuesData;
		let renderData: any = { data, projectName };

		return renderData;
	}, []);

	if (loading) {
		return <Progress />;
	} else if (error) {
		return <Alert severity="error">{error.message}</Alert>;
	}

	return (
		<DenseTable
			issuesObjects={value?.data || []}
			projectName={value?.projectName}
		/>
	);
};
