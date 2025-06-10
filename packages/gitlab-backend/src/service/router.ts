import { Config } from '@backstage/config';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import {
    readGitLabIntegrationConfigs,
    GitLabIntegrationConfig,
} from '@backstage/integration';
import { LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Request } from 'http-proxy-middleware/dist/types';
import bodyParser from 'body-parser';
import { IncomingHttpHeaders } from 'http';

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

    // Add body parser middleware because we need to parse the body in the graphqlFilter
    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({ extended: true }));
    router.use(bodyParser.text());

    // We are filtering the proxy request headers here rather than in
    // `onProxyReq` because when global-agent is enabled then `onProxyReq`
    // fires _after_ the agent has already sent the headers to the proxy
    // target, causing a ERR_HTTP_HEADERS_SENT crash
    const filter = (_pathname: string, req: Request): boolean => {
        headersManipulation(req.headers);
        return req.method === 'GET';
    };

    const graphqlFilter = (_pathname: string, req: Request): boolean => {
        headersManipulation(req.headers);
        return req.method === 'POST' && !req.body.query?.includes('mutation');
    };

    for (const { host, apiBaseUrl, token } of gitlabIntegrations) {
        const apiUrl = new URL(apiBaseUrl);

        router.use(
            `/graphql/${host}`,
            createProxyMiddleware(graphqlFilter, {
                target: apiUrl.origin,
                changeOrigin: true,
                headers: {
                    // If useOAuth is true, we don't not add the token
                    ...(token && !useOAuth ? { 'PRIVATE-TOKEN': token } : {}),
                },
                secure,
                onProxyReq: (proxyReq, req) => {
                    // Here we have to convert body into a stream to avoid to break middleware
                    if (req.body) {
                        const bodyData = JSON.stringify(req.body);
                        // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
                        proxyReq.setHeader('Content-Type', 'application/json');
                        proxyReq.setHeader(
                            'Content-Length',
                            Buffer.byteLength(bodyData)
                        );
                        // stream the content
                        proxyReq.write(bodyData);
                    }
                },
                logProvider: () => ({
                    log: logger.info.bind(logger),
                    debug: logger.debug.bind(logger),
                    info: logger.info.bind(logger),
                    warn: logger.warn.bind(logger),
                    error: logger.error.bind(logger),
                }),
                pathRewrite: {
                    [`^${basePath}/api/gitlab/graphql/${host}`]: `/api/graphql`,
                },
            })
        );

        router.use(
            `/rest/${host}`,
            createProxyMiddleware(filter, {
                target: apiUrl.origin,
                changeOrigin: true,
                headers: {
                    // If useOAuth is true, we don't not add the token
                    ...(token && !useOAuth ? { 'PRIVATE-TOKEN': token } : {}),
                },
                secure,
                logProvider: () => ({
                    log: logger.info.bind(logger),
                    debug: logger.debug.bind(logger),
                    info: logger.info.bind(logger),
                    warn: logger.warn.bind(logger),
                    error: logger.error.bind(logger),
                }),
                pathRewrite: {
                    [`^${basePath}/api/gitlab/rest/${host}`]: apiUrl.pathname,
                },
            })
        );
    }
    const middleware = MiddlewareFactory.create({ logger, config });
    router.use(middleware.error());
    return router;
}
