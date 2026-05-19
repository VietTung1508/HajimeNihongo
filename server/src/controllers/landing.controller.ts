import {Request, Response} from 'express'
import {v2 as cloudinary} from 'cloudinary'
import {DI} from '../utils/di'
import {LandingConfig, SectionKey} from '../entities/LandingConfig'
import {LandingTestimonial} from '../entities/LandingTestimonial'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const getLandingData = async (_req: Request, res: Response) => {
  try {
    const em = DI.orm!.em.fork()
    const configs = await em.find(LandingConfig, {}, {orderBy: {position: 'asc'}})
    const testimonials = await em.find(LandingTestimonial, {}, {orderBy: {position: 'asc'}})

    const sections = configs.map(config => ({
      sectionKey: config.sectionKey,
      content: config.content ?? null,
      position: config.position,
      ...(config.sectionKey === SectionKey.TESTIMONIALS
        ? {
            items: testimonials.map(t => ({
              id: t.id,
              name: t.name,
              userTitle: t.userTitle,
              content: t.content,
              avatarUrl: t.avatarUrl,
              position: t.position,
            })),
          }
        : {}),
    }))

    res.json({sections})
  } catch {
    res.status(500).json({message: 'Failed to fetch landing data'})
  }
}

export const updateSectionConfig = async (req: Request, res: Response) => {
  try {
    const em = DI.orm!.em.fork()
    const config = await em.findOne(LandingConfig, {sectionKey: req.params.sectionKey as SectionKey})
    if (!config) return res.status(404).json({message: 'Section not found'})
    config.content = req.body
    await em.flush()
    res.json({success: true, data: config})
  } catch {
    res.status(500).json({message: 'Failed to update section'})
  }
}

export const updateSectionPositions = async (req: Request, res: Response) => {
  try {
    const em = DI.orm!.em.fork()
    const {positions} = req.body as {positions: {sectionKey: string; position: number}[]}
    await Promise.all(
      positions.map(async ({sectionKey, position}) => {
        const config = await em.findOne(LandingConfig, {sectionKey: sectionKey as SectionKey})
        if (config) config.position = position
      }),
    )
    await em.flush()
    res.json({success: true})
  } catch {
    res.status(500).json({message: 'Failed to update positions'})
  }
}

export const createTestimonial = async (req: Request, res: Response) => {
  try {
    const em = DI.orm!.em.fork()
    const {name, userTitle, content, avatarUrl} = req.body
    const count = await em.count(LandingTestimonial, {})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const testimonial = em.create(LandingTestimonial, {name, userTitle, content, avatarUrl, position: count} as any)
    await em.persistAndFlush(testimonial)
    res.status(201).json({success: true, data: testimonial})
  } catch {
    res.status(500).json({message: 'Failed to create testimonial'})
  }
}

export const updateTestimonialPositions = async (req: Request, res: Response) => {
  try {
    const em = DI.orm!.em.fork()
    const {positions} = req.body as {positions: {id: number; position: number}[]}
    await Promise.all(
      positions.map(async ({id, position}) => {
        const t = await em.findOne(LandingTestimonial, {id})
        if (t) t.position = position
      }),
    )
    await em.flush()
    res.json({success: true})
  } catch {
    res.status(500).json({message: 'Failed to update positions'})
  }
}

export const updateTestimonial = async (req: Request, res: Response) => {
  try {
    const em = DI.orm!.em.fork()
    const testimonial = await em.findOne(LandingTestimonial, {id: parseInt(String(req.params.id))})
    if (!testimonial) return res.status(404).json({message: 'Testimonial not found'})
    const {name, userTitle, content, avatarUrl} = req.body
    if (name !== undefined) testimonial.name = name
    if (userTitle !== undefined) testimonial.userTitle = userTitle
    if (content !== undefined) testimonial.content = content
    if (avatarUrl !== undefined) testimonial.avatarUrl = avatarUrl
    await em.flush()
    res.json({success: true, data: testimonial})
  } catch {
    res.status(500).json({message: 'Failed to update testimonial'})
  }
}

export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    const em = DI.orm!.em.fork()
    const testimonial = await em.findOne(LandingTestimonial, {id: parseInt(String(req.params.id))})
    if (!testimonial) return res.status(404).json({message: 'Testimonial not found'})
    await em.removeAndFlush(testimonial)
    res.json({success: true})
  } catch {
    res.status(500).json({message: 'Failed to delete testimonial'})
  }
}

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({message: 'No file provided'})
    const result = await new Promise<{secure_url: string}>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {folder: 'landing', resource_type: 'image'},
        (err, result) => {
          if (err || !result) reject(err)
          else resolve(result as {secure_url: string})
        },
      )
      stream.end(req.file!.buffer)
    })
    res.json({url: result.secure_url})
  } catch {
    res.status(500).json({message: 'Image upload failed'})
  }
}
