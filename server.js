import express from "express"; // Import Express
import bodyParser from "body-parser"; // Import Body-Parser for form parsing
import Replicate from "replicate"; // Import Replicate API client
import * as dotenv from "dotenv"; // Import dotenv for environment variables
import path from "path";
import { fileURLToPath } from "url";

dotenv.config(); // Load environment variables from .env file

// Get the current directory name (for resolving paths)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); // Initialize Express
const port = process.env.PORT || 3001; // Use dynamic port from environment or fallback to 3001

// Debug environment variables
console.log("Environment setup:", {
    nodeEnv: process.env.NODE_ENV,
    hasApiToken: !!process.env.REPLICATE_API_TOKEN,
    apiTokenLength: process.env.REPLICATE_API_TOKEN ? process.env.REPLICATE_API_TOKEN.length : 0,
    // Don't log the actual token for security reasons
    apiTokenFirstChars: process.env.REPLICATE_API_TOKEN ? `${process.env.REPLICATE_API_TOKEN.substring(0, 4)}...` : 'none'
});

// Configure Replicate client
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN, // Use API token from .env file
});

// Middleware
app.set("views", path.join(__dirname, "views")); // Explicitly set the views directory
app.set("view engine", "ejs"); // Use EJS for templating
app.use(express.static("public")); // Serve static files from the "public" folder
app.use(bodyParser.urlencoded({ extended: true })); // Parse form data

// Function to ensure "DOODL style" is in the prompt
const ensureTweakInPrompt = (prompt) => {
    // Check if prompt exists
    if (!prompt) {
        return "DOODL style"; // Return a default prompt if the input is undefined
    }
    
    // Create a properly formatted prompt with DOODL at the beginning and end
    let modifiedPrompt = prompt.trim();
    
    // Only add DOODL prefix if it's not already at the beginning
    if (!modifiedPrompt.toLowerCase().startsWith("doodl")) {
        modifiedPrompt = `DOODL ${modifiedPrompt}`;
    }
    
    // Only add "in DOODL style" if it's not already at the end
    if (!modifiedPrompt.toLowerCase().endsWith("doodl style") && 
        !modifiedPrompt.toLowerCase().includes("in doodl style")) {
        modifiedPrompt = `${modifiedPrompt} in DOODL style`;
    }
    
    console.log(`Original prompt: "${prompt}" | Modified prompt: "${modifiedPrompt}"`);
    return modifiedPrompt;
};

// Serve the form page
app.get("/", (req, res) => {
    res.render("index"); // Render the 'index.ejs' file
});

// Health check route for testing API connectivity
app.get("/api-check", async (req, res) => {
    try {
        console.log("Checking Replicate API connection...");
        // Simple validation of the API token setup
        if (!process.env.REPLICATE_API_TOKEN) {
            return res.status(500).json({ 
                status: "error", 
                message: "API token not configured" 
            });
        }
        
        // Test API connectivity with a minimal request
        const testResult = await replicate.models.get("stability-ai/stable-diffusion");
        
        return res.json({ 
            status: "success", 
            message: "API connection successful",
            hasApiToken: !!process.env.REPLICATE_API_TOKEN,
            tokenLength: process.env.REPLICATE_API_TOKEN.length
        });
    } catch (error) {
        console.error("API check error:", error);
        return res.status(500).json({ 
            status: "error", 
            message: error.message || "Unknown error",
            stack: process.env.NODE_ENV === 'production' ? null : error.stack
        });
    }
});

// Handle form submission and generate the image
app.post("/generate", async (req, res) => {
    console.log("Received form submission:", {
        hasBody: !!req.body,
        contentType: req.get('Content-Type'),
        bodyKeys: req.body ? Object.keys(req.body) : [],
        bodyValues: JSON.stringify(req.body)
    });

    // Validate request body
    if (!req.body) {
        return res.status(400).render("error", { 
            error: "Missing request body" 
        });
    }

    // Get form data with validation
    const prompt = req.body.prompt || ""; // Default to empty string if undefined
    const guidance_scale = req.body.guidance_scale || "7.0";
    const num_inference_steps = req.body.num_inference_steps || "30";
    
    if (!prompt.trim()) {
        return res.status(400).render("error", { 
            error: "Please enter a prompt to generate an image" 
        });
    }

    try {
        // Modify the prompt to include "in DOODL style" if needed
        const modifiedPrompt = ensureTweakInPrompt(prompt);

        console.log("Sending request to Replicate with prompt:", modifiedPrompt);
        
        // Use the exact model version from the API docs
        const prediction = await replicate.run(
            "colinmcdonnell22/redbull_doodles:14c616496f87e094a49107a67ef5b7221c25c8bbee980913cbd24e59ff3c2591",
            {
                input: {
                    prompt: modifiedPrompt,
                    // Only include parameters if they're actually used by the model
                    guidance_scale: parseFloat(guidance_scale) || 7.0,
                    num_inference_steps: parseInt(num_inference_steps) || 30,
                }
            }
        );

        console.log("Received prediction response");
        
        // The result might be a ReadableStream
        if (prediction[0] && prediction[0] instanceof ReadableStream) {
            console.log("Processing ReadableStream response...");
            try {
                // Convert the ReadableStream to a Buffer
                const streamResponse = prediction[0];
                const reader = streamResponse.getReader();
                const chunks = [];
                
                let done = false;
                while (!done) {
                    const { value, done: doneReading } = await reader.read();
                    done = doneReading;
                    if (value) {
                        chunks.push(value);
                    }
                }
                
                // Combine the chunks into a single Buffer
                const imageBuffer = Buffer.concat(chunks);
                console.log(`Successfully processed image stream (${imageBuffer.length} bytes)`);
                
                // Send the image as a base64 data URL
                const base64Image = `data:image/webp;base64,${imageBuffer.toString('base64')}`;
                res.render("result", { imageUrl: base64Image, prompt: prompt });
            } catch (streamError) {
                console.error("Error processing stream:", streamError);
                res.status(500).render("error", { 
                    error: "Error processing the image stream. Please try again." 
                });
            }
        } else if (prediction[0] && typeof prediction[0] === 'string') {
            // Handle as URL if it's a string (direct URL)
            const imageUrl = prediction[0];
            console.log("Image URL:", imageUrl);
            
            res.render("result", { imageUrl, prompt: prompt });
        } else {
            console.error("Unexpected prediction format:", prediction);
            res.status(500).render("error", { 
                error: "Received an unexpected response format from the image generation service."
            });
        }
    } catch (error) {
        console.error("Error generating image:", error);
        
        let errorMessage = "Something went wrong while generating your image.";
        
        // Check for specific error types
        if (error.message && error.message.includes("API key")) {
            errorMessage = "API authentication error. Please check your API key.";
        } else if (error.message && error.message.includes("timed out")) {
            errorMessage = "The request timed out. Please try again with a simpler prompt.";
        } else if (error.response && error.response.status === 429) {
            errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
        } else if (error.response && error.response.data && error.response.data.detail) {
            errorMessage = error.response.data.detail;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        res.status(500).render("error", { error: errorMessage });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}`);
});
