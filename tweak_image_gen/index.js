import Replicate from 'replicate'
import dotenv from 'dotenv'
dotenv.config()

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  userAgent: 'https://www.npmjs.com/package/create-replicate'
})
const model = 'colinmcdonnell22/050md_ai:ffe5df4d14346fa97383cdcec0ec90ecd29b4146c34e663434ea10b1bf2af60d'
const input = {
  model: 'dev',
  prompt: 'pepe the frog in the style of TWEAKS',
  go_fast: true,
  lora_scale: 1,
  megapixels: '1',
  num_outputs: 1,
  aspect_ratio: '1:1',
  output_format: 'webp',
  guidance_scale: 3,
  output_quality: 80,
  prompt_strength: 0.8,
  extra_lora_scale: 1,
  num_inference_steps: 28,
}

console.log('Using model: %s', model)
console.log('With input: %O', input)

console.log('Running...')
const output = await replicate.run(model, { input })
console.log('Done!', output)
