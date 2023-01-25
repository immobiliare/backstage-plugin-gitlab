import { createApiRef } from '@backstage/core-plugin-api';
import {
    PeopleCardEntityData,
    MergeRequest,
    PipelineObject,
    IssueObject,
} from '../components/types';

export interface PipelineSummary {
    getPipelinesData: PipelineObject[];
}

export interface ContributorsSummary {
    getContributorsData: PeopleCardEntityData[];
}

export interface MergeRequestsSummary {
    getMergeRequestsData: MergeRequest[];
}

export interface MergeRequestsStatusSummary {
    getMergeRequestsStatusData: MergeRequest[];
}

export interface LanguagesSummary {
    getLanguagesData: any;
}

export interface IssuesSummary {
    getIssuesData: IssueObject[];
}

export const GitlabCIApiRef = createApiRef<GitlabCIBuilder>({
    id: 'plugin.gitlabci.service',
});

export type GitlabCIBuilder = {
    build(gitlabInstance: string): GitlabCIApi;
};

export type GitlabCIApi = {
    getPipelineSummary(projectID: string): Promise<PipelineSummary | undefined>;
    getContributorsSummary(
        projectID: string
    ): Promise<ContributorsSummary | undefined>;
    getMergeRequestsSummary(
        projectID: string
    ): Promise<MergeRequestsSummary | undefined>;
    getMergeRequestsStatusSummary(
        projectID: string,
        count: number
    ): Promise<MergeRequestsStatusSummary | undefined>;
    getProjectName(projectID: string): Promise<string | undefined>;
    getLanguagesSummary(
        projectID: string
    ): Promise<LanguagesSummary | undefined>;
    retryPipelineBuild(
        projectID: string,
        pipelineID: string
    ): Promise<Record<string, unknown> | undefined>;
    getProjectDetails(
        projectSlug: string
    ): Promise<Record<string, unknown> | undefined>;
    getIssuesSummary(projectID: string): Promise<IssuesSummary | undefined>;
    getCodeOwners(
        projectID?: string,
        branch?: string,
        filePath?: string
    ): Promise<PeopleCardEntityData[]>;

    getContributorsLink(
        projectWebUrl: string | undefined,
        projectDefaultBranch: string | undefined
    ): string;
    getOwnersLink(
        projectWebUrl: string | undefined,
        projectDefaultBranch: string | undefined,
        codeOwnersPath: string
    ): string;
};
