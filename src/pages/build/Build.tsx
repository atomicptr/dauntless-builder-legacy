import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageTitle from "../../components/page-title/PageTitle";
import { BuildModel } from "../../data/BuildModel";

const Build: React.FC = () => {
    const { buildId } = useParams();

    const navigate = useNavigate();

    if (!buildId) {
        navigate("/b/new");
        return null;
    }

    const build = BuildModel.tryDeserialize(buildId);

    return (
        <div>
            <PageTitle title={`${build.weaponName} Build`} />

            <img
                alt={build.weaponName ?? undefined}
                src={build.data.weapon?.icon}
            />
        </div>
    );
};

export default Build;
