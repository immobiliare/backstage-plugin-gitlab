import React from "react";

import { Entity } from "@backstage/catalog-model";
import { useEntity } from "@backstage/plugin-catalog-react";
import { GitlabCI } from "./GitlabCI";
import { Button, MissingAnnotationEmptyState } from "@backstage/core-components";

const GITLAB_ANNOTATION_PROJECT_ID = "gitlab.com/project-id";
export const GITLAB_ANNOTATION_PROJECT_SLUG = "gitlab.com/project-slug";

export const isGitlabAvailable = (entity: Entity) =>
  isGitlabProjectIDAnnotationAvailable(entity) ||
  isGitlabSlugAnnotationAvailable(entity);

export const isGitlabProjectIDAnnotationAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[GITLAB_ANNOTATION_PROJECT_ID]);

export const isGitlabSlugAnnotationAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[GITLAB_ANNOTATION_PROJECT_SLUG]);

export const Router = () => {
  const { entity } = useEntity();

  if (isGitlabAvailable(entity)) {
    return (
        <GitlabCI />
    );
  }

  return (
    <>
      <MissingAnnotationEmptyState annotation={GITLAB_ANNOTATION_PROJECT_ID} />
      <MissingAnnotationEmptyState
        annotation={GITLAB_ANNOTATION_PROJECT_SLUG}
      />
      <Button
        variant="contained"
        color="primary"
        href="https://github.com/immobiliare/backstage-plugin-gitlab/blob/main/README.md"
      >
        Read Gitlab Plugin Docs
      </Button>
    </>
  );
};
