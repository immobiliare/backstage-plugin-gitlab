export type PeopleCardEntityData = {
    name: string;
    email?: string;
    avatar_url: string;
    id: number;
    state?: string;
    username?: string;
    web_url: string;
    full_path?: string;
};

export type PeopleLink = {
    link: string;
    title: string;
    onClick: (e: any) => void;
};

export type MergeRequest = {
    id: string;
    iid: string;
    project_id: string;
    state: string;
    created_date: string;
    author: {
        username: string;
    };
    title: string;
    created_at: string;
    merged_at: string;
    updated_at: string;
    closed_at: string;
    web_url: string;
};

export type PipelineObject = {
    id: string;
    project_id: string;
    ref: string;
    status: string;
    web_url: string;
    project_name: string;
    onRestartClick: () => void;
    created_at: string;
    updated_at: string;
};

export type IssueObject = {
    id: string;
    project_name: string;
    project_id: string;
    title: string;
    state: IssueState;
    type: IssueType;
    description: string;
    created_at: string;
    updated_at: string;
    author: Author;
    web_url: string;
};

type Author = {
    id: string;
    username: string;
    name: string;
    avatar_url: string;
    web_url: string;
};

export type FileOwnership = {
    rule: string;
    path: string;
    owners: string[];
};

export type UserDetail = {
    id: number;
    name: string;
    username: string;
    state: string;
    avatar_url: string;
    web_url: string;
};

export type ProjectDetail = {
    project_web_url: string;
    project_default_branch: string;
};

export type MergeRequestState = 'opened' | 'closed' | 'all';

export type IssueState = 'opened' | 'closed';

export type IssueType = 'issue' | 'incident' | 'test_case';
