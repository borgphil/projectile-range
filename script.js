class Vector3D {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  add(other) {
    return new Vector3D(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  subtract(other) {
    return new Vector3D(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  multiplyByScalar(scalar) {
    return new Vector3D(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  dot(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalize() {
    const mag = this.magnitude();
    if (mag === 0) {
      return new Vector3D(0, 0, 0);
    }
    return this.multiplyByScalar(1 / mag);
  }

  rotate_x(theta) {
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const y = this.y * cos - this.z * sin;
    const z = this.y * sin + this.z * cos;
    return new Vector3D(this.x, y, z);
  }

  rotate_y(theta) {
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const x = this.x * cos + this.z * sin;
    const z = -this.x * sin + this.z * cos;
    return new Vector3D(x, this.y, z);
  }

  rotate_z(theta) {
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const x = this.x * cos - this.y * sin;
    const y = this.x * sin + this.y * cos;
    return new Vector3D(x, y, this.z);
  }

  clone() {
    return new Vector3D(this.x, this.y, this.z);
  }

  toString() {
    return `x:${this.x.toFixed(2)} y:${this.y.toFixed(2)} z:${this.z.toFixed(2)}`;
  }
}

class Constants {
  static GRAVITY = 9.80665;
}

class UnitConverter {
  static conversion_factors = {
    length: {
      m: 1.0,
      meter: 1.0,
      km: 1000.0,
      kilometer: 1000.0,
      cm: 0.01,
      centimeter: 0.01,
      mm: 0.001,
      millimeter: 0.001,
      in: 0.0254,
      inch: 0.0254,
      ft: 0.3048,
      foot: 0.3048,
      yd: 0.9144,
      yard: 0.9144,
      mi: 1609.34,
      mile: 1609.34
    },
    mass: {
      kg: 1.0,
      kilogram: 1.0,
      g: 0.001,
      gram: 0.001,
      mg: 1e-6,
      milligram: 1e-6,
      lb: 0.453592,
      pound: 0.453592,
      oz: 0.0283495,
      ounce: 0.0283495,
      ton: 907.185,
      "short ton": 907.185,
      gr: 0.00006479891,
      grains: 0.00006479891
    },
    time: {
      s: 1.0,
      second: 1.0,
      min: 60.0,
      minute: 60.0,
      hr: 3600.0,
      hour: 3600.0,
      day: 86400.0
    },
    speed: {
      "m/s": 1.0,
      meter_per_second: 1.0,
      "km/h": 1 / 3.6,
      kilometer_per_hour: 1 / 3.6,
      mph: 0.44704,
      mile_per_hour: 0.44704,
      "ft/s": 0.3048,
      foot_per_second: 0.3048
    }
  };

  static convert(category, value, fromUnit, toUnit) {
    const categoryFactors = UnitConverter.conversion_factors[category];
    if (!categoryFactors) {
      throw new Error(`Unsupported category: ${category}`);
    }

    const fromFactor = categoryFactors[fromUnit];
    const toFactor = categoryFactors[toUnit];

    if (fromFactor === undefined) {
      throw new Error(`Unsupported from-unit: ${fromUnit}`);
    }
    if (toFactor === undefined) {
      throw new Error(`Unsupported to-unit: ${toUnit}`);
    }

    return (value * fromFactor) / toFactor;
  }

  static convertLength(value, fromUnit, toUnit) {
    return UnitConverter.convert('length', value, fromUnit, toUnit);
  }

  static convertMass(value, fromUnit, toUnit) {
    return UnitConverter.convert('mass', value, fromUnit, toUnit);
  }

  static convertTime(value, fromUnit, toUnit) {
    return UnitConverter.convert('time', value, fromUnit, toUnit);
  }

  static convertSpeed(value, fromUnit, toUnit) {
    return UnitConverter.convert('speed', value, fromUnit, toUnit);
  }

  static convertTemperature(value, fromUnit, toUnit) {
    const normalize = (unit) => {
      switch (unit.toLowerCase()) {
        case 'c':
        case 'celsius':
          return 'celsius';
        case 'f':
        case 'fahrenheit':
          return 'fahrenheit';
        case 'k':
        case 'kelvin':
          return 'kelvin';
        default:
          throw new Error(`Unsupported temperature unit: ${unit}`);
      }
    };

    const from = normalize(fromUnit);
    const to = normalize(toUnit);

    const toKelvin = (val, unit) => {
      switch (unit) {
        case 'celsius':
          return val + 273.15;
        case 'fahrenheit':
          return (val + 459.67) * (5 / 9);
        case 'kelvin':
          return val;
      }
    };

    const fromKelvin = (kelvin, unit) => {
      switch (unit) {
        case 'celsius':
          return kelvin - 273.15;
        case 'fahrenheit':
          return kelvin * (9 / 5) - 459.67;
        case 'kelvin':
          return kelvin;
      }
    };

    const kelvin = toKelvin(value, from);
    return fromKelvin(kelvin, to);
  }
}

class Wind {
  constructor(windSpeed, windSpeedHeight, windDirection, hellmanConstant) {
    this.windSpeed = windSpeed;
    this.windSpeedHeight = windSpeedHeight;
    this.windDirection = windDirection;
    this.hellmanConstant = hellmanConstant;
  }

  getWindVectorAtHeight(height) {
    if (height < 0) {
      return new Vector3D(0, 0, 0);
    }

    const referenceHeight = this.windSpeedHeight;
    const exponent = this.hellmanConstant;
    const speed = this.windSpeed * Math.pow(height / referenceHeight, exponent);
    const radians = (Math.PI / 180) * this.windDirection;
    const x = speed * Math.cos(radians);
    const y = speed * Math.sin(radians);
    return new Vector3D(x, y, 0);
  }
}

class Atmosphere {
  constructor(temperature, pressure, humidity) {
    this.temperature = temperature;
    this.pressure = pressure;
    this.humidity = humidity;
    this.airDensity = this.calculateAirDensity();
  }

  calculateAirDensity() {
    // Temperature in Kelvin as stored on the Atmosphere instance
    const T = this.temperature;
    const p = this.pressure * 1000; // input pressure is kPa, convert to Pa
    let rh = this.humidity;

    // Convert relative humidity from percent to fraction if needed
    if (rh > 1) {
      rh = rh / 100;
    }

    // Saturation vapor pressure (hPa) using a Magnus-Tetens approximation
    const es = 6.112 * Math.exp((17.67 * (T - 273.15)) / (T - 29.65));
    // Actual vapor pressure in Pa
    const e = rh * es * 100;

    // Dry air partial pressure in Pa
    const pd = p - e;
    const R_d = 287.058; // specific gas constant for dry air (J/kg·K)
    const R_v = 461.495; // specific gas constant for water vapor (J/kg·K)

    // Air density for moist air: dry air + vapor contributions
    return (pd / (R_d * T)) + (e / (R_v * T));
  }
}

class Arrow {
  constructor(mass, longDragArea, latDragArea) {
    this.mass = mass;
    this.longDragArea = longDragArea;
    this.latDragArea = latDragArea;
  }
}

class TrajectoryCalculator {
  constructor() {
    // Placeholder for future trajectory-specific options
  }

  static calculateNetForce(position, velocity, arrow, wind, airDensity) {
    // position: Vector3D for arrow coordinates
    // velocity: Vector3D for arrow velocity
    // arrow: Arrow instance with mass and drag areas
    // wind: Wind instance describing current wind behavior
    // airDensity: local air density in kg/m^3

    const gravitationalForce = new Vector3D(0, 0, Constants.GRAVITY * arrow.mass * -1);
    const relativeVelocity = velocity.subtract(wind.getWindVectorAtHeight(position.z));

    let dragForceX = 0.0;
    let dragForceY = 0.0;
    let dragForceZ = 0.0;

    if (relativeVelocity.x !== 0) {
      dragForceX = -(0.5 * arrow.longDragArea * airDensity) * Math.abs(relativeVelocity.x) * relativeVelocity.x;
    }

    if (relativeVelocity.y !== 0) {
      dragForceY = -(0.5 * arrow.latDragArea * airDensity) * Math.abs(relativeVelocity.y) * relativeVelocity.y;
    }

    if (relativeVelocity.z !== 0) {
      dragForceZ = -(0.5 * arrow.longDragArea * airDensity) * Math.abs(relativeVelocity.z) * relativeVelocity.z;
    }

    const dragForce = new Vector3D(dragForceX, dragForceY, dragForceZ);
    return gravitationalForce.add(dragForce);
  }

  static calculateAcceleration(position, velocity, arrow, wind, airDensity) {
    const netForce = TrajectoryCalculator.calculateNetForce(position, velocity, arrow, wind, airDensity);
    return new Vector3D(netForce.x / arrow.mass, netForce.y / arrow.mass, netForce.z / arrow.mass);
  }

  static initializeLaunchState(launchElevation, launchVelocity, initialHeight) {
    const launchElevationRadians = (Math.PI / 180) * launchElevation;
    const position = new Vector3D(0, 0, initialHeight);
    const velocity = new Vector3D(
      launchVelocity * Math.cos(launchElevationRadians),
      0,
      launchVelocity * Math.sin(launchElevationRadians)
    );
    return { position, velocity };
  }

  static integrateRK4(position, velocity, arrow, wind, airDensity, timeStep) {
    const k1v = TrajectoryCalculator.calculateAcceleration(position, velocity, arrow, wind, airDensity).multiplyByScalar(timeStep);
    const k1p = velocity.multiplyByScalar(timeStep);

    const k2v = TrajectoryCalculator.calculateAcceleration(
      position.add(k1p.multiplyByScalar(0.5)),
      velocity.add(k1v.multiplyByScalar(0.5)),
      arrow,
      wind,
      airDensity
    ).multiplyByScalar(timeStep);
    const k2p = velocity.add(k1v.multiplyByScalar(0.5)).multiplyByScalar(timeStep);

    const k3v = TrajectoryCalculator.calculateAcceleration(
      position.add(k2p.multiplyByScalar(0.5)),
      velocity.add(k2v.multiplyByScalar(0.5)),
      arrow,
      wind,
      airDensity
    ).multiplyByScalar(timeStep);
    const k3p = velocity.add(k2v.multiplyByScalar(0.5)).multiplyByScalar(timeStep);

    const k4v = TrajectoryCalculator.calculateAcceleration(
      position.add(k3p),
      velocity.add(k3v),
      arrow,
      wind,
      airDensity
    ).multiplyByScalar(timeStep);
    const k4p = velocity.add(k3v).multiplyByScalar(timeStep);

    const nextVelocity = velocity.add(
      k1v.add(k2v.multiplyByScalar(2)).add(k3v.multiplyByScalar(2)).add(k4v).multiplyByScalar(1 / 6)
    );
    const nextPosition = position.add(
      k1p.add(k2p.multiplyByScalar(2)).add(k3p.multiplyByScalar(2)).add(k4p).multiplyByScalar(1 / 6)
    );

    return { nextPosition, nextVelocity };
  }

  static calculateGroundHeight(slopePercent, x) {
    return x * slopePercent / 100;
  }

  static simulateTrajectory(position, velocity, slopePercent, arrow, wind, airDensity, timeStep, maxSimulationTime) {
    let currentPosition = position.clone();
    let currentVelocity = velocity.clone();
    let previousPosition = currentPosition.clone();
    let previousVelocity = currentVelocity.clone();
    let flightTime = 0;
    let maxZ = currentPosition.z;

    while (currentPosition.z >= TrajectoryCalculator.calculateGroundHeight(slopePercent, currentPosition.x)) {
      previousPosition = currentPosition.clone();
      previousVelocity = currentVelocity.clone();

      const { nextPosition, nextVelocity } = TrajectoryCalculator.integrateRK4(
        currentPosition,
        currentVelocity,
        arrow,
        wind,
        airDensity,
        timeStep
      );

      currentPosition = nextPosition.clone();
      currentVelocity = nextVelocity.clone();
      const currentTime = flightTime + timeStep;
      const netForce = TrajectoryCalculator.calculateNetForce(currentPosition, currentVelocity, arrow, wind, airDensity);

      if (currentPosition.z > maxZ) {
        maxZ = currentPosition.z;
      }

      flightTime += timeStep;
      if (flightTime > maxSimulationTime) {
        throw new Error('Simulation exceeded maximum allowed time.');
      }
    }

    return { previousPosition, currentPosition, previousVelocity, currentVelocity, maxZ, flightTime };
  }

  static interpolateImpact(slopePercent, previousPosition, currentPosition, previousVelocity, currentVelocity, timeStep, flightTime) {
    // f: fraction along the last time step where z crosses ground slope
    const f = (previousPosition.z - TrajectoryCalculator.calculateGroundHeight(slopePercent, previousPosition.x )) /
              ((previousPosition.z - TrajectoryCalculator.calculateGroundHeight(slopePercent, previousPosition.x)) -
               (currentPosition.z - TrajectoryCalculator.calculateGroundHeight(slopePercent, currentPosition.x)));

    // Linear interpolation for impact position
    const impactX = previousPosition.x + f * (currentPosition.x - previousPosition.x);
    const impactY = previousPosition.y + f * (currentPosition.y - previousPosition.y);
    const impactZ = previousPosition.z + f * (currentPosition.z - previousPosition.z);
    const impactPosition = new Vector3D(impactX, impactY, impactZ);

    // Linear interpolation for impact velocity
    const impactVx = previousVelocity.x + f * (currentVelocity.x - previousVelocity.x);
    const impactVy = previousVelocity.y + f * (currentVelocity.y - previousVelocity.y);
    const impactVz = previousVelocity.z + f * (currentVelocity.z - previousVelocity.z);
    const impactVelocity = new Vector3D(impactVx, impactVy, impactVz);

    const totalFlightTime = flightTime - timeStep + f * timeStep;
    return { impactPosition, impactVelocity, totalFlightTime };
  }

  static calculateImpactAngle(velocity) {
    return Math.atan2(velocity.z, velocity.x) * (180 / Math.PI);
  }

  static calculate(launchElevation, launchVelocity, initialHeight, slopePercent, arrow, wind, airDensity, timeStep, maxSimulationTime) {
    const { position, velocity } = TrajectoryCalculator.initializeLaunchState(
      launchElevation,
      launchVelocity,
      initialHeight
    );

    const {
      previousPosition,
      currentPosition,
      previousVelocity,
      currentVelocity,
      maxZ,
      flightTime,
    } = TrajectoryCalculator.simulateTrajectory(
      position,
      velocity,
      slopePercent,
      arrow,
      wind,
      airDensity,
      timeStep,
      maxSimulationTime
    );

    const { impactPosition, impactVelocity, totalFlightTime } = TrajectoryCalculator.interpolateImpact(slopePercent,
      previousPosition,
      currentPosition,
      previousVelocity,
      currentVelocity,
      timeStep,
      flightTime
    );

    const impactAngle = TrajectoryCalculator.calculateImpactAngle(impactVelocity);

    return new TrajectoryResult(impactPosition.x, impactPosition.y, impactPosition.z, impactAngle, maxZ, totalFlightTime);
  }

}

class TrajectoryResult {
  constructor(impactX, impactY, impactZ, impactAngle, maxZ, totalFlightTime) {
    this.impactX = impactX;
    this.impactY = impactY;
    this.impactZ = impactZ;
    this.impactAngle = impactAngle;
    this.maxZ = maxZ;
    this.totalFlightTime = totalFlightTime;
  }
}

function setFieldValidity(fieldIds, invalid) {
  fieldIds.forEach((fieldId) => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.setAttribute('aria-invalid', invalid ? 'true' : 'false');
    }
  });
}

function displayValidationErrors(errors) {
  const fieldIds = [
    'launch-elevation',
    'launch-velocity',
    'initial-height',
    'slope-percent',
    'arrow-weight',
    'long-cda',
    'lat-cda',
    'wind-speed',
    'wind-speed-height',
    'wind-direction',
    'hellman-constant',
    'temperature',
    'pressure',
    'humidity'
  ];

  fieldIds.forEach((fieldId) => {
    const input = document.getElementById(fieldId);
    const helper = document.getElementById(`${fieldId}-helper`);
    if (input) {
      input.setAttribute('aria-invalid', 'false');
      input.classList.remove('is-invalid', 'is-valid');
      if (!input.readOnly) {
        input.classList.add('is-valid');
      }
    }
    if (helper) {
      helper.textContent = '';
      helper.classList.remove('field-helper-error', 'field-helper-ok');
    }
  });

  if (!errors.length) {
    return;
  }

  errors.forEach((error) => {
    const input = document.getElementById(error.fieldId);
    const helper = document.getElementById(`${error.fieldId}-helper`);

    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.classList.remove('is-valid');
      input.classList.add('is-invalid');
    }
    if (helper) {
      helper.textContent = error.message;
      helper.classList.remove('field-helper-ok');
      helper.classList.add('field-helper-error');
    }
  });
}

function overrideInputsFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const overrideMap = {
    launchElevation: 'launch-elevation',
    launchVelocity: 'launch-velocity',
    initialHeight: 'initial-height',
    slopePercent: 'slope-percent',
    arrowWeight: 'arrow-weight',
    longCda: 'long-cda',
    latCda: 'lat-cda',
    windSpeed: 'wind-speed',
    windSpeedHeight: 'wind-speed-height',
    windDirection: 'wind-direction',
    hellmanConstant: 'hellman-constant',
    temperature: 'temperature',
    pressure: 'pressure',
    humidity: 'humidity'
  };

  for (const [paramName, elementId] of Object.entries(overrideMap)) {
    if (!params.has(paramName)) {
      continue;
    }

    const input = document.getElementById(elementId);
    if (!input) {
      continue;
    }

    if (input.readonly) {
      continue;
    }

    const paramValue = params.get(paramName);
    if (paramValue === null) {
      continue;
    }

    if (input.type === 'number') {
      const numeric = parseFloat(paramValue);
      if (Number.isNaN(numeric)) {
        continue;
      }
      input.value = numeric;
    } else {
      input.value = paramValue;
    }

    input.removeAttribute('readonly');
  }
}

function reloadWithQueryParams() {
  const form = document.querySelector('form');
  if (!form) {
    return;
  }

  const params = new URLSearchParams();
  Array.from(form.elements).forEach((element) => {
    if (!(element instanceof HTMLInputElement)) {
      return;
    }
    if (!element.name) {
      return;
    }
    if (element.type === 'button' || element.type === 'submit' || element.type === 'reset') {
      return;
    }
    if (element.readOnly) {
      return;
    }
    params.set(element.name, element.value);
  });

  window.location.search = params.toString();
}

function initializeFieldHelpers() {
  overrideInputsFromQuery();
  displayValidationErrors([]);
  calculateTrajectory();
}

function syncGoalSeekTargetDefault() {
  const setSelect = document.getElementById('goal-seek-set');
  const targetInput = document.getElementById('goal-seek-target');
  if (!setSelect || !targetInput) {
    return;
  }

  const defaultValue = setSelect.value === 'impact-distance-yd' ? 180 : 185;
  if (!targetInput.dataset.userEdited) {
    targetInput.value = defaultValue;
  }
}

function sanitizeGoalSeekTargetInput(event) {
  const value = event.target.value;
  if (value === '') {
    return;
  }

  const sanitized = value.replace(/[^0-9.\-]/g, '');
  if (sanitized !== value) {
    event.target.value = sanitized;
  }
  event.target.dataset.userEdited = 'true';
}

function runGoalSeek() {
  const setSelect = document.getElementById('goal-seek-set');
  const targetInput = document.getElementById('goal-seek-target');
  const changeSelect = document.getElementById('goal-seek-change');
  if (!setSelect || !targetInput || !changeSelect) {
    return;
  }

  const targetValue = parseFloat(targetInput.value);
  if (Number.isNaN(targetValue)) {
    targetInput.focus();
    return;
  }

  const metricFieldId = setSelect.value === 'impact-distance-yd' ? 'impact-distance-yd' : 'impact-distance-m';
  const parameterConfig = {
    'launch-elevation': { inputId: 'launch-elevation', min: 0, max: 44.9, step: 0.1 },
    'launch-velocity': { inputId: 'launch-velocity', min: 50, max: 500, step: 1 },
    'long-cda': { inputId: 'long-cda', min: 1, max: 1000, step: 1 }
  };
  const config = parameterConfig[changeSelect.value];
  if (!config) {
    return;
  }

  let bestValue = parseFloat(document.getElementById(config.inputId).value);
  let bestResult = parseFloat(document.getElementById(metricFieldId).value);
  let bestDifference = Number.POSITIVE_INFINITY;

  for (let candidate = config.min; candidate <= config.max; candidate += config.step) {
    const input = document.getElementById(config.inputId);
    if (!input) {
      continue;
    }

    input.value = candidate.toFixed(config.step < 1 ? 1 : 0);
    calculateTrajectory();

    const currentResult = parseFloat(document.getElementById(metricFieldId).value);
    const difference = Math.abs(currentResult - targetValue);
    if (difference < bestDifference) {
      bestDifference = difference;
      bestValue = candidate;
      bestResult = currentResult;
    }
  }

  const bestInput = document.getElementById(config.inputId);
  if (bestInput) {
    bestInput.value = bestValue.toFixed(config.step < 1 ? 1 : 0);
    calculateTrajectory();
  }

  if (typeof window.bootstrap !== 'undefined') {
    const modalElement = document.getElementById('goalSeekModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modal.hide();
    }
  }
}

function initializeGoalSeekModal() {
  const setSelect = document.getElementById('goal-seek-set');
  const targetInput = document.getElementById('goal-seek-target');
  const submitButton = document.getElementById('goal-seek-submit');
  const modalElement = document.getElementById('goalSeekModal');

  if (setSelect) {
    setSelect.addEventListener('change', syncGoalSeekTargetDefault);
  }
  if (targetInput) {
    targetInput.addEventListener('input', sanitizeGoalSeekTargetInput);
  }
  if (submitButton) {
    submitButton.addEventListener('click', runGoalSeek);
  }
  if (modalElement) {
    modalElement.addEventListener('shown.bs.modal', syncGoalSeekTargetDefault);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initializeFieldHelpers();
  initializeGoalSeekModal();
});

function validateInputs(inputs) {
  const errors = [];

  if (Number.isNaN(inputs.launchElevation) || inputs.launchElevation < 0 || inputs.launchElevation >= 90) {
    errors.push({ fieldId: 'launch-elevation', message: 'Launch angle must be between 0 and 90 degrees.' });
  }
  if (Number.isNaN(inputs.launchVelocity) || inputs.launchVelocity <= 0 || inputs.launchVelocity > 500) {
    errors.push({ fieldId: 'launch-velocity', message: 'Launch velocity must be greater than 0 and less than 500 ft/s.' });
  }
  if (Number.isNaN(inputs.initialHeight) || inputs.initialHeight < 0 || inputs.initialHeight > 200) {
    errors.push({ fieldId: 'initial-height', message: 'Initial height must be greater than 0 and less than 200 meters.' });
  }
  if (Number.isNaN(inputs.slopePercent) || inputs.slopePercent < -10 || inputs.slopePercent > 10) {
    errors.push({ fieldId: 'slope-percent', message: 'Slope must be between -10 and 10 percent.' });
  }
  if (Number.isNaN(inputs.arrowWeight) || inputs.arrowWeight < 0 || inputs.arrowWeight > 1000) {
    errors.push({ fieldId: 'arrow-weight', message: 'Arrow weight must be greater than 0 and less than 1000 grains.' });
  }
  if (Number.isNaN(inputs.longCda) || inputs.longCda < 0) {
    errors.push({ fieldId: 'long-cda', message: 'Longitudinal CdA must be greater than 0.' });
  }
  if (Number.isNaN(inputs.latCda) || inputs.latCda < 0) {
    errors.push({ fieldId: 'lat-cda', message: 'Lateral CdA must be greater than 0.' });
  }
  if (Number.isNaN(inputs.windSpeed) || inputs.windSpeed < 0 || inputs.windSpeed > 50) {
    errors.push({ fieldId: 'wind-speed', message: 'Wind speed must be greater than or equal to 0 and less than 50 mph.' });
  }
  if (Number.isNaN(inputs.windSpeedHeight) || inputs.windSpeedHeight <= 0 || inputs.windSpeedHeight > 50) {
    errors.push({ fieldId: 'wind-speed-height', message: 'Wind speed height must be greater than 0 and less than 50 meters.' });
  }
  if (Number.isNaN(inputs.windDirection) || inputs.windDirection < 0 || inputs.windDirection > 360) {
    errors.push({ fieldId: 'wind-direction', message: 'Wind direction must be between 0 and 360 degrees.' });
  }
  if (Number.isNaN(inputs.hellmanConstant) || inputs.hellmanConstant < 0 || inputs.hellmanConstant > 0.7) {
    errors.push({ fieldId: 'hellman-constant', message: 'Hellman constant must be between 0 and 0.7.' });
  }
  if (Number.isNaN(inputs.temperatureC) || inputs.temperatureC < -50 || inputs.temperatureC > 100) {
    errors.push({ fieldId: 'temperature', message: 'Temperature must be greater than -50°C and less than 100°C.' });
  }
  if (Number.isNaN(inputs.pressure) || inputs.pressure < 80 || inputs.pressure > 120) {
    errors.push({ fieldId: 'pressure', message: 'Pressure must be greater than 80 kPa and less than 120 kPa.' });
  }
  if (Number.isNaN(inputs.humidity) || inputs.humidity < 0 || inputs.humidity > 100) {
    errors.push({ fieldId: 'humidity', message: 'Humidity must be between 0% and 100%.' });
  }

  return errors;
}

function calculateTrajectory() {
  const launchElevation = parseFloat(document.getElementById('launch-elevation').value);
  const launchVelocity = parseFloat(document.getElementById('launch-velocity').value);
  const initialHeight = parseFloat(document.getElementById('initial-height').value);
  const slopePercent = parseFloat(document.getElementById('slope-percent').value);
  const arrowWeight = parseFloat(document.getElementById('arrow-weight').value);
  const longCda = parseFloat(document.getElementById('long-cda').value)/1e6;
  const latCda = parseFloat(document.getElementById('lat-cda').value)/1e6;
  const windSpeed = parseFloat(document.getElementById('wind-speed').value);
  const windSpeedHeight = parseFloat(document.getElementById('wind-speed-height').value);
  const windDirection = parseFloat(document.getElementById('wind-direction').value);
  const hellmanConstant = parseFloat(document.getElementById('hellman-constant').value);
  const temperatureC = parseFloat(document.getElementById('temperature').value);
  const pressure = parseFloat(document.getElementById('pressure').value);
  const humidity = parseFloat(document.getElementById('humidity').value);

  const launchVelocityMps = UnitConverter.convertSpeed(launchVelocity, 'ft/s', 'm/s');
  const launchVelocityInput = document.getElementById('launch-velocity');
  if (launchVelocityInput) {
    launchVelocityInput.value = launchVelocity.toFixed(0);
  }
  const windSpeedMps = UnitConverter.convertSpeed(windSpeed, 'mph', 'm/s');

  const inputs = {
    launchElevation,
    launchVelocity,
    initialHeight,
    slopePercent,
    arrowWeight,
    longCda,
    latCda,
    windSpeed,
    windSpeedHeight,
    windDirection,
    hellmanConstant,
    temperatureC,
    pressure,
    humidity
  };

  const errors = validateInputs(inputs);
  if (errors.length) {
    displayValidationErrors(errors);
    return;
  }

  displayValidationErrors([]);

  const arrowMass = UnitConverter.convertMass(arrowWeight, 'grains', 'kg');
  const atmosphere = new Atmosphere(
    UnitConverter.convertTemperature(temperatureC, 'celsius', 'kelvin'),
    pressure,
    humidity
  );
  const wind = new Wind(windSpeedMps, windSpeedHeight, windDirection, hellmanConstant);
  const arrow = new Arrow(arrowMass, longCda, latCda);

  const result = TrajectoryCalculator.calculate(
    launchElevation,
    launchVelocityMps,
    initialHeight,
    slopePercent,
    arrow,
    wind,
    atmosphere.airDensity,
    0.01,
    30
  );

  if (!result || Number.isNaN(result.impactX) || Number.isNaN(result.impactY) || Number.isNaN(result.maxZ) || Number.isNaN(result.totalFlightTime)) {
    window.alert('Trajectory calculation returned invalid results', result);
    return;
  }

  document.getElementById('impact-distance-m').value = result.impactX.toFixed(2);
  document.getElementById('impact-distance-yd').value = UnitConverter.convertLength(result.impactX, 'm', 'yd').toFixed(2);
  document.getElementById('impact-height').value = result.impactZ.toFixed(2);
  document.getElementById('impact-angle').value = result.impactAngle.toFixed(2);
  document.getElementById('max-height').value = result.maxZ.toFixed(2);
  document.getElementById('flight-time').value = result.totalFlightTime.toFixed(2);
  document.getElementById('lateral-drift').value = result.impactY.toFixed(2);
  document.getElementById('air-density').value = atmosphere.airDensity.toFixed(3);
}

