export const adsEnabled = (): boolean => {
    return DB_ENABLE_ADS && DB_PW_PUBLISHER_ID !== null && DB_PW_WEBSITE_ID !== null;
};
