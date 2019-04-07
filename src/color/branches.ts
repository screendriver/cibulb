export interface Branch {
  name: string;
}

const allowedBranches = ['master', 'develop'];

export function isBranchAllowed(branches: readonly Branch[]): boolean {
  return branches
    .map(({ name }) => name)
    .some(name => allowedBranches.includes(name));
}
