import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class GeminiVideo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Gemini Video Analysis',
		name: 'geminiVideo',
		group: ['transform'],
		version: 1,
		description: 'Analyze videos using Google Gemini AI',
		subtitle: '={{$parameter["customPrompt"] ? "Custom Prompt" : ""}}',
		icon: 'file:gemini.svg',
		defaults: {
			name: 'Gemini Video Analysis',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
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
				default: 'gemini-2.0-flash-exp',
				options: [
					{
						name: 'Gemini 2.0 Flash',
						value: 'gemini-2.0-flash-exp',
					},
					{
						name: 'Gemini 2.0 Pro',
						value: 'gemini-2.0-pro',
					}
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
		const { GoogleGenerativeAI } = await import('@google/generative-ai');

		// Initialize client
		const genAI = new GoogleGenerativeAI(apiKey);

		for (let i = 0; i < items.length; i++) {
			try {
				// Get parameters
				const videoUrl = this.getNodeParameter('videoUrl', i) as string;
				const customPrompt = this.getNodeParameter('customPrompt', i) as string;
				const model = this.getNodeParameter('model', i) as string;
				const options = this.getNodeParameter('options', i, {}) as IDataObject;

				// Parse options
				const temperature = (options.temperature as number) || 0.5;

				// Use default video MIME type
				const mimeType = 'video/mp4';

				// Use the fileUri directly with videoUrl
				// Modern Gemini API supports direct video URLs
				const req = [
					{text: customPrompt},
					{
						fileData: {
							mimeType,
							fileUri: videoUrl,
						}
					}
				];

				// Generate content with Gemini
				const result = await genAI.getGenerativeModel({
					model,
					generationConfig: {
						temperature,
					},
				}).generateContent(req);

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
