CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS document_page (
  id SERIAL PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  file_path text NOT NULL,
  page_num bigint NOT NULL,
  extracted_text text NOT NULL,
  embedding vector(384) NOT NULL
);

CREATE UNIQUE INDEX document_uq_file_path
ON document_page(file_path, page_num);

CREATE INDEX ON document_page USING hnsw (embedding vector_l2_ops);
