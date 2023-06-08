import { createApiRef } from '@backstage/core-plugin-api';
import {
    PeopleCardEntityData,
    MergeRequest,
    PipelineObject,
    IssueObject,
    ReleaseData,
    ProjectDetails,
    Languages,
} from '../components/types';

export type PipelineSummary = PipelineObject[];
export type ContributorsSummary = PeopleCardEntityData[];

export type MergeRequestsSummary = MergeRequest[];

export type MergeRequestsStatusSummary = MergeRequest[];

export type LanguagesSummary = Languages;

export type IssuesSummary = IssueObject[];

export type ReleasesSummary = ReleaseData[];

export const GitlabCIApiRef = createApiRef<GitlabCIBuilder>({
    id: 'plugin.gitlabci.service',
});

export type GitlabCIBuilder = {
    build(gitlabInstance: string): GitlabCIApi;
};

export type GitlabCIApi = {
    getPipelineSummary(
        projectID: string | number
    ): Promise<PipelineSummary | undefined>;
    getContributorsSummary(
        projectID: string | number
    ): Promise<ContributorsSummary | undefined>;
    getMergeRequestsSummary(
        projectID: string | number
    ): Promise<MergeRequestsSummary | undefined>;
    getMergeRequestsStatusSummary(
        projectID: string | number,
        count: number
    ): Promise<MergeRequestsStatusSummary | undefined>;
    getProjectName(projectID: string | number): Promise<string | undefined>;
    getLanguagesSummary(
        projectID: string | number
    ): Promise<LanguagesSummary | undefined>;
    getProjectDetails(projectSlug: string): Promise<ProjectDetails | undefined>;
    getIssuesSummary(
        projectID: string | number
    ): Promise<IssuesSummary | undefined>;
    getCodeOwners(
        projectID?: string | number,
        branch?: string,
        filePath?: string
    ): Promise<PeopleCardEntityData[]>;
    getReleasesSummary(
        projectID: string | number
    ): Promise<ReleasesSummary | undefined>;

    getContributorsLink(
        projectWebUrl: string | undefined,
        projectDefaultBranch: string | undefined
    ): string;
    getOwnersLink(
        projectWebUrl: string | undefined,
        projectDefaultBranch: string | undefined,
        codeOwnersPath: string
    ): string;

    getReadme(
        projectID?: string | number,
        branch?: string,
        filePath?: string
    ): Promise<string | undefined>;
};
