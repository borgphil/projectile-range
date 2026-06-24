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

class Arrow {
  constructor(massGrains, longDragArea, latDragArea) {
    this.massGrains = massGrains;
    this.longDragArea = longDragArea;
    this.latDragArea = latDragArea;
  }
}
