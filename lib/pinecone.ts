import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import md5 from "md5";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";

import { downloadFromS3 } from "./s3-server";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";

let pinecone: Pinecone | null = null;

export const getPineconeClient = async () => {
  if (!pinecone) {
    pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  }

  return pinecone;
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPinecone(fileKey: string) {
  try {
    // Obtain the PDF -> Download and read from PDF
    console.log("downloading s3 into file system");
    const file_name = await downloadFromS3(fileKey);

    if (!file_name) {
      throw new Error("Could not download from s3");
    }

    console.log("loading pdf into memeory" + file_name);
    const loader = new PDFLoader(file_name);
    const pages = (await loader.load()) as PDFPage[];

    // 2. Split and segment the PDF
    // This splits the pages further into documents, thus increasing the items in the array
    const documents = await Promise.all(pages.map(prepareDocument));

    // 3. Vectorize and embed individual documents
    const vectors = await Promise.all(documents.flat().map(embedDocument));

    console.log(`Pages extracted: ${pages.length}`);
    console.log(`Documents after preparation: ${documents.flat().length}`);
    console.log(`Vectors created: ${vectors.length}`);

    // 4. Upload to pinecone
    const client = await getPineconeClient();
    const pineconeIndex = client.index("chatpdf-ai");
    const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

    console.log("inserting vectors into pinecone");

    await namespace.upsert(vectors);

    console.log("successfully inserted vectors into pinecone");

    return documents[0];
  } catch (error) {
    console.error("Error in loadS3IntoPinecone:", error);
    throw error;
  }
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent); // this helps us ID the vector within pinecone

    // Format the embeddings as PineconeRecords
    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  // eslint-disable-next-line prefer-const
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, "");

  // split the docs
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000), // Pinecone only accepts strings with bytes of 36000
      },
    }),
  ]);

  return docs;
}
