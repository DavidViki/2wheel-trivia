let questions = [];
let fetchedQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 10; // Time per question in seconds

// Add event listener for the start button
const startButton = document.getElementById("start-button");
startButton.addEventListener("click", () => {
  document.getElementById("start-screen").style.display = "none"; // Hide the start screen
  document.getElementById("app").style.display = "block"; // Show the quiz app
  displayQuestion();
  updateProgressBar();
});

// Fetch questions from the JSON file
fetch("questions.json")
  .then((response) => response.json())
  .then((data) => {
    fetchedQuestions = data;
    pickQuestions();
  })
  .catch((error) => console.error("Error loading questions:", error));

// Function to shuffle the questions array
function shuffleQuestions(questions) {
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]]; // Swap elements
  }
}

// Function to select 8 questions for the quiz
function pickQuestions() {
  if (!fetchedQuestions || fetchedQuestions.length < 8) {
    console.error("Not enough questions available.");
    return;
  }
  // Shuffle the questions array
  shuffleQuestions(fetchedQuestions);

  // Select the first 8 questions
  questions = fetchedQuestions.slice(0, 8);
}

// Function to display a question and start the timer
function displayQuestion() {
  const questionContainer = document.getElementById("question");
  const choicesContainer = document.getElementById("choices");
  const timerElement = document.getElementById("time");
  const timerContainer = document.getElementById("timer");

  // Get the current question
  const question = questions[currentQuestionIndex];

  // Update the question text
  questionContainer.textContent = question.question;

  // Clear any existing choices
  choicesContainer.innerHTML = "";

  // Add new choices
  question.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.classList.add("choice");
    button.textContent = choice;
    button.addEventListener("click", () => handleChoice(button, index)); // Handle choice click
    choicesContainer.appendChild(button);
  });

  // Reset the timer and start the countdown
  timeLeft = 10; // Reset the time for each new question
  timerElement.textContent = timeLeft; // Update the display
  timerContainer.classList.remove("warning", "critical"); // Remove previous classes
  startTimer(); // Start the countdown
}

// Function to start the timer
function startTimer() {
  // Clear any existing timer before starting a new one
  clearInterval(timer);

  // Update the timer every second
  timer = setInterval(() => {
    timeLeft--;
    const timerElement = document.getElementById("time");
    const timerContainer = document.getElementById("timer");
    const timerIcon = document.querySelector("i");

    timerElement.textContent = timeLeft;

    // Update timer colors
    if (timeLeft > 5) {
      timerContainer.classList.remove("warning", "critical");
    } else if (timeLeft <= 5 && timeLeft > 3) {
      timerContainer.classList.add("warning");
      timerContainer.classList.remove("critical");
    } else if (timeLeft <= 3) {
      timerContainer.classList.add("critical");
    }

    if (timeLeft <= 0) {
      clearInterval(timer); // Stop the timer when it reaches 0
      handleTimeout(); // Handle timeout if time runs out
    }
  }, 1000); // Update every second
}

// Function to handle when the time runs out
function handleTimeout() {
  const question = questions[currentQuestionIndex];

  const timeoutSound = new Audio("timeout.ogg");

  // Check if the current question exists (i.e., we haven't gone beyond the last queestion)
  if (!question) {
    return; // Exit the function if there are no questions left
  }

  const choicesContainer = document.getElementById("choices");

  // Disable all buttons
  const allButtons = choicesContainer.querySelectorAll(".choice");
  allButtons.forEach((btn) => (btn.disabled = true));

  // Play timeout sound
  timeoutSound.play();

  // Highlight the correct answer (in case the user didn't answer)
  allButtons[question.correct].classList.add("correct");

  // Move to the next question after a short delay
  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      displayQuestion();
      updateProgressBar();
    } else {
      endQuiz();
    }
  }, 2000); // 2-second delay
}

// Handle user choice
function handleChoice(button, selectedIndex) {
  const question = questions[currentQuestionIndex];
  const choicesContainer = document.getElementById("choices");
  const scoreContainer = document.getElementById("score");

  const correctSound = new Audio("correct.wav");
  const incorrectSound = new Audio("incorrect.wav");

  // Disable all buttons to prevent multiple clicks
  const allButtons = choicesContainer.querySelectorAll(".choice");
  allButtons.forEach((btn) => (btn.disabled = true));

  // Stop the timer when a choice is selected
  clearInterval(timer);

  // Check if the answer is correct
  if (selectedIndex === question.correct) {
    score++;
    scoreContainer.textContent = `Score: ${score}`; // Update score immediately
    button.classList.add("correct"); // Highlight the correct choice
    correctSound.play();
    scoreFeedback("Correct!", "green"); // Display feedback
  } else {
    button.classList.add("incorrect"); // Highlight the wrong choice
    allButtons[question.correct].classList.add("correct"); // Highlight the correct answer
    incorrectSound.play();
    scoreFeedback("Incorrect!", "red"); // Display feedback
  }
  // Move to the next question after a delay
  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      displayQuestion();
      updateProgressBar();
    } else {
      endQuiz();
    }
  }, 2000); // 2-second delay
}

// Function to show feedback message
function scoreFeedback(message, color) {
  const feedbackElement = document.createElement("div");
  feedbackElement.textContent = message;
  feedbackElement.style.color = color;
  feedbackElement.style.fontSize = "1.2rem";
  feedbackElement.style.marginTop = "10px";

  const questionContainer = document.getElementById("question");
  questionContainer.appendChild(feedbackElement);

  // Remove feedback after 1.5 seconds
  setTimeout(() => {
    feedbackElement.remove();
  }, 1500);
}

// Update the progress bar
function updateProgressBar() {
  const progressBar = document.getElementById("progress");
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
  progressBar.style.width = progressPercent + "%";
}

// Handle end of quiz
function endQuiz() {
  const questionContainer = document.getElementById("question");
  const choicesContainer = document.getElementById("choices");
  const timer = document.getElementById("timer");
  const scoreDisplay = document.getElementById("score");
  const endGameContainer = document.getElementById("end-game-container");
  const highScoreElement = document.getElementById("high-score");
  const retryButton = document.getElementById("retry-button");

  const finalScore = score;

  // Clear the questions and choices
  questionContainer.textContent = "Quiz Over!";
  choicesContainer.innerHTML = `Your final score is ${score} / ${questions.length}`;

  // Hide the timer and score
  timer.style.display = "none";
  scoreDisplay.style.display = "none";

  // Get the stored high score
  let highScore = localStorage.getItem("highScore") || 0;

  // If current score is higher than high score, update it
  if (finalScore > highScore) {
    highScore = finalScore;
    localStorage.setItem("highScore", highScore);
  }

  // Update and show the high score
  highScoreElement.textContent = `High Score: ${highScore}`;
  endGameContainer.style.display = "flex"; // Make container visible

  // Add event listener to retry button
  retryButton.addEventListener("click", () => {
    // Reset the quiz
    score = 0;
    currentQuestionIndex = 0;
    timeLeft = 10;
    displayQuestion(); // Display the first question again
    updateProgressBar(); // Reset the progress bar

    // Reset and show the timer and score
    timer.style.display = "flex";
    scoreDisplay.style.display = "block";
    scoreDisplay.textContent = `Score: ${score}`;

    // Hide the end game container
    endGameContainer.style.display = "none";

    document.getElementById("timer").classList.remove("warning", "critical"); // Reset timer styles
  });
}
