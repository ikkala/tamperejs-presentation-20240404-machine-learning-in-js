// npx tsc && node dist/vectorize.js "a man is standing on a stage with a microphone"

import { pipeline, env } from '@xenova/transformers';
import url from 'url';

env.cacheDir = './.cache';
const pipelineInstance = await pipeline(
    'feature-extraction',
    'Supabase/gte-small',
    {
        local_files_only: true,
        progress_callback: (_progress: any) => {
            // console.log('progress:', _progress);
        }
    }
);

export async function vectorize(str: string) {
    const result = await pipelineInstance(str, {
        normalize: true,
        pooling: 'mean',
    });
    return Array.from<number>(result.data.values());
}

const str = process.argv[2];
const __filename = url.fileURLToPath(import.meta.url);
if (process.argv[1] === __filename && str) {
    console.log('\n\n');
    console.log('vectorize:', str);
    const vector = await vectorize(str);
    console.log('vector:', vector);
}
