import { GitlabFillerProcessor } from './processor';
import { ConfigReader } from '@backstage/config';
import { Entity } from '@backstage/catalog-model';

// To write tests
describe('Processor', () => {
    const config = new ConfigReader({
        integrations: {
            gitlab: [
                {
                    host: 'my.custom-gitlab.com',
                    apiBaseUrl: 'https://my.custom-gitlab.com/api/v4',
                },
                {
                    host: 'my.second-custom-gitlab.com',
                    apiBaseUrl: 'https://my.second-custom-gitlab.com/api/v4',
                },
            ],
        },
    });

    it('Processor has the correct name', () => {
        const processor = new GitlabFillerProcessor(config);
        expect(processor.getProcessorName()).toEqual('GitlabFillerProcessor');
    });

    it('Processor creates the right annotation', async () => {
        const processor = new GitlabFillerProcessor(config);
        const entity: Entity = {
            apiVersion: 'backstage.io/v1alpha1',
            kind: 'Component',
            metadata: {
                name: 'backstage',
            },
        };
        await processor.postProcessEntity(
            entity,
            {
                type: 'url',
                target: 'https://my.custom-gitlab.com/backstage/backstage/-/blob/next/catalog.yaml',
            },
            () => undefined
        );

        expect(
            entity.metadata?.annotations?.['gitlab.com/project-slug']
        ).toEqual('0@backstage/backstage');
    });

    it('Processor creates the right old gitlab', async () => {
        const processor = new GitlabFillerProcessor(config);
        const entity: Entity = {
            apiVersion: 'backstage.io/v1alpha1',
            kind: 'Component',
            metadata: {
                name: 'backstage',
            },
        };
        await processor.postProcessEntity(
            entity,
            {
                type: 'url',
                target: 'https://my.custom-gitlab.com/backstage/backstage/blob/next/catalog.yaml',
            },
            () => undefined
        );

        expect(
            entity.metadata?.annotations?.['gitlab.com/project-slug']
        ).toEqual('0@backstage/backstage');
    });

    it('The processor does not update annotation if the annotations exist', async () => {
        const processor = new GitlabFillerProcessor(config);
        const projectId = '3922';
        const entity: Entity = {
            apiVersion: 'backstage.io/v1alpha1',
            kind: 'Component',
            metadata: {
                name: 'backstage',
                annotations: {
                    'gitlab.com/project-id': projectId,
                },
            },
        };
        await processor.postProcessEntity(
            entity,
            {
                type: 'url',
                target: 'https://my.custom-gitlab.com/backstage/backstage/blob/next/catalog.yaml',
            },
            () => undefined
        );

        expect(
            entity.metadata?.annotations?.['gitlab.com/project-slug']
        ).toBeUndefined();

        expect(entity.metadata?.annotations?.['gitlab.com/project-id']).toEqual(
            projectId
        );
    });
});
