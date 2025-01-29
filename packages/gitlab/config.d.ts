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
         * Cache configuration
         * @visibility frontend
         */
        cache?: {
            /**
             * Enable caching for the Gitlab plugin
             * @default false
             * @visibility frontend
             */
            enabled?: boolean;

            /**
             * Cache TTL for the Gitlab plugin in seconds
             * @default 300
             * @visibility frontend
             */
            ttl?: number;
        };
    };
}
