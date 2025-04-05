import {GoogleGenerativeAI} from '@google/generative-ai'

const systemInstruction = `When given a video and a query, call the relevant \
function only once with the appropriate timecodes and text for the video`

const client = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export default async ({text, functionDeclarations, file}) => {
  const {response} = await client
    .getGenerativeModel(
      {model: 'gemini-2.0-flash-exp', systemInstruction},
      {apiVersion: 'v1beta'}
    )
    .generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {text},
            {
              fileData: {
                mimeType: file.mimeType,
                fileUri: file.uri
              }
            }
          ]
        }
      ],
      generationConfig: {temperature: 0.5},
      tools: [{functionDeclarations}]
    })

  return response
}
