import {Request, Response} from 'express'
import {DI} from '../utils/di'
import {Word} from '../entities/Word'
import {uploadToCloudinary} from '../utils/uploadToCloudinary'
import {Example} from '../entities/Example'

export async function getWordAudio(req: Request, res: Response) {
  try {
    const {id} = req.params

    const word = await DI.em.findOne(Word, {id})

    if (!word) {
      return res.status(404).json({message: 'Word not found'})
    }

    if (word.audioUrl) {
      return res.redirect(word.audioUrl)
    }

    const text = word.reading

    const ttsRes = await fetch(
      `https://api.ttsvox.com/generate?text=${encodeURIComponent(text)}`,
    )

    const buffer = await ttsRes.arrayBuffer()

    const uploaded = await uploadToCloudinary(Buffer.from(buffer), {
      public_id: `word_${word.entSeq}`,
      resource_type: 'video',
    })

    word.audioUrl = uploaded.secure_url
    await DI.em.flush()

    return res.redirect(word.audioUrl)
  } catch (err) {
    console.error(err)
    return res.status(500).json({message: 'Internal server error'})
  }
}

export async function getExampleAudio(req: Request, res: Response) {
  try {
    const {id} = req.params

    const example = await DI.em.findOne(Example, {id})

    if (!example) {
      return res.status(404).json({message: 'Example not found'})
    }

    if (example.audioUrl) {
      return res.redirect(example.audioUrl)
    }

    const text = example.sentence

    const ttsRes = await fetch(
      `https://api.ttsvox.com/generate?text=${encodeURIComponent(text)}`,
    )

    const buffer = await ttsRes.arrayBuffer()

    const uploaded = await uploadToCloudinary(Buffer.from(buffer), {
      public_id: `example_${example.id}`,
      resource_type: 'video',
    })

    example.audioUrl = uploaded.secure_url
    await DI.em.flush()

    return res.redirect(example.audioUrl)
  } catch (err) {
    console.error(err)
    return res.status(500).json({message: 'Internal server error'})
  }
}
