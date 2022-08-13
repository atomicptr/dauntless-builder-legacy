export const dec2hex = (dec: string) => Number(parseInt(dec, 10)).toString(16).toUpperCase();

export interface Color {
    red: number;
    green: number;
    blue: number;
}

export const color2hex = (color: Color) => {
    const r = dec2hex(Math.floor(color.red * 255).toString());
    const g = dec2hex(Math.floor(color.green * 255).toString());
    const b = dec2hex(Math.floor(color.blue * 255).toString());
    return "#" + r + g + b;
};
