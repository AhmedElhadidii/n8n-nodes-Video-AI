# n8n Video AI Node

[![NPM Version](https://img.shields.io/npm/v/n8n-nodes-video-ai.svg?style=flat)](https://www.npmjs.com/package/n8n-nodes-video-ai)
[![NPM Downloads](https://img.shields.io/npm/dm/n8n-nodes-video-ai.svg?style=flat)](https://www.npmjs.com/package/n8n-nodes-video-ai)
[![License](https://img.shields.io/npm/l/n8n-nodes-video-ai.svg?style=flat)](https://github.com/AhmedElhadidii/n8n-nodes-Video-AI/blob/main/LICENSE.md)

This is an [n8n](https://n8n.io/) community node package for performing AI-powered analysis on video files.

Created by [**Hadidiz**](https://HadidizFlow.com).

- [Website](https://HadidizFlow.com)
- [YouTube Channel](https://www.youtube.com/@Hadidiz)

## Features

-   Analyze videos using AI models.
-   Provide a video URL and a custom prompt for analysis.
-   **Currently supports Google Gemini models.**
-   *More AI providers will be added in the future!*

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

1.  Go to **Settings > Community Nodes**.
2.  Select **Install**.
3.  Enter `n8n-nodes-video-ai` in the search box.
4.  Agree to the risks and install the node.

Alternatively, you can install using npm if you are self-hosting n8n:

```bash
npm install n8n-nodes-video-ai
```

## Usage

1.  **Add the Node**: Find the "Gemini Video Analysis" node in the node panel and add it to your workflow.
2.  **Configure Credentials**: 
    *   Go to the **Credentials** section in n8n.
    *   Create new credentials for "Gemini API".
    *   Enter your Google Gemini API key.
    *   Save the credentials.
    *   Select the created credentials in the node.
3.  **Provide Video URL**: Enter the direct URL to the video file you want to analyze.
4.  **Enter Custom Prompt**: Write a specific prompt instructing the AI on what analysis to perform (e.g., "Summarize this video", "Describe the main objects in the scene", "Generate a transcript").
5.  **Select Model**: Choose the Gemini model you want to use (e.g., Gemini 1.5 Flash, Gemini 1.5 Pro).
6.  **Run the Node**: Execute the node to get the analysis result in the output `text` field.

## Compatibility

Tested with n8n version 1.85.4.

## Contributing

Contributions are welcome! Please refer to the [n8n contributing guidelines](https://github.com/n8n-io/n8n/blob/master/CONTRIBUTING.md).

## License

[MIT](LICENSE.md)
