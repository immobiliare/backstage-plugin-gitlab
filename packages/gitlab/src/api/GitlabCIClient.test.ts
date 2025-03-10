import { GitlabCIClient } from './GitlabCIClient';
import {
    DiscoveryApi,
    IdentityApi,
    OAuthApi,
} from '@backstage/core-plugin-api';

describe('GitlabCIClient', () => {
    const mockDiscoveryApi: jest.Mocked<DiscoveryApi> = {
        getBaseUrl: jest.fn(),
    };

    const mockIdentityApi: jest.Mocked<IdentityApi> = {
        getCredentials: jest.fn(),
        signOut: jest.fn(),
        getProfileInfo: jest.fn(),
        getBackstageIdentity: jest.fn(),
    };

    const mockGitlabAuthApi: jest.Mocked<OAuthApi> = {
        getAccessToken: jest.fn(),
    };

    const defaultOptions = {
        discoveryApi: mockDiscoveryApi,
        identityApi: mockIdentityApi,
        gitlabAuthApi: mockGitlabAuthApi,
        gitlabInstance: 'gitlab.com',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        mockDiscoveryApi.getBaseUrl.mockResolvedValue('http://localhost:7007');
        mockIdentityApi.getCredentials.mockResolvedValue({
            token: 'fake-token',
        });
    });

    describe('constructor', () => {
        it('should initialize with default values', () => {
            const client = new GitlabCIClient(defaultOptions);
            expect(client.codeOwnersPath).toBe('CODEOWNERS');
            expect(client.readmePath).toBe('README.md');
            expect(client.useOAth).toBe(false);
            expect(client.cacheTTL).toBe(undefined);
        });

        it('should initialize with custom values', () => {
            const client = new GitlabCIClient({
                ...defaultOptions,
                codeOwnersPath: 'custom/OWNERS',
                readmePath: 'docs/README.md',
                useOAuth: true,
                cache: {
                    enabled: true,
                    ttl: 1,
                },
            });

            expect(client.codeOwnersPath).toBe('custom/OWNERS');
            expect(client.readmePath).toBe('docs/README.md');
            expect(client.useOAth).toBe(true);
            expect(client.cacheEnabled).toBe(true);
            expect(client.cacheTTL).toBe(1000);
        });
    });

    describe('API Methods', () => {
        let client: GitlabCIClient;
        const mockFetch = jest.fn();

        beforeEach(() => {
            client = new GitlabCIClient({
                ...defaultOptions,
                httpFetch: mockFetch,
            });
            mockFetch.mockReset();
        });

        describe('getPipelineSummary', () => {
            it('should return pipeline summary with project name', async () => {
                const mockProject = { name: 'Test Project' };
                const mockPipelines = [{ id: 1 }];

                mockFetch
                    .mockResolvedValueOnce({
                        status: 200,
                        headers: { get: () => 'application/json' },
                        json: () => Promise.resolve(mockProject),
                    })
                    .mockResolvedValueOnce({
                        status: 200,
                        headers: { get: () => 'application/json' },
                        json: () => Promise.resolve(mockPipelines),
                    });

                const result = await client.getPipelineSummary('123');
                expect(result?.[0]).toEqual({
                    id: 1,
                    project_name: 'Test Project',
                });
            });
        });

        describe('getIssuesSummary', () => {
            it('should return issues with project name', async () => {
                const mockProject = { name: 'Test Project' };
                const mockIssues = [{ id: 1 }];

                mockFetch
                    .mockResolvedValueOnce({
                        status: 200,
                        headers: { get: () => 'application/json' },
                        json: () => Promise.resolve(mockProject),
                    })
                    .mockResolvedValueOnce({
                        status: 200,
                        headers: { get: () => 'application/json' },
                        json: () => Promise.resolve(mockIssues),
                    });

                const result = await client.getIssuesSummary('123');
                expect(result?.[0]).toEqual({
                    id: 1,
                    project_name: 'Test Project',
                });
            });
        });

        describe('getCodeOwners', () => {
            it('should parse and return code owners', async () => {
                const mockCodeOwners = '* @user1 @user2';
                const mockUser1 = { username: 'user1', name: 'User 1' };
                const mockUser2 = { username: 'user2', name: 'User 2' };

                mockFetch
                    .mockResolvedValueOnce({
                        status: 200,
                        headers: { get: () => 'text/plain' },
                        text: () => Promise.resolve(mockCodeOwners),
                    })
                    .mockResolvedValueOnce({
                        status: 200,
                        headers: { get: () => 'application/json' },
                        json: () => Promise.resolve([mockUser1]),
                    })
                    .mockResolvedValueOnce({
                        status: 200,
                        headers: { get: () => 'application/json' },
                        json: () => Promise.resolve([mockUser2]),
                    });

                const result = await client.getCodeOwners('123');
                expect(result).toHaveLength(2);
            });
        });

        describe('getReadme', () => {
            it('should return readme content', async () => {
                const mockReadme = '# Test Project';

                mockFetch.mockResolvedValueOnce({
                    status: 200,
                    headers: { get: () => 'text/plain' },
                    text: () => Promise.resolve(mockReadme),
                });

                const result = await client.getReadme('123');
                expect(result).toBe(mockReadme);
            });
        });

        describe('getMergeRequestsSummary', () => {
            it('should return merge requests', async () => {
                const mockMRs = [{ id: 1, title: 'Test MR' }];

                mockFetch.mockResolvedValueOnce({
                    status: 200,
                    headers: { get: () => 'application/json' },
                    json: () => Promise.resolve(mockMRs),
                });

                const result = await client.getMergeRequestsSummary('123');
                expect(result).toEqual(mockMRs);
            });
        });

        describe('getContributorsSummary', () => {
            it('should return contributors with user profiles', async () => {
                const mockContributors = [
                    { email: 'test@test.com', name: 'Test User' },
                ];
                const mockUser = { username: 'testuser', name: 'Test User' };

                mockFetch
                    .mockResolvedValueOnce({
                        status: 200,
                        headers: { get: () => 'application/json' },
                        json: () => Promise.resolve(mockContributors),
                    })
                    .mockResolvedValueOnce({
                        status: 200,
                        headers: { get: () => 'application/json' },
                        json: () => Promise.resolve([mockUser]),
                    });

                const result = await client.getContributorsSummary('123');
                expect(result).toBeDefined();
                expect(result?.[0]).toMatchObject(mockContributors[0]);
            });
        });

        describe('getLanguagesSummary', () => {
            it('should return languages statistics', async () => {
                const mockLanguages = { JavaScript: 80, TypeScript: 20 };

                mockFetch.mockResolvedValueOnce({
                    status: 200,
                    headers: { get: () => 'application/json' },
                    json: () => Promise.resolve(mockLanguages),
                });

                const result = await client.getLanguagesSummary('123');
                expect(result).toEqual(mockLanguages);
            });
        });

        describe('getReleasesSummary', () => {
            it('should return releases', async () => {
                const mockReleases = [{ tag_name: 'v1.0.0' }];

                mockFetch.mockResolvedValueOnce({
                    status: 200,
                    headers: { get: () => 'application/json' },
                    json: () => Promise.resolve(mockReleases),
                });

                const result = await client.getReleasesSummary('123');
                expect(result).toEqual(mockReleases);
            });
        });
        describe('getTags', () => {
            it('should return tags', async () => {
                const mockTags = [{ message: '1.0.0' }];

                mockFetch.mockResolvedValueOnce({
                    status: 200,
                    headers: { get: () => 'application/json' },
                    json: () => Promise.resolve(mockTags),
                });

                const result = await client.getReleasesSummary('123');
                expect(result).toEqual(mockTags);
            });
        });
    });

    describe('Cache handling', () => {
        let client: GitlabCIClient;
        const mockFetch = jest.fn();
        global.fetch = mockFetch;

        beforeEach(() => {
            client = new GitlabCIClient({
                ...defaultOptions,
                cache: {
                    enabled: true,
                    ttl: 1,
                },
            });
            mockFetch.mockReset();
        });

        it('should cache successful responses', async () => {
            const mockResponse = { data: 'test' };
            mockFetch.mockResolvedValueOnce({
                status: 200,
                headers: { get: () => 'application/json' },
                json: () => Promise.resolve(mockResponse),
            });

            await client.getProjectDetails('test/project');
            await client.getProjectDetails('test/project');

            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        it('should invalidate cache after TTL expires', async () => {
            const mockResponse = { data: 'test' };
            const timer = jest.useFakeTimers();
            mockFetch.mockResolvedValue({
                status: 200,
                headers: { get: () => 'application/json' },
                json: () => Promise.resolve(mockResponse),
            });

            await client.getProjectDetails('test/project');

            // Move time forward past TTL
            timer.advanceTimersByTime(1500);

            await client.getProjectDetails('test/project');

            expect(mockFetch).toHaveBeenCalledTimes(2);
        });
    });
});
