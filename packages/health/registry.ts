export type DependencyTier = 1 | 2;

export interface Dependency {
  name: string;
  tier: DependencyTier;
  cacheTtlMs: number;
  timeoutMs: number;
  probe: () => Promise<boolean>;
}

export interface DependencyResult {
  name: string;
  tier: DependencyTier;
  healthy: boolean;
  latencyMs: number;
  lastChecked: string;
  error?: string;
}
