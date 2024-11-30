import express from "express"; // Import Express
import bodyParser from "body-parser"; // Import Body-Parser for form parsing
import Replicate from "replicate"; // Import Replicate API client

import * as dotenv from "dotenv"; // Import dotenv for environment variables
dotenv.config(); // Load environment variables from .env file

const app = express(); // Initialize Express
const port = 3000; // Define the port to run the server

// Configure Replicate client
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN, // Use API token from .env file
});

// Middleware
app.set("view engine", "ejs"); // Use EJS for templating
app.use(express.static("public")); // Serve static files from the "public" folder
app.use(bodyParser.urlencoded({ extended: true })); // Parse form data

// Function to ensure "tweak" is in the prompt
const ensureTweakInPrompt = (prompt) => {
    const tweakVariations = ["tweak style", "tweaks style", "in tweak style", "in tweaks style"];
    const lowerPrompt = prompt.toLowerCase();

    // Check if "tweak" is already in the prompt
    if (lowerPrompt.includes("tweak")) {
        return prompt; // Return the prompt as is
    }

    // Add "in tweak style" to the prompt if not present
    return `${prompt} in tweak style`;
};

// Serve the form page
app.get("/", (req, res) => {
    res.render("index"); // Render the 'index.ejs' file
});

// Handle form submission and generate the image
app.post("/generate", async (req, res) => {
    const {
        prompt,
        lora_scale,
        num_outputs,
        aspect_ratio,
        guidance_scale,
        prompt_strength,
        num_inference_steps,
    } = req.body;

    try {
        // Ensure "tweak" is in the prompt
        const modifiedPrompt = ensureTweakInPrompt(prompt);

        const prediction = await replicate.run(
            "colinmcdonnell22/050md_ai:ffe5df4d14346fa97383cdcec0ec90ecd29b4146c34e663434ea10b1bf2af60d",
            {
                input: {
                    model: "dev", // Fixed value
                    prompt: modifiedPrompt,
                    go_fast: true, // Fixed value
                    lora_scale: Math.min(parseFloat(lora_scale), 3), // Ensure lora_scale does not exceed 3
                    extra_lora_scale: 1, // Fixed value
                    megapixels: "1", // Fixed value
                    num_outputs: parseInt(num_outputs),
                    aspect_ratio,
                    output_format: "png", // Fixed value
                    guidance_scale: parseFloat(guidance_scale),
                    output_quality: 80, // Fixed value
                    prompt_strength: parseFloat(prompt_strength),
                    num_inference_steps: parseInt(num_inference_steps),
                },
            }
        );

        const imageUrl = prediction; // The output is the image URL
        res.render("result", { imageUrl, prompt: modifiedPrompt }); // Render the result page with the modified prompt
    } catch (error) {
        console.error("Error generating image:", error);
        res.status(500).send("Something went wrong!");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}`);
});
