import { assetsCdnPrefix } from "@src/constants";

export const assetUrl = (path: string) => `${assetsCdnPrefix}${path.startsWith("/") ? path : "/" + path}?build=${DB_BUILD_TIME}`;
