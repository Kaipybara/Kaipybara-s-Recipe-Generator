import React, { useState, useCallback, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { Recipe } from './types';
import { generateRecipesAndImages } from './services/geminiService';
import RecipeDisplay from './components/RecipeDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import RecipeCarousel from './components/RecipeCarousel';

export interface RecipeResult {
  recipe: Recipe;
  imageUrl: string;
}

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [recipeResults, setRecipeResults] = useState<RecipeResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0); // For carousel
  const activeCardRef = useRef<HTMLDivElement>(null); // For saving image

  const handleGenerateRecipe = useCallback(async () => {
    if (!userInput.trim()) {
      setError('Please enter some ingredients or a dish name.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecipeResults([]);
    setCurrentIndex(0); // Reset index for new search

    try {
      const results = await generateRecipesAndImages(userInput);
       if (results.length === 0) {
        setError("Sorry, I couldn't come up with any recipes for that. Please try a different request.");
      } else {
        setRecipeResults(results);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userInput]);

  const handleSaveRecipe = useCallback(() => {
    if (!activeCardRef.current || recipeResults.length === 0) {
      return;
    }
    // Determine the active recipe. If it's a carousel, use currentIndex. If not, it's the first one.
    const activeRecipe = recipeResults.length > 1 ? recipeResults[currentIndex].recipe : recipeResults[0].recipe;

    htmlToImage.toPng(activeCardRef.current, { cacheBust: true, pixelRatio: 2 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${activeRecipe.recipeName.replace(/\s+/g, '_').toLowerCase()}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Failed to save recipe image:', err);
      });
  }, [recipeResults, currentIndex]);


  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleGenerateRecipe();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans overflow-x-hidden">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 py-2">
            Kaipybara's Recipe Generator
          </h1>
          <p className="mt-2 text-base md:text-lg text-gray-600 dark:text-gray-400">
            What culinary creation are you dreaming of today?
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="relative flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., 'Chicken, broccoli, soy sauce' or 'Thanksgiving Turkey'"
              className="w-full px-5 py-4 text-base sm:text-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-full focus:outline-none focus:ring-4 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-300 shadow-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleGenerateRecipe}
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-4 bg-orange-500 text-white text-lg font-semibold rounded-full hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {isLoading ? 'Cooking...' : 'Generate'}
            </button>
          </div>

          <div className="mt-12 md:mt-16">
            {isLoading && <LoadingSpinner />}
            {error && (
              <div className="text-center p-6 bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 rounded-lg">
                <p>{error}</p>
              </div>
            )}
            {!isLoading && !error && recipeResults.length > 0 && (
                <div className="animate-fade-in">
                {recipeResults.length > 1 ? (
                  <>
                    <div className="text-center mb-4">
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Here are a few ideas for you!</h2>
                      <p className="text-gray-600 dark:text-gray-400">Click on a side card to switch.</p>
                    </div>
                    <RecipeCarousel 
                        results={recipeResults} 
                        currentIndex={currentIndex}
                        onCurrentIndexChange={setCurrentIndex}
                        activeCardRef={activeCardRef}
                    />
                  </>
                ) : (
                  <RecipeDisplay ref={activeCardRef} recipe={recipeResults[0].recipe} imageUrl={recipeResults[0].imageUrl} />
                )}
                 <div className="text-center mt-8 relative z-40">
                    <button
                        onClick={handleSaveRecipe}
                        className="px-8 py-3 bg-green-600 text-white text-lg font-semibold rounded-full hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        Save Current Recipe
                    </button>
                </div>
              </div>
            )}
            {!isLoading && !error && recipeResults.length === 0 && (
               <div className="text-center text-gray-500 dark:text-gray-400 p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                 <h2 className="text-xl sm:text-2xl font-semibold mb-2">Welcome!</h2>
                 <p>Enter some ingredients to see what you can make, or ask for a specific dish.</p>
                 <p className="mt-4 text-sm">You could try "healthy salmon dinner", "vegan pasta with mushrooms", or "quick breakfast with eggs and avocado".</p>
               </div>
            )}
          </div>
        </div>
      </main>
      <footer className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;