interface RGBARecord {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface RGBATotals {
  [key: string]: number;
}

interface MonoChromatic {
  light: RGBARecord[];
  dark: RGBARecord[];
  original: RGBARecord;
}

const palette = {
  /**
   *
   * @param d <Uint8ClampedArray>
   *        The array values returned from calling getImageData on canvas context
   * @returns <RGBARecord>
   *          A median blend of each pixels rgb value
   */
  blend(d: Uint8ClampedArray): RGBARecord {
    let r = 0;
    let g = 0;
    let b = 0;

    const a = 1;

    for (let i = 0; i < d.length; i += 4) {
      r += d[i];
      g += d[i + 1];
      b += d[i + 2];
    }

    r = Math.floor(r / d.length);
    g = Math.floor(g / d.length);
    b = Math.floor(b / d.length);

    return {
      r,
      g,
      b,
      a,
    };
  },

  /**
   *
   * @param d <Uint8ClampedArray>
   *        The array values returned from calling getImageData on canvas context
   * @returns <RGBARecord>
   *          The rgba values of the most dominant pixel in the provided image
   */
  dominant(d: Uint8ClampedArray): RGBARecord {
    const totals: RGBATotals = {};

    let r = 0,
      g = 0,
      b = 0;

    const a = 1;

    // get each pixel and set each RGB value
    // as the key in the totals record and
    // store running total of each instance of
    // that pixel color
    for (let i = 0; i < d.length - 1; i += 4) {
      r += d[i];
      g += d[i + 1];
      b += d[i + 2];

      const key = `${d[i]}_${d[i + 1]}_${d[i + 2]}_${a}`;

      totals[key] != undefined ? (totals[key] += 1) : 1;
    }

    let largest = 0;
    let rgba = "";

    // find the largest in the totals record
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
  },

  /**
   *
   * @param d <Uint8ClampedArray>
   *        The array values returned from calling getImageData on canvas context
   * @param startingDepth <number>
   *        the
   * @param maxDepth
   * @returns <RGBARecord[]>
   */
  quantize(
    d: Uint8ClampedArray,
    startingDepth = 0,
    maxDepth = 2
  ): RGBARecord[] {
    if (startingDepth >= maxDepth) {
      throw new Error(
        "startingDepth param must be initialized to a value lower than the maxDepth parameter"
      );
    }

    const rgbaData = getRGBValues(d);
    return quantizeRGB(rgbaData, startingDepth, maxDepth);
  },

  /**
   *
   * Using this method can result in CORS issues, so using this
   * pre-built implementation requires the resource server to have the
   * Access-Control-Allow-Origin header present.
   *
   * @param src <string>
   *        The image url
   * @param sizeDividend <number>
   *        The dividend used to resize(but keep aspection ratio in tact) the canvas before being drawn.
   *        This should in most cases be used when the image being analyzed
   *        is decently large(ie. > 1500px) as this will make the quantization
   *        much more performant. Pixel data is sacrificed at the expense of speed
   *        with the final generated palette being most unaffected - within reason.
   * @returns image data <Uint8ClampedArray> | undefined | Error
   */
  async extractImageDataFromSrc(
    src: string,
    sizeDividend: number = 1
  ): Promise<Uint8ClampedArray | undefined | Error> {
    const IMAGE = new Image();
    const CANVAS = document.createElement("canvas");
    const CONTEXT = CANVAS.getContext("2d");

    IMAGE.crossOrigin = "anonymous";
    IMAGE.src = src;

    try {
      await IMAGE.decode();

      CANVAS.width = IMAGE.width / sizeDividend;
      CANVAS.height = IMAGE.height / sizeDividend;

      CONTEXT?.drawImage(IMAGE, 0, 0, CANVAS.width, CANVAS.height);

      return CONTEXT?.getImageData(0, 0, CANVAS.width, CANVAS.height).data;
    } catch {
      throw new Error(`Failed to decode the provided image src: ${src}`);
    }
  },

  /**
   *
   * @param percent <number>
   *        The percent used in shifting the Lightness value of a provided RGB value
   * @param colors <number>
   *        The amount of light and dark monochromatic values returned
   * @param rgb {r,g,b: <number>}
   *        The RGB values to which a monochromatic palette will be generated
   * @returns <MonoChromatic>
   *          light and dark keys includes an array of rgb color values equal
   *          up to the number of colors provided in the param with the color's lightness
   *          value calculated either up or down from the provided percent.
   */
  monochromatic(
    percent: number,
    numOfColors: number = 4,
    rgb: { r: number; g: number; b: number }
  ): MonoChromatic {
    const hsl = RGBToHSL(rgb.r, rgb.g, rgb.b);

    let darkL = hsl[2];
    let lightL = hsl[2];

    const darkVals: Array<number> = [];
    const lightVals: Array<number> = [];

    let i = 0;

    while (i < numOfColors) {
      const offset = Math.round(darkL * (percent / 100));

      darkL = darkL - offset;
      lightL = lightL + offset;

      darkVals.push(darkL);
      lightVals.push(lightL);

      i++;
    }

    const monoChromaticPalette: MonoChromatic = {
      light: [],
      dark: [],
      original: { r: rgb.r, g: rgb.g, b: rgb.b, a: 1 },
    };

    darkVals.forEach((n) => {
      const rgb = HSLToRGB(hsl[0], hsl[1], n);

      monoChromaticPalette.dark.push({
        r: rgb[0],
        g: rgb[1],
        b: rgb[2],
        a: 1,
      });
    });

    lightVals.forEach((n) => {
      const rgb = HSLToRGB(hsl[0], hsl[1], n);

      monoChromaticPalette.light.push({
        r: rgb[0],
        g: rgb[1],
        b: rgb[2],
        a: 1,
      });
    });

    return monoChromaticPalette;
  },

  complimentary(rgb: { r: number; g: number; b: number }): RGBARecord {
    const hsl = RGBToHSL(rgb.r, rgb.g, rgb.b);
    const hue = hsl[0];
    let invertedHue: number;

    if (hue >= 180) {
      invertedHue = hue - 180;
    } else {
      invertedHue = hue + 180;
    }

    const newRGB = HSLToRGB(invertedHue, hsl[1], hsl[2]);

    return {
      r: newRGB[0],
      g: newRGB[1],
      b: newRGB[2],
      a: 1,
    };
  },
};

//////////////////////////////////
/////// HELPERS /////////////////
////////////////////////////////

const RGBToHSL = (r: number, g: number, b: number): Array<number> => {
  r /= 255;
  g /= 255;
  b /= 255;
  const l = Math.max(r, g, b);
  const s = l - Math.min(r, g, b);
  const h = s
    ? l === r
      ? (g - b) / s
      : l === g
      ? 2 + (b - r) / s
      : 4 + (r - g) / s
    : 0;
  return [
    60 * h < 0 ? 60 * h + 360 : 60 * h,
    100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    (100 * (2 * l - s)) / 2,
  ];
};

const HSLToRGB = (h: number, s: number, l: number): Array<number> => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [
    Math.round(255 * f(0)),
    Math.round(255 * f(8)),
    Math.round(255 * f(4)),
  ];
};

const sortByDominantColor = (d: RGBARecord[], key: string): void => {
  d.sort((p1, p2) => {
    return p1[key as keyof RGBARecord] - p2[key as keyof RGBARecord];
  });
};

const getRGBValues = (d: Uint8ClampedArray): RGBARecord[] => {
  const rgbaVals: RGBARecord[] = [];
  for (let i = 0; i < d.length; i += 4) {
    rgbaVals.push({
      r: d[i],
      g: d[i + 1],
      b: d[i + 2],
      a: 1,
    });
  }
  return rgbaVals;
};

const quantizeRGB = (
  d: RGBARecord[],
  startingDepth = 0,
  maxDepth = 2
): RGBARecord[] => {
  if (startingDepth === maxDepth) {
    const color = d.reduce(
      (p, c): RGBARecord => {
        p.r += c.r;
        p.g += c.g;
        p.b += c.b;
        return p;
      },
      { r: 0, g: 0, b: 0, a: 1 }
    );

    return [
      {
        r: Math.round(color.r / d.length),
        g: Math.round(color.g / d.length),
        b: Math.round(color.b / d.length),
        a: 255,
      },
    ];
  }

  const dominantColor = findDominantColorRange(d);

  sortByDominantColor(d, dominantColor);

  const middle = d.length / 2;

  return [
    ...quantizeRGB(d.slice(0, middle), startingDepth + 1, maxDepth),
    ...quantizeRGB(d.slice(middle), startingDepth + 1, maxDepth),
  ];
};

const findDominantColorRange = (rgbaRecords: RGBARecord[]): string => {
  const d = rgbaRecords[0];
  let rMin = d.r,
    rMax = d.r;
  let gMin = d.g,
    gMax = d.g;
  let bMin = d.b,
    bMax = d.b;

  rgbaRecords.forEach((pixel): void => {
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
  } else if (maxRange === gRange) {
    return "g";
  }
  return "b";
};

export default palette;
