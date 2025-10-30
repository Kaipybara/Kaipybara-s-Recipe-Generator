import React from 'react';
import { Recipe, Localization } from '../types';

interface RecipeDisplayProps {
  recipe: Recipe;
  imageUrl: string | null;
}

// Helper function to capitalize the first letter of each word
const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const InfoPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex flex-col items-center bg-orange-100 dark:bg-orange-900/50 p-3 rounded-lg text-center">
        <span className="text-sm font-medium text-orange-600 dark:text-orange-300">{label}</span>
        <span className="text-lg font-bold text-gray-800 dark:text-white">{value}</span>
    </div>
);

const MacroBar: React.FC<{ macros: Recipe['macros'], localization: Localization }> = ({ macros, localization }) => {
    const { protein, carbs, fat } = macros;
    const totalMacros = protein + carbs + fat;

    if (totalMacros === 0) {
        return null; // Don't render the bar if there's no data
    }

    const proteinPercentage = (protein / totalMacros) * 100;
    const carbsPercentage = (carbs / totalMacros) * 100;
    const fatPercentage = (fat / totalMacros) * 100;

    return (
        <div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4 flex overflow-hidden my-2">
                <div style={{ width: `${proteinPercentage}%` }} className="bg-sky-500 transition-all duration-500" title={`${localization.protein}: ${protein}g`}></div>
                <div style={{ width: `${carbsPercentage}%` }} className="bg-amber-500 transition-all duration-500" title={`${localization.carbs}: ${carbs}g`}></div>
                <div style={{ width: `${fatPercentage}%` }} className="bg-red-500 transition-all duration-500" title={`${localization.fat}: ${fat}g`}></div>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-between text-xs text-gray-600 dark:text-gray-400 gap-x-4 gap-y-1">
                <div className="flex items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-500 mr-1.5"></span>
                    <span><strong>{localization.protein}:</strong> {protein}g</span>
                </div>
                <div className="flex items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 mr-1.5"></span>
                    <span><strong>{localization.carbs}:</strong> {carbs}g</span>
                </div>
                <div className="flex items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 mr-1.5"></span>
                    <span><strong>{localization.fat}:</strong> {fat}g</span>
                </div>
            </div>
        </div>
    );
};


const RecipeDisplay = React.forwardRef<HTMLDivElement, RecipeDisplayProps>(({ recipe, imageUrl }, ref) => {
    const { localization } = recipe;
    
    return (
        <div ref={ref} className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        
        {imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden shadow-md aspect-video bg-gray-200 dark:bg-gray-700">
                <img src={imageUrl} alt={recipe.recipeName} className="w-full h-full object-cover" />
            </div>
        )}

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">{recipe.recipeName}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">{recipe.description}</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
            <InfoPill label={localization.prepTime} value={recipe.prepTime} />
            <InfoPill label={localization.cookTime} value={recipe.cookTime} />
            <InfoPill label={localization.servings} value={recipe.servings} />
        </div>

        {recipe.calories && recipe.macros && (
             <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">{localization.nutrition}</h3>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                    {localization.estimatedCalories}: <span className="font-bold text-orange-600 dark:text-orange-400">{recipe.calories}</span>
                </p>
                <MacroBar macros={recipe.macros} localization={localization} />
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b-2 border-orange-400 pb-2">{localization.ingredients}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-700 dark:text-gray-300">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                        <tr>
                            <th scope="col" className="pb-2 font-semibold">{localization.ingredient}</th>
                            <th scope="col" className="pb-2 font-semibold w-1/3 text-right">{localization.amount}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recipe.ingredients.map((ingredient, index) => (
                        <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                            <td className="py-2 pr-2 font-bold">{capitalizeWords(ingredient.name)}</td>
                            <td className="py-2 text-right">{ingredient.amount}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
              </div>
            </div>
            
            <div>
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b-2 border-orange-400 pb-2">{localization.instructions}</h3>
            <ol className="space-y-4 text-gray-700 dark:text-gray-300">
                {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                    <span className="mr-3 flex-shrink-0 bg-orange-500 text-white font-bold h-6 w-6 rounded-full flex items-center justify-center text-sm">{index + 1}</span>
                    <span>{instruction}</span>
                </li>
                ))}
            </ol>
            </div>
        </div>
        </div>
    );
});

export default RecipeDisplay;