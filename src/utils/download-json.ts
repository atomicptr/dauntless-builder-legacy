export const downloadJsonObject = (data: unknown, fileName: string) => {
    const jsonString = JSON.stringify(data, null, "    ");
    const dataString = `data:text/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
    return {
        component: "a",
        download: `${fileName}.${Date.now()}.json`,
        href: dataString,
    };
};
