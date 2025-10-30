
export interface Localization {
  prepTime: string;
  cookTime: string;
  servings: string;
  nutrition: string;
  estimatedCalories: string;
  ingredients: string;
  instructions: string;
  ingredient: string;
  amount: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface Recipe {
  recipeName: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  ingredients: {
    amount: string;
    name: string;
  }[];
  instructions: string[];
  calories: string;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  localization: Localization;
}