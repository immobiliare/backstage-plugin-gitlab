import { createTranslationRef } from '@backstage/core-plugin-api/alpha';

export const gitlabTranslationRef = createTranslationRef({
    id: 'Gitlab',
    messages: {
        coverageCard: {
            title: 'Coverage statistics',
            deepLinkTitle: 'go to Analytics',
            lastCoverage: 'Last Coverage: ',
            noData: 'No data',
        },
        issuesTable: {
            title: 'Gitlab Issues: {{projectName}}',
            columnsTitle: {
                issueId: 'Issue ID',
                title: 'Title',
                author: 'Author',
                createdAt: 'Created At',
                issueType: 'Issue Type',
                issueStatus: 'Issue Status',
            },
            status: {
                open: 'open',
                close: 'close',
            },
        },
        languagesCard: {
            title: 'Languages',
        },
        mergeRequestsTable: {
            title: 'Gitlab Merge Request Status: {{projectName}}',
            columnsTitle: {
                title: 'Title',
                creator: 'Creator',
                createdAt: 'Created At',
                state: 'State',
                duration: 'Duration',
            },
        },
        mergeRequestStats: {
            title: 'Merge Request Statistics',
            helperText: 'Number of MRs',
            avgTimeUntilMerge: 'Average time until merge',
            mergedToTotalRatio: 'Merged to total ratio',
        },
        peopleCard: {
            title: 'People',
            ownerList: {
                title: 'Owners',
                deepLinkTitle: 'go to Owners File',
            },
            contributorList: {
                title: 'Contributors',
                deepLinkTitle: 'go to Contributors',
            },
            memberList: {
                title: 'Members',
                deepLinkTitle: 'go to Members',
            },
        },
        pipelinesTable: {
            title: 'Gitlab Pipelines: {{projectName}}',
            columnsTitle: {
                pipelineID: 'Pipeline ID',
                branch: 'Branch',
                status: 'Status',
                webURL: 'Web URL',
                createdAt: 'Created At',
                duration: 'Duration',
            },
        },
        readmeCard: {
            noReadme: 'No README found',
        },
        releasesCard: {
            title: 'Releases',
            deepLinkTitle: 'go to Releases',
            noReleases: 'No releases have been made',
            releasedDate: 'Released Date',
            releasedVersion: 'Released Version',
        },
    },
});
