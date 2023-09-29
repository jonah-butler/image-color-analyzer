# Palette

Generate various RGBA color palettes based on image pixel data

## Installing

```shell
npm i @jayimbee/palette
```

## Example

```typescript
import palette from @jaimbee/palette;


const imgData = palette.extractImageDataFromSrc('https://some.site.com/godzilla.png', 3);

const imageColorPalette = palette.quantize(imgData);

console.log(imageColorPalette);
//
//     [
//      {
//        r: 123,
//        g: 145,
//        b: 12,
//        a: 255
//       }
//       ...
//     ]
```

# Methods

### 🎨 `blend`

Type: `Function`

Description: _returns a single blend of all pixel color values_

⚙️ Params

- d `<Uint8ClampedArray>`: value returned from a canvas context calling `.getImageData().data`

### 📦 Returns

```typescript
<RGBARecord>

interface RGBARecord {
  r: number;
  g: number;
  b: number;
  a: number;
}
```

### 🛠️ Usage

```typescript
const imgData = palette.extractImageDataFromSrc(imgURL, 3);

palette.blend(imgData);
```

---

### 🎨 `dominant`

Type: `Function`

Description: _returns the most reoccurring pixel color_

⚙️ Params

- d `<Uint8ClampedArray>`: value returned from a canvas context calling `.getImageData().data`

### 🛠️ Usage

```typescript
const imgData = palette.extractImageDataFromSrc(imgURL, 3);

palette.dominant(imgData);
```

### 📦 Returns

```typescript
<RGBARecord>

interface RGBARecord {
  r: number;
  g: number;
  b: number;
  a: number;
}
```

---

### 🎨 `quantize`

Type: `Function`

Description: _using the median cut algorithm, this returns an array of colors selected through finding the dominant color range and quantizing the color sets until the provided max depth is reached_

⚙️ Params

- d `<Uint8ClampedArray>`
  - value returned from a canvas context calling `.getImageData().data`
- startingDepth `<number>`
  - _default set to 0_
- maxDepth `<number>`
  - _default set to 2_

### 🛠️ Usage

```typescript
const imgData = palette.extractImageDataFromSrc(imgURL, 3);

palette.quantize(imgData);
```

### 📦 Returns

```typescript
<RGBARecord>[];

interface RGBARecord {
  r: number;
  g: number;
  b: number;
  a: number;
}
```

---

### 🎨 `extractImageDataFromSrc`

Type: `Function`

Description: _returns the most reocurring pixel color_

⚙️ Params

- src `<string>`
  - an image src
- sizeDividend `<number>`

  - default set to `1`
  - this is primarily for making the median cut algorithm more performant by reducing image size while keeping aspect ration in tact. Very large images require a lot of processing, so supplying a size dividend can speed up this palette generating process while keeping the final palette that is generated mostly unaffected within reason.
  - A custom implementation can utilize a size dividend by dividing the `CANVAS.width` and `CANVAS.height` by some number:

  ```typescript
  const IMAGE = new Image();
  const CANVAS = document.createElement("canvas");

  IMAGE.src = src;

  await IMAGE.decode();

  CANVAS.width = IMAGE.width / sizeDividend;
  CANVAS.height = IMAGE.height / sizeDividend;
  ```

🚨 Calling `getImageData` on an Image that's loaded with a source that is cross-origin is known to create CORS issues via the _tainted canvas_ error. This helper is here to simplify the process of getting image data, but a custom implementation of this may be a better solution for some. Things to note with this function is the resource server handling the requested image must include the response header: `Access-Control-Allow-Origin`.

🛑 If `.quantize()` is running too slow, reduce the size of the image as show above

### 🛠️ Usage

```typescript
palette.extractImageDataFromSrc(imgData);
```

### 📦 Returns

```
<Uint8ClampedArray>
```

---

### 🎨 `monochromatic`

Type: `Function`

Description:_returns a monochromatic object with colors ranginng in a spectrum from dark to light_

⚙️ Params

- d `<Uint8ClampedArray>`
  - value returned from a canvas context calling `.getImageData().data`
- numOfColors: <number>
  - default set to `4`
  - the amount of returned monochromatic colors
- rgb: `{r: number, g: number, b: number}`

  - an object containing the fields `r, g, b`

### 🛠️ Usage

```typescript
const imgData = palette.extractImageDataFromSrc(imgURL, 3);

palette.monochromatic(imgData);
```

### 📦 Returns

```typescript

<MonoChromatic>

interface RGBARecord {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface MonoChromatic {
  light: RGBARecord[];
  dark: RGBARecord[];
  original: RGBARecord;
}
```
