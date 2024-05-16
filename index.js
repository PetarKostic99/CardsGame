document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('grid');
  const timeDisplay = document.getElementById('time');
  let hasFlippedCard = false;
  let lockBoard = false;
  let firstCard, secondCard;
  let matchesFound = 0;
  let attempts = 0;
  let time = 0;
  let timer;

  // Function to load images from the "pictures" folder
  async function loadImages() {
    const response = await fetch('pictures/');
    const data = await response.text();
    const parser = new DOMParser();
    const htmlDocument = parser.parseFromString(data, 'text/html');
    const imageElements = htmlDocument.querySelectorAll(
      'a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"], a[href$=".gif"]'
    );
    const imageUrls = Array.from(imageElements).map((a) => a.getAttribute('href'));
    return imageUrls;
  }

  // document.addEventListener('contextmenu', function(event) {
  //     event.preventDefault(); // Prevent default context menu
  // });

  // Function to shuffle the array
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Function to create a card element
  function createCard(imageUrl) {
    const card = document.createElement('div');
    card.classList.add('card');

    const cardInner = document.createElement('div');
    cardInner.classList.add('card-inner');

    const cardFront = document.createElement('div');
    cardFront.classList.add('card-face', 'card-front');

    const cardBack = document.createElement('div');
    cardBack.classList.add('card-face', 'card-back');
    cardBack.style.backgroundImage = `url('background.jpg')`; // Set background image dynamically

    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);

    card.addEventListener('click', flipCard);

    return card;
  }

  // Function to handle card flipping
  function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flip');

    if (!hasFlippedCard) {
      hasFlippedCard = true;
      firstCard = this;
      // Dynamically set background image of the flipped card
      this.querySelector('.card-back').style.backgroundImage = `url(${this.dataset.imageUrl})`;
    } else {
      secondCard = this;
      this.querySelector('.card-back').style.backgroundImage = `url(${this.dataset.imageUrl})`;
      attempts++; // Increment attempts counter

      // Check for match immediately after setting the second card
      checkForMatch();
    }
  }

  // Function to check for matching cards
  function checkForMatch() {
    let isMatch = firstCard.dataset.imageUrl === secondCard.dataset.imageUrl;

    if (isMatch) {
      disableCards();
      matchesFound++;
      if (matchesFound === grid.children.length / 2) {
        stopTimer();
        alert('Congratulations! You finished the game in ' + attempts + ' attempts.');
      }
    } else {
      unflipCards();
    }
  }

  // Function to disable matched cards
  function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);

    resetBoard();
  }

  // Function to unflip cards if they don't match
  function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
      firstCard.classList.remove('flip');
      secondCard.classList.remove('flip');

      // Reset the background image of the unflipped cards
      firstCard.querySelector('.card-back').style.backgroundImage = `url('background.jpg')`;
      secondCard.querySelector('.card-back').style.backgroundImage = `url('background.jpg')`;

      resetBoard();
    }, 1000);
  }

  // Function to reset the board after each turn
  function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
  }

  // Function to start the timer
  function startTimer() {
    timer = setInterval(() => {
      time++;
      timeDisplay.textContent = time;
    }, 1000);
  }

  // Function to stop the timer
  function stopTimer() {
    clearInterval(timer);
  }

  // Load images and initialize the game
  const imageUrls = await loadImages();
  const cards = imageUrls.concat(imageUrls); // Duplicate cards for matching pairs
  shuffle(cards); // Shuffle the cards

  // Create and append cards to the grid
  cards.forEach((imageUrl) => {
    const card = createCard(imageUrl);
    card.dataset.imageUrl = imageUrl;
    grid.appendChild(card);
  });

  startTimer(); // Start the timer
});
