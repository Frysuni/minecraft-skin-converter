import MinecraftSkinConverter from '../index';

async function boot() {
    const converter = new MinecraftSkinConverter('./skininput.png', 'buffer/png');

    await converter.convertSkin();
    // returns { slim: false, hd: false, skinpath: './skininput.png', dataType: 'buffer/png', data: [Buffer] }

    converter.isSlim;
    // returns false

    await converter.getSkinHead(256);  // 256 is the avatar rescale from 8x8(default) to 256x256
    // returns { size: 256, skinpath: './skininput.png', dataType: 'buffer/png', data: [Buffer]; }
}

boot();