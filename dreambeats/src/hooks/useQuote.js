import { useState, useEffect } from 'react';

export const useQuote = () => {
  const [quote, setQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        // Vérifie si une citation a déjà été récupérée aujourd'hui
        const storedQuote = localStorage.getItem('dailyQuote');
        const storedDate = localStorage.getItem('quoteDate');
        const today = new Date().toDateString();

        if (storedQuote && storedDate === today) {
          setQuote(JSON.parse(storedQuote));
          setIsLoading(false);
          return;
        }

        const response = await fetch('https://api.quotable.io/random?tags=inspirational,wisdom');
        const data = await response.json();
        
        const quoteData = {
          content: data.content,
          author: data.author
        };

        // Stocke la citation du jour
        localStorage.setItem('dailyQuote', JSON.stringify(quoteData));
        localStorage.setItem('quoteDate', today);
        
        setQuote(quoteData);
      } catch (err) {
        setError('Failed to fetch quote');
        // Utilise une citation de secours en cas d'erreur
        setQuote({
          content: "The only way to do great work is to love what you do.",
          author: "Steve Jobs"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, []);

  return { quote, isLoading, error };
}; 