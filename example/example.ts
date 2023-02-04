import MinecraftSkinConverter from '../index';

async function boot() {
    const minecraftSkinConverter = new MinecraftSkinConverter();
    await minecraftSkinConverter.convertSkin('skininput.png', 'buffer/png');

    minecraftSkinConverter.writeToFile('skinoutput.png'); // Just write to file
    minecraftSkinConverter.isSlim; // boolean
    minecraftSkinConverter.data; // { dataType: 'mime/png' | 'buffer/png'; data: string | Buffer; slim?: boolean; hd?: boolean; skinpath?: string | URL | Buffer | ArrayBuffer | Uint8Array | Image; }
}

boot();