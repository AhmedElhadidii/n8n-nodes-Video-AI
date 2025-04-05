import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeConnectionType,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
// Use node-fetch v2 types
import type { RequestInit, Response } from 'node-fetch';

export class VideoAiAnalysis implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Video AI Analysis',
		name: 'videoAiAnalysis',
		group: ['transform'],
		version: 1,
		description: 'Perform AI-powered video Operations (analysis, Review, Summarize, etc). <br><em>Beta: Currently supports Google Gemini models only. More AI providers coming soon!</em>',
		documentationUrl: 'https://www.hadidizflow.com/blog/unlock-ai-video-analysis-n8n-video-ai-node-hadidizflow',
		defaults: {
			name: 'Video AI Analysis',
		},
		icon: 'file:VideoAiAnalysis.svg',
		subtitle: '={{$parameter["customPrompt"] ? "Custom Prompt" : ""}}',
		inputs: ['main'] as unknown as [NodeConnectionType.Main],
		outputs: ['main'] as unknown as [NodeConnectionType.Main],
		credentials: [
			{
				name: 'geminiApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Video URL',
				name: 'videoUrl',
				type: 'string',
				default: '',
				required: true,
				description: 'URL of the video to analyze',
			},
			{
				displayName: 'Custom Prompt',
				name: 'customPrompt',
				type: 'string',
				default: '',
				required: true,
				description: 'Custom prompt to analyze the video',
				typeOptions: {
					rows: 4,
				},
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				default: 'gemini-2.0-flash-thinking-exp-01-21',
				options: [
					{
						name: 'Gemini 2.0 Flash (Experimental)',
						value: 'gemini-2.0-flash-exp',
					},
					{
						name: 'Gemini 2.0 Flash Thinking (Experimental)',
						value: 'gemini-2.0-flash-thinking-exp-01-21',
					},
				],
				description: 'Which Gemini model to use for video analysis',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				default: {},
				placeholder: 'Add Option',
				options: [
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						default: 0.5,
						description: 'Controls the randomness of the output. Values can range from 0.0 to 1.0.',
						typeOptions: {
							minValue: 0,
							maxValue: 1,
						},
					},
					{
						displayName: 'Maximum Video Size (MB)',
						name: 'maxVideoSize',
						type: 'number',
						default: 25,
						description: 'Maximum size of video to download in megabytes (MB)',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials
		const credentials = await this.getCredentials('geminiApi');
		const apiKey = credentials.apiKey as string;

		// Import necessary Google Generative AI package
		const generativeAI = await import('@google/generative-ai');

		// Import node-fetch v2 using require for CommonJS compatibility
		const fetch = require('node-fetch');

		// Initialize clients
		const genAI = new generativeAI.GoogleGenerativeAI(apiKey);

		for (let i = 0; i < items.length; i++) {
			try {
				// Get parameters
				const videoUrl = this.getNodeParameter('videoUrl', i) as string;
				const customPrompt = this.getNodeParameter('customPrompt', i) as string;
				const model = this.getNodeParameter('model', i) as string;
				const options = this.getNodeParameter('options', i, {}) as IDataObject;

				// Parse options
				const temperature = (options.temperature as number) || 0.5;
				const maxVideoSize = (options.maxVideoSize as number) || 25;

				// Step 1: Download the video file
				this.logger.info(`Downloading video from ${videoUrl}...`);

				// Create fetch options
				const fetchOptions: RequestInit = {
					method: 'GET',
				};

				// Type assertion for node-fetch v2 response
				const response = await fetch(videoUrl, fetchOptions) as Response;

				if (!response.ok) {
					throw new NodeOperationError(
						this.getNode(),
						`Failed to download video: ${response.statusText}`,
						{ itemIndex: i }
					);
				}

				// Check content length if available
				const contentLength = response.headers.get('content-length');
				if (contentLength) {
					const sizeInMB = parseInt(contentLength) / (1024 * 1024);
					if (sizeInMB > maxVideoSize) {
						throw new NodeOperationError(
							this.getNode(),
							`Video size (${sizeInMB.toFixed(2)} MB) exceeds maximum allowed size (${maxVideoSize} MB)`,
							{ itemIndex: i }
						);
					}
				}

				// Determine MIME type
				const contentType = response.headers.get('content-type');
				const mimeType = contentType || 'video/mp4';

				// Step 2: Get the video data as a Buffer for node-fetch v2
				this.logger.info('Processing video data...');
				const videoBuffer = await response.buffer(); // Use buffer() for v2

				// Convert Buffer to base64
				const videoBase64 = videoBuffer.toString('base64');

				// Step 3: Use the GenerationService directly with Part containing Base64 data
				const generationModel = genAI.getGenerativeModel({
					model,
					generationConfig: {
						temperature,
					},
					// Using the default v1beta API version which is supported by all models
				});

				this.logger.info(`Analyzing video with ${model}...`);

				// Create model request with inline base64 data
				const req = [
					{text: customPrompt},
					{
						inlineData: {
							mimeType,
							data: videoBase64
						}
					}
				];

				// Generate content with Gemini
				const result = await generationModel.generateContent(req);

				// Process result
				const output = {
					text: result.response.text(),
					model,
					prompt: customPrompt,
				};

				// Return output data
				returnData.push({
					json: output,
					pairedItem: i,
				});

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: i,
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error, {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
}
