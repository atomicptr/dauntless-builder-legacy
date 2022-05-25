import React from "react";
import { useParams } from "react-router-dom";

const Build: React.FC = () => {
    const { buildId } = useParams();

    return <h2>Build: {buildId}</h2>;
};

export default Build;
