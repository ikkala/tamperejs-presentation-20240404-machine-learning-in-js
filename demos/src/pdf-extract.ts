import pdfjs from 'pdfjs-dist';
import type { TextItem, PDFPageProxy } from 'pdfjs-dist/types/src/display/api.js';
import { parsePageItems } from 'pdf-text-reader';
import sharp from 'sharp';

export async function* getPdfPageGenerator(url: string | URL) {
    // console.log('url:', url);
    const doc = await pdfjs.getDocument({ url, useSystemFonts: true, }).promise;
    for (let pageNumber = 1; pageNumber < doc.numPages; pageNumber += 1) {
        const page = await doc.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const textItems: TextItem[] = textContent.items.filter((item): item is TextItem => 'str' in item);
        const parsedPage = parsePageItems(textItems);
        // console.log('url:', url, 'pageNumber:', pageNumber);
        parsedPage.lines = parsedPage.lines.map(line => line.replaceAll('\0', ' ')); // ASCII code zero chars not accepted in db
        const images = await getImagesOfPage(page);
        yield { lines: parsedPage.lines, images };
    }
    doc.destroy();
}

// Following function is ripped and modified version of https://github.com/mablay/pdf-export-images/blob/main/src/index.ts
async function getImagesOfPage(page: PDFPageProxy) {
    const images = []
    const ops = await page.getOperatorList()

    for (let i = 0; i < ops.fnArray.length; i++) {
        if (
            ops.fnArray[i] === pdfjs.OPS.paintImageXObject ||
            ops.fnArray[i] === pdfjs.OPS.paintInlineImageXObject
        ) {
            const name = ops.argsArray[i][0]
            const common = await page.commonObjs.has(name)
            const img = await (common
                ? page.commonObjs.get(name)
                : page.objs.get(name)
            )
            const { width, height, kind } = img
            const bytes = img.data.length
            const channels = bytes / width / height
            if (!(channels === 1 || channels === 2 || channels === 3 || channels === 4)) {
                throw new Error(`Invalid image channel: ${channels} for image ${name} on page ${page}`)
            }
            const imageBuffer = await sharp(img.data, {
                raw: { width, height, channels }
            }).toFormat('png').toBuffer({resolveWithObject: true});
            images.push(imageBuffer)
        }
    }
    return images;
}