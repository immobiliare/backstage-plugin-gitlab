export interface Config {
    /** Configurations for the Gitlab plugin */
    gitlab?: {
        /**
         * This parameter work with Gitlab Processor, which automatically discovers the GitLab project-id for the kinds that you specify.
         * @default "['Component']"
         * @visibility backend
         */
        allowedKinds?: string[];
    };
}
