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
import { IncomingMessage } from 'http';

function getBasePath(config: Config) {
    const baseUrl = config.getOptionalString('backend.baseUrl');
    if (!baseUrl) {
        return undefined;
    }
    return new URL(baseUrl).pathname.replace(/\/$/, '');
}

export interface RouterOptions {
    logger: Logger;
    config: Config;
}

export async function createRouter(
    options: RouterOptions
): Promise<express.Router> {
    const { logger, config } = options;
    const secure = config.getOptionalBoolean('gitlab.proxySecure');
    const basePath = getBasePath(config) || '';

    const gitlabIntegrations: GitLabIntegrationConfig[] =
        readGitLabIntegrationConfigs(
            config.getConfigArray('integrations.gitlab')
        );

    const router = Router();

    // We are filtering the proxy request headers here rather than in
    // `onProxyReq` because when global-agent is enabled then `onProxyReq`
    // fires _after_ the agent has already sent the headers to the proxy
    // target, causing a ERR_HTTP_HEADERS_SENT crash
    const filter = (_pathname: string, req: IncomingMessage): boolean => {
        if (req.headers['authorization']) delete req.headers['authorization'];
        return req.method === 'GET';
    };

    const postFilter = (_pathname: string, req: IncomingMessage): boolean => {
        if (req.headers['authorization']) delete req.headers['authorization'];
        return req.method === 'POST';
    };

    for (const { host, apiBaseUrl, baseUrl, token } of gitlabIntegrations) {
        const graphqlBaseUrl = new URL(baseUrl);
        router.use(
            `/${host}/graphql`,
            createProxyMiddleware(postFilter, {
                target: graphqlBaseUrl.origin,
                changeOrigin: true,
                headers: {
                    ...(token ? { 'PRIVATE-TOKEN': token } : {}),
                },
                secure,
                logProvider: () => logger,
                logLevel: 'info',
                pathRewrite: {
                    [`^${basePath}/api/gitlab/${host}/graphql`]: `/api/graphql`,
                },
            })
        );

        const apiUrl = new URL(apiBaseUrl);
        router.use(
            `/${host}`,
            createProxyMiddleware(filter, {
                target: apiUrl.origin,
                changeOrigin: true,
                headers: {
                    ...(token ? { 'PRIVATE-TOKEN': token } : {}),
                },
                secure,
                logProvider: () => logger,
                pathRewrite: {
                    [`^${basePath}/api/gitlab/${host}`]: apiUrl.pathname,
                },
            })
        );
    }

    router.use(errorHandler());
    return router;
}
