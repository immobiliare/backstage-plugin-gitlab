export interface Config {
    /** Configurations for the Gitlab plugin */
    gitlab?: {
        /**
         * This parameter work with Gitlab Processor, which automatically discovers the GitLab project-id for the kinds that you specify.
         * @default "['Component']"
         * @visibility backend
         */
        allowedKinds?: string[];
        /**
         * This parameter controls SSL Certs verification
         * @default true
         * @visibility backend
         */
        proxySecure?: boolean;

        /**
         * Activate Oauth/OIDC
         * @default "false"
         * @visibility backend
         */
        useOAuth?: boolean;

        /**
         * Enable automatic project id extraction using the GitLab API
         * @default false
         * @visibility backend
         */
        projectIdExtraction?: boolean;
    };
}
