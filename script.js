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
    const p = this.pressure;
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

  static calculateNetForce(position, velocity, arrow, wind, atmosphere) {
    // position: Vector3D for arrow coordinates
    // velocity: Vector3D for arrow velocity
    // arrow: Arrow instance with mass and drag areas
    // wind: Wind instance describing current wind behavior
    // atmosphere: Atmosphere instance describing current environmental conditions

    const gravitationalForce = new Vector3D(0, 0, Constants.GRAVITY * arrow.mass * -1);
    const relativeVelocity = velocity.subtract(wind.getWindVectorAtHeight(position.z));

    let dragForceX = 0.0;
    let dragForceY = 0.0;
    let dragForceZ = 0.0;

    if (relativeVelocity.x !== 0) {
      dragForceX = -(0.5 * arrow.longDragArea * atmosphere.airDensity) * Math.abs(relativeVelocity.x) * relativeVelocity.x;
    }

    if (relativeVelocity.y !== 0) {
      dragForceY = -(0.5 * arrow.latDragArea * atmosphere.airDensity) * Math.abs(relativeVelocity.y) * relativeVelocity.y;
    }

    if (relativeVelocity.z !== 0) {
      dragForceZ = -(0.5 * arrow.latDragArea * atmosphere.airDensity) * Math.abs(relativeVelocity.z) * relativeVelocity.z;
    }

    const dragForce = new Vector3D(dragForceX, dragForceY, dragForceZ);
    return gravitationalForce.add(dragForce);
  }

  static calculateAcceleration(position, velocity, arrow, wind, atmosphere) {
    const netForce = TrajectoryCalculator.calculateNetForce(position, velocity, arrow, wind, atmosphere);
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

  static integrateRK4(position, velocity, arrow, wind, atmosphere, timeStep) {
    const k1v = TrajectoryCalculator.calculateAcceleration(position, velocity, arrow, wind, atmosphere).multiplyByScalar(timeStep);
    const k1p = velocity.multiplyByScalar(timeStep);

    const k2v = TrajectoryCalculator.calculateAcceleration(
      position.add(k1p.multiplyByScalar(0.5)),
      velocity.add(k1v.multiplyByScalar(0.5)),
      arrow,
      wind,
      atmosphere
    ).multiplyByScalar(timeStep);
    const k2p = velocity.add(k1v.multiplyByScalar(0.5)).multiplyByScalar(timeStep);

    const k3v = TrajectoryCalculator.calculateAcceleration(
      position.add(k2p.multiplyByScalar(0.5)),
      velocity.add(k2v.multiplyByScalar(0.5)),
      arrow,
      wind,
      atmosphere
    ).multiplyByScalar(timeStep);
    const k3p = velocity.add(k2v.multiplyByScalar(0.5)).multiplyByScalar(timeStep);

    const k4v = TrajectoryCalculator.calculateAcceleration(
      position.add(k3p),
      velocity.add(k3v),
      arrow,
      wind,
      atmosphere
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

  static simulateTrajectory(position, velocity, arrow, wind, atmosphere, timeStep, maxSimulationTime) {
    let currentPosition = position;
    let currentVelocity = velocity;
    let previousPosition = currentPosition;
    let previousVelocity = currentVelocity;
    let flightTime = 0;
    let maxZ = currentPosition.z;

    while (currentPosition.z >= 0) {
      previousPosition = currentPosition;
      previousVelocity = currentVelocity;

      const { nextPosition, nextVelocity } = TrajectoryCalculator.integrateRK4(
        currentPosition,
        currentVelocity,
        arrow,
        wind,
        atmosphere,
        timeStep
      );

      currentPosition = nextPosition;
      currentVelocity = nextVelocity;

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

  static calculate(launchElevation, launchVelocity, initialHeight, arrow, wind, atmosphere, timeStep, maxSimulationTime) {
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
      atmosphere,
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
  constructor(impactX, impactY, impactZ, impactAngle,maxZ, totalFlightTime) {
    this.impactX = impactX;
    this.impactY = impactY;
    this.impactZ = impactZ;
    this.impactAngle = impactAngle;
    this.maxZ = maxZ;
    this.totalFlightTime = totalFlightTime;  
  }
}

