import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import { PeopleCardEntityData } from '../components/types';
import { parseCodeOwners } from '../components/utils';
import {
    ContributorsSummary,
    GitlabCIApi,
    GitlabProjectCoverageResponse,
    GraphQLQuery,
    LanguagesSummary,
} from './GitlabCIApi';

import type {
    GroupSchema,
    IssueSchema,
    MergeRequestSchema,
    PipelineSchema,
    ProjectSchema,
    ReleaseSchema,
    RepositoryContributorSchema,
    UserSchema,
} from '@gitbeaker/rest';
import dayjs from 'dayjs';

export class GitlabCIClient implements GitlabCIApi {
    discoveryApi: DiscoveryApi;
    identityApi: IdentityApi;
    codeOwnersPath: string;
    gitlabInstance: string;
    readmePath: string;

    constructor({
        discoveryApi,
        identityApi,
        codeOwnersPath,
        readmePath,
        gitlabInstance,
    }: {
        discoveryApi: DiscoveryApi;
        identityApi: IdentityApi;
        codeOwnersPath?: string;
        readmePath?: string;
        gitlabInstance: string;
    }) {
        this.discoveryApi = discoveryApi;
        this.codeOwnersPath = codeOwnersPath || 'CODEOWNERS';
        this.readmePath = readmePath || 'README.md';
        this.gitlabInstance = gitlabInstance;
        this.identityApi = identityApi;
    }

    static setupAPI({
        discoveryApi,
        identityApi,
        codeOwnersPath,
        readmePath,
    }: {
        discoveryApi: DiscoveryApi;
        identityApi: IdentityApi;
        codeOwnersPath?: string;
        readmePath?: string;
    }) {
        return {
            build: (gitlabInstance: string) =>
                new this({
                    discoveryApi,
                    identityApi,
                    codeOwnersPath,
                    readmePath,
                    gitlabInstance,
                }),
        };
    }

    protected async callApi<T>(
        path: string,
        query: { [key in string]: string },
        APIkind: 'rest' | 'graphql' = 'rest',
        options: RequestInit = {}
    ): Promise<T | undefined> {
        const apiUrl = `${await this.discoveryApi.getBaseUrl(
            'gitlab'
        )}/${APIkind}/${this.gitlabInstance}`;
        const token = (await this.identityApi.getCredentials()).token;

        if (token) {
            options = {
                ...options,
                headers: {
                    ...options?.headers,
                    Authorization: `Bearer ${token}`,
                },
            };
        }

        const response = await fetch(
            `${apiUrl}${path ? `/${path}` : ''}?${new URLSearchParams(
                query
            ).toString()}`,
            options
        );
        if (response.status === 200) {
            if (
                response.headers
                    .get('content-type')
                    ?.includes('application/json')
            ) {
                return (await response.json()) as T;
            } else {
                return response.text() as unknown as T;
            }
        }
        return undefined;
    }

    protected callGraphQLApi<T>(query: GraphQLQuery): Promise<T | undefined> {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(query),
        };

        return this.callApi<T>('', {}, 'graphql', options);
    }

    async getPipelineSummary(
        projectID?: string | number
    ): Promise<PipelineSchema[] | undefined> {
        const [pipelineObjects, projectObj] = await Promise.all([
            this.callApi<PipelineSchema[]>(
                'projects/' + projectID + '/pipelines',
                {}
            ),
            this.callApi<Record<string, string>>('projects/' + projectID, {}),
        ]);
        if (pipelineObjects && projectObj) {
            pipelineObjects.forEach((element) => {
                element.project_name = projectObj.name;
            });
        }
        return pipelineObjects || undefined;
    }

    async getIssuesSummary(
        projectId: string | number
    ): Promise<IssueSchema[] | undefined> {
        const [issuesObject, projectObj] = await Promise.all([
            this.callApi<IssueSchema[]>(`projects/${projectId}/issues`, {}),
            this.callApi<Record<string, string>>('projects/' + projectId, {}),
        ]);
        if (issuesObject && projectObj) {
            issuesObject.forEach((element) => {
                element.project_name = projectObj.name;
            });
        }

        return issuesObject || undefined;
    }

    async getProjectName(
        projectID?: string | number
    ): Promise<string | undefined> {
        const projectObj = await this.callApi<ProjectSchema>(
            'projects/' + projectID,
            {}
        );
        return projectObj?.name;
    }

    //TODO: Merge with getUserDetail
    private async getUserProfilesData(
        contributorsData: RepositoryContributorSchema[]
    ): Promise<ContributorsSummary> {
        return Promise.all(
            contributorsData.map(async (contributor) => {
                const userProfile = await this.callApi<UserSchema[]>('users', {
                    search: contributor.email,
                    without_project_bots: 'true',
                });

                const user = userProfile?.find(
                    (v) => v.name === contributor.name
                );

                if (user) {
                    return {
                        ...contributor,
                        ...user,
                    };
                }
                return contributor;
            })
        );
    }

    private async getUserDetail(username: string): Promise<UserSchema> {
        if (username.startsWith('@')) {
            username = username.slice(1);
        }
        const userDetail = (
            await this.callApi<UserSchema[]>('users', {
                username,
            })
        )?.[0];

        if (!userDetail) throw new Error(`user ${username} does not exist`);

        return userDetail;
    }
    private async getGroupDetail(name: string): Promise<GroupSchema> {
        if (name.startsWith('@')) {
            name = name.slice(1);
        }
        const groupDetail = await this.callApi<GroupSchema>(
            `groups/${encodeURIComponent(name)}`,
            { with_projects: 'false' }
        );

        if (!groupDetail) throw new Error(`group ${name} does not exist`);

        return groupDetail;
    }

    async getMergeRequestsSummary(
        projectID?: string | number
    ): Promise<MergeRequestSchema[] | undefined> {
        return this.callApi<MergeRequestSchema[]>(
            'projects/' + projectID + '/merge_requests',
            {}
        );
    }

    async getMergeRequestsStatusSummary(
        projectID?: string | number,
        count?: number
    ): Promise<MergeRequestSchema[] | undefined> {
        return this.callApi<MergeRequestSchema[]>(
            'projects/' + projectID + '/merge_requests',
            { per_page: (count ?? 20).toString(10) }
        );
    }

    async getContributorsSummary(
        projectID?: string | number
    ): Promise<ContributorsSummary | undefined> {
        const contributorsData = await this.callApi<
            RepositoryContributorSchema[]
        >('projects/' + projectID + '/repository/contributors', {
            sort: 'desc',
        });

        const updatedContributorsData = await this.getUserProfilesData(
            contributorsData!
        );

        return updatedContributorsData;
    }

    async getLanguagesSummary(
        projectID?: string | number
    ): Promise<LanguagesSummary | undefined> {
        return this.callApi<Record<string, number>>(
            'projects/' + projectID + '/languages',
            {}
        );
    }

    async getReleasesSummary(
        projectID: string | number
    ): Promise<ReleaseSchema[] | undefined> {
        return this.callApi<ReleaseSchema[]>(
            'projects/' + projectID + '/releases',
            {}
        );
    }

    async getProjectDetails(
        projectSlug: string
    ): Promise<ProjectSchema | undefined> {
        if (!projectSlug) return undefined;

        return this.callApi<ProjectSchema>(
            'projects/' + encodeURIComponent(projectSlug),
            {}
        );
    }

    async getProjectCoverage(
        projectSlug: string,
        projectDefaultBranch: string
    ): Promise<GitlabProjectCoverageResponse | undefined> {
        if (!projectSlug) return undefined;

        return this.callGraphQLApi<GitlabProjectCoverageResponse>({
            variables: {
                projectSlug,
                projectDefaultBranch,
                updatedAfter: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
            },
            query: /* GraphQL */ `
                query getProjectCoverage(
                    $projectSlug: ID!
                    $updatedAfter: Time
                    $projectDefaultBranch: String
                ) {
                    project(fullPath: $projectSlug) {
                        pipelines(
                            ref: $projectDefaultBranch
                            updatedAfter: $updatedAfter
                        ) {
                            nodes {
                                coverage
                                createdAt
                            }
                        }
                    }
                }
            `,
        });
    }

    async getCodeOwners(
        projectID: string | number,
        branch = 'HEAD',
        filePath?: string
    ): Promise<PeopleCardEntityData[]> {
        filePath = filePath || this.codeOwnersPath;
        // Removing starting './'
        if (filePath.startsWith('./')) filePath = filePath.slice(2);

        const codeOwnersStr = await this.callApi<string>(
            `projects/${projectID}/repository/files/${encodeURIComponent(
                filePath
            )}/raw`,
            { ref: branch }
        );

        if (!codeOwnersStr) {
            throw Error(`Code owners file not found`);
        }

        const codeOwners = parseCodeOwners(codeOwnersStr);

        const uniqueOwners = [
            ...new Set(codeOwners.flatMap((owner) => owner.owners)),
        ];
        const ownersSettledResult: PromiseSettledResult<PeopleCardEntityData>[] =
            await Promise.allSettled(
                uniqueOwners.map(async (owner) => {
                    try {
                        const ownerData = await this.getUserDetail(owner);
                        return ownerData;
                    } catch (error) {
                        return this.getGroupDetail(owner);
                    }
                })
            );
        const owners = ownersSettledResult
            .filter((result) => result.status === 'fulfilled')
            .map(
                (result) =>
                    (result as PromiseFulfilledResult<PeopleCardEntityData>)
                        .value
            );
        return owners;
    }

    async getReadme(
        projectID: string | number,
        branch = 'HEAD',
        filePath?: string
    ): Promise<string | undefined> {
        filePath = filePath || this.readmePath;
        // Removing starting './'
        if (filePath.startsWith('./')) filePath = filePath.slice(2);

        const readmeStr = await this.callApi<string>(
            `projects/${projectID}/repository/files/${encodeURIComponent(
                filePath
            )}/raw`,
            { ref: branch }
        );

        if (!readmeStr) {
            throw Error(`README file not found`);
        }

        return readmeStr;
    }

    getContributorsLink(
        projectWebUrl: string,
        projectDefaultBranch: string
    ): string {
        return `${projectWebUrl}/-/graphs/${projectDefaultBranch}`;
    }

    getOwnersLink(
        projectWebUrl: string,
        projectDefaultBranch: string,
        codeOwnersPath?: string
    ): string {
        return `${projectWebUrl}/-/blob/${projectDefaultBranch}/${
            codeOwnersPath || this.codeOwnersPath
        }`;
    }
}
