export interface Branch {
  name: string;
}

export function isMasterBranch(branches: ReadonlyArray<Branch>): boolean {
  return branches.map(({ name }) => name).includes('master');
}
