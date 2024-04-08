// npx tsc && node dist/object-detection.js https://monad.fi/wp-content/uploads/2023/05/tamperejs03-1536x1024.jpg

import { env, AutoModel, AutoProcessor, RawImage } from '@xenova/transformers';
import url from 'url';

env.cacheDir = './.cache';
const model_id = 'Xenova/gelan-c_all';
const model = await AutoModel.from_pretrained(model_id);
const processor = await AutoProcessor.from_pretrained(model_id);

export async function detectObjects(image: RawImage) {
    const inputs = await processor(image);
    const { outputs } = await model(inputs);
    // Note: Types are quite bad in the framework currently:
    return (outputs.tolist() as Array<[number, number, number, number, number, number]>).map(
        (o) => [ model.config.id2label[o[5]] as string, ...o ] as const
    );
}

const commandLineUrl = process.argv[2];
const __filename = url.fileURLToPath(import.meta.url);
if (process.argv[1] === __filename && commandLineUrl) {
    console.log('detect from:', commandLineUrl);
    const image = await RawImage.fromURL(commandLineUrl);
    const detected = await detectObjects(image);
    detected.forEach(([label, xmin, ymin, xmax, ymax, score, id]) => {
        if (score > 0.5) {
            console.log('detected:', label, 'score:', score.toFixed(2), 'x:', xmin.toFixed(0), 'y:', ymin.toFixed(0));
        }
    });
}
