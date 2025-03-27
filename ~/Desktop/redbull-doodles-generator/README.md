# Red Bull Doodles Generator

A web application that generates images in the Red Bull doodle style using the Replicate API.

## Features

- Generate unique illustrations in the Red Bull doodle style
- Simple and intuitive user interface
- Mobile-friendly design
- Customizable text prompts

## Technologies Used

- Node.js & Express
- EJS templates
- Replicate API for AI image generation
- Vercel for deployment

## Getting Started

### Prerequisites

- Node.js 18 or later
- A Replicate API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/redbull-doodles-generator.git
cd redbull-doodles-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Replicate API key:
```
REPLICATE_API_TOKEN=your_replicate_api_key
```

4. Start the development server:
```bash
npm start
```

5. Open your browser and navigate to http://localhost:3001

## Deployment

This application is designed to be easily deployed to Vercel:

1. Push your code to GitHub
2. Import the project into Vercel
3. Add your REPLICATE_API_TOKEN as an environment variable
4. Deploy!

## License

This project is licensed under the MIT License. 