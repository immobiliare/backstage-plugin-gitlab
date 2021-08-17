export type ContributorData = {
    name: string;
    email: string;
    avatar_url: string;
};

export type MergeRequest = {
    id: string;
    project_id: string;
    state: string;
    created_date: string;
    author: {
        username: string;
    }
    title: string;
    created_at: string;
};  

export type PipelineObject = {
    id: string;
    project_id: string;
    ref: string;
    status: string;
    web_url: string;
    project_name: string;
    onRestartClick: () => void;
};