import { DiscoveryApi } from '@backstage/core-plugin-api';
import {
    PeopleCardEntityData,
    MergeRequest,
    PipelineObject,
    FileOwnership,
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
} from './GitlabCIApi';

export class GitlabCIClient implements GitlabCIApi {
    discoveryApi: DiscoveryApi;
    codeOwnersPath: string;
    gitlabInstance: string;

    constructor({
        discoveryApi,
        codeOwnersPath,
        gitlabInstance,
    }: {
        discoveryApi: DiscoveryApi;
        codeOwnersPath?: string;
        gitlabInstance: string;
    }) {
        this.discoveryApi = discoveryApi;
        this.codeOwnersPath = codeOwnersPath || 'CODEOWNERS';
        this.gitlabInstance = gitlabInstance;
    }

    static setupAPI({
        discoveryApi,
        codeOwnersPath,
    }: {
        discoveryApi: DiscoveryApi;
        codeOwnersPath?: string;
    }) {
        return {
            build: (gitlabInstance: string) =>
                new this({
                    discoveryApi,
                    codeOwnersPath,
                    gitlabInstance,
                }),
        };
    }

    protected async callApi<T>(
        path: string,
        query: { [key in string]: any }
    ): Promise<T | null> {
        const apiUrl = `${await this.discoveryApi.getBaseUrl('gitlab')}/${
            this.gitlabInstance
        }`;
        const response = await fetch(
            `${apiUrl}/${path}?${new URLSearchParams(query).toString()}`
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
        return null;
    }

    async getPipelineSummary(
        projectID?: string
    ): Promise<PipelineSummary | undefined> {
        const pipelineObjects = await this.callApi<PipelineObject[]>(
            'projects/' + projectID + '/pipelines',
            {}
        );
        const projectObj: any = await this.callApi<Record<string, unknown>>(
            'projects/' + projectID,
            {}
        );
        if (pipelineObjects) {
            pipelineObjects.forEach((element: PipelineObject) => {
                element.project_name = projectObj?.name;
            });
        }
        return {
            getPipelinesData: pipelineObjects!,
        };
    }

    async getIssuesSummary(
        projectId: string
    ): Promise<IssuesSummary | undefined> {
        const issuesObject = await this.callApi<IssueObject[]>(
            `projects/${projectId}/issues`,
            {}
        );

        const projectObj: any = await this.callApi<Record<string, unknown>>(
            'projects/' + projectId,
            {}
        );
        if (issuesObject) {
            issuesObject.forEach((element: IssueObject) => {
                element.project_name = projectObj?.name;
            });
        }

        return {
            getIssuesData: issuesObject!,
        };
    }

    async getProjectName(projectID?: string): Promise<string | undefined> {
        const projectObj: any = await this.callApi<Record<string, unknown>>(
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
            const userProfile: any = await this.callApi<
                Record<string, unknown>[]
            >('users', {
                search: contributorsData[i].email,
            });
            if (userProfile) {
                userProfile.forEach(
                    (userProfileElement: PeopleCardEntityData) => {
                        if (
                            userProfileElement.name == contributorsData[i].name
                        ) {
                            contributorsData[i].avatar_url =
                                userProfileElement?.avatar_url;
                        }
                    }
                );
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
            await this.callApi<PeopleCardEntityData[]>('users', { username })
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
        projectID?: string
    ): Promise<MergeRequestsSummary | undefined> {
        const mergeRquestsList = await this.callApi<MergeRequest[]>(
            'projects/' + projectID + '/merge_requests',
            {}
        );
        return {
            getMergeRequestsData: mergeRquestsList!,
        };
    }

    async getMergeRequestsStatusSummary(
        projectID?: string,
        count?: number
    ): Promise<MergeRequestsStatusSummary | undefined> {
        const mergeRequestsList = await this.callApi<MergeRequest[]>(
            'projects/' + projectID + '/merge_requests',
            { per_page: count }
        );
        return {
            getMergeRequestsStatusData: mergeRequestsList!,
        };
    }

    async getContributorsSummary(
        projectID?: string
    ): Promise<ContributorsSummary | undefined> {
        const contributorsData = await this.callApi<PeopleCardEntityData[]>(
            'projects/' + projectID + '/repository/contributors',
            { sort: 'desc' }
        );
        const updatedContributorsData = await this.getUserProfilesData(
            contributorsData!
        );
        return {
            getContributorsData: updatedContributorsData!,
        };
    }

    async getLanguagesSummary(
        projectID?: string
    ): Promise<LanguagesSummary | undefined> {
        const languageObjects = await this.callApi<Record<string, unknown>>(
            'projects/' + projectID + '/languages',
            {}
        );
        return {
            getLanguagesData: languageObjects!,
        };
    }

    async getProjectDetails(projectSlug?: string): Promise<any | undefined> {
        let projectDetails: any;
        if (projectSlug) {
            projectDetails = await this.callApi<Record<string, unknown>>(
                'projects/' + encodeURIComponent(projectSlug),
                {}
            );
        }
        return projectDetails;
    }

    async retryPipelineBuild(
        projectID?: string,
        pipelineID?: string
    ): Promise<any | undefined> {
        const retryBuild = await this.callApi<Record<string, unknown>>(
            'projects/' + projectID + '/pipelines/' + pipelineID + '/retry',
            {}
        );
        return retryBuild;
    }

    async getCodeOwners(
        projectID?: string,
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
