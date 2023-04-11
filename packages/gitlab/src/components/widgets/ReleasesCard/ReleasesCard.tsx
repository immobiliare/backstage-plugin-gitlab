/*
 * Copyright 2022 Nokia
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Link, Grid } from '@material-ui/core';
import LocalOfferOutlinedIcon from '@material-ui/icons/LocalOfferOutlined';
import Alert from '@material-ui/lab/Alert';
import { InfoCard, Progress } from '@backstage/core-components';
import { GitlabCIApiRef } from '../../../api';
import { useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import {
    gitlabProjectId,
    gitlabProjectSlug,
    gitlabInstance,
} from '../../gitlabAppData';
import { ReleaseData, ProjectDetail } from '../../types';
import { rcompare, valid, prerelease } from 'semver';

const useStyles = makeStyles((theme) => ({
    infoCard: {
        marginBottom: theme.spacing(3),
        '& + .MuiAlert-root': {
            marginTop: theme.spacing(3),
        },
    },
    releaseTitle: {
        ...theme.typography.h6,
        margin: 0,
        marginRight: '0.5rem',
    },
    releaseTagIcon: {
        verticalAlign: 'middle',
    },
}));

/**
 * Properties for {@link ReleasesCard}
 *
 * @public
 */
export interface ReleasesCardProps {
    /**
     * Filter
     *
     * all - show all releases (default)
     * patch - major, minor, patch - no pre-releases
     *
     */
    show?: string;
    /**
     * Limit - show only a maximum number of releases
     */
    limit?: number;
}

function makeFilter(
    show: string
): (value: ReleaseData, index: number, array: ReleaseData[]) => boolean {
    switch (show) {
        case 'patch':
            return (value: ReleaseData) => {
                try {
                    return prerelease(value.tag_name) == null;
                } catch (error) {
                    return true;
                }
            };
        case 'all':
        default:
            return () => true;
    }
}

/**
 * ReleasesCard
 *
 * @public
 */
export const ReleasesCard = (props: ReleasesCardProps) => {
    const { show = 'all', limit = 6 } = props;
    const classes = useStyles();
    const project_id = gitlabProjectId();
    const project_slug = gitlabProjectSlug();
    const gitlab_instance = gitlabInstance();

    const GitlabCIAPI = useApi(GitlabCIApiRef).build(
        gitlab_instance || 'gitlab.com'
    );
    /* TODO: to change the below logic to get contributors data*/
    const { value, loading, error } = useAsync(async (): Promise<{
        releases: ReleaseData[];
        projectDetails: ProjectDetail;
    }> => {
        const projectDetails: any = await GitlabCIAPI.getProjectDetails(
            project_slug || project_id
        );
        const projectDetailsData: ProjectDetail = {
            project_web_url: projectDetails?.web_url,
            project_default_branch: projectDetails?.default_branch,
        };
        const projectId = project_id || projectDetails?.id;
        const gitlabObj = await GitlabCIAPI.getReleasesSummary(projectId);
        const releaseData: ReleaseData[] | undefined =
            gitlabObj?.getReleasesData;
        return {
            releases: releaseData!,
            projectDetails: projectDetailsData!,
        };
    }, []);

    const project_web_url = value?.projectDetails.project_web_url;

    if (loading) {
        return <Progress />;
    } else if (error) {
        return (
            <Alert severity="error" className={classes.infoCard}>
                {error.message}
            </Alert>
        );
    }

    // shortest prefix match to dedupe the list, i.e.
    // prefer full releases, e.g. when v1.2.3 exists, we drop all pre-releases v1.2.3-*
    // prefer the latest in a series of pre-releases
    let releases: ReleaseData[] = [];
    // sort (e.g. v1.2.3 comes before v1.2.3-alpha-4.5) and walk through list of releases
    // NOTE: rcompare sorts descending, but full release comes before release candidates (v1.2.3 before v1.2.3-alpha-4.5)
    // use string comparison for non-compliant tags
    if (value?.releases != null) {
        value?.releases
            .filter(makeFilter(show))
            .sort((a, b) => {
                try {
                    return rcompare(a.tag_name, b.tag_name);
                } catch (error) {
                    return a.tag_name > b.tag_name ? 1 : -1;
                }
            })
            .forEach((release) => {
                // always add invalid release names
                if (!valid(release.tag_name)) {
                    releases.push(release);
                    return;
                }
                // see if there's already a release whose tag_name is a prefix of the current item's tag_name
                const idx = releases.findIndex((value) => {
                    return release.tag_name.startsWith(value.tag_name);
                });
                // if no item was found, the version is not yet in the list
                if (idx < 0) releases.push(release);
            });
    }
    // sort the remaining releases in descending order (latest release first)
    releases = releases
        .sort((a, b) => {
            try {
                return rcompare(a.tag_name, b.tag_name);
            } catch (error) {
                return a.tag_name > b.tag_name ? -1 : 1;
            }
        })
        .slice(0, limit);

    if (releases.length == 0) {
        return <></>;
    }

    return (
        <InfoCard
            title="Releases"
            deepLink={{
                link: `${project_web_url}/-/releases`,
                title: 'go to Releases',
                onClick: (e) => {
                    e.preventDefault();
                    window.open(`${project_web_url}/-/releases`);
                },
            }}
            className={classes.infoCard}
        >
            <Grid container spacing={2} justifyContent="flex-start">
                {releases.map((release: ReleaseData) => (
                    <Grid item key={release.tag_name}>
                        <Link
                            href={
                                project_web_url +
                                '/-/releases/' +
                                release.tag_name
                            }
                            color="inherit"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className={classes.releaseTitle}>
                                {release.name}
                            </div>
                            <LocalOfferOutlinedIcon
                                fontSize="inherit"
                                className={classes.releaseTagIcon}
                            />
                            {release.tag_name}
                        </Link>
                    </Grid>
                ))}
            </Grid>
        </InfoCard>
    );
};
