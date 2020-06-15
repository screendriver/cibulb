const allowedBranches = ['master', 'develop', 'main'];

export function isBranchAllowed(branch: string): boolean {
  return allowedBranches.some((allowed) => branch.includes(allowed));
}
