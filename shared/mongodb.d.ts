export interface Repository {
  name: string;
  state: 'pending' | 'failure' | 'error' | 'success';
}
