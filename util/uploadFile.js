const cloudinary = require('./cloudinary');

const uploadFile = async (folder,picture,fileName) => {
    // If Cloudinary isn't configured, persist the data URL directly in MongoDB.
    // This allows saving PDFs/images without requiring external storage.
    if (!process.env.CLOUD_NAME || !process.env.CLOUD_KEY || !process.env.CLOUD_SECRET) {
        return picture;
    }

    try{
        const result = await cloudinary.uploader.upload(picture, {
            public_id: `${folder}/${fileName}`,
            overwrite: true,
            resource_type: 'auto'
        })

        return result.secure_url || result.url
    }catch (e){
       console.log('cant upload file',e);
       // Fallback to storing the original data URL if upload fails.
       return picture || '';
    }
}

module.exports = {
    uploadFile
}
