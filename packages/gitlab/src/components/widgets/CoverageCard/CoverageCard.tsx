import React from 'react';
import { Progress } from '@backstage/core-components';
import { Box, makeStyles } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useAsync } from 'react-use';
import {
    gitlabInstance,
    gitlabProjectId,
    gitlabProjectSlug,
} from '../../gitlabAppData';
import { GitlabCIApiRef } from '../../../api';
import { useApi } from '@backstage/core-plugin-api';
import { InfoCard, InfoCardVariants } from '@backstage/core-components';
import { LineChart } from '@mui/x-charts/LineChart';
import dayjs from 'dayjs';

const useStyles = makeStyles(() => ({
    lineChartContainer: {
        '& .v5-MuiChartsAxis-directionX .v5-MuiChartsAxis-tickLabel': {
            transform: 'rotate(90deg)',
            textAnchor: 'start',
        },
        '& .v5-MuiLineElement-root, .MuiMarkElement-root': {
            strokeWidth: 1,
        },
    },
}));

type Props = {
    variant?: InfoCardVariants;
};

const CoverageCard = (props: Props) => {
    const project_id = gitlabProjectId();
    const project_slug = gitlabProjectSlug();
    const gitlab_instance = gitlabInstance();

    const classes = useStyles();

    const GitlabCIAPI = useApi(GitlabCIApiRef).build(
        gitlab_instance || 'gitlab.com'
    );

    const { value, loading, error } = useAsync(async () => {
        const projectDetails = await GitlabCIAPI.getProjectDetails(
            project_slug || project_id
        );
        if (!projectDetails)
            throw new Error('wrong project_slug or project_id');

        const coverageDetails = await GitlabCIAPI.getProjectCoverage(
            projectDetails.path_with_namespace,
            projectDetails.default_branch
        );

        return {
            webUrl: projectDetails.web_url,
            coverageDetails: !!coverageDetails
                ? coverageDetails.data.project.pipelines.nodes
                : [],
        };
    }, []);

    if (loading) {
        return <Progress />;
    } else if (error) {
        return <Alert severity="error">{error.message}</Alert>;
    }

    const dataset = value?.coverageDetails
        ? [
              ...new Map(
                  value.coverageDetails
                      .filter((node) => !!node.coverage)
                      .sort((a, b) =>
                          new Date(a.createdAt) > new Date(b.createdAt) ? 1 : -1
                      )
                      .map((node) => ({
                          x: dayjs(node.createdAt).format('YYYY-MM-DD'),
                          y: node.coverage,
                      }))
                      .map((node) => [`${node.x}_${node.y}`, node])
              ).values(),
          ]
        : [];

    return value ? (
        <InfoCard
            title="Coverage statistics"
            deepLink={{
                link: `${value.webUrl}/-/graphs/main/charts`,
                title: 'go to Analytics',
                onClick: (e) => {
                    e.preventDefault();
                    window.open(`${value.webUrl}/-/graphs/main/charts`);
                },
            }}
            variant={props.variant}
        >
            <Box position="relative">
                <div className={classes.lineChartContainer}>
                    <LineChart
                        xAxis={[{ scaleType: 'point', dataKey: 'x' }]}
                        series={[{ dataKey: 'y' }]}
                        dataset={dataset}
                        height={300}
                        margin={{ bottom: 90, top: 20, left: 40, right: 20 }}
                    />
                </div>

                <div>
                    {' '}
                    <b>Last Coverage: </b>
                    {!!value.coverageDetails
                        ? `${value.coverageDetails[0].coverage}%`
                        : 'No data'}
                </div>
            </Box>
        </InfoCard>
    ) : (
        <InfoCard title="Coverage Statistics" />
    );
};

export default CoverageCard;
