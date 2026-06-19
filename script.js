const GRAVITY = 9.81;
const velocityInput = document.getElementById('velocity');
const angleInput = document.getElementById('angle');
const calculateButton = document.getElementById('calculateButton');
const resultText = document.getElementById('resultText');

function validateInputs(velocity, angle) {
  if (Number.isNaN(velocity) || Number.isNaN(angle)) {
    return 'Please enter both velocity and angle.';
  }
  if (velocity <= 0) {
    return 'Velocity must be a positive number.';
  }
  if (angle <= 0 || angle >= 90) {
    return 'Angle must be greater than 0° and less than 90°.';
  }
  return '';
}

function calculateRange(velocity, angleDegrees) {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  return (Math.pow(velocity, 2) * Math.sin(2 * angleRadians)) / GRAVITY;
}

function displayResult(message, isError = false) {
  resultText.textContent = message;
  resultText.classList.toggle('has-text-danger', isError);
  resultText.classList.toggle('has-text-link', !isError);
}

calculateButton.addEventListener('click', () => {
  const velocityFps = parseFloat(velocityInput.value);
  const angle = parseFloat(angleInput.value);
  const validationMessage = validateInputs(velocityFps, angle);

  if (validationMessage) {
    displayResult(validationMessage, true);
    return;
  }

  // Convert feet per second (ft/s) to meters per second (m/s)
  const velocity = velocityFps * 0.3048;

  const range = calculateRange(velocity, angle);
  displayResult(`Estimated horizontal range: ${range.toFixed(2)} meters`, false);
});
