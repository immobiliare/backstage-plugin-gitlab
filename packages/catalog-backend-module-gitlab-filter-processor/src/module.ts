import {
    coreServices,
    createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { GitlabFillerProcessor } from './processor';

export const catalogPluginGitlabFillerProcessorModule = createBackendModule({
    pluginId: 'catalog',
    moduleId: 'gitlabFillerProcessor',
    register(env) {
        env.registerInit({
            deps: {
                config: coreServices.rootConfig,
                extensionPoint: catalogProcessingExtensionPoint,
            },
            async init({ config, extensionPoint }) {
                extensionPoint.addProcessor(new GitlabFillerProcessor(config));
            },
        });
    },
});
