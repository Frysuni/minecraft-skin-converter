[![](https://komarev.com/ghpvc/?username=minecraft-skin-converter&color=white&label=views)](https://www.npmjs.com/package/minecraft-skin-converter)
<p style="margin: 0px; padding: 0px;">
    <a href="https://www.npmjs.com/package/minecraft-skin-converter" target="_blank">
        <img src="https://img.shields.io/npm/types/minecraft-skin-converter?color=blue&label=language" style="display: inline-block; margin: 0px; padding: 0px; margin-right: 10px;">
    </a>
</p>
<p style="margin: 0px; padding: 0px;">
    <a href="https://www.npmjs.com/package/minecraft-skin-converter" target="_blank">
        <img src="https://img.shields.io/npm/v/minecraft-skin-converter?color=red&label=version" style="display: inline-block; margin: 0px; padding: 0px; margin-right: 10px;">
        <img src="https://img.shields.io/npm/dt/minecraft-skin-converter?color=red&label=downloads" style="display: inline-block; margin: 0px; padding: 0px;">
    </a>
</p>

# Minecraft skin converter
#### This package allows you to convert a 64x32 skin to 64x64, restore the alpha channel, define a slim(Alex) skin, and also clear unused areas. The package also supports HD format skins. It's ES5 import/export, but also contains default import for ES6.
#### It supports hd skins, jpg skins, new format skins for input. The output skin will always be of the same format as shown in the example.

#### **Warning! The definition of slim skins may be inaccurate due to poor-quality skin sources, although I did it as accurately as possible. Use this only as an auxiliary skin detection tool and give the choice to the person.**
---
## Installation:
```
npm i minecraft-skin-converter
```

![intro](https://github.com/Frysuni/minecraft-skin-converter/blob/main/example/intro.png?raw=true)

## Usage example:
```ts
import MinecraftSkinConverter from 'minecraft-skin-converter';
// or for ES5:
const { MinecraftSkinConverter } = require('minecraft-skin-converter');

async function boot() {
    const converter = new MinecraftSkinConverter('./skininput.png', 'buffer/png');
    // or 'mime/png' for the mime data type

    await converter.convertSkin().catch(console.error);
    // returns { slim: false, hd: false, skinpath: './skininput.png', dataType: 'buffer/png', data: [Buffer] }

    converter.isSlim;
    // returns false
    // or undefined if convertSkin was not executed

    await converter.getSkinHead(64).catch(console.error);
    // 64 is the avatar rescale from 8x8(default minimum) to 64x64
    // a multiple of 2 is recommended
    // regardless of convertSkin()
    // returns { size: 64, skinpath: './skininput.png', dataType: 'buffer/png', data: [Buffer]; }
}

boot();

// That's all you need to know!
```