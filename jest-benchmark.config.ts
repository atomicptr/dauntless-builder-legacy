import config from "./jest.config";

export default {
    ...config,
    reporters: ["default", "jest-bench/reporter"],
    testEnvironment: "jest-bench/environment",
    testEnvironmentOptions: {
        testEnvironment: "jsdom",
    },
    testRegex: "(\\.bench)\\.(ts|tsx|js)$",
};
