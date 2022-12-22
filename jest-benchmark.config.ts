import config from "./jest.config";

export default {
    ...config,
    testEnvironment: "jest-bench/environment",
    testEnvironmentOptions: {
        testEnvironment: "jsdom",
    },
    reporters: ["default", "jest-bench/reporter"],
    testRegex: "(\\.bench)\\.(ts|tsx|js)$",
};
