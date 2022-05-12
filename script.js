'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2022-02-26T14:11:59.604Z',
    '2022-02-24T17:01:17.194Z',
    '2022-02-28T23:36:17.929Z',
    '2022-03-02T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'ru-RU', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
function formatDates(date, locale) {
  const calcDaysPassed = (day1, day2) =>
    Math.round(Math.abs((day2 - day1) / (1000 * 60 * 60 * 24)));
  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}.${month}.${year}`;

  return new Intl.DateTimeFormat(locale).format(date);
  //labelDate.textContent = Intl.DateTimeFormat(locale, options).format(now);
}

function startLogOutTimer() {
  //Set time to 5 minutes
  let time = 10;

  //Call the time every second
  function tick() {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    //In each call print remaning Time in UI
    labelTimer.textContent = `${min}:${sec}`;

    //When 0 sec log out
    if (time === 0) {
      clearInterval(timerLogOut);
      labelWelcome.textContent = `You have been loged out. Please, enter again`;
      containerApp.style.opacity = 0;
    }
    //Decrease time by 1 sec
    time--;
  }

  tick();
  const timerLogOut = setInterval(tick, 1000);

  return timerLogOut;
}

//Reusable function has been created
function formatCur(value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency, //currency that we have in the obj
  }).format(value);
}

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    //It is coomon to use 'i' for looping also second array if needed
    const date = new Date(acc.movementsDates[i]);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);
    const displayDate = formatDates(date, acc.locale);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount, timerLogOut;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //Timer Logout
    if (timerLogOut) clearInterval(timerLogOut);
    timerLogOut = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    //add Transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    // Update UI
    updateUI(currentAccount);
    //Reset Timer
    clearInterval(timerLogOut);
    timerLogOut = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(+inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1))
    setTimeout(function () {
      {
        // Add movement
        currentAccount.movements.push(amount);
        //add Transfer date
        currentAccount.movementsDates.push(new Date().toISOString());
        // Update UI
        updateUI(currentAccount);
      }
    }, 2500); //Here we set TIMEOUT

  //Reset Timer
  clearInterval(timerLogOut);
  timerLogOut = startLogOutTimer();

  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

// //FAKED LOGGED-IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

//Date
// const now = new Date();
// const day = `${now.getDate()}`.padStart(2, 0);
// const month = `${now.getMonth() + 1}`.padStart(2, 0);
// const year = now.getFullYear();
// const hours = `${now.getHours()}`.padStart(2, 0);
// const minutes = `${now.getMinutes()}`.padStart(2, 0);
// labelDate.textContent = `${day}.${month}.${year}, ${hours}:${minutes}`;

/////////////////////////////////////////////////
/////////////////////////////////////

/*
// LECTURES
console.log(0.1 + 0.2); //0.30000000000004 🔴
console.log((0.1 * 10 + 0.2 * 10) / 10 === 0.3); //0.3  true🟢

//Making '+' || Number.
console.log(Number('23')); //number
console.log(+'23'); //number

//Number parsing. F/ex using number with its value. Always should start with a number. We use Base 10 integers not binary, so its a good practice to write ,10 at the end of Number.parseInt(...,10 ) function.
console.log(Number.parseInt('35 px', 10)); //will return 35
console.log(Number.parseFloat('2.5 rem')); // will return 2.5

//Checking if NaN (Not a number)
console.log(Number.isNaN(20)); //false. It is a Number
console.log(Number.isNaN('20')); // false. It is a value
console.log(Number.isNaN(+'20dasMachen')); //true. It is a NaN
console.log(Number.isNaN(20 / 0)); //false. It is Infinity

//BETTER way of cheking if value is a Number
console.log(Number.isFinite(20)); //true
console.log(Number.isFinite('20')); //false
console.log(Number.isFinite(+'20')); //true
console.log(Number.isFinite(+'20dasMachen')); //false. It is a NaN
console.log(Number.isFinite(20 / 0)); //false. It is Infinity.

// Cheking if Integer
console.log(Number.isInteger(20)); //true, it is.
console.log(Number.isInteger(20.0)); //true, it is.
console.log(Number.isInteger(34.2)); //It is Float/Number

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// Math and Roundings
// SquareRoot
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2)); //Same

console.log(8 ** (1 / 3)); //Cubic root

console.log(Math.max(2, 5, 32, 12, 341, 54356, 3421, 14124, '1241414')); //Gives max
console.log(Math.min(2, 5, 32, 12, 341, 54356, 3421, 14124, '1241414')); //Gives min

// Radious of circle
console.log(Math.PI * Number.parseFloat('10px', 10) ** 2);

//Random function
const randomInt = (max, min) =>
  Math.floor(Math.random() * (max - min) + min) + 1;
//0 * (max-min)+min ...

console.log(randomInt(15, 2));

// Rounding Int
console.log(Math.trunc(23.9)); //Simply removes the integer: 23
console.log(Math.round(23.9)); //Round: 24
console.log(Math.ceil(23.9)); //Rounds to the biggest
console.log(Math.floor(23.9)); //Rounds to the smallest

// work with decimals
console.log(+(2.348).toFixed(2)); //2.35 .toFixed return String always

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// REMINDER OPERATOR
console.log(5 % 2); // 2*2 + 1(reminder) = 1
console.log(7 % 3); // 1
console.log(8 % 3); //2

const isEven = num =>
  num % 2 === 0 ? `Number ${num} is even` : `Number ${num} is odd`;

console.log(isEven(5));

labelWelcome.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach((el, i) => {
    // 0..2..4..6...
    if (i % 2 === 0) el.style.backgroundColor = 'orangered';
    //0...3...6...9...
    if (i % 3 === 0) el.style.backgroundColor = 'blue';
  });
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// Numeric separator
const diameter = 287_460_000_000;

console.log(diameter); // JS actually sees 287460000000; but that one is easy to read 👆🏻.

/////////////////////////////////////////////////
/////////////////////////////////////
// BIGINT
//The biggest number that JS can operate safely
console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER); // same as above

//Bigint creation
console.log(141241241434532534534543532454534n);
console.log(BigInt(141241241434532534534543));

//Operations
console.log(1341343252545n * 342343243n);
//We cannot mix BigInt with regular numbers! We cannot do Math. w/ BigInt too. But we can transform it to String.
console.log(34232423513n + ' is a huge number!');

//Division
console.log(10n / 3n); // returns closest number (3)
console.log(12n / 3n); // 4n

/////////////////////////////////////////////////
/////////////////////////////////////
//Date
const now = new Date();
console.log(now);

//We can parse the String inside
console.log(new Date('July 19,1996 11:00'));

console.log(new Date(account1.movementsDates.at(0)));

console.log(new Date(2022, 6, 19, 11, 23, 5)); //Months are zero based [0]

//Time-stamp
console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000)); //Exactly 3 days later👆🏻

//Methods
const future = new Date(2037, 6, 19, 11, 30, 5);
console.log(future);
// to get year
console.log(future.getFullYear()); //2037

// to get month. REMEBER it is zero based
console.log(future.getMonth()); //zero based: 6

// to get Day(date)
console.log(future.getDate()); //19

//to get number of week day
console.log(future.getDay());

//to get hours
console.log(future.getHours());

//to get minutes
console.log(future.getMinutes());

//to get seconds
console.log(future.getSeconds());

//to convert to ISO (standard) String
console.log(future.toISOString());

//to get time
console.log(future.getTime());
console.log(new Date(2131594205000));

//To get todays time and date
console.log(Date.now());
console.log(new Date(1646206463657));

//There is also SETS types of methods
console.log(future.setFullYear(2055));
console.log(new Date(2699587805000));
*/

/*
/////////////////////////////////////////////////
//////////////////////////////////
//Operations with Dates

const future = new Date(2037, 6, 19, 11, 30, 5);

const calcDaysPassed = (day1, day2) =>
  Math.abs((day2 - day1) / (1000 * 60 * 60 * 24));

const days1 = calcDaysPassed(new Date(2037, 5, 19), new Date(2037, 6, 19));

console.log(days1);



?????//????????????????????????????/////?????????//////??????///////??????//////??????????????????


/////////////////////////////////////////////////
/////////////////////////////////////////////////
//Internationalizing Dates

//Experimenting API
const now = new Date();
const locale = navigator.language;
console.log(locale);
const options = {
  hour: 'numeric',
  minute: 'numeric',
  month: 'long', //month:2-digit
  day: 'numeric',
  year: 'numeric',
  weekday: 'long',
};
labelDate.textContent = Intl.DateTimeFormat(locale, options).format(now);

/////////////////////////////////////////////////
/////////////////////////////////////////////////
//Internationalizing Numbers (Intl)

const num = 3141242244.23;
const options2 = {
  style: 'currency',
  unit: 'celsius',
  currency: 'EUR',
  useGrouping: true, //separate numbers
};

console.log(new Intl.NumberFormat(navigator.language, options2).format(num));
*/
/////////////////////////////////////////////////
/////////////////////////////////////////////////
//Timers: setTimeout and setInterval

//setTimeout:
//Timeout is the function when we can delay an event in a specific time.
setTimeout(() => console.log("Here's your sushi! 🍣"), 2000); //exactly in 2 seconds (2000milliseconds) message is appeared.

//Also we can pass several parameters in a function

const ingredients = ['spinach', 'kazy', 'olives'];

const pizzaTime = setTimeout(
  (igr1, igr2, igr3) =>
    console.log(`Here's your pizza with ${igr1}, ${igr2} and ${igr3}`),
  3000,
  ...ingredients //'spinach', 'kazy', 'olives'
);

console.log(`Waiting...`);

//Moreover, we can CANCEL timer within the time that we are waiting it.
if (ingredients.includes('kazy')) {
  clearTimeout(pizzaTime);
  console.log(`Sorry you are on diet...`);
}

//setInterval:

setInterval(() => {
  const now = new Date();
});
