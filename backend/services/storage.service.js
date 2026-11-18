import ImageKit from '@imagekit/nodejs';

let client;

function getClient() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("IMAGEKIT_PRIVATE_KEY must be configured.");
  }
  if (!client) {
    client = new ImageKit({ privateKey });
  }
  return client;
}

async function uploadFile(buffer){
    const response = await getClient().files.upload({
        file: buffer.toString("base64"),
        fileName: 'image'+Date.now()+".jpg",
        folder: "products"
      });
      return response
}
export default uploadFile