import { expect } from 'chai';
import { Repository } from '../../../api/shared/mongodb';
import { getRepositoriesStatus } from '../../../api/shared/repositories';

describe('repositories', () => {
  it('returns "success" when repositories are empty', () => {
    const status = getRepositoriesStatus([]);
    expect(status).to.equal('success');
  });

  it('returns "success" when all repositories are in status "success"', () => {
    const repositories: Repository[] = [
      { name: 'repoA', status: 'success' },
      { name: 'repoB', status: 'success' },
    ];
    const status = getRepositoriesStatus(repositories);
    expect(status).to.equal('success');
  });

  it('returns "pending" when one repository is in status "pending"', () => {
    const repositories: Repository[] = [
      { name: 'repoA', status: 'success' },
      { name: 'repoB', status: 'failed' },
      { name: 'repoC', status: 'pending' },
    ];
    const status = getRepositoriesStatus(repositories);
    expect(status).to.equal('pending');
  });

  it('returns "pending" when one repository is in status "running"', () => {
    const repositories: Repository[] = [
      { name: 'repoA', status: 'success' },
      { name: 'repoB', status: 'failed' },
      { name: 'repoC', status: 'running' },
    ];
    const status = getRepositoriesStatus(repositories);
    expect(status).to.equal('pending');
  });

  it('returns "failed" when one repository is in status "failed"', () => {
    const repositories: Repository[] = [
      { name: 'repoA', status: 'success' },
      { name: 'repoB', status: 'failed' },
    ];
    const status = getRepositoriesStatus(repositories);
    expect(status).to.equal('failed');
  });
});
