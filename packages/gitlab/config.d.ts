export interface Config {
    /** Configurations for the Gitlab plugin */
    gitlab?: {
        /**
         * Default path for CODEOWNERS file
         * @default "CODEOWNERS"
         * @visibility frontend
         */
        defaultCodeOwnersPath?: string;
        /**
         * Default path for README file
         * @default "README.md"
         * @visibility frontend
         */
        defaultReadmePath?: string;

        /**
         * Activate Oauth/OIDC
         * @default "false"
         * @visibility frontend
         */
        useOAuth?: boolean;

        /**
         * Cache TTL for the Gitlab plugin in ms
         * @default 5 * 60 * 1000 (5 minutes)
         * @visibility frontend
         */
        cacheTTL?: number;
    };
}
