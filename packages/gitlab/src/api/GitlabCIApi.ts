import { createApiRef } from '@backstage/core-plugin-api';
import { PeopleCardEntityData, Languages } from '../components/types';
import type {
    IssueSchema,
    MergeRequestSchema,
    PipelineSchema,
    ProjectSchema,
    ReleaseSchema,
    RepositoryContributorSchema,
    UserSchema,
} from '@gitbeaker/rest';

export type ContributorsSummary = (RepositoryContributorSchema &
    Partial<UserSchema>)[];

export type LanguagesSummary = Languages;

export const GitlabCIApiRef = createApiRef<GitlabCIBuilder>({
    id: 'plugin.gitlabci.service',
});

export type GitlabCIBuilder = {
    build(gitlabInstance: string): GitlabCIApi;
};

export type GraphQLQuery = {
    variables: Record<string, string>;
    query: string;
};

export type GitlabProjectCoverageResponse = {
    data: {
        project: {
            name: string;
            webUrl: string;
            pipelines: {
                nodes: {
                    coverage: number;
                    createdAt: string;
                }[];
            };
        };
    };
};

export type GitlabCIApi = {
    getPipelineSummary(
        projectID: string | number
    ): Promise<PipelineSchema[] | undefined>;
    getContributorsSummary(
        projectID: string | number
    ): Promise<ContributorsSummary | undefined>;
    getMergeRequestsSummary(
        projectID: string | number
    ): Promise<MergeRequestSchema[] | undefined>;
    getMergeRequestsStatusSummary(
        projectID: string | number,
        count: number
    ): Promise<MergeRequestSchema[] | undefined>;
    getProjectName(projectID: string | number): Promise<string | undefined>;
    getLanguagesSummary(
        projectID: string | number
    ): Promise<LanguagesSummary | undefined>;
    getProjectDetails(projectSlug: string): Promise<ProjectSchema | undefined>;
    getProjectCoverage(
        projectSlug: string
    ): Promise<GitlabProjectCoverageResponse | undefined>;
    getIssuesSummary(
        projectID: string | number
    ): Promise<IssueSchema[] | undefined>;
    getCodeOwners(
        projectID: string | number,
        branch?: string,
        filePath?: string
    ): Promise<PeopleCardEntityData[]>;
    getReleasesSummary(
        projectID: string | number
    ): Promise<ReleaseSchema[] | undefined>;
    getContributorsLink(
        projectWebUrl: string,
        projectDefaultBranch: string
    ): string;
    getOwnersLink(
        projectWebUrl: string,
        projectDefaultBranch: string,
        codeOwnersPath?: string
    ): string;
    getReadme(
        projectID: string | number,
        branch?: string,
        filePath?: string
    ): Promise<string | undefined>;
};
