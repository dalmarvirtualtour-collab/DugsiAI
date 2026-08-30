// Automated mathematical verification of Virtual Lab equations (Phase 1, 2 & 3)

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// 1. Physics Buoyancy Solvers
function solveBuoyancy(mass, volume, liquidDensity, gravity) {
  const objectDensity = mass / volume;
  const weight = (mass / 1000) * gravity; // N
  
  const isFloating = objectDensity < liquidDensity;
  const submergedFraction = isFloating ? (objectDensity / liquidDensity) : 1.0;
  const displacedVolume = volume * submergedFraction; // cm^3
  
  const buoyantForce = (displacedVolume * liquidDensity / 1000) * gravity; // N
  const netForce = buoyantForce - weight;
  
  return { objectDensity, weight, buoyantForce, netForce, isFloating };
}

function verifyPhysics() {
  console.log('Verifying Physics Buoyancy Calculations...');
  const gold = solveBuoyancy(193, 10, 1.0, 9.81);
  assert(gold.objectDensity === 19.3, 'Gold density should be 19.3');
  assert(!gold.isFloating, 'Gold should sink in water');
  assert(Math.abs(gold.buoyantForce - 0.0981) < 0.0001, 'Buoyant force of gold displaced volume should match water weight');
  assert(gold.netForce < 0, 'Net force should be negative (downwards)');
  
  const wood = solveBuoyancy(60, 100, 1.0, 9.81);
  assert(wood.isFloating, 'Wood should float in water');
  assert(Math.abs(wood.buoyantForce - wood.weight) < 0.0001, 'Buoyant force should equal weight for floating objects (equilibrium)');
  assert(Math.abs(wood.netForce) < 0.0001, 'Net force in equilibrium should be zero');
  
  console.log('  -> Physics buoyancy successfully verified!');
}

// 2. Mathematics Quadratic Solvers
function solveQuadratic(a, b, c) {
  const vertexX = -b / (2 * a);
  const vertexY = a * Math.pow(vertexX, 2) + b * vertexX + c;
  const discriminant = Math.pow(b, 2) - 4 * a * c;
  
  let roots = [];
  if (discriminant > 0) {
    roots = [
      (-b + Math.sqrt(discriminant)) / (2 * a),
      (-b - Math.sqrt(discriminant)) / (2 * a)
    ].sort((x, y) => x - y);
  } else if (discriminant === 0) {
    roots = [-b / (2 * a)];
  }
  
  return { vertexX, vertexY, discriminant, roots };
}

function verifyMath() {
  console.log('Verifying Mathematics Quadratic Solvers...');
  const res = solveQuadratic(1, -4, 3);
  assert(res.vertexX === 2 && res.vertexY === -1, 'Vertex of y=x^2-4x+3 should be (2, -1)');
  assert(res.discriminant === 4, 'Discriminant should be 4');
  assert(res.roots[0] === 1 && res.roots[1] === 3, 'Roots should be 1 and 3');
  
  console.log('  -> Mathematics quadratics successfully verified!');
}

// 3. Kirchhoff Circuit Solver Verification
function solveCircuit(batteryVoltage, resistance, bulbResistance, isSwitchClosed) {
  const totalResistance = resistance + bulbResistance;
  const current = isSwitchClosed ? batteryVoltage / totalResistance : 0; // A
  const bulbVoltageDrop = current * bulbResistance; // V
  const resistorVoltageDrop = current * resistance; // V
  return { totalResistance, current, bulbVoltageDrop, resistorVoltageDrop };
}

function verifyCircuit() {
  console.log('Verifying Kirchhoff Circuit Analysis Solvers...');
  const c1 = solveCircuit(12, 10, 5, true);
  assert(c1.totalResistance === 15, 'Total Resistance should be 15 ohms');
  assert(Math.abs(c1.current - 0.8) < 0.0001, 'Current should be 0.8 A');
  assert(Math.abs(c1.bulbVoltageDrop - 4.0) < 0.0001, 'Bulb voltage drop should be 4.0 V');
  assert(Math.abs(c1.resistorVoltageDrop - 8.0) < 0.0001, 'Resistor voltage drop should be 8.0 V');

  const c2 = solveCircuit(12, 10, 5, false);
  assert(c2.current === 0, 'Current should be 0 A when switch is open');
  
  console.log('  -> Circuit solvers successfully verified!');
}

// 4. Stoichiometry Yield Solver Verification
function solveStoichiometry(massR1, massR2, mwR1, mwR2, cR1, cR2, cProduct, mwProduct) {
  const molesR1 = massR1 / mwR1;
  const molesR2 = massR2 / mwR2;
  
  const ratioR1 = molesR1 / cR1;
  const ratioR2 = molesR2 / cR2;
  
  let limitingReactant = '';
  let theoreticalYield = 0;
  let excessRemaining = 0;
  
  if (ratioR1 < ratioR2) {
    limitingReactant = 'R1';
    const productMoles = molesR1 * (cProduct / cR1);
    theoreticalYield = productMoles * mwProduct;
    
    const excessConsumedMoles = molesR1 * (cR2 / cR1);
    excessRemaining = (molesR2 - excessConsumedMoles) * mwR2;
  } else {
    limitingReactant = 'R2';
    const productMoles = molesR2 * (cProduct / cR2);
    theoreticalYield = productMoles * mwProduct;
    
    const excessConsumedMoles = molesR2 * (cR1 / cR2);
    excessRemaining = (molesR1 - excessConsumedMoles) * mwR1;
  }
  
  return { limitingReactant, theoreticalYield, excessRemaining };
}

function verifyStoichiometry() {
  console.log('Verifying Chemistry Stoichiometry Solvers...');
  const synthesis = solveStoichiometry(10.0, 32.0, 2.016, 32.00, 2, 1, 2, 18.015);
  
  assert(synthesis.limitingReactant === 'R2', 'Oxygen (R2) should be the limiting reactant');
  assert(Math.abs(synthesis.theoreticalYield - 36.03) < 0.01, 'Theoretical yield should be ~36.03 g');
  assert(Math.abs(synthesis.excessRemaining - 5.968) < 0.01, 'Excess H2 remaining should be ~5.968 g');
  
  console.log('  -> Stoichiometry solvers successfully verified!');
}

// 5. Phase 3: Projectile Motion Analytical Range Solver
function solveProjectileRange(v0, angleDeg, g) {
  const rad = (angleDeg * Math.PI) / 180;
  return (Math.pow(v0, 2) * Math.sin(2 * rad)) / g;
}

function verifyProjectile() {
  console.log('Verifying Physics Projectile Range Equations...');
  // Launch at 45 degrees, v0 = 20 m/s, g = 9.81 m/s^2. Range R = (400 * sin(90))/9.81 = 40.77 m
  const range = solveProjectileRange(20, 45, 9.81);
  assert(Math.abs(range - 40.7747) < 0.001, 'Ideal range should be 40.775 m');
  
  // Launch at 90 degrees (straight up). Range should be 0.0
  const vertical = solveProjectileRange(20, 90, 9.81);
  assert(Math.abs(vertical) < 0.0001, 'Ideal range straight up should be 0.0 m');
  
  console.log('  -> Projectile range equations successfully verified!');
}

// 6. Phase 3: Punnett Cross Solver
function solvePunnettMonoRatio(p1, p2) {
  const g1 = p1.split('');
  const g2 = p2.split('');
  
  const combos = [
    g1[0] + g2[0],
    g1[0] + g2[1],
    g1[1] + g2[0],
    g1[1] + g2[1]
  ].map(allele => {
    const parts = allele.split('');
    if (parts[0] !== parts[0].toUpperCase() && parts[1] === parts[1].toUpperCase()) {
      return parts[1] + parts[0];
    }
    return allele;
  });

  const count = { dominant: 0, recessive: 0 };
  combos.forEach(c => {
    // Dominant trait has capital letter, e.g. Tt or TT
    if (c.includes('T')) count.dominant++;
    else count.recessive++;
  });

  return count;
}

function verifyGenetics() {
  console.log('Verifying Biology Mendelian Punnett Ratio Solvers...');
  // Tt x Tt heterozygous cross. Dominant Tall should be 3/4, Recessive Short should be 1/4 (3:1)
  const cross = solvePunnettMonoRatio('Tt', 'Tt');
  assert(cross.dominant === 3, 'Dominant count should be 3');
  assert(cross.recessive === 1, 'Recessive count should be 1');
  
  // TT x tt cross. Dominant should be 4, Recessive should be 0 (all Tt heterozygous)
  const cross2 = solvePunnettMonoRatio('TT', 'tt');
  assert(cross2.dominant === 4, 'Dominant count should be 4 (all heterozygous Tt)');
  assert(cross2.recessive === 0, 'Recessive count should be 0');

  console.log('  -> Genetics Punnett ratio solvers successfully verified!');
}

// 7. Phase 3: Electrochemistry Nernst Equation
function solveNernstPotential(eStandard, temp, n, concAnode, concCathode) {
  const R = 8.314;
  const F = 96485;
  const Q = concAnode / concCathode;
  const nernstFactor = (R * temp) / (n * F);
  return eStandard - nernstFactor * Math.log(Q);
}

function verifyElectrochemistry() {
  console.log('Verifying Chemistry Nernst Cell Voltage Potentials...');
  // Zn-Cu standard cell. E0 = 1.10 V. T = 298.15 K. n = 2.
  // Concentration: [Zn2+] = 0.1 M, [Cu2+] = 1.0 M. Q = 0.1 / 1.0 = 0.1
  const voltage = solveNernstPotential(1.10, 298.15, 2, 0.1, 1.0);
  // E = 1.10 - (0.02569 / 2) * ln(0.1) = 1.10 - (0.01284 * -2.3025) = 1.10 + 0.0296 = 1.1296 V
  assert(Math.abs(voltage - 1.1296) < 0.001, 'Cell voltage under non-standard concentration should be ~1.130 V');
  
  console.log('  -> Electrochemistry Nernst voltage equations successfully verified!');
}

// 8. Phase 3: Calculus Secant Slope Limit Verification
function solveSecantSlope(f, x0, h) {
  return (f(x0 + h) - f(x0)) / h;
}

function verifyCalculus() {
  console.log('Verifying Mathematics Calculus Tangent Slope Limits...');
  // f(x) = x^2. Derivative f'(x) = 2x. At x0 = 2, f'(2) = 4.
  const f_poly = (x) => x * x;
  
  // Large h = 1.0. Secant slope = [f(3) - f(2)]/1 = [9 - 4]/1 = 5
  const slopeLargeH = solveSecantSlope(f_poly, 2, 1.0);
  assert(slopeLargeH === 5, 'Large interval h=1.0 secant slope should be 5');

  // Small h = 0.001. Secant slope = [f(2.001) - f(2)]/0.001 = [4.004001 - 4]/0.001 = 4.001 -> approaches f'(2) = 4!
  const slopeSmallH = solveSecantSlope(f_poly, 2, 0.001);
  assert(Math.abs(slopeSmallH - 4.0) < 0.01, 'Small interval h=0.001 secant slope should approach tangent derivative of 4.0');

  console.log('  -> Calculus tangent slope limits successfully verified!');
}

try {
  verifyPhysics();
  verifyMath();
  verifyCircuit();
  verifyStoichiometry();
  verifyProjectile();
  verifyGenetics();
  verifyElectrochemistry();
  verifyCalculus();
  console.log('\n=== ALL PHASE 1, 2 & 3 MATHEMATICAL MODEL VERIFICATIONS PASSED ===');
} catch (e) {
  console.error('\n!!! VERIFICATION FAILURE !!!', e.message);
  process.exit(1);
}
