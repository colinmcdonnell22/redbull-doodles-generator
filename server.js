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
    // Check if the prompt already contains "DOODL" 
    if (prompt.toLowerCase().includes("doodl")) {
        return prompt; // Return the prompt as is if it already mentions DOODL
    }
    
    // Add "in DOODL style" to the end of the prompt
    return `${prompt} in DOODL style`;
};

// Serve the form page
app.get("/", (req, res) => {
    res.render("index"); // Render the 'index.ejs' file
});

// Handle form submission and generate the image
app.post("/generate", async (req, res) => {
    const {
        prompt, // User input
        guidance_scale,
        num_inference_steps,
    } = req.body;

    try {
        // Modify the prompt to include "in DOODL style" if needed
        const modifiedPrompt = ensureTweakInPrompt(prompt);

        // Use the exact model version from the API docs
        const prediction = await replicate.run(
            "colinmcdonnell22/redbull_doodles:14c616496f87e094a49107a67ef5b7221c25c8bbee980913cbd24e59ff3c2591",
            {
                input: {
                    prompt: modifiedPrompt,
                    // Only include parameters if they're actually used by the model
                    // Based on your API example, the model might only need the prompt
                    // But we'll keep some basic parameters that might be useful
                    guidance_scale: parseFloat(guidance_scale),
                    num_inference_steps: parseInt(num_inference_steps),
                }
            }
        );

        // From the docs, it appears the output might be an array of images
        const imageUrl = prediction[0]; // The output is expected to be an array of image URLs

        // Pass original prompt to the results page, not the modified one
        res.render("result", { imageUrl, prompt: prompt }); 
    } catch (error) {
        console.error("Error generating image:", error);
        res.status(500).send("Something went wrong!");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}`);
});
