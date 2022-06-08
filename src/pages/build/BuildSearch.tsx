import PageTitle from "@src/components/PageTitle";
import React from "react";
import { useTranslation } from "react-i18next";

const BuildSearch: React.FC = () => {
    const { t } = useTranslation();
    return <PageTitle title={t("pages.buildsearch.title")} />;
};

export default BuildSearch;
