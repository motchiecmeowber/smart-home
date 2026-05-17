export const REDIS_KEYS = {
  blacklist: (token: string) => `blacklist:${token}`,

  refreshToken: (token: string) => `refreshToken:${token}`,

  loginAttempts: (identifier: string) => `loginAttempts:${identifier}`,
  tbToken: "tb:token",
};