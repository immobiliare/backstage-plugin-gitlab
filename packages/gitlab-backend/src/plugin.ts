import { loggerToWinstonLogger } from '@backstage/backend-common';
import {
    createBackendModule,
    coreServices,
} from '@backstage/backend-plugin-api';
import {
    catalogServiceRef,
    catalogProcessingExtensionPoint,
} from '@backstage/plugin-catalog-node/alpha';
import { createRouter } from './service/router';
import { GitlabFillerProcessor } from './processor';

export const gitlabPlugin = createBackendModule({
    moduleId: 'gitlab-backend-module',
    pluginId: 'gitlab',
    register(env) {
        env.registerInit({
            deps: {
                http: coreServices.httpRouter,
                logger: coreServices.logger,
                config: coreServices.config,
                catalogApi: catalogServiceRef,
                permissions: coreServices.permissions,
                processor: catalogProcessingExtensionPoint,
            },
            async init({ http, logger, config, processor }) {
                const winstonLogger = loggerToWinstonLogger(logger);

                processor.addProcessor(new GitlabFillerProcessor(config));

                const router = await createRouter({
                    logger: winstonLogger,
                    config,
                });
                http.use(router);
            },
        });
    },
});
