let workMinutes = 0;
let breakMinutes = 0;

document.getElementById("work-increase").addEventListener("click", () => {
  workMinutes++;
  document.getElementById("work-minutes").textContent = workMinutes;
});

document.getElementById("work-decrease").addEventListener("click", () => {
  if (workMinutes > 0) workMinutes--;
  document.getElementById("work-minutes").textContent = workMinutes;
});

document.getElementById("rest-increase").addEventListener("click", () => {
  breakMinutes++;
  document.getElementById("rest-minutes").textContent = breakMinutes;
});

document.getElementById("rest-decrease").addEventListener("click", () => {
  if (breakMinutes > 0) breakMinutes--;
  document.getElementById("rest-minutes").textContent = breakMinutes;
});

let currentTimer = null;
let isbreak = false;

// grapping all the elements 
const setupScreen = document.getElementById('setup-screen');
const timerScreen = document.getElementById('timer-screen');
const displayTaskName = document.getElementById('displayTaskName');
const timerText = document.getElementById('timer');

// the sounds effects
const workSound = new Audio(chrome.runtime.getURL('sounds/work.mp3'));
const breakSound = new Audio(chrome.runtime.getURL('sounds/break.mp3'));

// wheb start is clicked
document.getElementById('start').onclick = () => {
  const task = document.getElementById('task').value || "unnamed task";
  displayTaskName.innerText = task;

  setupScreen.style.display = 'none';
  timerScreen.style.display = 'flex';

  startTimer(workMinutes, () =>{
    workSound.play();
    isbreak = true;
    startTimer(breakMinutes, () =>{
      breakSound.play();
      // rest to setup screen 
      setupScreen.style.display = 'flex';
      timerScreen.style.display = 'none';
      isbreak = false;
    });
  });
};


// functions 
function startTimer(minutes, callback) {
  let totalSeconds = minutes * 60; // Convert minutes to seconds 

  updateTimerDisplay(totalSeconds);

  if (currentTimer) {
    clearInterval(currentTimer); // Ensure any existing timer is cleared
  }
  currentTimer = setInterval(() => {
    totalSeconds--;
    updateTimerDisplay(totalSeconds);

    if (totalSeconds <= 0) {
      clearInterval(currentTimer);
      currentTimer = null; // Reset currentTimer to null after clearing
      callback();
    }
  }, 1000);
}


function updateTimerDisplay(seconds) {
  let m = Math.floor(seconds / 60).toString().padStart(2, '0');
  let s = (seconds % 60).toString().padStart(2, '0');
  timerText.innerText = `${m}:${s}`;
}

document.getElementById('editBtn').onclick = () => {
  clearInterval(currentTimer);
  setupScreen.style.display = 'flex';
  timerScreen.style.display = 'none';
  
  // Reset workMinutes and breakMinutes
  workMinutes = 0;
  breakMinutes = 0;
  document.getElementById("work-minutes").textContent = workMinutes;
  document.getElementById("rest-minutes").textContent = breakMinutes;
};