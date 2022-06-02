import React from "react";
import { useTranslation } from "react-i18next";

import PageTitle from "../../components/page-title/PageTitle";

const NewBuild: React.FC = () => {
    const { t } = useTranslation();
    return <PageTitle
        title={t("pages.newbuild.title")} />;
};

export default NewBuild;
