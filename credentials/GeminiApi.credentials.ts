import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class GeminiApi implements ICredentialType {
	name = 'geminiApi';
	displayName = 'Gemini API';
	documentationUrl = 'https://ai.google.dev/docs/api_reference';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Gemini API key',
		},
	];
}
