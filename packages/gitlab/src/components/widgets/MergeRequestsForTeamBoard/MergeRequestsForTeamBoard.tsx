
import React, { useState, useEffect, useCallback } from 'react';
import { Progress } from '@backstage/core-components';
import { Grid, Box, Typography, Card, CardContent, Chip, Button, Link } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useApi } from '@backstage/core-plugin-api';
import { GitlabCIApiRef } from '../../../api';
import { getElapsedTime } from '../../utils';
import { isGroupEntity } from '@backstage/catalog-model';
import { useEntity } from '@backstage/plugin-catalog-react';
import dayjs from 'dayjs';
import JiraIcon from '@material-ui/icons/BugReport';
// import { gitlabInstance } from '../../gitlabAppData';

const ITEMS_PER_PAGE = 10;

type SimpleLabelSchema = {
  id: number;
  name: string;
};

type MergeRequestSchema = {
  id: number;
  project_id: number;
  iid: number;
  state: string;
  title: string;
  web_url: string;
  created_at: string;
  pipeline?: {
    status: string;
  };
  author: {
    username: string;
  };
  labels: string[] | SimpleLabelSchema[];
  reviewers?: { username: string }[];
  approved_by?: { username: string }[];
};

type MergeRequest = {
  id: number;
  project_id: number;
  iid: number;
  state: string;
  title: string;
  web_url: string;
  created_at: string;
  pipeline?: {
    status: string;
  };
  author: {
    username: string;
  };
  labels: string[];
  reviewers?: { username: string }[];
  approved_by?: { username: string }[];
};

const MergeRequestsForTeamBoard = () => {
  const { entity } = useEntity();
  const gitlab_instance = 'gitlab.${internal_gitlab_domain}.com';
  const GitlabCIAPI = useApi(GitlabCIApiRef).build(gitlab_instance);

  const [mergeRequests, setMergeRequests] = useState<MergeRequest[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDataFetched, setIsDataFetched] = useState(false);

  const [reviewRequiredVisible, setReviewRequiredVisible] = useState(ITEMS_PER_PAGE);
  const [reviewInProgressVisible, setReviewInProgressVisible] = useState(ITEMS_PER_PAGE);
  const [approvedNotMergedVisible, setApprovedNotMergedVisible] = useState(ITEMS_PER_PAGE);

  if (!isGroupEntity(entity)) {
    return <Alert severity="error">This component only works with Group entities.</Alert>;
  }

  const groupName = entity.metadata.name;

  const fetchPipelineForMR = useCallback(async (mr: MergeRequestSchema) => {
    try {
      if (!mr.project_id || !mr.iid) {
        throw new Error('Invalid MR data');
      }

      const pipelines = await GitlabCIAPI.getPipelinesForMergeRequest(mr.project_id, mr.iid);
      if (pipelines && pipelines.length > 0) {
        const latestPipeline = pipelines[0];
        return latestPipeline;
      } else {
        return undefined;
      }
    } catch (err) {
      return undefined;
    }
  }, [GitlabCIAPI]);

  const fetchMergeRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!groupName) {
        throw new Error('Group name is undefined. Cannot fetch merge requests.');
      }

      const mergeRequests = await GitlabCIAPI.getMergeRequestsForGroup(groupName);

      const openedMergeRequests = mergeRequests
        ?.filter((mr: MergeRequestSchema) => mr.state === 'opened')
        .map((mr: MergeRequestSchema) => ({
          ...mr,
          labels: Array.isArray(mr.labels) && typeof mr.labels[0] !== 'string'
            ? (mr.labels as SimpleLabelSchema[]).map((label) => label.name)
            : (mr.labels as string[]),
          reviewers: mr.reviewers ?? [],
        })) || [];

      const updatedMergeRequests = await Promise.all(
        openedMergeRequests.map(async (mr) => {
          const pipeline = await fetchPipelineForMR(mr);
          return { ...mr, pipeline };
        })
      );

      setMergeRequests(updatedMergeRequests);
      setIsDataFetched(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Error fetching merge requests');
      } else {
        setError('Unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [groupName, fetchPipelineForMR]);


  useEffect(() => {
    if (!isDataFetched) {
      fetchMergeRequests();
    }
  }, [fetchMergeRequests, isDataFetched]);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!mergeRequests || mergeRequests.length === 0) {
    return (
      <Typography>No open merge requests found for your team: {groupName}</Typography>
    );
  }

  const getCommitStatus = (mr: MergeRequest) => {
    const latestPipeline = mr?.pipeline?.status;
    switch (latestPipeline) {
      case 'success':
        return { label: 'Passed', color: '#28a745' };
      case 'failed':
        return { label: 'Failed', color: '#d73a49' };
      default:
        return { label: 'Warning', color: '#f1e05a' };
    }
  };

  const getCreationDateColor = (created_at: string) => {
    const now = dayjs();
    const createdDate = dayjs(created_at);
    const diffInMonths = now.diff(createdDate, 'month');

    if (diffInMonths >= 12) {
      return '#e57373';
    } else if (diffInMonths >= 3) {
      return '#FFB74D';
    } else {
      return '#81c784';
    }
  };

  const detectJiraTicket = (title: string) => {
    const regex = /([A-Z]+-\d+)/;
    const match = title.match(regex);
    return match ? match[0] : null;
  };

  const MergeRequestCard = ({ mr }: { mr: MergeRequest }) => {
    const commitStatus = getCommitStatus(mr);
    const creationDateColor = getCreationDateColor(mr.created_at);
    const timeElapsed = getElapsedTime(mr.created_at);

    const isDraft = mr.title.startsWith("Draft:");
    const cleanTitle = isDraft ? mr.title.replace("Draft:", "").trim() : mr.title;

    const jiraTicket = detectJiraTicket(mr.title);
    const jiraUrl = jiraTicket ? `https://${internal_jira_hostname_var}.atlassian.net/browse/${jiraTicket}` : null;
    return (
      <Card variant="outlined" style={{ marginBottom: '16px', position: 'relative' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {/* Title and Author */}
            <Box display="flex" flexDirection="column">
              <Typography variant="h6" style={{ display: 'flex', alignItems: 'center' }}>
                {isDraft && (
                  <Chip
                    label="Draft"
                    style={{
                      backgroundColor: '#0052cc',
                      color: 'white',
                      marginRight: '8px',
                    }}
                  />
                )}
                <a href={mr.web_url} target="_blank" rel="noopener noreferrer">
                  {cleanTitle}
                </a>
              </Typography>
              <Typography variant="subtitle2">
                Created: <span style={{ color: creationDateColor }}>{timeElapsed}</span> by {mr.author.username}
              </Typography>
            </Box>

            {/* Commit Status */}
            <Box>
              <Chip
                label={commitStatus.label}
                style={{
                  backgroundColor: commitStatus.color,
                  color: 'white',
                  fontSize: '12px',
                }}
              />
            </Box>
          </Box>

          {/* Labels */}
          <Box marginTop={2}>
            {mr.labels.map((label: string, idx: number) => (
              <Chip key={idx} label={label} style={{ marginRight: '8px' }} />
            ))}
          </Box>
        </CardContent>

        {/* JIRA Icon */}
        {jiraTicket && (
          <Box position="absolute" bottom="8px" right="8px">
            <Link href={jiraUrl || undefined} target="_blank" rel="noopener noreferrer">
              <JiraIcon style={{ color: '#0052cc' }} />
            </Link>
          </Box>
        )}
      </Card>
    );
  };

  const renderMRColumn = (
    title: string,
    data: MergeRequest[],
    visibleCount: number,
    setVisibleCount: React.Dispatch<React.SetStateAction<number>>
  ) => (
    <Grid item xs={12} sm={4}>
      <Typography variant="h5">{title}</Typography>
      <Grid container spacing={3}>
        {data.slice(0, visibleCount).map((mr: MergeRequest) => (
          <Grid item xs={12} key={mr.id}>
            <MergeRequestCard mr={mr} />
          </Grid>
        ))}
        {visibleCount < data.length && (
          <Grid item xs={12}>
            <Button onClick={() => setVisibleCount((prev: number) => prev + ITEMS_PER_PAGE)}>
              Show more
            </Button>
          </Grid>
        )}
      </Grid>
    </Grid>
  );


  const reviewRequired = mergeRequests.filter(mr => !mr.reviewers || mr.reviewers.length === 0);
  const reviewInProgress = mergeRequests.filter(mr => mr.reviewers && mr.reviewers.length > 0 && !mr.approved_by);
  const approvedButNotMerged = mergeRequests.filter(mr => mr.approved_by && mr.state !== 'merged');

  return (
    <>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" color="primary" onClick={() => { fetchMergeRequests(); setIsDataFetched(false); }}>
          Refresh
        </Button>
      </Box>
      <Grid container spacing={3}>
        {/* Review Required */}
        {renderMRColumn('🔍 Review Required', reviewRequired, reviewRequiredVisible, setReviewRequiredVisible)}

        {/* Review in Progress */}
        {renderMRColumn('👀 Review In Progress', reviewInProgress, reviewInProgressVisible, setReviewInProgressVisible)}

        {/* Approved but Not Merged */}
        {renderMRColumn('✅ Approved but Not Merged', approvedButNotMerged, approvedNotMergedVisible, setApprovedNotMergedVisible)}
      </Grid>
    </>
  );
};

export default MergeRequestsForTeamBoard;
