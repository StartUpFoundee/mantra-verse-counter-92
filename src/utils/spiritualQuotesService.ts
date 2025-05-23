
/**
 * Service for fetching spiritual quotes from external APIs
 * Currently includes offline quotes as a fallback
 */

// Default collection of spiritual quotes in both English and Hindi
const defaultQuotes = [
  {
    english: "Meditate, that in the midst of chaos you find peace.",
    hindi: "ध्यान करें, कि अराजकता के बीच में आप शांति पा सकें।"
  },
  {
    english: "The journey of a thousand mantras begins with a single chant.",
    hindi: "हज़ार मंत्रों की यात्रा एक जाप से शुरू होती है।"
  },
  {
    english: "When you repeat the name of the divine, the divine repeats yours.",
    hindi: "जब आप दिव्य का नाम दोहराते हैं, तो दिव्य आपका नाम दोहराता है।"
  },
  {
    english: "In the silence between mantras, wisdom speaks.",
    hindi: "मंत्रों के बीच के मौन में, ज्ञान बोलता है।"
  },
  {
    english: "The sound of your mantra is the echo of your soul.",
    hindi: "आपके मंत्र की आवाज आपकी आत्मा की प्रतिध्वनि है।"
  },
  {
    english: "To chant is to invite divine presence into our lives.",
    hindi: "जाप करना हमारे जीवन में दिव्य उपस्थिति को आमंत्रित करना है।"
  },
  {
    english: "The deepest prayer needs no words, only devotion.",
    hindi: "सबसे गहरी प्रार्थना को शब्दों की नहीं, केवल भक्ति की आवश्यकता होती है।"
  },
  {
    english: "As the mala beads move through your fingers, let worries slip away.",
    hindi: "जैसे माला के मनके आपकी उंगलियों से गुजरते हैं, चिंताओं को दूर जाने दें।"
  }
];

// Cache quotes in memory for faster retrieval
let cachedRandomQuotes: { english: string; hindi: string }[] = [];

interface QuoteResponse {
  english: string;
  hindi: string;
}

// Function to fetch a quote from an API (can be enabled later with API key)
export const fetchQuoteFromAPI = async (): Promise<QuoteResponse> => {
  try {
    // This API URL is a placeholder - you would replace with actual API when you have the key
    // For now this function will always "fail" and use the fallback
    const response = await fetch('https://api.example.com/spiritual-quotes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${API_KEY}` // Uncomment when API key is available
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch quote');
    }
    
    const data = await response.json();
    return {
      english: data.quote,
      hindi: data.hindi_translation || "हिंदी अनुवाद उपलब्ध नहीं है।" // Fallback if no Hindi translation
    };
  } catch (error) {
    console.log('Error fetching quote, using default quote:', error);
    // Return a random quote from the default collection as fallback
    return getRandomDefaultQuote();
  }
};

// Preload quotes to memory for faster access
export const preloadQuotes = () => {
  // Create a random shuffled copy of the quotes for better variety
  cachedRandomQuotes = [...defaultQuotes].sort(() => Math.random() - 0.5);
};

// Initialize the preloaded quotes
preloadQuotes();

// Function to get a random quote from our default collection with better performance
export const getRandomDefaultQuote = (): QuoteResponse => {
  // If we've used all our cached quotes, refresh them
  if (cachedRandomQuotes.length === 0) {
    preloadQuotes();
  }
  
  // Take the next quote from our shuffled array (this is faster than random access)
  // and remove it from the cache so we don't repeat until we've gone through all quotes
  return cachedRandomQuotes.pop() || defaultQuotes[0];
};

// Main function to get a spiritual quote (tries API first, falls back to defaults)
export const getSpiritualQuote = async (): Promise<QuoteResponse> => {
  try {
    // For now, we'll just use the default quotes
    // Later when API key is provided, you can uncomment the line below
    // return await fetchQuoteFromAPI();
    
    return getRandomDefaultQuote();
  } catch (error) {
    console.error('Failed to get spiritual quote:', error);
    return getRandomDefaultQuote();
  }
};

export default {
  getSpiritualQuote,
  getRandomDefaultQuote,
  fetchQuoteFromAPI,
  preloadQuotes
};
