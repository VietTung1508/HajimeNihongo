import assert from 'node:assert/strict'
import {describe, it} from 'node:test'

describe('Cloudinary environment loading', () => {
  it('loads dotenv before route imports configure Cloudinary', async () => {
    delete process.env.CLOUDINARY_CLOUD_NAME
    delete process.env.CLOUDINARY_API_KEY
    delete process.env.CLOUDINARY_API_SECRET

    await import('../src/app')
    const {default: cloudinary} = await import('../src/utils/cloudinary')
    const config = cloudinary.config()

    assert.ok(config.cloud_name)
    assert.ok(config.api_key)
    assert.ok(config.api_secret)
  })
})
