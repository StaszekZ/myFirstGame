//złapane elementy
const updateResult = document.querySelector('.score');
const playground = document.querySelector('.container');
const lifes = document.querySelector('.lifes');
const score = document.querySelector('.score');
const ship = document.querySelector('.ship');
const modal = document.querySelector('.start');
const startBtn = document.querySelector('.start__button');
const quitBtn = document.querySelector('.quit__button');
const endModal = document.querySelector('.endModal');
const winnersList = document.querySelector('.table__body');
const form = document.querySelector('.input');

let initialResult = 0;
let gameInterval = 2000;
let interval = 20;

class Obstacle {
  constructor() {}

  run(lp) {
    this.append();
    this.setPositionX();
    this.changeInterval();
    this.collisionDetection(lp);
    this.setIntervalElement(lp);
  }
  changeInterval() {
    if (score.innerText > 10) {
      interval = 15;
    }
    if (score.innerText > 20) {
      gameInterval = 1000;
    }
    if (score.innerText > 30) {
      interval = 10;
      gameInterval = 700;
    }
    if (score.innerText > 40) {
      gameInterval = 400;
    }
    if (score.innerText > 50) {
      gameInterval = 300;
      interval = 7;
    }
    if (score.innerText > 70) {
      gameInterval = 200;
      interval = 5;
    }
  }
  append() {
    this.obstacleElement = document.createElement('div');
    this.obstacleElement.classList.add('obstacle');
    playground.appendChild(this.obstacleElement);
  }

  setPositionX() {
    this.obstacleElement.style.left = `${Math.floor(Math.random() * 520)}px`;
    this.obstacleElement.style.top = `0px`;
  }
  collisionDetection(lp) {
    this.collisionInterval = setInterval(() => {
      const shipElementRect = ship.getBoundingClientRect();
      const obstacleElementRect = this.obstacleElement.getBoundingClientRect();

      if (obstacleElementRect === undefined) {
        return clearInterval(this.collisionInterval);
      }

      if (
        shipElementRect.x <= obstacleElementRect.x + obstacleElementRect.width &&
        obstacleElementRect.x <= shipElementRect.x + shipElementRect.width &&
        obstacleElementRect.bottom >= shipElementRect.top
      ) {
        console.log('collision detected', score.innerText);
        playground.removeChild(this.obstacleElement);
        score.innerText = ++initialResult;
      }
    }, interval);
  }
  setIntervalElement(lp) {
    this.moveIntervalRef = setInterval(() => {
      this.obstacleElement.style.top = this.obstacleElement.offsetTop + 3 + 'px';

      const obstacleElementRect = this.obstacleElement.getClientRects()[0];
      const playgroundElementRect = playground.getClientRects()[0];

      if (obstacleElementRect === undefined) {
        clearInterval(this.collisionInterval);
        clearInterval(this.moveIntervalRef);

        return;
      }

      if (
        obstacleElementRect.y + obstacleElementRect.height >=
        playgroundElementRect.y + playgroundElementRect.height
      ) {
        lifes.innerText -= 1;

        playground.removeChild(this.obstacleElement);
        if (lifes.innerText < 1) {
          lifes.innerText = 0;
          let allElements = document.querySelectorAll('.obstacle');
          allElements.forEach(element => {
            playground.removeChild(element);
          });
        }
      }
    }, interval);
  }
}
class Results {
  constructor(lifes) {
    let _lifes = lifes;
    this.getLifesValue = () => _lifes;

    this.checkCanPlay = value => {
      if (_lifes >= value) return true;
      return false;
    };
    this.changeResult = value => {
      const currentLifeStatus = _lifes - value;
      if (currentLifeStatus > 0) return currentLifeStatus;
    };
  }
}

class Player {
  constructor() {
    this.positionX = 280;
    ship.style.left = `${this.positionX}px`;
    this.btnLeft = document.querySelector('.button--left');
    this.btnRight = document.querySelector('.button--right');
    this.btnLeft.addEventListener('click', this.moveLeft.bind(this));
    this.btnRight.addEventListener('click', this.moveRight.bind(this));
    document.addEventListener('keydown', this.moveByKeyDown.bind(this));
  }

  moveRight() {
    if (this.positionX >= 520) {
      this.positionX = 520;
      ship.style.left = `${this.positionX}px`;
    }
    this.positionX += 20;
    console.log(`position`, this.positionX);
    ship.style.left = `${this.positionX}px`;
  }

  moveLeft() {
    if (this.positionX <= 0) {
      this.positionX = 20;
      ship.style.left = `${this.positionX}px`;
    }
    this.positionX -= 20;
    console.log(`position left`, this.positionX);
    ship.style.left = `${this.positionX}px`;
  }

  moveByKeyDown(e) {
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      this.moveRight();
    }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      this.moveLeft();
    }
  }
}

class Game {
  constructor(life) {
    lifes.innerText = life;
    score.innerText = 0;
    this.results = new Results(life);
    this.player = new Player();
    this.createObstacle();
    console.log(lifes.innerText);
  }
  createObstacle() {
    let lp = 1;
    this.startInterval = setInterval(() => {
      if (lifes.innerText < 1) {
        clearInterval(this.startInterval);
        addingPlayer();
        localStorage.setItem(form.value, score.innerText);

        endModal.style.display = 'flex';
        db.collection('winnersInGame')
          .get()
          .then(snapshot => {
            snapshot.docs.forEach(doc => {
              renderTable(doc);
            });
          });
      }

      new Obstacle().run(lp);
      lp++;
    }, gameInterval);
  }
}

const startGame = () => {
  modal.style.display = 'none';
  new Game(2);
};

startBtn.addEventListener('click', startGame);
quitBtn.addEventListener('click', () => {
  document.location.href = 'https://www.google.com';
});

// const game = new Game(20);
//getting data
function renderTable(doc) {
  const nick = document.createElement('td');
  const result = document.createElement('td');
  const tr = document.createElement('tr');

  tr.setAttribute('data-id', doc.id);
  nick.textContent = doc.data().nick;
  result.textContent = doc.data().result;

  tr.appendChild(nick);
  tr.appendChild(result);
  winnersList.appendChild(tr);

  console.log(doc.data());
}

//saving new data
const playerName = document.querySelector('.player__name');

form.addEventListener('keyup', e => {
  form.value = e.target.value;
  playerName.innerText = e.target.value;
});

function addingPlayer() {
  db.collection('winnersInGame').add({
    nick: form.value,
    result: score.innerText,
  });
}
