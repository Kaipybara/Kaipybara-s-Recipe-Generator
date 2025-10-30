# Kaipybara's Recipe Generator

Welcome to Kaipybara's Recipe Generator! This is a smart, web-based application that uses the power of Google's Gemini AI to turn your culinary ideas into beautiful, complete recipes. Whether you have a specific dish in mind or just a few ingredients lying around, this app is your creative partner in the kitchen.

## ✨ Features

- **Intelligent Recipe Generation**: The app understands your request. Ask for a specific dish like "Thanksgiving Turkey," and you'll get one classic recipe. Give it a list of ingredients like "chicken, rice, broccoli," and it will suggest up to three different creative options.
- **AI-Generated Dish Images**: Every recipe is paired with a unique, high-quality, AI-generated image of the finished dish, helping you visualize the delicious outcome.
- **Comprehensive Nutritional Info**: Each recipe card includes estimated calories per serving and a clear macronutrient breakdown (protein, carbs, and fat) with a visual bar chart.
- **Fully Multilingual**: The app automatically detects the language of your input and generates the entire recipe—including all the labels like "Ingredients" and "Prep Time"—in that same language.
- **Interactive & Responsive UI**: Browse multiple recipe options with a sleek, intuitive "fan stack" carousel. The entire interface is fully responsive and looks great on desktops, tablets, and mobile phones.
- **Save & Share**: With a single click, you can download the currently displayed recipe card as a high-quality PNG image, perfect for saving or sharing with friends and family.

## 🚀 How to Use

Using the generator is simple:

1.  **Enter Your Request**: In the input box, type what you want to cook. This can be:
    *   A specific dish (e.g., `Classic Beef Lasagna`, `Tarte Tatin`)
    *   A list of ingredients (e.g., `eggs, avocado, cheese, bread`)
    *   A general idea (e.g., `healthy vegan dinner`, `quick breakfast for one`)
2.  **Generate**: Click the **Generate** button and watch the AI work its magic.
3.  **Browse Recipes**: If multiple recipes are generated, they will appear in a stacked carousel. Simply click on a card on the left or right to bring it to the front.
4.  **Review the Details**: Each card contains everything you need: a description, prep/cook times, servings, a formatted ingredient table, step-by-step instructions, and nutritional information.
5.  **Save Your Favorite**: Once you've found a recipe you love, click the **Save Current Recipe** button below the card to download the entire recipe as a beautiful image file.

## 🛠️ Technology Stack

This application is built with modern web technologies and powered by cutting-edge AI.

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **AI & Machine Learning**:
    -   **Google Gemini API**: For generating structured recipe data, performing intelligent request analysis, and localizing UI text.
    -   **Google Imagen API**: For generating high-quality, photorealistic images of the dishes.
-   **Image Conversion**: `html-to-image` library for converting the recipe card component into a downloadable PNG.

## ✍️ Author

This application was lovingly crafted by **Kaipybara**.
