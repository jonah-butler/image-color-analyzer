// const IMAGE = new Image();
// const CANVAS: HTMLCanvasElement;
// const CONTEXT = CANVAS.getContext("2d");
let IMAGE: HTMLImageElement,
  CANVAS: HTMLCanvasElement,
  CONTEXT: CanvasRenderingContext2D | null;

interface RGBARecord {
  r: number;
  g: number;
  b: number;
  a: number;
}

// just a dummy src for now
const SRC =
  "https://dev-blog-resources.s3.amazonaws.com/canvas_1691764016404.png";

const initialize = async (): Promise<void> => {
  IMAGE = new Image();
  CANVAS = document.createElement("canvas");
  CONTEXT = CANVAS.getContext("2d");

  IMAGE.crossOrigin = "anonymous";

  IMAGE.src = SRC;

  // load image
  await IMAGE.decode();

  setCanvasHeightAndWidth();

  console.log("IMAGE: ", IMAGE);

  CONTEXT?.drawImage(IMAGE, 0, 0, CANVAS.width, CANVAS.height);
  const data = CONTEXT?.getImageData(0, 0, CANVAS.width, CANVAS.height).data;
  if (data) {
    const cd = medianColorBlend(data);
    console.log(`rgba(${cd.r}, ${cd.g}, ${cd.b}, ${cd.a})`);
  }
};

const setCanvasHeightAndWidth = (): void => {
  CANVAS.width = IMAGE.width;
  CANVAS.height = IMAGE.height;
};

const medianColorBlend = (d: Uint8ClampedArray): RGBARecord => {
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

initialize();
