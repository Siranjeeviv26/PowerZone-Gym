const multer = require('multer')
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Image storage — auto-optimize, max 1200px wide
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'powerzone-gym/images',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1200, quality: 'auto', fetch_format: 'auto' }],
  }),
})

// Video storage — stored as-is, Cloudinary transcodes automatically
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'powerzone-gym/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  }),
})

// Auto storage — detects image vs video by mimetype
const autoStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isVideo = file.mimetype.startsWith('video/')
    return {
      folder: isVideo ? 'powerzone-gym/videos' : 'powerzone-gym/images',
      resource_type: 'auto',
      ...(isVideo ? {} : { transformation: [{ width: 1200, quality: 'auto', fetch_format: 'auto' }] }),
    }
  },
})

const upload = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are allowed'), false)
  },
})

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, true)
    else cb(new Error('Only video files are allowed'), false)
  },
})

const uploadAny = multer({
  storage: autoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) cb(null, true)
    else cb(new Error('Only image and video files are allowed'), false)
  },
})

module.exports = upload
module.exports.uploadVideo = uploadVideo
module.exports.uploadAny = uploadAny
module.exports.cloudinary = cloudinary
