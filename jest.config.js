module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"
  },
  testMatch: [
    "<rootDir>/**/__tests__/**/*.(js|jsx|ts|tsx)",
    "<rootDir>/**/*.(test|spec).(js|jsx|ts|tsx)"
  ],
  collectCoverageFrom: [
    "**/*.(ts|tsx)",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**"
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};