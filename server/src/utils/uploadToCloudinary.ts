import cloudinary from './cloudinary'

export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    public_id: string
    resource_type?: 'image' | 'video' | 'raw'
  },
) {
  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: options.public_id,
        resource_type: options.resource_type || 'video', // audio = video
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      },
    )

    stream.end(buffer)
  })
}
