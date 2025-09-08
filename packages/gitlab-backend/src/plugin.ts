import {
    coreServices,
    createBackendModule,
    createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { GitlabFillerProcessor } from './processor';
import { GitlabProjectIdProcessor } from './processor/projectIdProcessor';
import { createRouter } from './service/router';

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

export const catalogPluginGitlabProjectIdProcessorModule = createBackendModule({
    pluginId: 'catalog',
    moduleId: 'gitlabProjectIdProcessor',
    register(env) {
        env.registerInit({
            deps: {
                config: coreServices.rootConfig,
                extensionPoint: catalogProcessingExtensionPoint,
                cache: coreServices.cache,
            },
            async init({ config, extensionPoint, cache }) {
                if (config.getOptionalBoolean('gitlab.projectIdExtraction')) {
                    extensionPoint.addProcessor(
                        new GitlabProjectIdProcessor(config, cache)
                    );
                }
            },
        });
    },
});

export const gitlabPlugin = createBackendPlugin({
    pluginId: 'gitlab',
    register(env) {
        env.registerInit({
            deps: {
                http: coreServices.httpRouter,
                logger: coreServices.logger,
                config: coreServices.rootConfig,
            },
            async init({ config, logger, http }) {
                http.use(
                    await createRouter({
                        logger,
                        config,
                    })
                );
            },
        });
    },
});
