import { Progress, Table, TableColumn } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import Alert from '@material-ui/lab/Alert';
import React from 'react';
import { useAsync } from 'react-use';
import { GitlabCIApiRef } from '../../../api';
import {
    gitlabInstance,
    gitlabProjectId,
    gitlabProjectSlug,
} from '../../gitlabAppData';
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

    const data = issuesObjects.map((issue) => ({
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
    const project_id = gitlabProjectId();
    const project_slug = gitlabProjectSlug();
    const gitlab_instance = gitlabInstance();

    const GitlabCIAPI = useApi(GitlabCIApiRef).build(gitlab_instance || '0');

    const { value, loading, error } = useAsync(async (): Promise<{
        data: IssueObject[];
        projectName: string;
    }> => {
        const projectDetails: any = await GitlabCIAPI.getProjectDetails(
            project_slug
        );
        const projectId = project_id || projectDetails?.id;
        const projectName = await GitlabCIAPI.getProjectName(projectId);
        const gitlabIssuesObject = await GitlabCIAPI.getIssuesSummary(
            projectId
        );
        const data = gitlabIssuesObject?.getIssuesData;
        const renderData: any = { data, projectName };

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
