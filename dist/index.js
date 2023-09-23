"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let IMAGE, CANVAS, CONTEXT;
const SIZE_DIVIDEND = 50;
const DUMMY_DATA = [
    {
        r: 55,
        g: 109,
        b: 204,
        a: 255,
    },
    {
        r: 128,
        g: 86,
        b: 135,
        a: 255,
    },
    {
        r: 69,
        g: 56,
        b: 100,
        a: 255,
    },
    {
        r: 125,
        g: 131,
        b: 224,
        a: 255,
    },
    {
        r: 187,
        g: 153,
        b: 223,
        a: 255,
    },
    {
        r: 221,
        g: 126,
        b: 151,
        a: 255,
    },
    {
        r: 246,
        g: 185,
        b: 205,
        a: 255,
    },
    {
        r: 21,
        g: 21,
        b: 39,
        a: 255,
    },
];
// just a dummy src for now
const SRC = "https://dev-blog-resources.s3.amazonaws.com/wavy-yellow-compressed2.jpg";
const initialize = () => __awaiter(void 0, void 0, void 0, function* () {
    IMAGE = new Image();
    CANVAS = document.createElement("canvas");
    CONTEXT = CANVAS.getContext("2d");
    IMAGE.crossOrigin = "anonymous";
    IMAGE.src = SRC;
    // load image
    yield IMAGE.decode();
    setCanvasHeightAndWidth();
    CONTEXT === null || CONTEXT === void 0 ? void 0 : CONTEXT.drawImage(IMAGE, 0, 0, CANVAS.width, CANVAS.height);
    const data = CONTEXT === null || CONTEXT === void 0 ? void 0 : CONTEXT.getImageData(0, 0, CANVAS.width, CANVAS.height).data;
    if (data && data.length) {
        const rgba = getRGBValues(data);
        const palette = quanitizeRGB(rgba);
        console.log("palette: ", palette);
    }
    else {
        throw new Error("image data unavailable");
    }
});
const setCanvasHeightAndWidth = () => {
    CANVAS.width = IMAGE.width / SIZE_DIVIDEND;
    CANVAS.height = IMAGE.height / SIZE_DIVIDEND;
};
const quanitizeRGB = (d, startingDepth = 0, maxDepth = 2) => {
    if (startingDepth === maxDepth) {
        const color = d.reduce((p, c) => {
            p.r += c.r;
            p.g += c.g;
            p.b += c.b;
            return p;
        }, { r: 0, g: 0, b: 0, a: 255 });
        return [
            {
                r: Math.round(color.r / d.length),
                g: Math.round(color.g / d.length),
                b: Math.round(color.b / d.length),
                a: 255,
            }
        ];
    }
    const dominantColor = findDominantColorRange(d);
    sortByDominantColor(d, dominantColor);
    const middle = d.length / 2;
    return [
        ...quanitizeRGB(d.slice(0, middle), startingDepth + 1, maxDepth),
        ...quanitizeRGB(d.slice(middle), startingDepth + 1, maxDepth)
    ];
};
const sortByDominantColor = (d, key) => {
    d.sort((p1, p2) => {
        return p1[key] - p2[key];
    });
};
const getRGBValues = (d) => {
    const rgbaVals = [];
    for (let i = 0; i < d.length; i += 4) {
        rgbaVals.push({
            r: d[i],
            g: d[i + 1],
            b: d[i + 2],
            a: 255,
        });
    }
    return rgbaVals;
};
const findDominantColorRange = (rgbaRecords) => {
    const d = rgbaRecords[0];
    let rMin = d.r, rMax = d.r;
    let gMin = d.g, gMax = d.g;
    let bMin = d.b, bMax = d.b;
    rgbaRecords.forEach((pixel) => {
        rMin = Math.min(rMin, pixel.r);
        gMin = Math.min(gMin, pixel.g);
        bMin = Math.min(bMin, pixel.b);
        rMax = Math.max(rMax, pixel.r);
        gMax = Math.max(gMax, pixel.g);
        bMax = Math.max(bMax, pixel.b);
    });
    const rRange = rMax - rMin;
    const gRange = gMax - gMin;
    const bRange = bMax - bMin;
    const maxRange = Math.max(rRange, gRange, bRange);
    if (maxRange === rRange) {
        return "r";
    }
    else if (maxRange === gRange) {
        return "g";
    }
    return "b";
};
const medianColorBlend = (d) => {
    let r = 0;
    let g = 0;
    let b = 0;
    const a = 255;
    for (let i = 0; i < d.length; i += 4) {
        r += d[i];
        g += d[i + 1];
        b += d[i + 2];
    }
    console.log(r, g, b);
    r = Math.floor(r / d.length);
    g = Math.floor(g / d.length);
    b = Math.floor(b / d.length);
    return {
        r,
        g,
        b,
        a,
    };
};
;
const dominantColor = (d) => {
    const totals = {};
    let r = 0;
    let g = 0;
    let b = 0;
    const a = 255;
    for (let i = 0; i < d.length - 1; i += 4) {
        r += d[i];
        g += d[i + 1];
        b += d[i + 2];
        const key = `${d[i]}_${d[i + 1]}_${d[i + 2]}_${a}`;
        if (totals[key] === undefined) {
            totals[key] = 1;
        }
        else {
            totals[key] += 1;
        }
    }
    let largest = 0;
    let rgba = "";
    for (const c of Object.keys(totals)) {
        if (totals[c] > largest) {
            largest = totals[c];
            rgba = c;
        }
    }
    const split = rgba.split("_");
    r = parseInt(split[0]);
    g = parseInt(split[1]);
    b = parseInt(split[2]);
    return {
        r,
        g,
        b,
        a,
    };
};
initialize();
