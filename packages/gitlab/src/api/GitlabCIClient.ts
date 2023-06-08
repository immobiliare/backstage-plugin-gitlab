import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import {
    PeopleCardEntityData,
    MergeRequest,
    PipelineObject,
    FileOwnership,
    ReleaseData,
    ProjectDetails,
} from '../components/types';
import { parseCodeOwners } from '../components/utils';
import { IssueObject } from './../components/types';
import {
    ContributorsSummary,
    GitlabCIApi,
    IssuesSummary,
    LanguagesSummary,
    MergeRequestsStatusSummary,
    MergeRequestsSummary,
    PipelineSummary,
    ReleasesSummary,
} from './GitlabCIApi';

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
        query: { [key in string]: string }
    ): Promise<T | undefined> {
        const apiUrl = `${await this.discoveryApi.getBaseUrl('gitlab')}/${
            this.gitlabInstance
        }`;
        const token = (await this.identityApi.getCredentials()).token;
        const options = token
            ? {
                  headers: {
                      Authorization: `Bearer ${token}`,
                  },
              }
            : {};
        const response = await fetch(
            `${apiUrl}/${path}?${new URLSearchParams(query).toString()}`,
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

    async getPipelineSummary(
        projectID?: string | number
    ): Promise<PipelineSummary | undefined> {
        const [pipelineObjects, projectObj] = await Promise.all([
            this.callApi<PipelineObject[]>(
                'projects/' + projectID + '/pipelines',
                {}
            ),
            this.callApi<Record<string, string>>('projects/' + projectID, {}),
        ]);
        if (pipelineObjects && projectObj) {
            pipelineObjects.forEach((element: PipelineObject) => {
                element.project_name = projectObj.name;
            });
        }
        return pipelineObjects || undefined;
    }

    async getIssuesSummary(
        projectId: string | number
    ): Promise<IssuesSummary | undefined> {
        const [issuesObject, projectObj] = await Promise.all([
            this.callApi<IssueObject[]>(`projects/${projectId}/issues`, {}),
            this.callApi<Record<string, string>>('projects/' + projectId, {}),
        ]);
        if (issuesObject && projectObj) {
            issuesObject.forEach((element: IssueObject) => {
                element.project_name = projectObj.name;
            });
        }

        return issuesObject || undefined;
    }

    async getProjectName(
        projectID?: string | number
    ): Promise<string | undefined> {
        const projectObj = await this.callApi<Record<string, string>>(
            'projects/' + projectID,
            {}
        );
        return projectObj?.name;
    }

    //TODO: Merge with getUserDetail
    private async getUserProfilesData(
        contributorsData: PeopleCardEntityData[]
    ): Promise<PeopleCardEntityData[]> {
        for (let i = 0; contributorsData && i < contributorsData.length; i++) {
            const userProfile = await this.callApi<Record<string, string>[]>(
                'users',
                {
                    search: contributorsData[i].email || '',
                    without_project_bots: 'true',
                }
            );
            if (userProfile) {
                userProfile.forEach((userProfileElement) => {
                    if (userProfileElement.name == contributorsData[i].name) {
                        contributorsData[i].avatar_url =
                            userProfileElement?.avatar_url;
                    }
                });
            }
        }
        return contributorsData;
    }

    private async getUserDetail(
        username: string
    ): Promise<PeopleCardEntityData> {
        if (username.startsWith('@')) {
            username = username.slice(1);
        }
        const userDetail = (
            await this.callApi<PeopleCardEntityData[]>('users', {
                username,
            })
        )?.[0];

        if (!userDetail) throw new Error(`user ${username} does not exist`);

        return userDetail;
    }
    private async getGroupDetail(name: string): Promise<PeopleCardEntityData> {
        if (name.startsWith('@')) {
            name = name.slice(1);
        }
        const groupDetail = await this.callApi<PeopleCardEntityData>(
            `groups/${encodeURIComponent(name)}`,
            { with_projects: 'false' }
        );

        if (!groupDetail) throw new Error(`group ${name} does not exist`);

        return groupDetail;
    }

    async getMergeRequestsSummary(
        projectID?: string | number
    ): Promise<MergeRequestsSummary | undefined> {
        return this.callApi<MergeRequest[]>(
            'projects/' + projectID + '/merge_requests',
            {}
        );
    }

    async getMergeRequestsStatusSummary(
        projectID?: string | number,
        count?: number
    ): Promise<MergeRequestsStatusSummary | undefined> {
        return this.callApi<MergeRequest[]>(
            'projects/' + projectID + '/merge_requests',
            { per_page: (count ?? 20).toString(10) }
        );
    }

    async getContributorsSummary(
        projectID?: string | number
    ): Promise<ContributorsSummary | undefined> {
        const contributorsData = await this.callApi<PeopleCardEntityData[]>(
            'projects/' + projectID + '/repository/contributors',
            { sort: 'desc' }
        );

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
    ): Promise<ReleasesSummary | undefined> {
        return this.callApi<ReleaseData[]>(
            'projects/' + projectID + '/releases',
            {}
        );
    }

    async getProjectDetails(
        projectSlug: string
    ): Promise<ProjectDetails | undefined> {
        if (!projectSlug) return undefined;

        return this.callApi<ProjectDetails>(
            'projects/' + encodeURIComponent(projectSlug),
            {}
        );
    }

    async getCodeOwners(
        projectID?: string | number,
        branch = 'HEAD',
        filePath?: string
    ): Promise<PeopleCardEntityData[]> {
        filePath = filePath || this.codeOwnersPath;
        // Removing starting './'
        if (filePath.startsWith('./')) filePath = filePath.slice(2);

        const codeOwnersStr = await this.callApi<string>(
            `projects/${projectID}/repository/files/${encodeURI(filePath)}/raw`,
            { ref: branch }
        );

        if (!codeOwnersStr) {
            throw Error(`Code owners file not found`);
        }

        const codeOwners = parseCodeOwners(codeOwnersStr || '');

        const dataOwners: FileOwnership[] = codeOwners;
        const uniqueOwners = [
            ...new Set(dataOwners.flatMap((owner) => owner.owners)),
        ];
        const ownersSettledResult: PromiseSettledResult<PeopleCardEntityData>[] =
            await Promise.allSettled(
                uniqueOwners.map(async (owner) => {
                    try {
                        const ownerData: PeopleCardEntityData =
                            await this.getUserDetail(owner);
                        return ownerData;
                    } catch (error) {
                        const ownerData: PeopleCardEntityData =
                            await this.getGroupDetail(owner);
                        return ownerData;
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
        projectID?: string | number,
        branch = 'HEAD',
        filePath?: string
    ): Promise<string | undefined> {
        filePath = filePath || this.readmePath;
        // Removing starting './'
        if (filePath.startsWith('./')) filePath = filePath.slice(2);

        const readmeStr = await this.callApi<string>(
            `projects/${projectID}/repository/files/${encodeURI(filePath)}/raw`,
            { ref: branch }
        );

        if (!readmeStr) {
            throw Error(`README file not found`);
        }

        return readmeStr;
    }

    getContributorsLink(
        projectWebUrl: string | undefined,
        projectDefaultBranch: string | undefined
    ): string {
        return `${projectWebUrl}/-/graphs/${projectDefaultBranch}`;
    }

    getOwnersLink(
        projectWebUrl: string | undefined,
        projectDefaultBranch: string | undefined,
        codeOwnersPath: string
    ): string {
        return `${projectWebUrl}/-/blob/${projectDefaultBranch}/${
            codeOwnersPath || this.codeOwnersPath
        }`;
    }
}
