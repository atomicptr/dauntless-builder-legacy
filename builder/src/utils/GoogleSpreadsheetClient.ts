import axios, {AxiosError, AxiosRequestConfig} from "axios";

export interface BatchGetResult {
    [valueRange: string]: string | string[];
}

export interface ValueRange {
    range: string;
    values: string[];
}

export interface SheetDataResult {
    title: string;
    sheets: SheetDataSheet[];
}

export interface SheetDataSheet {
    index: number;
    title: string;
    [ident: string]: unknown;
}

export interface TransformResultResult {
    [identifier: string]: string | string[];
}

export interface TransformExport {
    range: string;
    exportAs: string;
}

const axiosConfig = {
    headers: {
        "Accept-Encoding": "deflate",
        "Accept": "application/json",
    }
} as AxiosRequestConfig;

export class GoogleSpreadsheetClient {
    constructor(private apiKey: string, private spreadsheetId: string) {}

    private get baseUrl(): string {
        return `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}`;
    }

    public async sheetData(_extraSheetProps: string[] = []): Promise<SheetDataResult> {
        const res = (await axios.get(`${this.baseUrl}?key=${this.apiKey}`, axiosConfig)) as {
            status: number;
            statusText: string;
            data: {
                properties: {
                    title: string;
                };
                sheets: {
                    properties: {
                        index: number;
                        title: string;
                    };
                }[];
            };
        };

        if (res.status !== 200) {
            throw Error(`Could not batchGet data from Google Sheets Api: ${res.status} ${res.statusText}`);
        }

        return {
            sheets: res.data.sheets.map(({ properties: { index, title, ..._extraSheetProps } }) => ({
                index,
                title,
                ..._extraSheetProps,
            })),
            title: res.data.properties.title,
        };
    }

    public async batchGet(ranges: string[]) {
        const rangesParam = ranges.map(r => `ranges=${r}`).join("&");

        let res = null;

        try {
            res = await axios.get(
                `${this.baseUrl}/values:batchGet?valueRenderOption=FORMULA&key=${this.apiKey}&` + rangesParam,
                axiosConfig,
            );
        } catch (err) {
            if ((err as AxiosError).response) {
                const res = (err as AxiosError).response;
                throw new Error(
                    `Could not batchGet data from Google Sheets Api: ${res?.status} ${
                        res?.statusText
                    }: ${JSON.stringify(res?.data)}`,
                );
            }
            return {};
        }

        if (res.status !== 200) {
            throw Error(`Could not batchGet data from Google Sheets Api: ${res.status} ${res.statusText}`);
        }

        const result: BatchGetResult = {};

        res.data.valueRanges.forEach((valueRange: ValueRange) => {
            if (!Array.isArray(valueRange.values)) {
                return;
            }
            const value = valueRange.values.flat(10);
            result[valueRange.range] = value.length === 1 ? value[0] : value;
        });

        return result;
    }

    public transformResult(result: BatchGetResult, exportData: TransformExport[]) {
        const newData: TransformResultResult = {};

        const nameByRange = (range: string) => {
            const r = exportData.find(r => r.range === range);
            if (r) {
                return r.exportAs;
            }
            return `UNKNOWN-${range}`;
        };

        for (const entry of exportData) {
            newData[nameByRange(entry.range)] = result[entry.range];
        }

        return newData;
    }
}
