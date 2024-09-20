import React, { useState, useCallback } from 'react';
import { InfoCard, Progress, Link } from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';
import { useAsync } from 'react-use';
import { GitlabCIApiRef } from '../../../api';
import { useApi } from '@backstage/core-plugin-api';
import { getElapsedTime } from '../../utils';
import { List, Typography, Box, useTheme, Button } from '@material-ui/core';
import { getStatusIconType } from './Icons';
// import { gitlabInstance } from '../../gitlabAppData';

const MergeRequestsAssignedToMeCard = () => {
  const theme = useTheme();
  const gitlab_instance = 'gitlab.${internal-gitlab-domain}.com';
  const GitlabCIAPI = useApi(GitlabCIApiRef).build(gitlab_instance);

  const { value, loading, error } = useAsync(async () => {
    const mergeRequests = await GitlabCIAPI.getMergeRequestsAssignedToMe();
    return mergeRequests || [];
  }, []);

  const [collapsed, setCollapsed] = useState(true);


  const onClick = useCallback(() => setCollapsed((prev) => !prev), []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  } else if (!value || value.length === 0) {
    return (
      <InfoCard title="MR Assigned">
        <Typography>No open merge requests are currently assigned to you.</Typography>
      </InfoCard>
    );
  }

  const displayedMergeRequests = collapsed ? value.slice(0, 3) : value;

  return (
    <InfoCard title="MR Assigned">
      <List dense>
        {displayedMergeRequests.map((mergeRequest) => (
          <Box
            key={mergeRequest.id}
            border={1}
            borderRadius={4}
            padding={1}
            marginBottom={1}
            style={{
              borderColor: theme.palette.divider,
              backgroundColor: theme.palette.background.paper,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', marginRight: '12px' }}>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '24px',
                  width: '24px',
                }}
              >
                {getStatusIconType(mergeRequest)}
              </Box>
              <Link to={mergeRequest.web_url} target="_blank" style={{ fontSize: '1rem', lineHeight: '24px' }}>
                {mergeRequest.title}
              </Link>
            </Box>


              <Typography
                variant="body2"
                style={{
                  color: theme.palette.text.secondary,
                  backgroundColor: theme.palette.action.hover,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  lineHeight: '24px',
                }}
              >
                {getElapsedTime(mergeRequest.created_at)}
              </Typography>
            </Box>
        ))}
      </List>

      {/* View More / View Less Button */}
      {value.length > 3 && (
        <Box style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <Button variant="text" onClick={onClick}>
            {collapsed ? 'View More' : 'View Less'}
          </Button>
        </Box>
      )}
    </InfoCard>
  );
};

export default MergeRequestsAssignedToMeCard;
