import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import { readGitLabIntegrationConfigs } from '@backstage/integration';
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

    const gitlabIntegrations = readGitLabIntegrationConfigs(
        config.getConfigArray('integrations.gitlab')
    );

    const router = Router();

    for (const [i, { apiBaseUrl, token }] of gitlabIntegrations.entries()) {
        const apiUrl = new URL(apiBaseUrl);
        router.use(
            `/${i}`,
            createProxyMiddleware((_pathname, req) => req.method === 'GET', {
                target: apiUrl.origin,
                changeOrigin: true,
                headers: {
                    ...(token ? { 'PRIVATE-TOKEN': token } : {}),
                },
                logProvider: () => logger,
                pathRewrite: {
                    [`^/api/gitlab/${i}`]: apiUrl.pathname,
                },
                onProxyReq: (proxyReq) => {
                    proxyReq.removeHeader('Authorization');
                },
            })
        );
    }

    router.use(errorHandler());
    return router;
}
