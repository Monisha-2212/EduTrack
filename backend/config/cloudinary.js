import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a buffer to Cloudinary.
 * @param {Buffer} buffer - The file buffer to upload
 * @param {string} mimetype - MIME type of the file
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype.startsWith('image/') ? 'image' : 'raw';

    const uploadOptions = {
      folder: 'edutrack',
      resource_type: resourceType,
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    // Removed attachment flag to allow inline viewing of files

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    // Convert buffer to readable stream and pipe into uploadStream
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

export { uploadToCloudinary };
export default cloudinary;
