import type { MouseEventHandler } from 'react';

export type PeopleCardEntityData = {
    name: string;
    email?: string;
    avatar_url?: string;
    id?: number;
    state?: string;
    username?: string;
    web_url?: string;
    full_path?: string;
};

export type PeopleLink = {
    link: string;
    title: string;
    onClick: MouseEventHandler;
};

export type MemberCardEntityData = {
    name: string;
    email?: string;
    avatar_url?: string;
    id?: number;
    state?: string;
    username?: string;
    web_url?: string;
    full_path?: string;
    access_level?: number;
    access_level_label?: string;
    membership_state?: string;
};

export type FileOwnership = {
    rule: string;
    path: string;
    owners: string[];
};

export type Languages = {
    [key: string]: number;
};
