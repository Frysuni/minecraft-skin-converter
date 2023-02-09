/* eslint-disable no-console */
// used for self-testing

import MinecraftSkinConverter from '../build/index';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'fs';

async function test(number: number, setup = false) {
    const converter = new MinecraftSkinConverter(`test/${number}.png`, 'base64/png');

    const skin = await converter.convertSkin();
    const head = await converter.getSkinHead(32);

    if (setup) {
        if (existsSync(`./test/${number}_skin.txt`)) rmSync(`./test/${number}_skin.txt`);
        if (existsSync(`./test/${number}_head.txt`)) rmSync(`./test/${number}_head.txt`);

        writeFileSync(`./test/${number}_skin.txt`, JSON.stringify(skin));
        writeFileSync(`./test/${number}_head.txt`, JSON.stringify(head));

        console.log(`Test ${number} setup.`);
        return;
    }

    const expectedSkin = readFileSync(`test/${number}_skin.txt`);
    const expectedHead = readFileSync(`test/${number}_head.txt`);

    if (JSON.stringify(skin) != expectedSkin.toString()) {
        console.log(`Error in test ${number}.`);
        console.log('------------------');
        console.log('Output skin:', skin);
        console.log('------------------');
        console.log('Expected skin output:', JSON.parse(expectedSkin.toString()));
        process.exit();
    }

    if (JSON.stringify(head) != expectedHead.toString()) {
        console.log(`Error in test ${number}.`);
        console.log('------------------');
        console.log('Output head:', skin);
        console.log('------------------');
        console.log('Expected head output:', JSON.parse(expectedHead.toString()));
        process.exit();
    }

    console.log(`Test ${number} passed.`);
    return;
}

async function boot() {
    const setup = false;

    // Not HD skin, not square, without alpha-channel, not slim
    const a = test(1, setup);

    // HD skin, square, with alpha-channel, slim
    const b = test(2, setup);

    await Promise.all([a, b]);
}


console.log('Started.');
const startTime = Date.now();
boot()
    .then(() => console.log(`Finished at ${Date.now() - startTime}ms.`))
    .catch(e => console.log(`Error occured: ${e}`));
