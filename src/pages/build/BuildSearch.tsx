import PageTitle from "@src/components/page-title/PageTitle";
import React from "react";
import { useTranslation } from "react-i18next";

const BuildSearch: React.FC = () => {
    const { t } = useTranslation();
    return <PageTitle
        title={t("pages.buildsearch.title")} />;
};

export default BuildSearch;
