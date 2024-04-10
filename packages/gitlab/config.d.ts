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
    };
}
