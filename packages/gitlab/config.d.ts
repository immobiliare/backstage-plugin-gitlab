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
         * Proxy path
         * @default "/gitlabci"
         * @visibility frontend
         */
        proxyPath?: string;
    };
}
