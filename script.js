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

class BowSpeeds {
  constructor(speed0Turns, speed2Turns, speed4Turns) {
    this.speed0Turns = speed0Turns;
    this.speed2Turns = speed2Turns;
    this.speed4Turns = speed4Turns;
  }

  calculateSpeedFps(noTurns) {
    const y0 = this.speed0Turns;
    const y2 = this.speed2Turns;
    const y4 = this.speed4Turns;

    const c = y0;
    const a = (y4 - 2 * y2 + y0) / 8;
    const b = (y2 - y0 - 4 * a) / 2;

    return a * noTurns * noTurns + b * noTurns + c;
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
    // Debug: show relative velocity and height to diagnose force changes per iteration
    console.log(`calculateNetForce z:${position.z.toFixed(3)} relVel:${relativeVelocity.toString()}`);

    let dragForceX = 0.0;
    let dragForceY = 0.0;
    let dragForceZ = 0.0;

    if (relativeVelocity.x !== 0) {
      dragForceX = -(0.5 * arrow.longDragArea * airDensity) * Math.abs(relativeVelocity.x) * relativeVelocity.x;
      console.log(`dragX ${dragForceX.toFixed(4)}`);
    }

    if (relativeVelocity.y !== 0) {
      dragForceY = -(0.5 * arrow.latDragArea * airDensity) * Math.abs(relativeVelocity.y) * relativeVelocity.y;
      console.log(`dragY ${dragForceY.toFixed(4)}`);
    }

    if (relativeVelocity.z !== 0) {
      dragForceZ = -(0.5 * arrow.latDragArea * airDensity) * Math.abs(relativeVelocity.z) * relativeVelocity.z;
      console.log(`dragZ ${dragForceZ.toFixed(4)}`);
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

  static simulateTrajectory(position, velocity, arrow, wind, airDensity, timeStep, maxSimulationTime) {
    let currentPosition = position.clone();
    let currentVelocity = velocity.clone();
    let previousPosition = currentPosition.clone();
    let previousVelocity = currentVelocity.clone();
    let flightTime = 0;
    let maxZ = currentPosition.z;

    while (currentPosition.z >= 0) {
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
      console.log(`time:${currentTime.toFixed(2)} position:${currentPosition.toString()} force:${netForce.toString()}`);

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

  static interpolateImpact(previousPosition, currentPosition, previousVelocity, currentVelocity, timeStep, flightTime) {
    // t: fraction along the last time step where z crosses zero
    const denom = (currentPosition.z - previousPosition.z) || 1e-12;
    const t = (0 - previousPosition.z) / denom;

    // Linear interpolation for impact position
    const impactX = previousPosition.x + t * (currentPosition.x - previousPosition.x);
    const impactY = previousPosition.y + t * (currentPosition.y - previousPosition.y);
    const impactPosition = new Vector3D(impactX, impactY, 0);

    // Linear interpolation for impact velocity
    const impactVx = previousVelocity.x + t * (currentVelocity.x - previousVelocity.x);
    const impactVy = previousVelocity.y + t * (currentVelocity.y - previousVelocity.y);
    const impactVz = previousVelocity.z + t * (currentVelocity.z - previousVelocity.z);
    const impactVelocity = new Vector3D(impactVx, impactVy, impactVz);

    const totalFlightTime = flightTime - timeStep + t * timeStep;
    return { impactPosition, impactVelocity, totalFlightTime };
  }

  static calculateImpactAngle(velocity) {
    return Math.atan2(velocity.z, velocity.x) * (180 / Math.PI);
  }

  static calculate(launchElevation, launchVelocity, initialHeight, arrow, wind, airDensity, timeStep, maxSimulationTime) {
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
      arrow,
      wind,
      airDensity,
      timeStep,
      maxSimulationTime
    );

    const { impactPosition, impactVelocity, totalFlightTime } = TrajectoryCalculator.interpolateImpact(
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
    'bow-turns',
    'initial-height',
    'speed-0-turns',
    'speed-2-turns',
    'speed-4-turns',
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
    }
    if (helper) {
      helper.textContent = error.message;
      helper.classList.remove('field-helper-ok');
      helper.classList.add('field-helper-error');
    }
  });
}

function initializeFieldHelpers() {
  displayValidationErrors([]);
}

window.addEventListener('DOMContentLoaded', initializeFieldHelpers);

function validateInputs(inputs) {
  const errors = [];

  if (Number.isNaN(inputs.launchElevation) || inputs.launchElevation < 0 || inputs.launchElevation > 45) {
    errors.push({ fieldId: 'launch-elevation', message: 'Launch angle must be between 0 and 45 degrees.' });
  }
  if (Number.isNaN(inputs.bowTurns) || inputs.bowTurns < 0 || inputs.bowTurns > 8) {
    errors.push({ fieldId: 'bow-turns', message: 'Bow turns must be between 0 and 8.' });
  }
  if (Number.isNaN(inputs.initialHeight) || inputs.initialHeight <= 0 || inputs.initialHeight >= 10) {
    errors.push({ fieldId: 'initial-height', message: 'Initial height must be greater than 0 and less than 10 meters.' });
  }
  if (Number.isNaN(inputs.speed0Turns) || inputs.speed0Turns <= 0) {
    errors.push({ fieldId: 'speed-0-turns', message: 'Speed @0 Turns must be greater than 0.' });
  }
  if (Number.isNaN(inputs.speed2Turns) || inputs.speed2Turns <= 0) {
    errors.push({ fieldId: 'speed-2-turns', message: 'Speed @2 Turns must be greater than 0.' });
  }
  if (Number.isNaN(inputs.speed4Turns) || inputs.speed4Turns <= 0) {
    errors.push({ fieldId: 'speed-4-turns', message: 'Speed @4 Turns must be greater than 0.' });
  }
  if (Number.isNaN(inputs.arrowWeight) || inputs.arrowWeight <= 0 || inputs.arrowWeight >= 1000) {
    errors.push({ fieldId: 'arrow-weight', message: 'Arrow weight must be greater than 0 and less than 1000 grains.' });
  }
  if (Number.isNaN(inputs.longCda) || inputs.longCda <= 0) {
    errors.push({ fieldId: 'long-cda', message: 'Longitudinal CdA must be greater than 0.' });
  }
  if (Number.isNaN(inputs.latCda) || inputs.latCda <= 0) {
    errors.push({ fieldId: 'lat-cda', message: 'Lateral CdA must be greater than 0.' });
  }
  if (Number.isNaN(inputs.windSpeed) || inputs.windSpeed < 0 || inputs.windSpeed >= 50) {
    errors.push({ fieldId: 'wind-speed', message: 'Wind speed must be greater than or equal to 0 and less than 50 mph.' });
  }
  if (Number.isNaN(inputs.windSpeedHeight) || inputs.windSpeedHeight <= 0 || inputs.windSpeedHeight >= 50) {
    errors.push({ fieldId: 'wind-speed-height', message: 'Wind speed height must be greater than 0 and less than 50 meters.' });
  }
  if (Number.isNaN(inputs.windDirection) || inputs.windDirection < -180 || inputs.windDirection > 180) {
    errors.push({ fieldId: 'wind-direction', message: 'Wind direction must be between -180 and 180 degrees.' });
  }
  if (Number.isNaN(inputs.hellmanConstant) || inputs.hellmanConstant < 0 || inputs.hellmanConstant > 0.7) {
    errors.push({ fieldId: 'hellman-constant', message: 'Hellman constant must be between 0 and 0.7.' });
  }
  if (Number.isNaN(inputs.temperatureC) || inputs.temperatureC <= -40 || inputs.temperatureC >= 50) {
    errors.push({ fieldId: 'temperature', message: 'Temperature must be greater than -40°C and less than 50°C.' });
  }
  if (Number.isNaN(inputs.pressure) || inputs.pressure <= 80 || inputs.pressure >= 120) {
    errors.push({ fieldId: 'pressure', message: 'Pressure must be greater than 80 kPa and less than 120 kPa.' });
  }
  if (Number.isNaN(inputs.humidity) || inputs.humidity < 0 || inputs.humidity > 100) {
    errors.push({ fieldId: 'humidity', message: 'Humidity must be between 0% and 100%.' });
  }

  return errors;
}

function calculateTrajectory() {
  const launchElevation = parseFloat(document.getElementById('launch-elevation').value);
  const bowTurns = parseFloat(document.getElementById('bow-turns').value);
  const initialHeight = parseFloat(document.getElementById('initial-height').value);
  const speed0Turns = parseFloat(document.getElementById('speed-0-turns').value);
  const speed2Turns = parseFloat(document.getElementById('speed-2-turns').value);
  const speed4Turns = parseFloat(document.getElementById('speed-4-turns').value);
  const arrowWeight = parseFloat(document.getElementById('arrow-weight').value);
  const longCda = parseFloat(document.getElementById('long-cda').value);
  const latCda = parseFloat(document.getElementById('lat-cda').value);
  const windSpeed = parseFloat(document.getElementById('wind-speed').value);
  const windSpeedHeight = parseFloat(document.getElementById('wind-speed-height').value);
  const windDirection = parseFloat(document.getElementById('wind-direction').value);
  const hellmanConstant = parseFloat(document.getElementById('hellman-constant').value);
  const temperatureC = parseFloat(document.getElementById('temperature').value);
  const pressure = parseFloat(document.getElementById('pressure').value);
  const humidity = parseFloat(document.getElementById('humidity').value);

  const bowSpeeds = new BowSpeeds(speed0Turns, speed2Turns, speed4Turns);
  const launchVelocity = bowSpeeds.calculateSpeedFps(bowTurns);
  const launchVelocityMps = UnitConverter.convertSpeed(launchVelocity, 'ft/s', 'm/s');
  const launchVelocityInput = document.getElementById('launch-velocity');
  if (launchVelocityInput) {
    launchVelocityInput.value = launchVelocity.toFixed(0);
  }
  const windSpeedMps = UnitConverter.convertSpeed(windSpeed, 'mph', 'm/s');

  const inputs = {
    launchElevation,
    launchVelocity,
    bowTurns,
    initialHeight,
    speed0Turns,
    speed2Turns,
    speed4Turns,
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

  console.log('calculateTrajectory inputs:', {
    launchElevation,
    launchVelocity,
    initialHeight,
    arrowWeight,
    arrowMass,
    longCda,
    latCda,
    windSpeed,
    windSpeedHeight,
    windDirection,
    hellmanConstant,
    temperatureC,
    pressure,
    humidity,
    airDensity: atmosphere.airDensity,
    timeStep: 0.01,
    maxSimulationTime: 10
  });

  const result = TrajectoryCalculator.calculate(
    launchElevation,
    launchVelocityMps,
    initialHeight,
    arrow,
    wind,
    atmosphere.airDensity,
    0.01,
    10
  );

  if (!result || Number.isNaN(result.impactX) || Number.isNaN(result.impactY) || Number.isNaN(result.maxZ) || Number.isNaN(result.totalFlightTime)) {
    console.error('Trajectory calculation returned invalid results', result);
    return;
  }

  document.getElementById('impact-distance-m').value = result.impactX.toFixed(2);
  document.getElementById('impact-distance-yd').value = UnitConverter.convertLength(result.impactX, 'm', 'yd').toFixed(2);
  document.getElementById('max-height').value = result.maxZ.toFixed(2);
  document.getElementById('flight-time').value = result.totalFlightTime.toFixed(2);
  document.getElementById('lateral-drift').value = result.impactY.toFixed(2);
  document.getElementById('air-density').value = atmosphere.airDensity.toFixed(3);
}

