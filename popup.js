class PomodoroTimer {
  constructor() {
    // Default settings
    this.settings = {
      workMinutes: 25,
      breakMinutes: 5,
      tasks: [],
      currentTaskIndex: 0,
      isRunning: false,
      isBreak: false,
      remainingTime: 0,
      timerInterval: null
    };

    // DOM elements
    this.ui = {
      setupScreen: document.getElementById('setup-screen'),
      timerScreen: document.getElementById('timer-screen'),
      taskList: document.getElementById('task-list'),
      currentTaskDisplay: document.getElementById('current-task'),
      timerDisplay: document.getElementById('timer-display'),
      timerStatus: document.getElementById('timer-status'),
      workMinutes: document.getElementById('work-minutes'),
      breakMinutes: document.getElementById('rest-minutes')
    };

    // Initialize
    this.initElements();
    this.loadSettings();
    this.render();
  }

  initElements() {
    // Button event listeners
    document.getElementById('add-task').addEventListener('click', () => this.addTask());
    document.getElementById('start').addEventListener('click', () => this.startSession());
    document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
    document.getElementById('edit-btn').addEventListener('click', () => this.resetSession());
    
    // Timer controls
    document.getElementById('work-increase').addEventListener('click', () => this.adjustTime('work', 1));
    document.getElementById('work-decrease').addEventListener('click', () => this.adjustTime('work', -1));
    document.getElementById('rest-increase').addEventListener('click', () => this.adjustTime('break', 1));
    document.getElementById('rest-decrease').addEventListener('click', () => this.adjustTime('break', -1));
  }

  loadSettings() {
    chrome.storage.sync.get(['pomodoroSettings'], (result) => {
      if (result.pomodoroSettings) {
        this.settings = {...this.settings, ...result.pomodoroSettings};
        this.ui.workMinutes.textContent = this.settings.workMinutes;
        this.ui.breakMinutes.textContent = this.settings.breakMinutes;
      }
    });
  }

  saveSettings() {
    chrome.storage.sync.set({
      pomodoroSettings: {
        workMinutes: this.settings.workMinutes,
        breakMinutes: this.settings.breakMinutes
      }
    });
  }

  addTask() {
    const inputs = this.ui.taskList.querySelectorAll('.task-input');
    const lastInput = inputs[inputs.length - 1];
    
    if (inputs.length === 0 || lastInput.value.trim() !== '') {
      const newInput = document.createElement('input');
      newInput.className = 'task-input';
      newInput.type = 'text';
      newInput.placeholder = 'Task name...';
      newInput.ariaLabel = 'Task name';
      this.ui.taskList.appendChild(newInput);
      newInput.focus();
    }
  }

  startSession() {
    const taskInputs = this.ui.taskList.querySelectorAll('.task-input');
    this.settings.tasks = Array.from(taskInputs)
      .map(input => input.value.trim())
      .filter(task => task !== '');
    
    if (this.settings.tasks.length === 0) {
      this.showError('Please add at least one task');
      return;
    }

    this.settings.currentTaskIndex = 0;
    this.settings.isBreak = false;
    this.showTimerScreen();
    this.startTimer();
  }

  showTimerScreen() {
    this.ui.setupScreen.classList.add('hidden');
    this.ui.timerScreen.classList.remove('hidden');
    this.updateTimerDisplay();
  }

  startTimer() {
    if (this.settings.timerInterval) {
      clearInterval(this.settings.timerInterval);
    }

    const duration = this.settings.isBreak 
      ? this.settings.breakMinutes * 60 
      : this.settings.workMinutes * 60;
    
    this.settings.remainingTime = duration;
    this.settings.isRunning = true;
    
    this.ui.timerStatus.textContent = this.settings.isBreak 
      ? '🍅 Break Time 🍅' 
      : '🍅 Focus Time 🍅';
    
    this.ui.currentTaskDisplay.textContent = this.settings.isBreak 
      ? 'Take a break!' 
      : this.settings.tasks[this.settings.currentTaskIndex];

    this.settings.timerInterval = setInterval(() => this.tick(), 1000);
  }

  tick() {
    this.settings.remainingTime--;
    this.updateTimerDisplay();

    if (this.settings.remainingTime <= 0) {
      this.timerComplete();
    }
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.settings.remainingTime / 60).toString().padStart(2, '0');
    const seconds = (this.settings.remainingTime % 60).toString().padStart(2, '0');
    this.ui.timerDisplay.textContent = `${minutes}:${seconds}`;
  }

  timerComplete() {
    clearInterval(this.settings.timerInterval);
    this.playSound();
    
    if (!this.settings.isBreak) {
      // Work session completed, start break
      this.settings.isBreak = true;
      this.startTimer();
    } else {
      // Break completed, move to next task or end session
      this.settings.currentTaskIndex++;
      this.settings.isBreak = false;
      
      if (this.settings.currentTaskIndex < this.settings.tasks.length) {
        this.startTimer();
      } else {
        this.resetSession();
      }
    }
  }

  togglePause() {
    this.settings.isRunning = !this.settings.isRunning;
    const pauseBtn = document.getElementById('pause-btn');
    
    if (this.settings.isRunning) {
      pauseBtn.textContent = 'Pause';
      this.startTimer();
    } else {
      pauseBtn.textContent = 'Resume';
      clearInterval(this.settings.timerInterval);
    }
  }

  resetSession() {
    clearInterval(this.settings.timerInterval);
    this.settings.isRunning = false;
    this.ui.setupScreen.classList.remove('hidden');
    this.ui.timerScreen.classList.add('hidden');
  }

  adjustTime(type, change) {
    const minValue = 1;
    const maxValue = 60;
    
    if (type === 'work') {
      this.settings.workMinutes = Math.min(maxValue, Math.max(minValue, this.settings.workMinutes + change));
      this.ui.workMinutes.textContent = this.settings.workMinutes;
    } else {
      this.settings.breakMinutes = Math.min(maxValue, Math.max(minValue, this.settings.breakMinutes + change));
      this.ui.breakMinutes.textContent = this.settings.breakMinutes;
    }
    
    this.saveSettings();
  }

  playSound() {
    const soundFile = this.settings.isBreak ? 'work.mp3' : 'break.mp3';
    const audio = new Audio(chrome.runtime.getURL(`sounds/${soundFile}`));
    audio.play().catch(e => console.error('Audio playback failed:', e));
  }

  showError(message) {
    // Could implement a proper error display in the UI
    console.error(message);
  }

  render() {
    this.ui.workMinutes.textContent = this.settings.workMinutes;
    this.ui.breakMinutes.textContent = this.settings.breakMinutes;
  }
}

// Initialize the timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PomodoroTimer();
});