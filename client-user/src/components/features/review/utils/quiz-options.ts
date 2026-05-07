/**
 * Expanded pool of common Japanese learning distractors
 * Includes verbs, nouns, adjectives, and common expressions
 */
const COMMON_DISTRACTORS = [
  // Verbs - Basic actions
  'to study', 'to learn', 'to teach', 'to eat', 'to drink', 'to sleep', 'to wake up',
  'to write', 'to read', 'to speak', 'to talk', 'to listen', 'to hear', 'to see',
  'to watch', 'to look', 'to go', 'to come', 'to return', 'to leave', 'to enter',
  'to buy', 'to sell', 'to get', 'to give', 'to receive', 'to send', 'to bring',
  'to take', 'to make', 'to do', 'to play', 'to work', 'to rest', 'to walk',
  'to run', 'to stop', 'to wait', 'to start', 'to finish', 'to begin', 'to end',
  'to open', 'to close', 'to turn on', 'to turn off', 'to use', 'to think', 'to feel',
  'to know', 'to understand', 'to remember', 'to forget', 'to like', 'to hate',
  'to want', 'to need', 'to hope', 'to wish', 'to try', 'to help', 'to meet',
  // Verbs - Motion/Position
  'to stand up', 'to sit down', 'to lie down', 'to move', 'to stay', 'to live',
  'to die', 'to born', 'to grow', 'to change', 'to become', 'to seem', 'to appear',
  // Nouns - People & Family
  'person', 'people', 'man', 'woman', 'child', 'boy', 'girl', 'baby',
  'family', 'mother', 'father', 'parent', 'sister', 'brother', 'grandmother',
  'grandfather', 'friend', 'teacher', 'student', 'doctor', 'worker',
  // Nouns - Time & Weather
  'time', 'moment', 'now', 'today', 'tomorrow', 'yesterday', 'morning', 'afternoon',
  'evening', 'night', 'week', 'month', 'year', 'season', 'spring', 'summer',
  'autumn', 'winter', 'weather', 'rain', 'snow', 'wind', 'cloud', 'sky', 'sun',
  'moon', 'star',
  // Nouns - Places & Locations
  'place', 'here', 'there', 'where', 'house', 'home', 'room', 'building',
  'school', 'company', 'office', 'shop', 'store', 'market', 'restaurant',
  'park', 'station', 'hospital', 'bank', 'library', 'hotel', 'country',
  'city', 'town', 'village', 'road', 'street', 'way',
  // Nouns - Objects & Things
  'thing', 'something', 'nothing', 'everything', 'anything', 'object', 'item',
  'book', 'pen', 'pencil', 'paper', 'desk', 'chair', 'table', 'bed', 'computer',
  'phone', 'car', 'bus', 'train', 'bicycle', 'ticket', 'money', 'price', 'cost',
  'bag', 'box', 'clothes', 'shoes', 'hat', 'watch', 'glasses', 'key', 'door',
  'window', 'letter', 'email', 'card',
  // Nouns - Food & Drink
  'food', 'drink', 'water', 'tea', 'coffee', 'milk', 'juice', 'bread', 'rice',
  'meat', 'fish', 'chicken', 'vegetable', 'fruit', 'apple', 'banana', 'orange',
  'cake', 'sweets', 'sugar', 'salt', 'breakfast', 'lunch', 'dinner', 'meal',
  // Nouns - Body & Health
  'body', 'head', 'face', 'eye', 'ear', 'nose', 'mouth', 'hand', 'finger',
  'arm', 'leg', 'foot', 'heart', 'mind', 'health', 'sickness', 'medicine',
  // Nouns - Abstract concepts
  'idea', 'thought', 'feeling', 'emotion', 'love', 'problem', 'trouble',
  'question', 'answer', 'reason', 'cause', 'result', 'news', 'information',
  'story', 'history', 'culture', 'language', 'word', 'sentence', 'meaning',
  'grammar', 'vocabulary', 'lesson', 'class', 'exam', 'test', 'homework',
  // Adjectives - Descriptive
  'big', 'small', 'large', 'little', 'huge', 'tiny', 'long', 'short', 'tall',
  'high', 'low', 'wide', 'narrow', 'thick', 'thin', 'heavy', 'light', 'deep',
  'shallow', 'hard', 'soft', 'hot', 'warm', 'cool', 'cold', 'dry', 'wet',
  'good', 'bad', 'nice', 'fine', 'great', 'terrible', 'excellent', 'poor',
  'easy', 'difficult', 'simple', 'complex', 'new', 'old', 'young', 'modern',
  'ancient', 'clean', 'dirty', 'beautiful', 'ugly', 'pretty', 'cute', 'handsome',
  'strong', 'weak', 'healthy', 'sick', 'fast', 'slow', 'quick', 'early', 'late',
  'important', 'interesting', 'boring', 'fun', 'serious', 'happy', 'sad',
  'angry', 'surprised', 'excited', 'tired', 'busy', 'free', 'rich', 'poor',
  'expensive', 'cheap', 'right', 'wrong', 'true', 'false', 'real', 'fake',
  'possible', 'impossible', 'necessary', 'dangerous', 'safe', 'different',
  'same', 'similar', 'various', 'many', 'much', 'few', 'little', 'some', 'any',
  'all', 'every', 'each', 'both', 'either', 'neither', 'first', 'last', 'next',
  // Colors
  'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown',
  'black', 'white', 'gray', 'grey', 'colorful', 'dark', 'bright',
  // Numbers & Quantity
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'hundred', 'thousand', 'number', 'amount', 'quantity', 'all', 'none',
  // Expressions & Patterns
  'please', 'thank you', 'sorry', 'excuse me', 'hello', 'goodbye', 'yes', 'no',
  'maybe', 'perhaps', 'of course', 'certainly', 'really', 'very', 'too', 'quite',
  'just', 'only', 'still', 'already', 'yet', 'always', 'never', 'sometimes',
  'often', 'usually', 'again', 'also', 'too', 'either', 'neither', 'both',
  'because', 'so', 'but', 'and', 'or', 'if', 'when', 'while', 'before', 'after',
  'during', 'through', 'with', 'without', 'about', 'for', 'to', 'from', 'of', 'in',
  'on', 'at', 'by', 'as', 'like', 'than',
  // Grammar particles
  'wa', 'ga', 'wo', 'ni', 'de', 'to', 'e', 'kara', 'made', 'no', 'na', 'ne',
  'yo', 'ka', 'yo', 'ne',
]

export interface Option {
  id: number
  text: string
  isCorrect: boolean
  status: 'idle' | 'correct' | 'incorrect'
}

/**
 * Generate quiz options with the correct answer and 3 distractors
 * Distractors are randomly selected from a large pool to prevent guessing
 */
export function generateOptions(correctAnswer: string): Option[] {
  const shuffledDistractors = [...COMMON_DISTRACTORS]
    .sort(() => Math.random() - 0.5)
    .filter(d => d !== correctAnswer)
    .slice(0, 3)

  const allOptions = [
    {text: correctAnswer, isCorrect: true},
    ...shuffledDistractors.map(text => ({text, isCorrect: false})),
  ]

  return allOptions
    .map((opt, index) => ({
      ...opt,
      id: index,
      status: 'idle' as const,
    }))
    .sort(() => Math.random() - 0.5)
}
