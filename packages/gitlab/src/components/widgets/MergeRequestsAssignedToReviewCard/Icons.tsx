import React from 'react';
import { makeStyles, Tooltip } from '@material-ui/core';
import type { MergeRequestSchema } from '@gitbeaker/rest';
const useStyles = makeStyles(() => ({
    open: {
        fill: '#22863a',
    },
    closed: {
        fill: '#cb2431',
    },
    merged: {
        fill: '#6f42c1',
    },
    draft: {
        fill: '#6a737d',
    },
}));

const StatusOpen = () => {
    const classes = useStyles();
    return (
        <svg
            width="16"
            height="16"
            className={classes.open}
            viewBox="0 0 16 16"
        >
            <path
                fillRule="evenodd"
                d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"
            />
        </svg>
    );
};


const StatusClosed = () => {
    const classes = useStyles();
    return (
        <svg
            width="16"
            height="16"
            className={classes.closed}
            viewBox="0 0 16 16"
        >
            <path
                fillRule="evenodd"
                d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"
            />
        </svg>
    );
};

const StatusMerged = () => {
    const classes = useStyles();
    return (
        <svg
            width="16"
            height="16"
            className={classes.merged}
            viewBox="0 0 16 16"
        >
            <path
                fillRule="evenodd"
                d="M5 3.254V3.25v.005a.75.75 0 110-.005v.004zm.45 1.9a2.25 2.25 0 10-1.95.218v5.256a2.25 2.25 0 101.5 0V7.123A5.735 5.735 0 009.25 9h1.378a2.251 2.251 0 100-1.5H9.25a4.25 4.25 0 01-3.8-2.346zM12.75 9a.75.75 0 100-1.5.75.75 0 000 1.5zm-8.5 4.5a.75.75 0 100-1.5.75.75 0 000 1.5z"
            />
        </svg>
    );
};

export const getStatusIconType = (row: MergeRequestSchema) => {
    switch (true) {
        case row.state === 'opened':
            return (
                <Tooltip title="Open">
                    <span>
                        <StatusOpen />
                    </span>
                </Tooltip>
            );
        case row.state === 'locked':
            return (
                <Tooltip title="Open">
                    <span>
                        <StatusOpen />
                    </span>
                </Tooltip>
            );
        case row.state === 'merged':
            return (
                <Tooltip title="Merged">
                    <span>
                        <StatusMerged />
                    </span>
                </Tooltip>
            );
        case row.state === 'closed':
            return (
                <Tooltip title="Closed">
                    <span>
                        <StatusClosed />
                    </span>
                </Tooltip>
            );
        default:
            return null;
    }
};
