import Bottleneck from "bottleneck";

// Rate limiters for translation and vision requests
export const characterLimiter = new Bottleneck({
  minTime: (60 * 1000) / 6000000, // limits characters processed per minute
  maxConcurrent: 5,
});

export const requestLimiter = new Bottleneck({
  minTime: (60 * 1000) / 6000, // limits translation requests per minute
  maxConcurrent: 10,
});

export const visionLimiter = new Bottleneck({
  minTime: (60 * 1000) / 1800, // limits vision API requests per minute
  maxConcurrent: 10,
});

export const memortIntensivLimiter = new Bottleneck({
  maxConcurrent: 10,
});
