require('dotenv').config();
const { Telegraf } = require('telegraf');
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new Telegraf(token);

const words = [
  "apple", "banana", "grape", "orange", "mango", "pineapple", "strawberry", "blueberry", "kiwi", "peach", 
  "pear", "plum", "cherry", "melon", "watermelon", "lemon", "apricot", "fig", "nectar", "date", 
  "rose", "sunflower", "tulip", "orchid", "lily", "daffodil", "poppy", "daisy", "violet", "jasmine", 
  "computer", "keyboard", "monitor", "mouse", "screen", "laptop", "tablet", "phone", "charger", "headphones",
  "book", "notebook", "pen", "pencil", "eraser", "marker", "ruler", "scissors", "paper", "stapler",
  "dog", "cat", "rabbit", "mouse", "hamster", "elephant", "tiger", "lion", "bear", "zebra", 
  "computer", "internet", "email", "website", "server", "cloud", "data", "database", "algorithm", "code",
  "football", "basketball", "soccer", "baseball", "volleyball", "tennis", "golf", "rugby", "hockey", "swimming",
  "car", "bus", "train", "airplane", "bicycle", "motorcycle", "boat", "submarine", "ship", "rocket"
];

let users = {};  // Store the current state for each user

// Function to start a new game
function startGame(chatId) {
  const currentWord = words[Math.floor(Math.random() * words.length)];
  const currentAnswer = '_'.repeat(currentWord.length);  // Display underscores instead of the word

  // Initialize the user state if not already
  if (!users[chatId]) {
    users[chatId] = {
      word: currentWord,
      answer: currentAnswer,
      attempts: 0
    };
  }

  bot.telegram.sendMessage(chatId, `🎮 Let's play! \nGuess the word: ${currentAnswer}`);
  bot.telegram.sendMessage(chatId, `Type a letter to guess. You have 5 attempts.`);
}

// Function to process the user's guess
function processGuess(chatId, guess) {
  if (!users[chatId]) {
    bot.telegram.sendMessage(chatId, "You need to start a game first. Type /play to begin.");
    return;
  }

  const user = users[chatId];
  const letter = guess.toLowerCase();

  if (user.word.includes(letter)) {
    // Update the answer with the guessed letter
    let updatedAnswer = '';
    for (let i = 0; i < user.word.length; i++) {
      updatedAnswer += (user.word[i] === letter) ? letter : user.answer[i];
    }
    user.answer = updatedAnswer;

    bot.telegram.sendMessage(chatId, `Correct! \nCurrent answer: ${user.answer}`);
  } else {
    user.attempts++;
    bot.telegram.sendMessage(chatId, `Wrong guess! \nAttempts left: ${5 - user.attempts}`);
  }

  // Check if the user won or lost
  if (user.answer === user.word) {
    bot.telegram.sendMessage(chatId, `🎉 Congratulations! You've guessed the word: ${user.word}`);
    delete users[chatId];  // Reset the game state
  } else if (user.attempts >= 5) {
    bot.telegram.sendMessage(chatId, `😞 You've lost! The word was: ${user.word}`);
    delete users[chatId];  // Reset the game state
  }
}

// Command to start the game
bot.command('play', (ctx) => {
  const chatId = ctx.chat.id;

  // Only start a game if the user hasn't already finished one
  if (!users[chatId]) {
    startGame(chatId);
  } else {
    bot.telegram.sendMessage(chatId, "You are already playing. Please finish the current game first.");
  }
});

// Listen for text messages and process them as guesses
bot.on('text', (ctx) => {
  const chatId = ctx.chat.id;
  const message = ctx.message.text.trim();

  // Check if the user has started a game and if it's a valid letter guess
  if (users[chatId] && message.length === 1 && /^[a-zA-Z]$/.test(message)) {
    processGuess(chatId, message);
  } else if (users[chatId] && !message.startsWith('/')) {
    // Ignore messages that are not part of the game
    bot.telegram.sendMessage(chatId, "Please send a valid letter to guess. Example: 'w'.");
  } else if (!users[chatId] && !message.startsWith('/')) {
return
  }
});

bot.launch().then(() => {
  console.log('Bot started');
}).catch(err => {
  console.error('Error launching bot:', err);
});
