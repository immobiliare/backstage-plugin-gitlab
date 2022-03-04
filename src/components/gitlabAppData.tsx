/*
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
 *
 * limitations under the License.
 */

import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import { scmIntegrationsApiRef } from '@backstage/integration-react';
import {
  parseLocationRef,
  ANNOTATION_LOCATION,
  ANNOTATION_SOURCE_LOCATION,
} from '@backstage/catalog-model';

export const GITLAB_ANNOTATION_PROJECT_ID = 'gitlab.com/project-id';
export const GITLAB_ANNOTATION_PROJECT_SLUG = 'gitlab.com/project-slug';
const defaultGitlabIntegration = {
	hostname: 'gitlab.com',
	baseUrl: 'https://gitlab.com/api/v4',
};
  
export const useEntityGitlabScmIntegration = () => {
	const { entity } = useEntity();
	const integrations = useApi(scmIntegrationsApiRef);
	if (!entity) {
	  return defaultGitlabIntegration;
	}
  
	let location = entity.metadata.annotations?.[ANNOTATION_SOURCE_LOCATION];
  
	if (!location) {
	  location = entity.metadata.annotations?.[ANNOTATION_LOCATION];
	}
  
	const { target } = parseLocationRef(location || '');
  
	const scm = integrations.gitlab.byUrl(target);
	if (scm) {
	  return {
		hostname: scm.config.host,
		baseUrl: scm.config.apiBaseUrl,
	  };
	}
	return defaultGitlabIntegration;
};

export const gitlabAppData = () => {
	const { entity } = useEntity();

	const project_id =
		entity.metadata.annotations?.[GITLAB_ANNOTATION_PROJECT_ID] ?? '';

	return { project_id };
};

export const gitlabAppSlug = () => {
	const { entity } = useEntity();

	const project_slug =
		entity.metadata.annotations?.[GITLAB_ANNOTATION_PROJECT_SLUG] ?? '';

	return { project_slug };
};
