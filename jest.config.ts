export default {
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    extensionsToTreatAsEsm: [".ts", ".tsx"],
    moduleFileExtensions: ["js", "ts", "tsx"],
    moduleNameMapper: {
        "^@json(.*)$": "<rootDir>/src/json$1",
        "^@src(.*)$": "<rootDir>/src$1",
    },
    preset: "ts-jest",
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                useESM: true,
            },
        ],
    },
};
