import { Entity } from '@backstage/catalog-model';
import { Route, Routes } from 'react-router-dom';
import React from 'react';
import { MissingAnnotationEmptyState } from '@backstage/core-components';
import { Button } from '@material-ui/core';
import { GitlabCI } from './components/GitlabCI';
import { rootRouteRef } from './plugin';
import { useEntity } from '@backstage/plugin-catalog-react';


const GITLAB_ANNOTATION_PROJECT_ID = 'gitlab.com/project-id';
export const isGitlabAvailable = (entity: Entity) =>
Boolean(entity.metadata.annotations?.[GITLAB_ANNOTATION_PROJECT_ID]);

type Props = {
  /** @deprecated The entity is now grabbed from context instead */
  entity?: Entity;
};

export const Router =  (_props: Props) => {
  const { entity } = useEntity();
  
  if (isGitlabAvailable(entity)) {
    return (
      <Routes>
        <Route
          path={`/${rootRouteRef.path}`}
          element={<GitlabCI />}
        />
      </Routes>
    );
  }

  return (
    <>
      <MissingAnnotationEmptyState annotation={GITLAB_ANNOTATION_PROJECT_ID} />
      <Button
        variant="contained"
        color="primary"
        href="https://github.com/loblaw-sre/backstage-plugin-gitlab/blob/main/README.md"
      >
        Read Gitlab Plugin Docs
      </Button>
    </>
  );
};
