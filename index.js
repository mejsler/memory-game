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
const deck = shuffleCards(cardImages.flatMap((card) => [card, { ...card }]));

statsGrid.append(
	createStatItem('TIME', '00:00', 'timerVal'),
	createStatItem('MOVES', '0', 'movesVal'),
	createStatItem('MATCHES', '0 / 8', 'matchesVal')
);

actionsPanel.append(
	createActionButton('btnRestart', 'RESTART', 'Restart Game'),
	createActionButton('btnScores', 'SCORES', 'Leaderboard')
);

identityPanel.append(title, subtitle);
statsPanel.append(statsLabel, statsGrid);
header.append(identityPanel, statsPanel, actionsPanel);

gameBoard.id = 'gameBoard';
gameBoard.setAttribute('aria-label', 'Card Grid');

deck.forEach((card, cardIndex) => {
	const cardButton = createElement('button', 'game-card');
	const cardBack = createElement('img', 'card-back');
	const cardFace = createElement('img', 'card-face');

	cardButton.type = 'button';
	cardButton.dataset.pairId = card.pairId;
	cardButton.setAttribute('aria-label', `Face-down card ${cardIndex + 1}`);

	cardBack.src = 'assets/images/card-back.jpg';
	cardBack.alt = '';
	cardFace.src = card.imagePath;
	cardFace.alt = '';
	cardButton.append(cardBack, cardFace);
	gameBoard.append(cardButton);
});

boardFrame.append(gameBoard);
main.append(boardFrame);

author.append(document.createTextNode('MADE BY '));
authorLink.href = 'https://github.com/mejsler';
authorLink.target = '_blank';
authorLink.rel = 'noopener noreferrer';
author.append(authorLink);
footer.append(author, course);

appShell.append(header, main, footer);
document.body.append(appShell);
