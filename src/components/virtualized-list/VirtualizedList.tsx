import React, { CSSProperties, ReactNode, RefObject, useEffect, useRef } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { ListChildComponentProps, VariableSizeList } from "react-window";

interface VirtualizedListProps {
    count: number;
    subtractFromHeight?: number;
    defaultRowHeight?: number;
    renderItems: (rowRef: RefObject<HTMLDivElement>, index: number, style?: CSSProperties) => ReactNode;
}

const VirtualizedList: React.FC<VirtualizedListProps> = ({
    count,
    subtractFromHeight,
    defaultRowHeight,
    renderItems,
}) => {
    const listRef = useRef<VariableSizeList>(null);
    const rowHeights = useRef<{ [index: number]: number }>({});

    const getRowHeight = (index: number) =>
        index in rowHeights.current ? rowHeights.current[index] : defaultRowHeight ?? 0;

    const setRowHeight = (index: number, size: number) => {
        listRef.current?.resetAfterIndex(0);
        rowHeights.current = { ...rowHeights.current, [index]: size };
    };

    const Row = ({ index, style }: ListChildComponentProps) => {
        const rowRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            if (rowRef.current) {
                setRowHeight(index, rowRef.current.clientHeight);
            }
        }, [rowRef, index]);

        return <>{renderItems(rowRef, index, style)}</>;
    };

    return (
        <AutoSizer>
            {({ height, width }) => (
                <VariableSizeList
                    height={height - (subtractFromHeight ?? 0)}
                    itemCount={count}
                    itemSize={getRowHeight}
                    ref={listRef}
                    width={width}
                >
                    {Row}
                </VariableSizeList>
            )}
        </AutoSizer>
    );
};

export default VirtualizedList;
