import { v2 as cloudinary } from 'cloudinary';

// Configuration is handled via MCP cloudinary server
// The cloudinary package will use CLOUDINARY_URL environment variable if set
// Otherwise, we configure it programmatically

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export default cloudinary;

export async function uploadImage(
  file: string, // base64 string
  publicId: string
): Promise<{ url: string; publicId: string } | null> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      public_id: publicId,
      folder: 'hmpsinf/profiles',
      overwrite: true,
      transformation: [
        { width: 200, height: 200, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
}

export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}

export async function uploadLogo(
  file: string, // base64 string
  publicId: string
): Promise<{ url: string; publicId: string } | null> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      public_id: publicId,
      overwrite: true,
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary logo upload error:', error);
    return null;
  }
}

// Upload foto HIMA Inti dengan crop 2:3 (lebih tinggi)
export async function uploadHimaIntiPhoto(
  file: string, // base64 string
  publicId: string
): Promise<{ url: string; publicId: string } | null> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      public_id: publicId,
      folder: 'hmpsinf/hima-inti',
      overwrite: true,
      transformation: [
        { width: 400, height: 600, crop: 'fill', gravity: 'face' }, // 2:3 ratio (lebih tinggi)
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary HIMA Inti photo upload error:', error);
    return null;
  }
}

// Upload foto Ketua Divisi dengan crop 2:3 (lebih tinggi)
export async function uploadDivisionPhoto(
  file: string, // base64 string
  publicId: string
): Promise<{ url: string; publicId: string } | null> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      public_id: publicId,
      folder: 'hmpsinf/divisions',
      overwrite: true,
      transformation: [
        { width: 400, height: 600, crop: 'fill', gravity: 'face' }, // 2:3 ratio (lebih tinggi)
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary division photo upload error:', error);
    return null;
  }
}
