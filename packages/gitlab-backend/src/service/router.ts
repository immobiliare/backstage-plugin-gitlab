import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import {
    readGitLabIntegrationConfigs,
    GitLabIntegrationConfig,
} from '@backstage/integration';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { createProxyMiddleware } from 'http-proxy-middleware';

export interface RouterOptions {
    logger: Logger;
    config: Config;
}

export async function createRouter(
    options: RouterOptions
): Promise<express.Router> {
    const { logger, config } = options;

    const gitlabIntegrations: GitLabIntegrationConfig[] =
        readGitLabIntegrationConfigs(
            config.getConfigArray('integrations.gitlab')
        );

    const router = Router();

    for (const { host, apiBaseUrl, token } of gitlabIntegrations) {
        const apiUrl = new URL(apiBaseUrl);
        router.use(
            `/${host}`,
            createProxyMiddleware((_pathname, req) => req.method === 'GET', {
                target: apiUrl.origin,
                changeOrigin: true,
                headers: {
                    ...(token ? { 'PRIVATE-TOKEN': token } : {}),
                },
                logProvider: () => logger,
                pathRewrite: {
                    [`^/api/gitlab/${host}`]: apiUrl.pathname,
                },
                onProxyReq: (proxyReq) => {
                    try {
                        proxyReq.removeHeader('Authorization');
                    } catch (e) {
                        console.log((e as Error).message);
                    }
                },
            })
        );
    }

    router.use(errorHandler());
    return router;
}
