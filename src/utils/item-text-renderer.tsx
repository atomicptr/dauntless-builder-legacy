export const renderItemText = (text: string) => (
    <span
        dangerouslySetInnerHTML={{
            __html: text.trim().replace(/\{\{NL}}/g, "<br/>"),
        }}></span>
);
