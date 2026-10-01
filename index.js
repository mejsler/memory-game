function createElement(tagName, className, text) {
	const element = document.createElement(tagName);

	if (className) {
		element.className = className;
	}

	if (text !== undefined) {
		element.textContent = text;
	}

	return element;
}

function createStatItem(labelText, valueText, valueId) {
	const statItem = createElement('div', 'stat-item');
	const label = createElement('span', 'k', `${labelText}:`);
	const value = createElement('span', 'v', valueText);

	value.id = valueId;
	value.setAttribute('aria-live', 'polite');
	statItem.append(label, createElement('br'), value);

	return statItem;
}

function createActionButton(id, label, title) {
	const button = createElement('button', 'action-btn', label);

	button.type = 'button';
	button.id = id;
	button.title = title;

	return button;
}

function shuffleCards(cards) {
	for (let cardIndex = cards.length - 1; cardIndex > 0; cardIndex -= 1) {
		const randomIndex = Math.floor(Math.random() * (cardIndex + 1));
		const currentCard = cards[cardIndex];

		cards[cardIndex] = cards[randomIndex];
		cards[randomIndex] = currentCard;
	}

	return cards;
}

function createModal(content) {
	const modal = createElement('dialog', 'game-modal');

	modal.append(content);
	modal.addEventListener('click', (event) => {
		if (event.target === modal) {
			closeModal(modal);
		}
	});
	modal.addEventListener('cancel', (event) => {
		event.preventDefault();
		closeModal(modal);
	});
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && modal.open) {
			event.preventDefault();
			closeModal(modal);
		}
	});

	return modal;
}

function openModal(modal) {
	modal.showModal();
}

function closeModal(modal) {
	if (modal.open) {
		modal.close();
	}
}

const appShell = createElement('div', 'archive-shell');
const header = createElement('header', 'archive-header');
const identityPanel = createElement('div', 'panel header-identity');
const title = createElement('h1', 'header-title', 'MEMORY GAME');
const subtitle = createElement('p', 'header-subtitle', 'ROLLING SCOPES SCHOOL TASK');
const statsPanel = createElement('div', 'panel header-stats');
const statsLabel = createElement('div', 'stats-label', 'STATS');
const statsGrid = createElement('div', 'stats-grid');
const actionsPanel = createElement('div', 'panel header-actions');
const main = createElement('main', 'archive-main');
const boardFrame = createElement('div', 'board-frame');
const gameBoard = createElement('section', 'game-board');
const footer = createElement('footer', 'archive-footer');
const author = createElement('div', 'footer-col');
const course = createElement('div', 'footer-col text-right', 'Full-Stack JS 2026 Q3');
const authorLink = createElement('a', '', 'MEJSLER');
const cardImages = Array.from({ length: 8 }, (_, cardIndex) => ({
	pairId: cardIndex,
	imagePath: `assets/images/card-${cardIndex + 1}.jpg`
}));
const victoryContent = createElement('div', 'game-modal-content');
const victoryTitle = createElement('h2', 'game-modal-title', 'You win!');
const victoryMessage = createElement('p', 'game-modal-message');
const victoryActions = createElement('div', 'game-modal-actions');
const newGameButton = createActionButton('btnModalRestart', 'NEW GAME', 'Start a new game');
const closeVictoryButton = createActionButton('btnModalClose', 'CLOSE', 'Close victory modal');
const victoryModal = createModal(victoryContent);

statsGrid.append(
	createStatItem('TIME', '00:00', 'timerVal'),
	createStatItem('MOVES', '0', 'movesVal'),
	createStatItem('MATCHES', '0 / 8', 'matchesVal')
);

const movesValue = statsGrid.querySelector('#movesVal');
const matchesValue = statsGrid.querySelector('#matchesVal');
const timerValue = statsGrid.querySelector('#timerVal');
let moveCount = 0;
let matchesCount = 0;
let firstSelectedCard = null;
let mismatchTimeout = null;
let gameFinished = false;
let timerStartedAt = null;
let timerIntervalId = null;
let elapsedSeconds = 0;

timerValue.setAttribute('aria-live', 'off');

function formatTime(seconds) {
	const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
	const remainingSeconds = String(seconds % 60).padStart(2, '0');

	return `${minutes}:${remainingSeconds}`;
}

function updateTimer() {
	if (timerStartedAt === null) {
		return;
	}

	elapsedSeconds = Math.floor((Date.now() - timerStartedAt) / 1000);
	timerValue.textContent = formatTime(elapsedSeconds);
}

function startTimer() {
	if (timerIntervalId !== null || gameFinished) {
		return;
	}

	timerStartedAt = Date.now() - elapsedSeconds * 1000;
	timerIntervalId = window.setInterval(updateTimer, 1000);
}

function stopTimer() {
	if (timerIntervalId !== null) {
		window.clearInterval(timerIntervalId);
		timerIntervalId = null;
	}

	if (timerStartedAt !== null) {
		elapsedSeconds = Math.floor((Date.now() - timerStartedAt) / 1000);
		timerStartedAt = null;
	}

	timerValue.textContent = formatTime(elapsedSeconds);
}

function renderCards() {
	const deck = shuffleCards(cardImages.flatMap((card) => [card, { ...card }]));

	gameBoard.replaceChildren();
	deck.forEach((card, cardIndex) => {
		const cardButton = createElement('button', 'game-card');
		const cardBack = createElement('img', 'card-back');
		const cardFace = createElement('img', 'card-face');

		cardButton.type = 'button';
		cardButton.dataset.pairId = card.pairId;
		cardButton.dataset.cardIndex = cardIndex;
		cardButton.setAttribute('aria-pressed', 'false');
		cardButton.setAttribute('aria-label', `Face-down card ${cardIndex + 1}`);
		cardButton.addEventListener('click', () => selectCard(cardButton));

		cardBack.src = 'assets/images/card-back.jpg';
		cardBack.alt = '';
		cardFace.src = card.imagePath;
		cardFace.alt = '';
		cardButton.append(cardBack, cardFace);
		gameBoard.append(cardButton);
	});
}

function showVictoryModal() {
	victoryMessage.textContent = `You found all 8 pairs in ${moveCount} moves.`;
	openModal(victoryModal);
}

function startNewGame() {
	if (mismatchTimeout !== null) {
		window.clearTimeout(mismatchTimeout);
		mismatchTimeout = null;
	}

	firstSelectedCard = null;
	moveCount = 0;
	matchesCount = 0;
	gameFinished = false;
	stopTimer();
	elapsedSeconds = 0;
	timerValue.textContent = '00:00';
	movesValue.textContent = '0';
	matchesValue.textContent = '0 / 8';
	closeModal(victoryModal);
	renderCards();
}

function selectCard(cardButton) {
	if (
		gameFinished ||
		mismatchTimeout !== null ||
		cardButton.classList.contains('is-face-up') ||
		cardButton.classList.contains('is-matched')
	) {
		return;
	}

	startTimer();
	cardButton.classList.add('is-face-up');
	cardButton.setAttribute('aria-pressed', 'true');
	cardButton.setAttribute('aria-label', `Card ${Number(cardButton.dataset.cardIndex) + 1}, face up`);

	if (firstSelectedCard === null) {
		firstSelectedCard = cardButton;
		return;
	}

	moveCount += 1;
	movesValue.textContent = String(moveCount);

	const firstCard = firstSelectedCard;
	const selectedCards = [firstCard, cardButton];
	firstSelectedCard = null;

	if (firstCard.dataset.pairId === cardButton.dataset.pairId) {
		matchesCount += 1;
		matchesValue.textContent = `${matchesCount} / 8`;

		selectedCards.forEach((matchedCard) => {
			matchedCard.classList.add('is-matched');
			matchedCard.setAttribute(
				'aria-label',
				`Card ${Number(matchedCard.dataset.cardIndex) + 1}, matched`
			);
		});

		if (matchesCount === 8) {
			gameFinished = true;
			stopTimer();
			showVictoryModal();
		}

		return;
	}

	mismatchTimeout = window.setTimeout(() => {
		selectedCards.forEach((mismatchedCard) => {
			mismatchedCard.classList.remove('is-face-up');
			mismatchedCard.setAttribute('aria-pressed', 'false');
			mismatchedCard.setAttribute(
				'aria-label',
				`Face-down card ${Number(mismatchedCard.dataset.cardIndex) + 1}`
			);
		});

		mismatchTimeout = null;
	}, 1000);
}

victoryTitle.id = 'victoryTitle';
victoryModal.setAttribute('aria-labelledby', victoryTitle.id);
victoryActions.append(newGameButton, closeVictoryButton);
victoryContent.append(victoryTitle, victoryMessage, victoryActions);
newGameButton.addEventListener('click', startNewGame);
closeVictoryButton.addEventListener('click', () => closeModal(victoryModal));

actionsPanel.append(
	createActionButton('btnRestart', 'RESTART', 'Restart Game'),
	createActionButton('btnScores', 'SCORES', 'Leaderboard')
);
	actionsPanel.querySelector('#btnRestart').addEventListener('click', startNewGame);

identityPanel.append(title, subtitle);
statsPanel.append(statsLabel, statsGrid);
header.append(identityPanel, statsPanel, actionsPanel);

gameBoard.id = 'gameBoard';
gameBoard.setAttribute('aria-label', 'Card Grid');
renderCards();

boardFrame.append(gameBoard);
main.append(boardFrame);

author.append(document.createTextNode('MADE BY '));
authorLink.href = 'https://github.com/mejsler';
authorLink.target = '_blank';
authorLink.rel = 'noopener noreferrer';
author.append(authorLink);
footer.append(author, course);

appShell.append(header, main, footer);
document.body.append(appShell, victoryModal);
