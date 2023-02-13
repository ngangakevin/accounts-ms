/* eslint-disable */
export default {
    displayName: 'accounts-service',
    globals: {
      'ts-jest': {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    },
    transform: {
      '^.+\\.[tj]sx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: './coverage/acccounts-ms',
    moduleNameMapper: {
        "^@common(.*)$": "<rootDir>/src/common/$1",
        "^@configs(.*)$": "<rootDir>/src/configs/$1",
        "^@entities(.*)$": "<rootDir>/src/entities/$1",
        "^@enums(.*)$": "<rootDir>/src/enums/$1"
      }
  };
  