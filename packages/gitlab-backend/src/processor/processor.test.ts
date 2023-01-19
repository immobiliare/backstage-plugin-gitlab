import { GitlabFillerProcessor } from './processor';
import { ConfigReader } from '@backstage/config';

// To write tests
describe('Processor', () => {
    const config = new ConfigReader({
        integrations: {
            gitlab: [
                {
                    host: 'gitlab.com',
                },
            ],
        },
    });
    const processor = new GitlabFillerProcessor(config);

    it('added label', () => {
        expect(processor.getProcessorName()).toEqual('GitlabFillerProcessor');
    });
});
