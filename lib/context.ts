import { Pinecone } from "@pinecone-database/pinecone";

import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  try {
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

    const index = pinecone.index("chatpdf-ai");

    const namespace = index.namespace(convertToAscii(fileKey));
    const queryResult = await namespace.query({
      topK: 5, // top 5 similar vectors
      vector: embeddings,
      includeMetadata: true,
    });

    return queryResult.matches || [];
  } catch (error) {
    console.log("error querying embeddings", error);
    throw error;
  }
}

// The fileKey parameter is to help us target the correct namespace
export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

  // The greater the score, the better the result's accuracy
  const qualifyingDocs = matches.filter(
    (match) => match.score && match.score > 0.7
  ); // score greater than 70%

  type Metadata = {
    text: string;
    pageNumber: number;
  };

  const docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);
  // if limit the docs length to 3000 characters so as not to feed too much info
  // into oepnai's prompt, to prevent exceeding the token limit
  return docs.join("\n").substring(0, 3000);
}
