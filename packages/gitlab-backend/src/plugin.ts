import {
    coreServices,
    createBackendModule,
    createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { loggerToWinstonLogger } from '@backstage/backend-common';
import { GitlabFillerProcessor } from './processor';
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
                const winstonLogger = loggerToWinstonLogger(logger);
                http.use(
                    await createRouter({
                        logger: winstonLogger,
                        config,
                    })
                );
            },
        });
    },
});
