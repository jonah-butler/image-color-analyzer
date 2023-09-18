// const IMAGE = new Image();
// const CANVAS: HTMLCanvasElement;
// const CONTEXT = CANVAS.getContext("2d");
let IMAGE: HTMLImageElement,
  CANVAS: HTMLCanvasElement,
  CONTEXT: CanvasRenderingContext2D | null;

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
  const data = CONTEXT?.getImageData(0, 0, CANVAS.width, CANVAS.height);
  console.log("data: ", data);
};

const setCanvasHeightAndWidth = (): void => {
  CANVAS.width = IMAGE.width;
  CANVAS.height = IMAGE.height;
};

initialize();
