import { Vector3 } from './src/math/Vector3.js';
import { Quaternion } from './src/math/Quaternion.js';

// Test 1: Rotation combination
const q1 = Quaternion.Euler(0, 90, 0);
const q2 = Quaternion.Euler(0, 90, 0);
const combined = Quaternion.Multiply(q1, q2);
console.log('Combined rotation Euler:', combined.eulerAngles);

// Test 2: RotateAround
const pos = new Vector3(5, 0, 0);
const rotation = Quaternion.AngleAxis(90, Vector3.up);
const rotatedPos = rotation.MultiplyVector(pos);
console.log('Rotated position:', rotatedPos);

// Test 3: LookRotation
const direction = new Vector3(10, 0, 0);
const lookRot = Quaternion.LookRotation(direction, Vector3.up);
const forward = lookRot.MultiplyVector(Vector3.forward);
console.log('Forward after LookRotation:', forward);
console.log('Direction normalized:', direction.normalized);
