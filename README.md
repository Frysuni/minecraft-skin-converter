[![NPM Package](https://img.shields.io/npm/v/minecraft-skin-converter)](https://www.npmjs.com/package/minecraft-skin-converter)

# Minecraft skin converter
#### This package allows you to convert a 64x32 skin to 64x64, restore the alpha channel, define a slim(Alex) skin, and also clear unused areas. The package also supports HD format skins. It's ES6 import/export.
---
## Installation:
```
npm i minecraft-skin-converter
```

## Simple usage:
```ts
import MinecraftSkinConverter from './index';

async function boot() {
    const minecraftSkinConverter = new MinecraftSkinConverter();
    await minecraftSkinConverter.convertSkin('./skin.png', 'buffer/png');

    minecraftSkinConverter.writeToFile('./skin_out.png'); // Just write to file
    minecraftSkinConverter.isSlim; // boolean
    minecraftSkinConverter.data; // { dataType: 'mime/png' | 'buffer/png'; data: string | Buffer; slim?: boolean; hd?: boolean; skinpath?: string | URL | Buffer | ArrayBuffer | Uint8Array | Image; }
}

boot();
```

Input skin:
![Input skin image](https://github.com/Frysuni/minecraft-skin-converter/blob/main/example/skininput.png?raw=true)

Expected output skin:
![Output skin image](https://github.com/Frysuni/minecraft-skin-converter/blob/main/example/skinoutput.png?raw=true)
