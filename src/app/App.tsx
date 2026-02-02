import { useState, useEffect, useMemo } from 'react';
import { BookOpen, RefreshCw, Sparkles } from 'lucide-react';
import bibleVerses from '../data/verses.json';

// Type for verse with optional similar verses from enriched data
interface Verse {
  text: string;
  reference: string;
  similar_verses?: { reference: string; similarity: number }[];
  cluster_label?: string;
}

// Format cluster label for display (e.g., "faith_guidance_scripture" → "Faith, Guidance & Scripture")
function formatTheme(label: string): string {
  const words = label
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1));

  if (words.length <= 1) return words[0] || '';
  if (words.length === 2) return words.join(' & ');
  return words.slice(0, -1).join(', ') + ' & ' + words[words.length - 1];
}

// Religious art backgrounds (paths relative to base URL)
const artImages = [
  'religious_art/Bouguereau-Linnocence.webp',
  'religious_art/Edward_Burne-Jones_The_Golden_Stairs.webp',
  'religious_art/Leonardo_da_Vinci_-_Virgin_of_the_Rocks.webp',
  'religious_art/Michelangelo_-_Creation_of_Adam.webp',
  'religious_art/Pierre_Mignard_-_The_Virgin_of_the_Grapes.webp',
  'religious_art/The_Triumph_of_St._Ignatius.webp',
  'religious_art/velasquez-coronacion.webp',
].map(path => import.meta.env.BASE_URL + path);

// Get BibleGateway URL for the chapter (strips verse numbers)
function getBibleGatewayUrl(reference: string): string {
  // "Proverbs 3:5-6" → "Proverbs 3"
  const chapterOnly = reference.replace(/:\d+(-\d+)?$/, '');
  return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(chapterOnly)}&version=NKJV`;
}

// Function to get verse based on the current date
function getDailyVerse(date: Date): Verse {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % bibleVerses.length;
  return bibleVerses[index] as Verse;
}

export default function App() {
  const [currentVerse, setCurrentVerse] = useState<Verse>(() => getDailyVerse(new Date()));
  const [isAnimating, setIsAnimating] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [showCard, setShowCard] = useState(true);
  const [similarTheme, setSimilarTheme] = useState<string | null>(null);

  // Build lookup map from reference to verse for O(1) access
  const verseMap = useMemo(() => {
    const map = new Map<string, Verse>();
    for (const verse of bibleVerses) {
      map.set(verse.reference, verse as Verse);
    }
    return map;
  }, []);

  // Pick random image on mount and preload (safe for non-DOM environments)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isLargeScreen = window.innerWidth >= 768;
    const availableImages = isLargeScreen
      ? artImages
      : artImages.filter(img => !img.includes('Michelangelo'));
    const selected = availableImages[Math.floor(Math.random() * availableImages.length)];

    setBackgroundImage(selected);

    const img = new Image();
    img.onload = () => console.log(`Background image loaded: ${selected}`);
    img.onerror = () => console.error(`Failed to load background image: ${selected}`);
    img.src = selected;
  }, []);

  // Function to get a new random verse
  const getNewVerse = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * bibleVerses.length);
      setCurrentVerse(bibleVerses[randomIndex] as Verse);
      setSimilarTheme(null);
      setIsAnimating(false);
    }, 300);
  };

  // Function to get a similar verse (random pick from top 3)
  const getSimilarVerse = () => {
    if (!currentVerse.similar_verses?.length) return;
    const previousTheme = currentVerse.cluster_label;
    setIsAnimating(true);
    setTimeout(() => {
      const similar = currentVerse.similar_verses!;
      const randomPick = similar[Math.floor(Math.random() * similar.length)];
      const verse = verseMap.get(randomPick.reference);
      if (verse) {
        setCurrentVerse(verse);
        setSimilarTheme(previousTheme || null);
      }
      setIsAnimating(false);
    }, 300);
  };

  const imageName = useMemo(() => {
    if (!backgroundImage) return 'Unknown image';
    const file = backgroundImage.split('/').pop() || backgroundImage;
    const base = file.replace(/\.[^.]+$/, '');
    return base.replace(/[_-]+/g, ' ');
  }, [backgroundImage]);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat bg-indigo-900"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
      onClick={() => setShowCard(prev => !prev)}
    >
      {showCard ? (
        <div className="max-w-2xl w-full" onClick={event => event.stopPropagation()}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Header */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <BookOpen className="size-8 text-indigo-600" />
            <h1 className="text-3xl text-indigo-900">Daily Bible Verse</h1>
          </div>

          {/* Date */}
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Verse Content */}
          <div
            aria-live="polite"
            className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
          >
            <blockquote className="text-center mb-6">
              <p className="text-xl md:text-2xl text-gray-800 leading-relaxed italic mb-4">
                "{currentVerse.text}"
              </p>
              <footer className="text-lg">
                —{' '}
                <a
                  href={getBibleGatewayUrl(currentVerse.reference)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-700 hover:text-indigo-900 underline"
                >
                  {currentVerse.reference}
                </a>
              </footer>
              {similarTheme && (
                <p className="mt-3 text-sm text-gray-500">
                  Similar by theme: {formatTheme(similarTheme)}
                </p>
              )}
            </blockquote>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 mt-8 flex-wrap">
            <button
              onClick={getNewVerse}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <RefreshCw className={`size-4 ${isAnimating ? 'animate-spin' : ''}`} />
              Get Another Verse
            </button>
            {currentVerse.similar_verses?.length && (
              <button
                onClick={getSimilarVerse}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <Sparkles className="size-4" />
                Similar Verse
              </button>
            )}
          </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              A new verse is displayed each day. Click the button to explore more verses.
            </p>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-6 right-6 bg-white/60 rounded-lg px-3 py-2 shadow-md text-center">
          <p className="text-sm text-gray-900">{imageName}</p>
        </div>
      )}
    </div>
  );
}
