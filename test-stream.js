import Replicate from "replicate";
import * as dotenv from "dotenv";
import fs from "fs/promises";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";

dotenv.config();

async function testReplicateStreamHandling() {
  console.log("Testing Replicate API stream handling...");
  
  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
    
    console.log("Making API call to Red Bull Doodles model...");
    const prediction = await replicate.run(
      "colinmcdonnell22/redbull_doodles:14c616496f87e094a49107a67ef5b7221c25c8bbee980913cbd24e59ff3c2591",
      {
        input: {
          prompt: "a DOODL of a red bull can with wings",
        }
      }
    );
    
    console.log("Prediction result type:", typeof prediction[0]);
    console.log("Is ReadableStream?", prediction[0] instanceof ReadableStream);
    
    if (prediction[0] instanceof ReadableStream) {
      console.log("Processing ReadableStream...");
      
      // Method 1: Using stream reader
      const streamResponse = prediction[0];
      const reader = streamResponse.getReader();
      const chunks = [];
      
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          chunks.push(value);
          console.log("Received chunk of size:", value.length);
        }
      }
      
      const imageBuffer = Buffer.concat(chunks);
      console.log("Total image size:", imageBuffer.length);
      
      // Save the image
      await fs.writeFile("test-output.webp", imageBuffer);
      console.log("Image saved to test-output.webp");
      
      return true;
    } else {
      console.log("Output is not a ReadableStream, value:", prediction[0]);
      return false;
    }
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    return false;
  }
}

testReplicateStreamHandling(); 