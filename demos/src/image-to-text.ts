// https://monad.fi/en/blog/tamperejs-brought-web-developers-together-once-again/
// npx tsc && node dist/image-to-text.js https://monad.fi/wp-content/uploads/2023/05/tamperejs03-1536x1024.jpg

import { pipeline, env } from '@xenova/transformers';
import url from 'url';

env.cacheDir = './.cache';
const pipelineInstance = await pipeline(
    'image-to-text',
    'Xenova/vit-gpt2-image-captioning',
    {
        local_files_only: true,
        progress_callback: (_progress: any) => {
            // console.log('progress:', _progress);
        }
    }
);

export async function infereCaption(url: string): Promise<string> {
    const result = await pipelineInstance(new URL(url));
    const [ { generated_text: inferredCaption} ] = result as any; // Note: Types are quite bad in the framework currently!
    return inferredCaption;
}

const commandLineUrl = process.argv[2];
const __filename = url.fileURLToPath(import.meta.url);
if (process.argv[1] === __filename && commandLineUrl) {
    console.log('\n\n');
    console.log('captioning:', commandLineUrl);
    const caption = await infereCaption(commandLineUrl);
    console.log('caption:', caption);
}
