import PageTitle from "@src/components/page-title/PageTitle";
import React from "react";
import { useTranslation } from "react-i18next";

const MetaBuilds: React.FC = () => {
    const { t } = useTranslation();
    return <PageTitle
        title={t("pages.metabuilds.title")} />;
};

export default MetaBuilds;
