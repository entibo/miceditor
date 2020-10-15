module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  moduleNameMapper: {
    "(data|util|stores)/(.*)": "<rootDir>/src/$1/$2",
  },
};