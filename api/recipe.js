// Global Mock Kitchen Database (In-Memory RAM)
let dynamicRecipes = [
    { id: "recipe_1", title: "3-Ingredient Banana Pancakes", steps: "1. Mash 1 banana.\n2. Whisk with 2 eggs.\n3. Fry in a pan until golden.", diet: "Keto", favorites: 142 },
    { id: "recipe_2", title: "Crispy Garlic Chili Noodles", steps: "1. Boil noodles.\n2. Mix hot oil with minced garlic, soy sauce, and chili flakes.\n3. Toss together.", diet: "Vegan", favorites: 389 },
    { id: "recipe_3", title: "Creamy Avocado Toast", steps: "1. Toast your bread.\n2. Mash avocado with lemon juice, salt, and pepper.\n3. Spread and serve.", diet: "Veg", favorites: 95 },
    { id: "recipe_4", title: "Quick Berry Protein Smoothie", steps: "1. Add frozen berries, protein powder, and milk to a blender.\n2. Blend until smooth.", diet: "Veg", favorites: 64 }
];

let communitySubmissions = [];

export default async function handler(req, res) {
    // Unlocked CORS Cross-Origin Policies
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const dietParam = req.query.diet;

    // --- 1. HANDLE GET REQUESTS (FETCH & FILTER) ---
    if (req.method === 'GET') {
        // Filter by diet query parameters (e.g. ?diet=Vegan)
        if (dietParam) {
            const filtered = dynamicRecipes.filter(item => item.diet.toLowerCase() === dietParam.toLowerCase());
            return res.status(200).json({ success: true, count: filtered.length, data: filtered });
        }
        // Default: Fetch all recipes combined with user community inputs
        return res.status(200).json({ 
            success: true, 
            count: dynamicRecipes.length, 
            data: [...dynamicRecipes, ...communitySubmissions] 
        });
    }

    // --- 2. HANDLE POST REQUESTS (MUTATE & SUBMIT) ---
    if (req.method === 'POST') {
        const { action, id, title, steps, diet } = req.body;

        // Action A: "Favorite" a recipe to increment its score counter
        if (action === "favorite" && id) {
            // Check core recipes first
            let recipe = dynamicRecipes.find(item => item.id === id);
            // If not found, check community submissions array
            if (!recipe) recipe = communitySubmissions.find(item => item.id === id);

            if (recipe) {
                recipe.favorites += 1;
                return res.status(200).json({ success: true, message: "Added to favorites! ❤️", updatedFavorites: recipe.favorites });
            }
            return res.status(404).json({ error: "Recipe resource ID not found" });
        }

        // Action B: Submit a new custom community 3-step recipe
        if (title && steps && diet) {
            const newRecipe = {
                id: `user_recipe_${Date.now()}`,
                title,
                steps,
                diet,
                favorites: 0
            };
            communitySubmissions.push(newRecipe);
            return res.status(201).json({ success: true, message: "Chef alert! Your recipe is live!", data: newRecipe });
        }

        return res.status(400).json({ error: "Invalid body parameters or missing required fields" });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
}
