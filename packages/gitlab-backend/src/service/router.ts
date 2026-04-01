import type { IncomingHttpHeaders } from 'node:http';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import type { LoggerService } from '@backstage/backend-plugin-api';
import type { Config } from '@backstage/config';
import {
    type GitLabIntegrationConfig,
    readGitLabIntegrationConfigs,
} from '@backstage/integration';
import bodyParser from 'body-parser';
import type express from 'express';
import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

function getBasePath(config: Config) {
    const baseUrl = config.getOptionalString('backend.baseUrl');
    if (!baseUrl) {
        return undefined;
    }
    return new URL(baseUrl).pathname.replace(/\/$/, '');
}

function headersManipulation(headers: IncomingHttpHeaders) {
    // Remove Backstage authorization before forwarding to GitLab
    if (headers['authorization']) delete headers['authorization'];
    // Forward authorization, this header is defined when gitlab.useOAuth is true
    if (headers['gitlab-authorization']) {
        headers['authorization'] = headers['gitlab-authorization'] as string;
        delete headers['gitlab-authorization'];
    }
}

export interface RouterOptions {
    logger: LoggerService;
    config: Config;
}

export async function createRouter(
    options: RouterOptions
): Promise<express.Router> {
    const { logger, config } = options;
    const secure = config.getOptionalBoolean('gitlab.proxySecure');
    const useOAuth = config.getOptionalBoolean('gitlab.useOAuth');
    const basePath = getBasePath(config) || '';

    const gitlabIntegrations: GitLabIntegrationConfig[] =
        readGitLabIntegrationConfigs(
            config.getConfigArray('integrations.gitlab')
        );

    const router = Router();

    // Add body parser middleware
    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({ extended: true }));
    router.use(bodyParser.text());

    for (const { host, apiBaseUrl, token } of gitlabIntegrations) {
        const apiUrl = new URL(apiBaseUrl);

        // GraphQL Proxy
        router.use(
            `/graphql/${host}`,
            createProxyMiddleware(
                (_pathname, req) => {
                    headersManipulation(req.headers);
                    const isPost = req.method === 'POST';
                    const isNotMutation = !(req.body as any)?.query?.includes(
                        'mutation'
                    );
                    return isPost && isNotMutation;
                },
                {
                    target: apiUrl.origin,
                    changeOrigin: true,
                    headers: {
                        ...(token && !useOAuth
                            ? { 'PRIVATE-TOKEN': token }
                            : {}),
                    },
                    secure,
                    onProxyReq: (proxyReq, req: any) => {
                        headersManipulation(req.headers);
                        if (req.headers.authorization) {
                            proxyReq.setHeader(
                                'authorization',
                                req.headers.authorization
                            );
                        }
                        const body = req.body || {};
                        const bodyData = JSON.stringify(body);
                        proxyReq.setHeader('Content-Type', 'application/json');
                        proxyReq.setHeader(
                            'Content-Length',
                            Buffer.byteLength(bodyData)
                        );
                        proxyReq.write(bodyData);
                    },
                    logProvider: () => ({
                        log: logger.info.bind(logger),
                        debug: logger.debug.bind(logger),
                        info: logger.info.bind(logger),
                        warn: logger.warn.bind(logger),
                        error: logger.error.bind(logger),
                    }),
                    pathRewrite: (path, _req) => {
                        const from = `${basePath}/api/gitlab/graphql/${host}`;
                        const to = '/api/graphql';
                        if (path.startsWith(from))
                            return path.replace(from, to);
                        const relativeFrom = `/graphql/${host}`;
                        if (path.startsWith(relativeFrom))
                            return path.replace(relativeFrom, to);
                        return path;
                    },
                }
            )
        );

        // REST Proxy
        router.use(
            `/rest/${host}`,
            createProxyMiddleware(
                (_pathname, req) => {
                    headersManipulation(req.headers);
                    return req.method === 'GET';
                },
                {
                    target: apiUrl.origin,
                    changeOrigin: true,
                    headers: {
                        ...(token && !useOAuth
                            ? { 'PRIVATE-TOKEN': token }
                            : {}),
                    },
                    secure,
                    logProvider: () => ({
                        log: logger.info.bind(logger),
                        debug: logger.debug.bind(logger),
                        info: logger.info.bind(logger),
                        warn: logger.warn.bind(logger),
                        error: logger.error.bind(logger),
                    }),
                    pathRewrite: (path, _req) => {
                        const from = `${basePath}/api/gitlab/rest/${host}`;
                        const to = apiUrl.pathname;
                        if (path.startsWith(from))
                            return path.replace(from, to);
                        const relativeFrom = `/rest/${host}`;
                        if (path.startsWith(relativeFrom))
                            return path.replace(relativeFrom, to);
                        return path;
                    },
                }
            )
        );
    }

    const middleware = MiddlewareFactory.create({ logger, config });
    router.use(middleware.error());
    return router;
}
