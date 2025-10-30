import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const localizationSchema = {
  type: Type.OBJECT,
  description: "Localized strings for UI labels in the detected language.",
  properties: {
    prepTime: { type: Type.STRING, description: "Translation for 'Prep Time'." },
    cookTime: { type: Type.STRING, description: "Translation for 'Cook Time'." },
    servings: { type: Type.STRING, description: "Translation for 'Servings'." },
    nutrition: { type: Type.STRING, description: "Translation for 'Nutrition (per serving)'." },
    estimatedCalories: { type: Type.STRING, description: "Translation for 'Estimated Calories'." },
    ingredients: { type: Type.STRING, description: "Translation for 'Ingredients'." },
    instructions: { type: Type.STRING, description: "Translation for 'Instructions'." },
    ingredient: { type: Type.STRING, description: "Translation for 'Ingredient' (table header)." },
    amount: { type: Type.STRING, description: "Translation for 'Amount' (table header)." },
    protein: { type: Type.STRING, description: "Translation for 'Protein'." },
    carbs: { type: Type.STRING, description: "Translation for 'Carbs'." },
    fat: { type: Type.STRING, description: "Translation for 'Fat'." },
  },
  required: ["prepTime", "cookTime", "servings", "nutrition", "estimatedCalories", "ingredients", "instructions", "ingredient", "amount", "protein", "carbs", "fat"]
};


const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    recipeName: {
      type: Type.STRING,
      description: "The name of the recipe.",
    },
    description: {
      type: Type.STRING,
      description: "A short, enticing description of the dish.",
    },
    prepTime: {
        type: Type.STRING,
        description: "Estimated preparation time, e.g., '15 minutes'."
    },
    cookTime: {
        type: Type.STRING,
        description: "Estimated cooking time, e.g., '30 minutes'."
    },
    servings: {
        type: Type.STRING,
        description: "Number of servings the recipe makes, e.g., '4 servings'."
    },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        description: "A single ingredient, separating the amount from the name.",
        properties: {
            amount: {
                type: Type.STRING,
                description: "The quantity of the ingredient, e.g., '1 cup', '2 tbsp', '100g'."
            },
            name: {
                type: Type.STRING,
                description: "The name of the ingredient, e.g., 'all-purpose flour', 'chicken breast'."
            }
        },
        required: ["amount", "name"],
      },
    },
    instructions: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
        description: "A single step in the cooking instructions."
      },
    },
    calories: {
      type: Type.STRING,
      description: "Estimated calories per serving, e.g., '450 kcal'."
    },
    macros: {
      type: Type.OBJECT,
      properties: {
        protein: {
          type: Type.NUMBER,
          description: "Grams of protein per serving."
        },
        carbs: {
          type: Type.NUMBER,
          description: "Grams of carbohydrates per serving."
        },
        fat: {
          type: Type.NUMBER,
          description: "Grams of fat per serving."
        },
      },
      required: ["protein", "carbs", "fat"],
    },
    localization: localizationSchema,
  },
  required: ["recipeName", "description", "prepTime", "cookTime", "servings", "ingredients", "instructions", "calories", "macros", "localization"],
};

const multiRecipeSchema = {
    type: Type.ARRAY,
    items: recipeSchema,
}

export const generateRecipesAndImages = async (prompt: string): Promise<{ recipe: Recipe; imageUrl: string; }[]> => {
  try {
    const generationPrompt = `Analyze the user's food request: "${prompt}".

1. **Language Detection**: First, detect the language of the user's request.

2. **Localization**: You MUST provide a 'localization' object containing translations for all required UI labels in the detected language. This is critical for the user interface. For example, if the request is in Spanish, 'prepTime' should be 'Tiempo de preparación'.

3. **Request Analysis**: Determine if the request is for a single, specific, well-known dish (like 'Thanksgiving Turkey', 'Classic Beef Wellington') OR if it's a general request, a list of ingredients, or a creative concept (like 'healthy dinner', 'something with chicken and broccoli').

4. **Recipe Generation (Specific Dish)**: If the request is for a single, specific, well-known dish, generate exactly ONE classic and traditional recipe for it. All text in your response (recipe names, descriptions, ingredients, instructions) MUST be in the detected language.

5. **Recipe Generation (General Request)**: If the request is general, a list of ingredients, or a creative concept, generate up to THREE distinct and appealing recipe options. All text in your response (recipe names, descriptions, ingredients, instructions) MUST be in the detected language.

6. **Nutrition**: For each recipe, provide an estimated nutritional breakdown per serving.

7. **Ingredient Formatting**: For the ingredients list, provide an array of objects. Each object must have an "amount" and a "name".

8. **Output Format**: IMPORTANT: Always return your response as a JSON array of recipe objects, adhering to the provided schema. For specific dishes, this array will contain only one recipe object. For general requests, it will contain up to three recipe objects. If you cannot fulfill the request, return an empty array.`;

    // Step 1: Generate the structured recipe data
    const recipeResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: generationPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: multiRecipeSchema,
      },
    });

    const jsonText = recipeResponse.text.trim();
    const recipeDataArray: Recipe[] = JSON.parse(jsonText);

    if (!Array.isArray(recipeDataArray)) {
        throw new Error("Invalid recipe format received from API. Expected an array.");
    }
    
    if (recipeDataArray.length === 0) {
        return [];
    }

    // Step 2: Generate an image for each recipe in parallel
    const imageGenerationPromises = recipeDataArray.map(recipe => {
        // Image prompt should be in English for better consistency with the image model
        const imagePrompt = `A high-quality, delicious-looking photograph of "${recipe.recipeName}", studio lighting, appetizing. ${recipe.description}`;
        return ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: imagePrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '16:9',
            },
        });
    });

    const imageResponses = await Promise.all(imageGenerationPromises);

    const results = recipeDataArray.map((recipe, index) => {
        const imageResponse = imageResponses[index];
        const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
        if (!base64ImageBytes) {
          // Fallback or throw error. For now, let's throw.
          throw new Error(`Failed to generate image for recipe: ${recipe.recipeName}`);
        }
        const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
        return { recipe, imageUrl };
    });

    return results;

  } catch (error) {
    console.error("Error generating recipe and image:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check for specific quota error messages
    if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota')) {
        // A more helpful message for the user
        throw new Error("You've exceeded your API request quota. Please check your plan and billing details. You can monitor your usage at https://ai.dev/usage.");
    }
    
    // Generic fallback error
    throw new Error("Failed to generate recipe from the API. The kitchen might be busy, please try again.");
  }
};