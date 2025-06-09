let minutes = 0;

document.getElementById("work-increase").addEventListener("click", () => {
  minutes++;
  updateDisplay();
});
document.getElementById("rest-increase").addEventListener("click", () => {
  minutes++;
  updateDisplayforest();
});

document.getElementById("work-decrease").addEventListener("click", () => {
  if (minutes > 1) minutes--;
  updateDisplay();
});
document.getElementById("rest-decrease").addEventListener("click", () => {
  if (minutes > 1) minutes--;
  updateDisplayforest();
});

function updateDisplay() {
  document.getElementById("work-minutes").textContent = minutes;
}
function updateDisplayforest(){
    document.getElementById("rest-minutes").textContent = minutes;
}