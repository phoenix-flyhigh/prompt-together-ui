import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

type SuccessResponse = {
  response: string;
};

type ErrorResponse = {
  message: string;
};

export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ message: "Prompt is required" });
      return;
    }

    console.log(prompt);
    
    // const response = await ai.models.generateContent({
    //   model: "gemini-2.0-flash",
    //   contents: prompt,
    // });
    
    // if (!response || !response.text) {
    //   res.status(500).json({ message: "No response body from DeepSeek" });
    //   return;
    // }
    
    console.log("successfully got AI response");
    // return res.status(200).json({ response: response.text});
    return res.status(200).json({ response: "random text"});
  } catch (error) {
    console.error("Error handling request:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}
