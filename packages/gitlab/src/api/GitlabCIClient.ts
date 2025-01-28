import {
    DiscoveryApi,
    IdentityApi,
    OAuthApi,
} from '@backstage/core-plugin-api';
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

export type APIOptions = {
    discoveryApi: DiscoveryApi;
    identityApi: IdentityApi;
    codeOwnersPath?: string;
    readmePath?: string;
    gitlabAuthApi: OAuthApi;
    useOAuth?: boolean;
    cacheTTL?: number;
    httpFetch?: typeof fetch;
};

export class GitlabCIClient implements GitlabCIApi {
    discoveryApi: DiscoveryApi;
    identityApi: IdentityApi;
    gitlabAuthApi: OAuthApi;
    useOAth: boolean;
    codeOwnersPath: string;
    gitlabInstance: string;
    readmePath: string;
    cacheTTL: number;
    httpFetch: typeof fetch;

    constructor({
        discoveryApi,
        identityApi,
        codeOwnersPath,
        readmePath,
        gitlabAuthApi,
        gitlabInstance,
        cacheTTL,
        useOAuth,
        httpFetch = fetch,
    }: APIOptions & { gitlabInstance: string }) {
        this.discoveryApi = discoveryApi;
        this.codeOwnersPath = codeOwnersPath || 'CODEOWNERS';
        this.readmePath = readmePath || 'README.md';
        this.gitlabInstance = gitlabInstance;
        this.identityApi = identityApi;
        this.gitlabAuthApi = gitlabAuthApi;
        this.useOAth = useOAuth ?? false;
        this.cacheTTL = cacheTTL ?? 5 * 60 * 1000; // 5 minutes cache TTL
        this.httpFetch = httpFetch;
    }

    static setupAPI({
        discoveryApi,
        identityApi,
        codeOwnersPath,
        readmePath,
        gitlabAuthApi,
        useOAuth,
        cacheTTL,
    }: APIOptions) {
        return {
            build: (gitlabInstance: string) =>
                new this({
                    discoveryApi,
                    identityApi,
                    codeOwnersPath,
                    readmePath,
                    gitlabInstance,
                    gitlabAuthApi,
                    useOAuth,
                    cacheTTL,
                }),
        };
    }

    private getCacheKey(path: string, query: object, APIkind: string): string {
        return `gitlab-cache:${APIkind}:${path}:${JSON.stringify(query)}`;
    }

    private getCachedData<T>(key: string): T | undefined {
        const cached = localStorage.getItem(key);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < this.cacheTTL) {
                return data as T;
            }
            localStorage.removeItem(key);
        }
        return undefined;
    }

    private setCachedData<T>(key: string, data: T): void {
        localStorage.setItem(
            key,
            JSON.stringify({
                data,
                timestamp: Date.now(),
            })
        );
    }

    protected async callApi<T>(
        path: string,
        query: { [key in string]: string },
        APIkind: 'rest' | 'graphql' = 'rest',
        options: RequestInit = {}
    ): Promise<T | undefined> {
        const cacheKey = this.getCacheKey(path, query, APIkind);
        const cachedData = this.getCachedData<T>(cacheKey);
        if (cachedData) {
            console.log('hit cache');
            return cachedData;
        }

        const apiUrl = `${await this.discoveryApi.getBaseUrl(
            'gitlab'
        )}/${APIkind}/${this.gitlabInstance}`;
        const token = (await this.identityApi.getCredentials()).token;

        const headers: Record<string, string> = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        if (this.useOAth) {
            const oauthToken = await this.gitlabAuthApi.getAccessToken([
                'read_api',
            ]);
            headers['gitlab-authorization'] = `Bearer ${oauthToken}`;
        }

        options = {
            ...options,
            headers: {
                ...options?.headers,
                ...headers,
            },
        };

        const response = await this.httpFetch(
            `${apiUrl}${path ? `/${path}` : ''}?${new URLSearchParams(
                query
            ).toString()}`,
            options
        );
        if (response.status === 200) {
            let data: T;
            if (
                response.headers
                    .get('content-type')
                    ?.includes('application/json')
            ) {
                data = (await response.json()) as T;
            } else {
                data = response.text() as unknown as T;
            }
            this.setCachedData(cacheKey, data);
            return data;
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
        const [projectObj, pipelineObjects] = await Promise.all([
            this.callApi<Record<string, string>>('projects/' + projectID, {}),
            this.callApi<PipelineSchema[]>(
                'projects/' + projectID + '/pipelines',
                {}
            ),
        ]);

        if (!projectObj) return undefined;

        if (pipelineObjects) {
            pipelineObjects.forEach((element) => {
                element.project_name = projectObj.name;
            });
            return pipelineObjects;
        }
        return undefined;
    }

    async getIssuesSummary(
        projectId: string | number
    ): Promise<IssueSchema[] | undefined> {
        const [projectObj, issuesObject] = await Promise.all([
            this.callApi<Record<string, string>>('projects/' + projectId, {}),
            this.callApi<IssueSchema[]>(`projects/${projectId}/issues`, {}),
        ]);

        if (!projectObj) return undefined;

        if (issuesObject) {
            issuesObject.forEach((element) => {
                element.project_name = projectObj.name;
            });
            return issuesObject;
        }

        return undefined;
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
        const uniqueEmails = [...new Set(contributorsData.map((c) => c.email))];
        const userProfiles = await Promise.all(
            uniqueEmails.map((email) =>
                this.callApi<UserSchema[]>('users', {
                    search: email,
                    without_project_bots: 'true',
                })
            )
        );

        const emailToUser = new Map<string, UserSchema>();
        userProfiles.forEach((profiles, idx) => {
            if (profiles) {
                const email = uniqueEmails[idx];
                const user = profiles.find((v) =>
                    contributorsData.some(
                        (c) => c.email === email && c.name === v.name
                    )
                );
                if (user) {
                    emailToUser.set(email, user);
                }
            }
        });

        return contributorsData.map((contributor) => {
            const user = emailToUser.get(contributor.email);
            return user ? { ...contributor, ...user } : contributor;
        });
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

        if (!contributorsData) return undefined;

        const updatedContributorsData = await this.getUserProfilesData(
            contributorsData
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

        const ownersMap = new Map<string, PeopleCardEntityData>();

        await Promise.all(
            uniqueOwners.map(async (owner) => {
                try {
                    const ownerData = await this.getUserDetail(owner);
                    ownersMap.set(owner, ownerData);
                } catch {
                    try {
                        const groupData = await this.getGroupDetail(owner);
                        ownersMap.set(owner, groupData);
                    } catch {
                        // Skip invalid owners
                    }
                }
            })
        );

        return Array.from(ownersMap.values());
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
