import rateLimit from "express-rate-limit";

export const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 2, // limit each IP to 2 requests per minute
  message: {
    error:
      "Too many AI generation requests. Please wait a minute and try again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
