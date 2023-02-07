/* eslint-disable no-console */

import MinecraftSkinConverter from '../index';

async function boot() {
    const converter = new MinecraftSkinConverter('./skininput.png', 'buffer/png');
    // or 'mime/png' for the mime data type

    await converter.convertSkin().catch(console.error);
    // returns { slim: false, hd: false, skinpath: './skininput.png', dataType: 'buffer/png', data: [Buffer] }

    converter.isSlim;
    // returns false
    // or undefined if convertSkin was not executed

    await converter.getSkinHead(64).catch(console.error);
    // 64 is the avatar rescale from 8x8(default) to 64x64
    // a multiple of 8 and at least 8 is recommended
    // regardless of convertSkin()
    // returns { size: 64, skinpath: './skininput.png', dataType: 'buffer/png', data: [Buffer]; }
}

boot();