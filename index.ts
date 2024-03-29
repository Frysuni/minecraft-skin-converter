import {
  Canvas,
  CanvasRenderingContext2D,
  createCanvas,
  Image,
  loadImage,
} from 'canvas';
import Sharp = require('sharp');
import { Buffer } from 'buffer';

type skinHeadSizeType =
  | 8
  | 16
  | 32
  | 64
  | 128
  | 256
  | 512
  | 1024
  | 2048
  | 4096
  | 8128;
type ConverterReturnType = 'base64/png' | 'buffer/png';
type GetReturnDataType<T extends ConverterReturnType> = T extends 'buffer/png'
  ? Buffer
  : string;

export class MinecraftSkinConverter<ReturnType extends ConverterReturnType> {
  public isSlim: boolean;
  private canvas: Canvas;
  private ctx: CanvasRenderingContext2D;
  private abstractScale: number;

  /**
   * @param skinpath `URL`, `URI` or local filesystem path
   * @param returnType In what format will the skins be returned.
   * @param returnType `string(base64)` or `Buffer`. **Only always png.**
   */
  constructor(
    private skinpath: string | Buffer,
    private returnType: ReturnType,
  ) {
    if (typeof this.skinpath != 'string' && !Buffer.isBuffer(skinpath)) {
      throw 'MINECRAFT-SKIN-CONVERTER: skinpath must be type of string or Buffer';
    }

    if (this.returnType != 'buffer/png' && this.returnType != 'base64/png') {
      throw 'MINECRAFT-SKIN-CONVERTER: returnType must be "buffer/png" or "base64/png"';
    }
  }

  public async convertSkin(): Promise<{
    slim: boolean;
    hd: boolean;
    skinpath: string | Buffer;
    dataType: ReturnType;
    data: GetReturnDataType<ReturnType>;
  }> {
    const sourceSkin = await loadImage(this.skinpath).catch((e) => {
      throw (
        'MINECRAFT-SKIN-CONVERTER: unexpected error while loading the image: ' +
        e
      );
    });
    this.checkSizes(sourceSkin);

    const format = this.getFormat(sourceSkin);
    this.abstractScale = format.abstractScale;

    this.canvas = createCanvas(sourceSkin.width, sourceSkin.width);
    this.ctx = this.canvas.getContext('2d');

    this.ctx.drawImage(sourceSkin, 0, 0);
    this.fixOpaque(format.square);

    if (!format.square) this.convertToSquare();

    this.isSlim = this.checkSlim();

    this.clearUnusedArea(format.square);

    const data: string | Buffer =
      this.returnType === 'buffer/png'
        ? this.canvas.toBuffer('image/png')
        : this.canvas.toDataURL('image/png');

    return {
      slim: this.isSlim,
      hd: format.hd,
      skinpath: this.skinpath,
      dataType: this.returnType,
      data: data as GetReturnDataType<ReturnType>,
    };
  }

  public async getSkinHead(size: skinHeadSizeType = 8): Promise<{
    size: skinHeadSizeType;
    skinpath: string | Buffer;
    dataType: ReturnType;
    data: GetReturnDataType<ReturnType>;
  }> {
    if (size < 8) {
      throw 'MINECRAFT-SKIN-CONVERTER: the size of the head must be equal to or more than eight';
    }

    const sourceSkin = await loadImage(this.skinpath);
    this.checkSizes(sourceSkin);

    const oneHead = sourceSkin.width / 8;

    this.canvas = createCanvas(oneHead, oneHead);
    this.ctx = this.canvas.getContext('2d');

    const transparentHat = this.getTransparentHat(sourceSkin);
    this.ctx.drawImage(sourceSkin, -oneHead, -oneHead);

    this.ctx.drawImage(transparentHat, 0, 0);

    const imageBuffer = await Sharp(this.canvas.toBuffer('image/png'))
      .resize(size, size, { kernel: Sharp.kernel.nearest })
      .toBuffer();

    const data: string | Buffer =
      this.returnType == 'base64/png'
        ? 'data:image/png;base64,' + imageBuffer.toString('base64')
        : imageBuffer;

    return {
      size: size,
      skinpath: this.skinpath,
      dataType: this.returnType,
      data: data as GetReturnDataType<ReturnType>,
    };
  }

  private checkSizes(image: Image): void {
    if (
      image.naturalWidth != image.width ||
      image.naturalHeight != image.height
    ) {
      throw 'MINECRAFT-SKIN-CONVERTER: The natural size of the image is not equal to the size of the attribute.';
    }

    if (
      image.width % 2 != 0 ||
      image.height % 2 != 0 ||
      (image.width / 64) % 1 != 0 ||
      (image.height / 32) % 1 != 0 ||
      (image.width != image.height && image.width / image.height != 2)
    ) {
      throw `MINECRAFT-SKIN-CONVERTER: Wrong image size. Recived: ${image.width}x${image.height}`;
    }

    return;
  }

  private getFormat(image: Image): {
    hd: boolean;
    square: boolean;
    abstractScale: number;
  } {
    let hd = false;
    let square = false;

    if (image.width > 64) hd = true;
    if (image.width == image.height) square = true;

    return { hd, square, abstractScale: image.width / 16 };
  }

  private getTransparentHat(sourceSkin: Image): Canvas {
    const oneHead = sourceSkin.width / 8;
    const canvas = createCanvas(oneHead, oneHead);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(sourceSkin, oneHead * -5, -oneHead);

    function hasTransparency() {
      const imgData = ctx.getImageData(0, 0, oneHead, oneHead);

      for (let x = 0; x < oneHead; x++) {
        for (let y = 0; y < oneHead; y++) {
          const offset = (x + y * oneHead) * 4;
          if (imgData.data[offset + 3] !== 0xff) {
            return true;
          }
        }
      }
      return false;
    }

    if (hasTransparency()) return canvas;

    const imgData = ctx.getImageData(0, 0, oneHead, oneHead);
    for (let x = 0; x < oneHead; x++) {
      for (let y = 0; y < oneHead; y++) {
        const offset = (x + y * oneHead) * 4;

        if (
          imgData.data[offset + 0] === 255 &&
          imgData.data[offset + 1] === 255 &&
          imgData.data[offset + 2] === 255
        ) {
          imgData.data[offset + 0] = 0;
          imgData.data[offset + 1] = 0;
          imgData.data[offset + 2] = 0;
          imgData.data[offset + 3] = 0;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  private fixOpaque(isSquare: boolean): void {
    const hasTransparency = () => {
      const w = this.abstractScale * 16;
      const h = (this.abstractScale * 16) / (isSquare ? 1 : 2);
      const imgData = this.ctx.getImageData(0, 0, w, h);

      for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
          const offset = (x + y * w) * 4;
          if (imgData.data[offset + 3] !== 0xff) {
            return true;
          }
        }
      }
      return false;
    };

    if (hasTransparency()) return;

    const removeWhite = (
      x0: number,
      y0: number,
      w: number,
      h: number,
    ): void => {
      x0 *= this.abstractScale;
      y0 *= this.abstractScale;
      w *= this.abstractScale;
      h *= this.abstractScale;

      const imgData = this.ctx.getImageData(x0, y0, w, h);
      for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
          const offset = (x + y * w) * 4;

          if (
            imgData.data[offset + 0] === 0xff &&
            imgData.data[offset + 1] === 0xff &&
            imgData.data[offset + 2] === 0xff
          ) {
            imgData.data[offset + 0] = 0;
            imgData.data[offset + 1] = 0;
            imgData.data[offset + 2] = 0;
            imgData.data[offset + 3] = 0;
          }
        }
      }
      this.ctx.putImageData(imgData, x0, y0);
    };

    removeWhite(8, 0, 8, 4); // Hat
    if (isSquare) {
      removeWhite(0, 8, 15, 4); // RightLegOverlay + BodyOverlay + RightArmOverlay
      removeWhite(0, 12, 4, 4); // LeftLegOverlay
      removeWhite(12, 12, 4, 4); // LeftArmOverlay
    }
  }

  private convertToSquare(): void {
    const tempCanvas = createCanvas(
      16 * this.abstractScale,
      16 * this.abstractScale,
    );
    const tempCtx = tempCanvas.getContext('2d');

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;

    function copyArea(data: number[]) {
      const startX = data[0] * that.abstractScale,
        startY = data[1] * that.abstractScale,
        width = data[2] * that.abstractScale,
        height = data[3] * that.abstractScale,
        destX = data[4] * that.abstractScale,
        destY = data[5] * that.abstractScale;
      tempCtx.putImageData(
        that.ctx.getImageData(startX, startY, width, height),
        0,
        0,
      );

      that.ctx.save();
      that.ctx.translate(destX + width, 0);
      that.ctx.scale(-1, 1);
      that.ctx.drawImage(
        tempCanvas,
        0,
        0,
        width,
        height,
        0,
        destY,
        width,
        height,
      );
      that.ctx.restore();
    }

    copyArea(CopyAreas.Arm.Top);
    copyArea(CopyAreas.Arm.Bottom);
    copyArea(CopyAreas.Arm.Outer);
    copyArea(CopyAreas.Arm.Front);
    copyArea(CopyAreas.Arm.Inner);
    copyArea(CopyAreas.Arm.Back);

    copyArea(CopyAreas.Leg.Top);
    copyArea(CopyAreas.Leg.Bottom);
    copyArea(CopyAreas.Leg.Outer);
    copyArea(CopyAreas.Leg.Front);
    copyArea(CopyAreas.Leg.Inner);
    copyArea(CopyAreas.Leg.Back);
  }

  private checkSlim(): boolean {
    const isUnusedArea = (
      data: number[],
      resultObject: {
        totalPixels: number;
        pixelsThatAreTransparent: number;
        pixelsThatAreBlack: number;
        pixelsThatAreWhite: number;
      },
    ) => {
      const x0 = data[0] * this.abstractScale,
        y0 = data[1] * this.abstractScale,
        w = data[2] * this.abstractScale,
        h = data[3] * this.abstractScale;
      const imgData = this.ctx.getImageData(x0, y0, w, h);

      const totalPixels = w * h;
      let pixelsThatAreTransparent = 0;
      let pixelsThatAreBlack = 0;
      let pixelsThatAreWhite = 0;

      for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
          const offset = (x + y * w) * 4;

          if (imgData.data[offset + 3] !== 0xff) pixelsThatAreTransparent++;

          if (
            imgData.data[offset + 0] === 0 &&
            imgData.data[offset + 1] === 0 &&
            imgData.data[offset + 2] === 0
          ) {
            pixelsThatAreBlack++;
          }

          if (
            imgData.data[offset + 0] === 0xff &&
            imgData.data[offset + 1] === 0xff &&
            imgData.data[offset + 2] === 0xff
          ) {
            pixelsThatAreWhite++;
          }
        }
      }

      resultObject.totalPixels += totalPixels;
      resultObject.pixelsThatAreTransparent += pixelsThatAreTransparent;
      resultObject.pixelsThatAreBlack += pixelsThatAreBlack;
      resultObject.pixelsThatAreWhite += pixelsThatAreWhite;
    };

    const slimTestResults = {
      totalPixels: 0,
      pixelsThatAreTransparent: 0,
      pixelsThatAreBlack: 0,
      pixelsThatAreWhite: 0,
    };

    isUnusedArea(UnusedAreas.Slim.RightArm.Top, slimTestResults);
    isUnusedArea(UnusedAreas.Slim.RightArm.Side, slimTestResults);
    if (this.isSlim) {
      isUnusedArea(UnusedAreas.Slim.LeftArm.Top, slimTestResults);
      isUnusedArea(UnusedAreas.Slim.LeftArm.Side, slimTestResults);
    }

    if (
      slimTestResults.pixelsThatAreTransparent >
        slimTestResults.totalPixels / 1.1 ||
      slimTestResults.pixelsThatAreBlack > slimTestResults.totalPixels / 1.1 ||
      slimTestResults.pixelsThatAreWhite > slimTestResults.totalPixels / 1.1
    ) {
      return true;
    }

    return false;
  }

  private clearUnusedArea(isSquare: boolean) {
    const clearArea = (data: number[]) =>
      this.ctx.clearRect(
        data[0] * this.abstractScale,
        data[1] * this.abstractScale,
        data[2] * this.abstractScale,
        data[3] * this.abstractScale,
      );

    clearArea(UnusedAreas.HeadHat.Left);
    clearArea(UnusedAreas.HeadHat.Middle);
    clearArea(UnusedAreas.HeadHat.Right);

    clearArea(UnusedAreas.Body.Left);
    clearArea(UnusedAreas.Body.Middle1);
    clearArea(UnusedAreas.Body.Middle2);
    clearArea(UnusedAreas.Body.Right);
    clearArea(UnusedAreas.Body.RightSide);

    if (this.isSlim) {
      clearArea(UnusedAreas.Slim.RightArm.Top);
      clearArea(UnusedAreas.Slim.RightArm.Side);
    }

    if (isSquare) {
      // if it WAS a square

      if (this.isSlim) {
        clearArea(UnusedAreas.Slim.LeftArm.Top);
        clearArea(UnusedAreas.Slim.LeftArm.Side);
      }

      clearArea(UnusedAreas.Body2.Left);
      clearArea(UnusedAreas.Body2.Middle1);
      clearArea(UnusedAreas.Body2.Middle2);
      clearArea(UnusedAreas.Body2.Right);
      clearArea(UnusedAreas.Body2.RightSide);

      clearArea(UnusedAreas.Bottom.Left);
      clearArea(UnusedAreas.Bottom.Middle1);
      clearArea(UnusedAreas.Bottom.Middle2);
      clearArea(UnusedAreas.Bottom.Middle3);
      clearArea(UnusedAreas.Bottom.Right);
    }
  }
}

export default MinecraftSkinConverter;

// x, y, widht, height
const UnusedAreas = {
  HeadHat: {
    Left: [0, 0, 2, 2],
    Middle: [6, 0, 4, 2],
    Right: [14, 0, 2, 2],
  },
  Body: {
    Left: [0, 4, 1, 1],
    Middle1: [3, 4, 2, 1],
    Middle2: [9, 4, 2, 1],
    Right: [13, 4, 1, 1],
    RightSide: [14, 4, 2, 4],
  },
  Body2: {
    Left: [0, 8, 1, 1],
    Middle1: [3, 8, 2, 1],
    Middle2: [9, 8, 2, 1],
    Right: [13, 8, 1, 1],
    RightSide: [14, 8, 2, 4],
  },
  Bottom: {
    Left: [0, 12, 1, 1],
    Middle1: [3, 12, 2, 1],
    Middle2: [7, 12, 2, 1],
    Middle3: [11, 12, 2, 1],
    Right: [15, 12, 1, 1],
  },
  Slim: {
    RightArm: {
      Top: [50 * 0.25, 16 * 0.25, 2 * 0.25, 4 * 0.25],
      Side: [54 * 0.25, 20 * 0.25, 2 * 0.25, 12 * 0.25],
    },
    LeftArm: {
      Top: [42 * 0.25, 48 * 0.25, 2 * 0.25, 4 * 0.25],
      Side: [46 * 0.25, 52 * 0.25, 2 * 0.25, 12 * 0.25],
    },
  },
};

// startX, startY, widht, height, destX, destY
const CopyAreas = {
  Arm: {
    Top: [11, 4, 1, 1, 9, 12],
    Bottom: [12, 4, 1, 1, 10, 12],
    Outer: [10, 5, 1, 3, 10, 13],
    Front: [11, 5, 1, 3, 9, 13],
    Inner: [12, 5, 1, 3, 8, 13],
    Back: [13, 5, 1, 3, 11, 13],
  },
  Leg: {
    Top: [1, 4, 1, 1, 5, 12],
    Bottom: [2, 4, 1, 1, 6, 12],
    Outer: [0, 5, 1, 3, 6, 13],
    Front: [1, 5, 1, 3, 5, 13],
    Inner: [2, 5, 1, 3, 4, 13],
    Back: [3, 5, 1, 3, 7, 13],
  },
};
