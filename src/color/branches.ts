const allowedBranches = ['master', 'develop'];

export function isBranchAllowed(branch: string): boolean {
  return allowedBranches.some(allowed => branch.includes(allowed));
}
