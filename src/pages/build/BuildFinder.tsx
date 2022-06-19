import PageTitle from "@src/components/PageTitle";
import React from "react";
import { useTranslation } from "react-i18next";

const BuildFinder: React.FC = () => {
    const { t } = useTranslation();
    return <PageTitle title={t("pages.build-finder.title")} />;
};

export default BuildFinder;
