import React from "react";
import { useNavigate, useParams } from "react-router-dom";
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
            <h2>Weapon: {build.weaponName}</h2>
            <img src={build.data.weapon?.icon} />
        </div>
    );
};

export default Build;
