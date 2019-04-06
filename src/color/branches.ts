export interface Branch {
  name: string;
}

export function isMasterBranch(branches: readonly Branch[]): boolean {
  return branches.map(({ name }) => name).includes('master');
}
