import { FeatureItem, FeatureName } from '@/types/features/spaceFeatures';

export const dodaoFeatures: FeatureItem[] = [
  {
    featureName: FeatureName.Guides,
    enabled: true,
    details: {
      priority: 90,
    },
  },
  {
    featureName: FeatureName.Courses,
    enabled: true,
    details: {
      priority: 80,
    },
  },
  {
    featureName: FeatureName.Bytes,
    enabled: true,
    details: {
      priority: 70,
    },
  },
  {
    featureName: FeatureName.Timelines,
    enabled: true,
    details: {
      priority: 60,
    },
  },
];
