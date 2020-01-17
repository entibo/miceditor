module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  moduleNameMapper: {
    "(data|util)/(.*)": "<rootDir>/src/$1/$2",
  },
};