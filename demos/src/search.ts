// npx tsc && node dist/search.js index "../Tensorflow.js and Huggingface Transformers.js_ Machine learning in JavaScript.pdf"
// npx tsc && node dist/search.js search "software professional"

import { vectorize } from './vectorize.js';
// import { detectObjects } from './object-detection.js';
// import { infereCaption } from './image-to-text.js';
import { queryTopDocuments, removeDocuments, shutdown, storeDocument } from './db.js';
import { Command } from 'commander';
import { getPdfPageGenerator } from './pdf-extract.js';
import { RawImage } from '@xenova/transformers';

const program = new Command();

program
    .name('semantic-search')
    .description('Semantic indexing and search for documents containing text content');

program
    .command('index')
    .description(
        'Index file pages'
    )
    .argument(
        '<file-path>',
        'Index file pages'
    )
    .action(async (filePath: string) => {
        console.log('Indexing file pages of:', filePath);
        // await removeDocuments();
        let pageNum = 1;
        for await (let pageTextsAndImages of getPdfPageGenerator(filePath)) {
            let text = pageTextsAndImages.lines.join('\n') + '\n\n';
            /*TODO: for (const { data, info } of pageTextsAndImages.images) {
                try {
                    // From here: https://git.it-kuny.ch/hx/transformers.js/compare/9e7d629dfba1114af4bb78dca1f53a72a3a796a3..311cb9c5b385a14923112f4eab2806d8fd7a4b57
                    const rawImage = new RawImage(new Uint8ClampedArray(data), info.width, info.height, info.channels)
                    const detectedFromImage = await detectObjects(rawImage);
                    detectedFromImage.forEach(([label,,,,, score]) => {
                        if (score > 0.5) {
                            text += '\n\n' + label;
                        }
                    });
                } catch (err) {
                    console.warn('error on', pageNum, ':', err);
                }
            }*/
            const vector = await vectorize(text);
            await storeDocument({ filePath, pageNum, text, vector });
            pageNum += 1;
        }
        console.log('Done indexing.');
        await clean();
    });

program
    .command('search')
    .description(
        'Search indexed files'
    )
    .argument(
        '<semantic-search-string>',
        'Text to be searched from the indexed documents. Search is done by the semantic meaning, not based on exact match.'
    )
    .action(async (searchString: string) => {
        console.log('Searching:', searchString);
        const vector = await vectorize(searchString);
        const result = await queryTopDocuments(vector);
        console.log('Result:');
        console.log(result.map(r => r.distance.toFixed(3) + ' ' + r.filePath.substring(0, 30) + '... page ' + r.pageNum).join('\n'));
        await clean();
    });

program.parse();

async function clean() {
    await shutdown();
}
