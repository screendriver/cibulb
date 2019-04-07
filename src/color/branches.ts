export interface Branch {
  name: string;
}

const allowedBranches = ['master', 'develop'];

export function isMasterBranch(branches: readonly Branch[]): boolean {
  return branches
    .map(({ name }) => name)
    .some(name => allowedBranches.includes(name));
}
