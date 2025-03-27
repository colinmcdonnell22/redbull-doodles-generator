import Replicate from "replicate";
import * as dotenv from "dotenv";

dotenv.config();

async function testReplicateAPI() {
  console.log("Testing Replicate API connection...");
  console.log("Using API token:", process.env.REPLICATE_API_TOKEN);
  
  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
    
    console.log("Replicate client initialized successfully");
    
    // Make a simple API call to verify permissions
    const prediction = await replicate.run(
      "colinmcdonnell22/redbull_doodles:14c616496f87e094a49107a67ef5b7221c25c8bbee980913cbd24e59ff3c2591",
      {
        input: {
          prompt: "a DOODL of a simple red circle",
        }
      }
    );
    
    console.log("API call successful!");
    console.log("Prediction result:", prediction);
    return true;
  } catch (error) {
    console.error("Error connecting to Replicate API:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    return false;
  }
}

testReplicateAPI(); 