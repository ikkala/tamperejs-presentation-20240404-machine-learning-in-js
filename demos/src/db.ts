import pgp from 'pg-promise';

const pgpInstance = pgp();
const db = pgpInstance({
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'postgres',
    user: process.env.POSTGRES_USER || 'testuser',
    password: process.env.POSTGRES_PASSWORD || 'testpwd',
});

export async function removeDocuments() {
    await db.none(
        `truncate table document_page`
    );
}

export async function shutdown() {
    await db.$pool.end();
}

export async function storeDocument(properties: {
    filePath: string,
    pageNum: number,
    text: string,
    vector: number[]
}) {
    await db.none(
        `insert into document_page(file_path, page_num, extracted_text, embedding)
        values ($[filePath], $[pageNum], $[text], $[vector])
        on conflict (file_path, page_num) do update set
            updated_at = now(),
            page_num = EXCLUDED.page_num,
            extracted_text = EXCLUDED.extracted_text,
            embedding = EXCLUDED.embedding;`,
        properties
    )
}

export async function queryTopDocuments(queryVector: number[], limit = 10) {
    const rows = await db.manyOrNone<{ filePath: string, pageNum: number, distance: number }>(
        `select file_path as "filePath", page_num as "pageNum", embedding <-> $[queryVector] AS "distance"
        from "document_page" d
        order by 3
        limit $[limit]`,
        {
            queryVector: JSON.stringify(queryVector),
            limit
        }
    );
    return rows;
}
