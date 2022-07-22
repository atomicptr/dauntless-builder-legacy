import { BuildModel } from "@src/data/BuildModel";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NewBuild: React.FC = () => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate(`/b/${BuildModel.empty().serialize()}`);
    });
    return null;
};

export default NewBuild;
