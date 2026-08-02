const { Jimp } = require('jimp');

async function run() {
  try {
    const image = await Jimp.read('./public/logo.png');
    console.log("Image read successfully");
    const spins = [
      { name: 'logo_gold', hue: 0 }, 
      { name: 'logo_red', hue: -45 }, 
      { name: 'logo_green', hue: 90 }, 
      { name: 'logo_cyan', hue: 150 },
      { name: 'logo_blue', hue: 190 }, 
      { name: 'logo_purple', hue: 250 }, 
    ];
    for (let s of spins) {
      if (s.hue === 0) {
         await image.clone().write(`./public/${s.name}.png`);
         continue;
      }
      const clone = image.clone();
      clone.color([{ apply: 'hue', params: [s.hue] }]);
      await clone.write(`./public/${s.name}.png`);
      console.log(`Saved ${s.name}.png`);
    }
  } catch(e) {
    console.error(e);
  }
}
run();
