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
import MinecraftSkinConverter from '../index';

async function boot() {
    const converter = new MinecraftSkinConverter('./skininput.png', 'buffer/png');

    await converter.convertSkin();
    // returns { slim: false, hd: false, skinpath: './skininput.png', dataType: 'buffer/png', data: [Buffer] }

    converter.isSlim;
    // returns false

    converter.getSkinHead(256);  // 256 is the avatar rescale from 8x8(default) to 256x256
    // returns { size: 256, skinpath: './skininput.png', dataType: 'buffer/png', data: [Buffer]; }
}

boot();

// That's all you need to know!
```

Input skin:
![Input skin image](https://github.com/Frysuni/minecraft-skin-converter/blob/main/example/skininput.png?raw=true)

Output skin:
![Output skin image](https://github.com/Frysuni/minecraft-skin-converter/blob/main/example/skinoutput.png?raw=true)

Output head:
![Output head image](https://github.com/Frysuni/minecraft-skin-converter/blob/main/example/skinheadoutput.png?raw=true)
