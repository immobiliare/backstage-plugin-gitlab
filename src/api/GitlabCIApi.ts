import { createApiRef } from '@backstage/core-plugin-api';
import { ContributorData, MergeRequest, PipelineObject } from '../components/types';


export interface PipelineSummary {
  getPipelinesData: PipelineObject[];
}

export interface ContributorsSummary {
  getContributorsData: ContributorData[];
}

export interface MergeRequestsSummary {
  getMergeRequestsData: MergeRequest[];
}

export interface LanguagesSummary {
  getLanguagesData: any;
}

export const GitlabCIApiRef = createApiRef<GitlabCIApi>({
  id: 'plugin.gitlabci.service',
  description: 'Used by the GitlabCI plugin to make requests',
});

export type GitlabCIApi = {
  getPipelineSummary(projectID: string): Promise<PipelineSummary | undefined>;
  getContributorsSummary(projectID: string): Promise<ContributorsSummary | undefined>;
  getMergeRequestsSummary(projectID: string): Promise<MergeRequestsSummary | undefined>;
  getProjectName(projectID: string): Promise<string | undefined>;
  getLanguagesSummary(projectID: string): Promise<LanguagesSummary | undefined>;
  retryPipelineBuild(projectID: string, pipelineID: string): Promise<Object | undefined>;
};