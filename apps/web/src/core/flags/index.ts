export interface FeatureFlags {
  orientation_mandatory: boolean;
  framed_journal_prompts: boolean;
  action_templates: boolean;
  audio_loops: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  orientation_mandatory: false,
  framed_journal_prompts: true,
  action_templates: true,
  audio_loops: true,
};

export class FeatureFlagService {
  private flags: FeatureFlags = { ...DEFAULT_FLAGS };

  get<K extends keyof FeatureFlags>(flag: K): FeatureFlags[K] {
    return this.flags[flag];
  }

  getAll(): FeatureFlags {
    return { ...this.flags };
  }

  overrideFlags(newFlags: Partial<FeatureFlags>): void {
    this.flags = { ...this.flags, ...newFlags };
  }
}

export const featureFlags = new FeatureFlagService();
