const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Virtual Lab Curriculum & Metadata...');

  // 1. Create or Find Subjects
  const subjectsData = [
    { id: '7-physics', name: 'Physics', grade: 7, description: 'Grade 7 Physics Curriculum' },
    { id: '9-physics', name: 'Physics', grade: 9, description: 'Grade 9 Physics Curriculum' },
    { id: '9-biology', name: 'Biology', grade: 9, description: 'Grade 9 Biology Curriculum' },
    { id: '10-physics', name: 'Physics', grade: 10, description: 'Grade 10 Physics Curriculum' },
    { id: '10-biology', name: 'Biology', grade: 10, description: 'Grade 10 Biology Curriculum' },
    { id: '10-chemistry', name: 'Chemistry', grade: 10, description: 'Grade 10 Chemistry Curriculum' },
    { id: '10-mathematics', name: 'Mathematics', grade: 10, description: 'Grade 10 Mathematics Curriculum' },
    { id: '10-geography', name: 'Geography', grade: 10, description: 'Grade 10 Geography Curriculum' },
    { id: '11-biology', name: 'Biology', grade: 11, description: 'Grade 11 Biology Curriculum' },
    { id: '12-physics', name: 'Physics', grade: 12, description: 'Grade 12 Physics Curriculum' },
    { id: '12-chemistry', name: 'Chemistry', grade: 12, description: 'Grade 12 Chemistry Curriculum' },
    { id: '12-mathematics', name: 'Mathematics', grade: 12, description: 'Grade 12 Mathematics Curriculum' }
  ];

  const subjects = {};
  for (const item of subjectsData) {
    let sub = await prisma.subject.findUnique({ where: { id: item.id } });
    if (!sub) {
      // Check if there's an existing subject with the same name and grade
      const existing = await prisma.subject.findFirst({
        where: { name: item.name, grade: item.grade }
      });
      if (existing) {
        sub = existing;
      } else {
        sub = await prisma.subject.create({ data: item });
      }
    }
    subjects[item.id] = sub;
  }
  console.log('Subjects verified/created.');

  // 2. Create or Find Chapters
  const chaptersData = [
    {
      id: '7-physics-ch-buoyancy',
      name: 'Density and Buoyancy',
      chapterNumber: 3,
      subjectId: subjects['7-physics'].id
    },
    {
      id: '9-physics-ch-circuit',
      name: 'Electricity & Magnetism',
      chapterNumber: 5,
      subjectId: subjects['9-physics'].id
    },
    {
      id: '9-biology-ch-mitosis',
      name: 'Reproduction and Chromosome Splitting',
      chapterNumber: 4,
      subjectId: subjects['9-biology'].id
    },
    {
      id: '10-biology-ch-heart',
      name: 'Human Circulatory System',
      chapterNumber: 2,
      subjectId: subjects['10-biology'].id
    },
    {
      id: '10-chemistry-ch-atom',
      name: 'Atomic Structure',
      chapterNumber: 1,
      subjectId: subjects['10-chemistry'].id
    },
    {
      id: '10-chemistry-ch-stoichiometry',
      name: 'Chemical Reactions & Stoichiometry',
      chapterNumber: 2,
      subjectId: subjects['10-chemistry'].id
    },
    {
      id: '10-mathematics-ch-quadratic',
      name: 'Quadratic Functions',
      chapterNumber: 1,
      subjectId: subjects['10-mathematics'].id
    },
    {
      id: '10-geography-ch-topography',
      name: 'Topographical Maps',
      chapterNumber: 1,
      subjectId: subjects['10-geography'].id
    },
    {
      id: '11-biology-ch-genetics',
      name: 'Genetics & DNA Replication',
      chapterNumber: 6,
      subjectId: subjects['11-biology'].id
    },
    {
      id: '12-physics-ch-projectile',
      name: 'Two-Dimensional Motion',
      chapterNumber: 2,
      subjectId: subjects['12-physics'].id
    },
    {
      id: '12-chemistry-ch-electrochemistry',
      name: 'Electrochemistry',
      chapterNumber: 2,
      subjectId: subjects['12-chemistry'].id
    },
    {
      id: '12-mathematics-ch-calculus',
      name: 'Introduction to Calculus',
      chapterNumber: 2,
      subjectId: subjects['12-mathematics'].id
    }
  ];

  const chapters = {};
  for (const item of chaptersData) {
    let chap = await prisma.chapter.findUnique({ where: { id: item.id } });
    if (!chap) {
      // Fallback: look for a chapter with the same name in the subject
      const existing = await prisma.chapter.findFirst({
        where: { name: item.name, subjectId: item.subjectId }
      });
      if (existing) {
        chap = existing;
      } else {
        chap = await prisma.chapter.create({ data: item });
      }
    }
    chapters[item.id] = chap;
  }
  console.log('Chapters verified/created.');

  // 3. Create or Find Lessons
  const lessonsData = [
    {
      id: '7-physics-les-buoyancy',
      title: 'Buoyancy & Archimedes\' Principle',
      lessonNumber: 1,
      textbookAccess: 'FREEMIUM',
      chapterId: chapters['7-physics-ch-buoyancy'].id,
      content: `### Grade 7 Physics: Buoyancy and Archimedes' Principle
Buoyancy is the upward force exerted by a fluid on any object placed in it. 

**Archimedes' Principle** states:
*Any object, wholly or partially immersed in a fluid, is buoyed up by a force equal to the weight of the fluid displaced by the object.*

$$F_b = \\rho_{liquid} \\cdot V_{submerged} \\cdot g$$

Where:
- $F_b$ is the buoyant force
- $\\rho_{liquid}$ is the fluid density
- $V_{submerged}$ is the submerged volume of the object
- $g$ is acceleration due to gravity (~$9.81\\text{ m/s}^2$)`
    },
    {
      id: '9-physics-les-circuit',
      title: 'Current, Voltage, and Kirchhoff\'s Laws',
      lessonNumber: 1,
      textbookAccess: 'FREEMIUM',
      chapterId: chapters['9-physics-ch-circuit'].id,
      content: `### Grade 9 Physics: Electric Circuits and Kirchhoff's Laws
Ohm's Law states that current ($I$) through a conductor between two points is directly proportional to the voltage ($V$) across them:

$$V = I \\cdot R$$

Kirchhoff's Laws:
1. **Kirchhoff's Current Law (KCL):** The total current entering a junction equals the total current leaving it.
2. **Kirchhoff's Voltage Law (KVL):** The sum of potential drops around any closed loop is equal to the sum of electromotive forces.`
    },
    {
      id: '9-biology-les-mitosis',
      title: 'Mitosis & Phases of Cell Division',
      lessonNumber: 1,
      textbookAccess: 'FREEMIUM',
      chapterId: chapters['9-biology-ch-mitosis'].id,
      content: `### Grade 9 Biology: Cell Division and Mitosis
Mitosis is the process of cell division that results in two genetically identical daughter cells.

The phases are:
1. **Interphase:** DNA duplicates.
2. **Prophase:** Chromosomes condense, spindles form.
3. **Metaphase:** Chromosomes align on the equator plate.
4. **Anaphase:** Sister chromatids separate.
5. **Telophase:** Nuclear membranes re-form.
6. **Cytokinesis:** Cytoplasm divides.`
    },
    {
      id: '10-biology-les-heart',
      title: '3D Heart & Blood Circulation',
      lessonNumber: 1,
      textbookAccess: 'FREEMIUM',
      chapterId: chapters['10-biology-ch-heart'].id,
      content: `### Grade 10 Biology: The Human Heart
The heart is a muscular organ that pumps blood throughout the circulatory system. 

It consists of four chambers:
1. **Right Atrium:** Receives deoxygenated blood from the body.
2. **Right Ventricle:** Pumps deoxygenated blood to the lungs.
3. **Left Atrium:** Receives oxygenated blood from the lungs.
4. **Left Ventricle:** Pumps oxygenated blood to the body (has the thickest muscular wall).

Valves prevent the backflow of blood, ensuring one-way circulation.`
    },
    {
      id: '10-chemistry-les-atom',
      title: 'Atomic Structure & Bohr Model',
      lessonNumber: 1,
      textbookAccess: 'FREEMIUM',
      chapterId: chapters['10-chemistry-ch-atom'].id,
      content: `### Grade 10 Chemistry: The Bohr Atom Model
The Bohr model represents the atom as a central nucleus containing protons and neutrons, orbited by electrons in discrete quantum energy shells.

Key concepts:
- **Atomic Number (Z):** Number of protons in the nucleus (defines the element).
- **Mass Number (A):** Sum of protons and neutrons.
- **Electron Configurations:** Distribution of electrons in energy levels ($2, 8, 8, \\dots$).`
    },
    {
      id: '10-chemistry-les-stoichiometry',
      title: 'Stoichiometry & Reaction Balancing',
      lessonNumber: 1,
      textbookAccess: 'FREEMIUM',
      chapterId: chapters['10-chemistry-ch-stoichiometry'].id,
      content: `### Grade 10 Chemistry: Reaction Stoichiometry
Stoichiometry measures quantitative relationships between reactants and products.

Key terms:
- **Limiting Reactant:** The reactant that is completely consumed first, limiting the amount of product formed.
- **Theoretical Yield:** The maximum amount of product that can be generated.
- **Excess Reactant:** The reactant that remains after the reaction terminates.`
    },
    {
      id: '10-mathematics-les-quadratic',
      title: 'Quadratic Functions & Parabolic Graphs',
      lessonNumber: 1,
      textbookAccess: 'FREEMIUM',
      chapterId: chapters['10-mathematics-ch-quadratic'].id,
      content: `### Grade 10 Mathematics: Quadratic Functions
A quadratic function is a second-degree polynomial function of the form:

$$y = a x^2 + b x + c$$

Where:
- $a \\neq 0$: controls width and direction of opening (positive opens UP, negative opens DOWN).
- $b$: affects horizontal shift and vertex position.
- $c$: is the y-intercept of the graph.

The vertex is located at:
$$x_{vertex} = -\\frac{b}{2a}$$`
    },
    {
      id: '10-geography-les-topography',
      title: '3D Topographical Contour Mapping',
      lessonNumber: 1,
      textbookAccess: 'FREEMIUM',
      chapterId: chapters['10-geography-ch-topography'].id,
      content: `### Grade 10 Geography: Topographic Contour Maps
Topographic maps represent three-dimensional terrain features on a flat sheet using contour lines.

Key parameters:
- **Contour Lines:** Lines connecting points of equal elevation.
- **Contour Interval:** The vertical distance difference between adjacent contours.
- **Map Scales:** Numerical ratios (e.g. $1:50,000$) or visual bar scales translating map distance to real-world distance.`
    },
    {
      id: '12-physics-les-projectile',
      title: 'Two-Dimensional Projectile Motion',
      lessonNumber: 1,
      textbookAccess: 'FREEMIUM',
      chapterId: chapters['12-physics-ch-projectile'].id,
      content: `### Grade 12 Physics: Projectile Motion
Projectile motion is a form of two-dimensional motion where an object is launched into a gravitational field.

Equations of motion under constant gravity $g$ (without air resistance):
- $x(t) = v_0 \\cos\\theta \\cdot t$
- $y(t) = h_0 + v_0 \\sin\\theta \\cdot t - \\frac{1}{2} g t^2$

With drag $F_d = -k v$, velocity components decay exponentially, limiting range and skewing the parabolic path.`
    },
    {
      id: '11-biology-les-genetics',
      title: 'Mendelian Genetics & Punnett Squares',
      lessonNumber: 1,
      textbookAccess: 'FREEMIUM',
      chapterId: chapters['11-biology-ch-genetics'].id,
      content: `### Grade 11 Biology: Genetics and Inheritance
Gregor Mendel established the laws of inheritance using pea plants. 

Key terms:
- **Genotype:** The genetic makeup of an organism (e.g., TT, Tt, tt).
- **Phenotype:** The physical expression of traits (e.g., Tall, Short).
- **Punnett Square:** A grid used to predict the genotypes of offspring from parent crosses.`
    },
    {
      id: '12-chemistry-les-electrochemistry',
      title: 'Galvanic Cells & Standard Reduction Potentials',
      lessonNumber: 1,
      textbookAccess: 'FREEMIUM',
      chapterId: chapters['12-chemistry-ch-electrochemistry'].id,
      content: `### Grade 12 Chemistry: Galvanic Cells
A galvanic cell generates electrical energy from spontaneous redox reactions.

Key concepts:
- **Anode:** The electrode where oxidation occurs (negative terminal).
- **Cathode:** The electrode where reduction occurs (positive terminal).
- **Nernst Equation:** Calculates cell potential under non-standard conditions:
  $$E_{cell} = E^\\circ_{cell} - \\frac{RT}{nF} \\ln Q$$`
    },
    {
      id: '12-mathematics-les-calculus',
      title: 'Limits, Derivatives & Riemann Integration Area',
      lessonNumber: 1,
      textbookAccess: 'FREEMIUM',
      chapterId: chapters['12-mathematics-ch-calculus'].id,
      content: `### Grade 12 Mathematics: Calculus Foundations
Calculus focuses on limits, derivatives, and integrals.

Key concepts:
- **Derivative:** Instantaneous rate of change, defined as the limit of secant slopes:
  $$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$
- **Definite Integral:** The continuous area under a curve, defined as the limit of Riemann summation rectangles:
  $$\\int_a^b f(x) dx = \\lim_{N \\to \\infty} \\sum_{i=1}^N f(x_i) \\Delta x$$`
    }
  ];

  for (const item of lessonsData) {
    const existing = await prisma.lesson.findUnique({ where: { id: item.id } });
    if (!existing) {
      await prisma.lesson.create({ data: item });
    }
  }
  console.log('Lessons verified/created.');

  // 4. Seed VirtualLab configs
  const labsData = [
    {
      labId: 'grade7_physics_buoyancy',
      grade: 7,
      subject: 'physics',
      chapterId: chapters['7-physics-ch-buoyancy'].id,
      lessonId: '7-physics-les-buoyancy',
      title: 'Archimedes\' Buoyancy Laboratory',
      description: 'Interact with fluids, gravity, and material densities to understand floating and sinking forces.',
      learningObjectives: JSON.stringify([
        'Understand buoyancy and Archimedes\' Principle.',
        'Compare densities of objects and liquids.',
        'Observe how weight and buoyant force interact.'
      ]),
      labType: 'PHYSICS',
      configuration: JSON.stringify({
        defaultLiquidDensity: 1.0, // g/cm^3
        defaultObjectMass: 100.0, // g
        defaultObjectVolume: 50.0 // cm^3
      }),
      equations: JSON.stringify({
        buoyantForce: 'F_b = rho_liquid * V_submerged * g',
        objectDensity: 'rho_obj = m / V'
      }),
      questions: JSON.stringify([
        {
          id: 'q1',
          question: 'According to Archimedes\' Principle, the buoyant force is equal to:',
          options: [
            'The total weight of the object',
            'The weight of the displaced liquid',
            'The density of the liquid times gravity',
            'The volume of the object'
          ],
          correctAnswer: 'The weight of the displaced liquid',
          explanation: 'Archimedes\' Principle states that the buoyant force equals the weight of the fluid that the object displaces.'
        },
        {
          id: 'q2',
          question: 'If an object floats in water, what does this tell us about its density?',
          options: [
            'Its density is higher than water\'s density (> 1.0 g/cm³)',
            'Its density is lower than water\'s density (< 1.0 g/cm³)',
            'Its density is exactly equal to water\'s density',
            'Density has no impact on floating'
          ],
          correctAnswer: 'Its density is lower than water\'s density (< 1.0 g/cm³)',
          explanation: 'An object floats if its average density is less than the density of the surrounding fluid.'
        }
      ]),
      localization: JSON.stringify({
        en: { title: 'Archimedes\' Buoyancy Lab', prompt: 'Drop object' },
        so: { title: 'Sheybaarka Kacsanaanta Biyaha', prompt: 'Ku dhib shayga' },
        am: { title: 'የፈሳሽ ተንሳፋፊነት ላብራቶሪ', prompt: 'ዕቃውን ጣል' },
        om: { title: 'Virtual Laabii Dhiibbaa Bishaanii', prompt: 'Meesha gadi dhiisi' }
      })
    },
    {
      labId: 'grade10_biology_heart',
      grade: 10,
      subject: 'biology',
      chapterId: chapters['10-biology-ch-heart'].id,
      lessonId: '10-biology-les-heart',
      title: '3D Human Heart Anatomical Simulator',
      description: 'Explore the internal chambers of the human heart and trace oxygenated/deoxygenated circulation pathways.',
      learningObjectives: JSON.stringify([
        'Identify the four chambers of the human heart.',
        'Trace the sequence of pulmonary and systemic circulation.',
        'Distinguish between oxygen-rich and oxygen-poor blood.'
      ]),
      labType: 'BIOLOGY',
      configuration: JSON.stringify({
        defaultBpm: 72,
        playSpeed: 1.0
      }),
      equations: JSON.stringify({
        cardiacOutput: 'Cardiac Output = Stroke Volume * Heart Rate'
      }),
      questions: JSON.stringify([
        {
          id: 'q1',
          question: 'Which chamber of the heart has the thickest muscular wall to pump blood to the entire body?',
          options: [
            'Right Atrium',
            'Right Ventricle',
            'Left Atrium',
            'Left Ventricle'
          ],
          correctAnswer: 'Left Ventricle',
          explanation: 'The Left Ventricle requires the thickest myocardium to generate high pressures needed for systemic circulation.'
        },
        {
          id: 'q2',
          question: 'What is the correct order of blood entering the heart from the body?',
          options: [
            'Vena Cava -> Right Atrium -> Right Ventricle -> Pulmonary Artery',
            'Aorta -> Left Atrium -> Left Ventricle -> Pulmonary Vein',
            'Vena Cava -> Left Atrium -> Left Ventricle -> Aorta',
            'Pulmonary Vein -> Right Atrium -> Right Ventricle -> Lungs'
          ],
          correctAnswer: 'Vena Cava -> Right Atrium -> Right Ventricle -> Pulmonary Artery',
          explanation: 'Deoxygenated blood returns from the body via the vena cava into the right side of the heart to be pumped to the lungs.'
        }
      ]),
      localization: JSON.stringify({
        en: { title: '3D Human Heart Simulator', prompt: 'Start Blood Flow' },
        so: { title: 'Muuqaalka 3D ee Wadnaha', prompt: 'Biloow Socodka Dhiigga' },
        am: { title: 'ባለ 3-ልኬት የልብ ላብራቶሪ', prompt: 'የደም ዝውውር ጀምር' },
        om: { title: 'Simuleetara Onnee Namaa 3D', prompt: 'Dhiiga yaasi' }
      })
    },
    {
      labId: 'grade10_chemistry_atom',
      grade: 10,
      subject: 'chemistry',
      chapterId: chapters['10-chemistry-ch-atom'].id,
      lessonId: '10-chemistry-les-atom',
      title: 'Bohr Atomic Orbitals Workspace',
      description: 'Visualize protons, neutrons, and electron shells. Explore the periodic table and quantum energy levels.',
      learningObjectives: JSON.stringify([
        'Determine electron configurations for main-group elements.',
        'Understand atomic number and mass number relationships.',
        'Visualize electron quantum energy levels in 3D.'
      ]),
      labType: 'CHEMISTRY',
      configuration: JSON.stringify({
        defaultElement: 'Carbon',
        atomicNumber: 6
      }),
      equations: JSON.stringify({
        massNumber: 'Mass Number (A) = Protons + Neutrons'
      }),
      questions: JSON.stringify([
        {
          id: 'q1',
          question: 'A neutral Carbon-12 atom contains:',
          options: [
            '6 protons, 12 neutrons, 6 electrons',
            '6 protons, 6 neutrons, 6 electrons',
            '12 protons, 6 neutrons, 6 electrons',
            '6 protons, 6 neutrons, 12 electrons'
          ],
          correctAnswer: '6 protons, 6 neutrons, 6 electrons',
          explanation: 'Carbon has atomic number 6 (6 protons, 6 electrons). Carbon-12 has mass number 12, meaning 12 - 6 = 6 neutrons.'
        },
        {
          id: 'q2',
          question: 'What is the electron shell configuration of Sodium (Atomic Number 11)?',
          options: [
            '2, 8, 1',
            '2, 8, 2',
            '2, 9, 0',
            '2, 6, 3'
          ],
          correctAnswer: '2, 8, 1',
          explanation: 'Electrons fill the innermost shells first: 2 in the first shell (n=1), 8 in the second shell (n=2), and the remaining 1 in the third shell (n=3).'
        }
      ]),
      localization: JSON.stringify({
        en: { title: '3D Atom Simulator', prompt: 'Select Element' },
        so: { title: 'Sheybaarka Atomka 3D', prompt: 'Dooro Curiye' },
        am: { title: 'ባለ 3-ልኬት የአቶም ላብራቶሪ', prompt: 'ንጥረ-ነገር ይምረጡ' },
        om: { title: 'Simulatorii Atoomii 3D', prompt: 'Elementii filadhu' }
      })
    },
    {
      labId: 'grade10_mathematics_quadratic',
      grade: 10,
      subject: 'mathematics',
      chapterId: chapters['10-mathematics-ch-quadratic'].id,
      lessonId: '10-mathematics-les-quadratic',
      title: 'Interactive Quadratic Graphs Workspace',
      description: 'Manipulate coefficients a, b, and c to see graph scaling, vertices, axis of symmetry, and root positions.',
      learningObjectives: JSON.stringify([
        'Explore how coefficients affect parabolic shape.',
        'Calculate roots, vertices, and intercepts of quadratic curves.',
        'Observe coordinates update in real time.'
      ]),
      labType: 'MATH',
      configuration: JSON.stringify({
        defaultA: 1.0,
        defaultB: 0.0,
        defaultC: 0.0
      }),
      equations: JSON.stringify({
        vertexForm: 'x_v = -b / (2a), y_v = f(x_v)',
        discriminant: 'D = b^2 - 4ac'
      }),
      questions: JSON.stringify([
        {
          id: 'q1',
          question: 'For f(x) = x² - 4x + 3, what are the coordinates of the vertex?',
          options: [
            '(2, -1)',
            '(2, 3)',
            '(4, 3)',
            '(-2, 15)'
          ],
          correctAnswer: '(2, -1)',
          explanation: 'x = -b/(2a) = 4/(2*1) = 2. Substituting x=2 yields y = (2)² - 4(2) + 3 = -1.'
        },
        {
          id: 'q2',
          question: 'What happens to the graph of y = ax² + bx + c if coefficient "a" becomes negative?',
          options: [
            'The parabola opens downwards',
            'The parabola shifts to the left',
            'The parabola becomes a straight line',
            'The parabola shifts upwards'
          ],
          correctAnswer: 'The parabola opens downwards',
          explanation: 'If a > 0, the parabola opens upwards. If a < 0, the parabola is reflected across the horizontal axis and opens downwards.'
        }
      ]),
      localization: JSON.stringify({
        en: { title: 'Quadratic Graphs Lab', prompt: 'Change Coefficients' },
        so: { title: 'Sheybaarka Garaafka Laba-jibbaarka', prompt: 'Beddel Lambarada' },
        am: { title: 'የኳድራቲክ ግራፍ ላብራቶሪ', prompt: 'ኮፊሸንት ቀይር' },
        om: { title: 'Laabii Giraafii Koodraatiki', prompt: 'Koo-effishentii jijjiiri' }
      })
    },
    {
      labId: 'grade10_geography_topography',
      grade: 10,
      subject: 'geography',
      chapterId: chapters['10-geography-ch-topography'].id,
      lessonId: '10-geography-les-topography',
      title: '3D Contour Elevation Sandbox',
      description: 'Interact with elevation values, map scales, and fault lines to project 3D topographical maps.',
      learningObjectives: JSON.stringify([
        'Translate contour lines into 3D topography.',
        'Understand topographic map scales.',
        'Visualize tectonic compression and strike-slip faults.'
      ]),
      labType: 'GEOGRAPHY',
      configuration: JSON.stringify({
        defaultContourInterval: 20,
        defaultScale: 50000,
        defaultTectonicForce: 0
      }),
      equations: JSON.stringify({
        mapDistance: 'Real Distance = Map Distance * Scale Ratio'
      }),
      questions: JSON.stringify([
        {
          id: 'q1',
          question: 'On a topographic map, closely spaced contour lines represent:',
          options: [
            'A flat valley',
            'A steep slope or cliff',
            'A gentle incline',
            'A river basin'
          ],
          correctAnswer: 'A steep slope or cliff',
          explanation: 'Closely spaced lines mean elevation is changing rapidly over a short horizontal distance, representing a steep slope.'
        },
        {
          id: 'q2',
          question: 'If the scale of a map is 1:50,000, what is the real-world equivalent of 2 cm measured on the map?',
          options: [
            '100 meters',
            '1 kilometer',
            '10 kilometers',
            '50 kilometers'
          ],
          correctAnswer: '1 kilometer',
          explanation: '2 cm * 50,000 = 100,000 cm = 1,000 meters = 1 kilometer.'
        }
      ]),
      localization: JSON.stringify({
        en: { title: '3D Topography & Contours', prompt: 'Adjust Elevation' },
        so: { title: 'Nashqadda Dhulka 3D', prompt: 'Hagaaji Dhererka' },
        am: { title: 'ባለ 3-ልኬት የመሬት አቀማመጥ ላብራቶሪ', prompt: 'ከፍታዎችን ቀይር' },
        om: { title: 'Laabii Topogiraafii 3D', prompt: 'Olka\'iinsa sirreessi' }
      })
    },
    {
      labId: 'grade9_physics_circuit',
      grade: 9,
      subject: 'physics',
      chapterId: chapters['9-physics-ch-circuit'].id,
      lessonId: '9-physics-les-circuit',
      title: 'Kirchhoff\'s Electric Circuit Breadboard',
      description: 'Drag, drop, and wire resistors, batteries, and bulb components to measure Kirchhoff currents and voltage drops.',
      learningObjectives: JSON.stringify([
        'Understand Ohm\'s Law V = I * R.',
        'Apply Kirchhoff\'s Voltage and Current Laws to loops.',
        'Observe how resistance changes total circuit current.'
      ]),
      labType: 'PHYSICS',
      configuration: JSON.stringify({
        defaultBatteryVoltage: 12.0,
        defaultResistance: 10.0,
        defaultBulbResistance: 5.0
      }),
      equations: JSON.stringify({
        ohmsLaw: 'V = I * R',
        totalSeriesResistance: 'R_total = R1 + R2'
      }),
      questions: JSON.stringify([
        {
          id: 'q1',
          question: 'If a 12V battery is connected in series with a 10 ohm resistor and a 5 ohm bulb, what is the current in the circuit?',
          options: ['0.8 A', '1.2 A', '1.5 A', '2.4 A'],
          correctAnswer: '0.8 A',
          explanation: 'Total R = 10 + 5 = 15 ohms. Current I = V / R = 12 / 15 = 0.8 A.'
        },
        {
          id: 'q2',
          question: 'What is the voltage drop across the 5 ohm lightbulb in the above circuit?',
          options: ['2.0 V', '4.0 V', '6.0 V', '8.0 V'],
          correctAnswer: '4.0 V',
          explanation: 'V_bulb = I * R_bulb = 0.8 A * 5 ohms = 4.0 V.'
        }
      ]),
      localization: JSON.stringify({
        en: { title: 'Electric Circuit Breadboard', prompt: 'Connect wires' },
        so: { title: 'Sheybaarka Korontada', prompt: 'Xiriiri fiilooyinka' },
        am: { title: 'የኤሌክትሪክ ሰርኪዩት ላብራቶሪ', prompt: 'ሽቦዎችን አገናኝ' },
        om: { title: 'Laabii Diyaagramii Korontoo', prompt: 'Sanyii sibiilaa wal-qabsiisi' }
      })
    },
    {
      labId: 'grade9_biology_mitosis',
      grade: 9,
      subject: 'biology',
      chapterId: chapters['9-biology-ch-mitosis'].id,
      lessonId: '9-biology-les-mitosis',
      title: '3D Mitosis & Cell Division Simulator',
      description: 'Scrub through the 6 stages of cellular reproduction and inspect spindle fibers and chromosome chromatids in 3D.',
      learningObjectives: JSON.stringify([
        'List the phases of mitotic cell division in order.',
        'Explain the role of spindle fibers and centromeres.',
        'Observe how chromatin condenses and splits.'
      ]),
      labType: 'BIOLOGY',
      configuration: JSON.stringify({
        defaultStage: 0
      }),
      equations: JSON.stringify({
        cellDivision: '1 Parent Cell -> 2 Identical Daughter Cells'
      }),
      questions: JSON.stringify([
        {
          id: 'q1',
          question: 'During which phase of mitosis do sister chromatids align along the center of the cell?',
          options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
          correctAnswer: 'Metaphase',
          explanation: 'During Metaphase, spindle fibers align all chromosomes along the equatorial plate of the cell.'
        },
        {
          id: 'q2',
          question: 'What mitotic event occurs during Anaphase?',
          options: [
            'Chromosomes condense and become visible',
            'Sister chromatids are pulled to opposite poles',
            'New nuclear envelopes form',
            'The cell membrane splits during cytokinesis'
          ],
          correctAnswer: 'Sister chromatids are pulled to opposite poles',
          explanation: 'During Anaphase, centromeres split and sister chromatids are pulled apart toward opposite spindle poles.'
        }
      ]),
      localization: JSON.stringify({
        en: { title: '3D Mitosis Simulator', prompt: 'Select Phase' },
        so: { title: 'Muuqaalka Mitosis 3D', prompt: 'Dooro Wajiga' },
        am: { title: 'የሴል ክፍፍል ላብራቶሪ', prompt: 'ደረጃ ይምረጡ' },
        om: { title: 'Simulatorii Mitosisii 3D', prompt: 'Wajii filadhu' }
      })
    },
    {
      labId: 'grade10_chemistry_stoichiometry',
      grade: 10,
      subject: 'chemistry',
      chapterId: chapters['10-chemistry-ch-stoichiometry'].id,
      lessonId: '10-chemistry-les-stoichiometry',
      title: 'Chemical Reactions & Stoichiometry Lab',
      description: 'Balance water synthesis, methane combustion, and decomposition equations. Solve mass yields and limiting reagents.',
      learningObjectives: JSON.stringify([
        'Balance chemical reaction equations.',
        'Identify limiting and excess reactants.',
        'Calculate theoretical mass yields of products.'
      ]),
      labType: 'CHEMISTRY',
      configuration: JSON.stringify({
        defaultReactant1Mass: 10.0,
        defaultReactant2Mass: 30.0
      }),
      equations: JSON.stringify({
        molesFormula: 'Moles = Mass / Molar Weight (MW)',
        molarYield: 'Mass_product = Moles_limiting * Ratio * MW_product'
      }),
      questions: JSON.stringify([
        {
          id: 'q1',
          question: 'If you combine 10g of Hydrogen Gas (MW = 2 g/mol) and 32g of Oxygen Gas (MW = 32 g/mol) in Water Synthesis (2 H₂ + O₂ -> 2 H₂O), which is the limiting reactant?',
          options: ['Hydrogen Gas (H₂)', 'Oxygen Gas (O₂)', 'Water (H₂O)', 'They are in perfect ratio'],
          correctAnswer: 'Oxygen Gas (O₂)',
          explanation: '10g H2 = 5 moles. 32g O2 = 1 mole. Ratio H2/2 = 2.5, ratio O2/1 = 1.0. Since 1.0 < 2.5, Oxygen is limiting.'
        },
        {
          id: 'q2',
          question: 'What is the theoretical yield of Water Vapor (MW = 18 g/mol) in the above reaction?',
          options: ['18 grams', '36 grams', '54 grams', '90 grams'],
          correctAnswer: '36 grams',
          explanation: 'Limiting reactant is 1 mole of O2. Moles of H2O formed = 1 mole * 2 = 2 moles. Yield = 2 moles * 18 g/mol = 36 grams.'
        }
      ]),
      localization: JSON.stringify({
        en: { title: 'Stoichiometry & Balancing', prompt: 'Input masses' },
        so: { title: 'Sheybaarka Isu-dheolotirka Curiye', prompt: 'Geli Miisaanada' },
        am: { title: 'የስቶይቺዮሜትሪ ላብራቶሪ', prompt: 'ክብደቶችን አስገባ' },
        om: { title: 'Laabii Istaatikiikeemistirii', prompt: 'Safartuu gali' }
      })
    },
    {
      labId: 'grade12_physics_projectile',
      grade: 12,
      subject: 'physics',
      chapterId: chapters['12-physics-ch-projectile'].id,
      lessonId: '12-physics-les-projectile',
      title: 'Two-Dimensional Projectile Trajectory Lab',
      description: 'Adjust launch angle, velocity, height, gravity, and drag coefficients. Observe instantaneous velocity vectors and hit landing platforms.',
      learningObjectives: JSON.stringify([
        'Understand horizontal and vertical components of 2D velocity.',
        'Observe how air drag alters parabolic trajectory symmetry.',
        'Solve range and height under custom gravity parameters.'
      ]),
      labType: 'PHYSICS',
      configuration: JSON.stringify({
        defaultAngle: 45.0,
        defaultVelocity: 20.0,
        defaultHeight: 0.0,
        defaultDrag: 0.05
      }),
      equations: JSON.stringify({
        maxRange: 'R = (v₀² * sin(2θ)) / g (no drag)',
        maxHeight: 'H = (v₀² * sin(θ)²) / (2g) (no drag)'
      }),
      questions: JSON.stringify([
        {
          id: 'q1',
          question: 'At what launch angle is the horizontal range of a projectile maximized (assuming no air drag)?',
          options: ['30°', '45°', '60°', '90°'],
          correctAnswer: '45°',
          explanation: 'Range is proportional to sin(2θ). The sine function reaches its maximum value of 1.0 at 90°, meaning 2θ = 90° or θ = 45°.'
        },
        {
          id: 'q2',
          question: 'What happens to the horizontal range and symmetry of a projectile if air friction (drag coefficient k) is increased?',
          options: [
            'Range increases and the curve remains a symmetric parabola',
            'Range decreases and the descent path becomes steeper than launch path',
            'Range decreases but the curve remains perfectly symmetric',
            'Symmetry shifts but range is unaffected'
          ],
          correctAnswer: 'Range decreases and the descent path becomes steeper than launch path',
          explanation: 'Air resistance continually slows down the projectile. The horizontal velocity decay pulls the landing point closer, resulting in an asymmetric curve.'
        }
      ]),
      localization: JSON.stringify({
        en: { title: 'Projectile Vector Lab', prompt: 'Launch ball' },
        so: { title: 'Ganaaska Jihooyinka 2D', prompt: 'Tuur shayga' },
        am: { title: 'የፕሮጀክታይል ማስወንጨፊያ ላብራቶሪ', prompt: 'አስወንጭፍ' },
        om: { title: 'Laabii Harakaata Birojektaayilii', prompt: 'Gadi dhiisi' }
      })
    },
    {
      labId: 'grade11_biology_genetics',
      grade: 11,
      subject: 'biology',
      chapterId: chapters['11-biology-ch-genetics'].id,
      lessonId: '11-biology-les-genetics',
      title: 'Genetics, DNA Helix & Punnett Engine',
      description: 'Interact with monohybrid and dihybrid parent crosses. Trace base pair complementary rules on a 3D structural DNA double helix.',
      learningObjectives: JSON.stringify([
        'Construct monohybrid and dihybrid Punnett square grids.',
        'Calculate genotypic and phenotypic ratios of offspring.',
        'Understand complementary base pairing A-T and C-G.'
      ]),
      labType: 'BIOLOGY',
      configuration: JSON.stringify({
        defaultParent1: 'Tt',
        defaultParent2: 'Tt'
      }),
      equations: JSON.stringify({
        monohybridRatio: 'Phenotype: 3:1 | Genotype: 1:2:1',
        dihybridRatio: 'Mendelian Independent Assortment: 9:3:3:1'
      }),
      questions: JSON.stringify([
        {
          id: 'q1',
          question: 'In a monohybrid cross of heterozygous parents (Tt x Tt), what percentage of offspring is expected to be homozygous recessive (tt)?',
          options: ['0%', '25%', '50%', '75%'],
          correctAnswer: '25%',
          explanation: 'The genotypes produced are 1 TT, 2 Tt, and 1 tt. The homozygous recessive tt is 1 out of 4, or 25%.'
        },
        {
          id: 'q2',
          question: 'In a Mendel dihybrid cross (YyRr x YyRr), what is the expected phenotypic probability of double-dominant offspring (Yellow Round)?',
          options: ['1/16', '3/16', '9/16', '4/16'],
          correctAnswer: '9/16',
          explanation: 'Due to independent assortment, the phenotypic distribution ratio is 9 (double dominant), 3 (dominant-recessive), 3 (recessive-dominant), and 1 (double recessive).'
        }
      ]),
      localization: JSON.stringify({
        en: { title: '3D DNA & Punnett Lab', prompt: 'Perform cross' },
        so: { title: 'Sheybaarka Dhaxalka & DNA', prompt: 'Isku talaal' },
        am: { title: 'የጄኔቲክስና ፑኔት ስኩዌር ላብራቶሪ', prompt: 'ክሮስ አድርግ' },
        om: { title: 'Laabii Dhaala Adda addaa 3D', prompt: 'Wal-firi' }
      })
    },
    {
      labId: 'grade12_chemistry_galvanic',
      grade: 12,
      subject: 'chemistry',
      chapterId: chapters['12-chemistry-ch-electrochemistry'].id,
      lessonId: '12-chemistry-les-electrochemistry',
      title: 'Galvanic Cells & Electrochemistry Workspace',
      description: 'Select half-cells (Zn, Cu, Ag, Pb) to build battery circuits. Solve Nernst concentrations and map salt bridge ion flow paths.',
      learningObjectives: JSON.stringify([
        'Distinguish anode (oxidation) from cathode (reduction) locations.',
        'Calculate standard cell potential potentials (E°cell).',
        'Model voltage responses to non-standard concentrations.'
      ]),
      labType: 'CHEMISTRY',
      configuration: JSON.stringify({
        defaultLeftCell: 'zinc',
        defaultRightCell: 'copper',
        defaultConcentration: 1.0
      }),
      equations: JSON.stringify({
        standardPotential: 'E°cell = E°cathode - E°anode',
        nernstEquation: 'E = E° - (RT/nF) * ln(Q)'
      }),
      questions: JSON.stringify([
        {
          id: 'q1',
          question: 'In a standard Zinc-Copper galvanic cell (E° Zn = -0.76 V, E° Cu = +0.34 V), which metal serves as the anode (undergoes oxidation)?',
          options: ['Zinc (Zn)', 'Copper (Cu)', 'Both metals oxidize', 'Neither, it requires an external battery'],
          correctAnswer: 'Zinc (Zn)',
          explanation: 'Zinc has a lower reduction potential (-0.76 V < +0.34 V), meaning it is more easily oxidized and functions as the anode.'
        },
        {
          id: 'q2',
          question: 'According to the Nernst Equation, what happens to the galvanic cell voltage if the cathode reactant ion concentration is increased?',
          options: [
            'Voltage increases (increases forward reaction drive)',
            'Voltage decreases (hinders reduction drive)',
            'Voltage remains exactly at standard E°',
            'Current stops completely'
          ],
          correctAnswer: 'Voltage increases (increases forward reaction drive)',
          explanation: 'Increasing cathode reactant concentration decreases the reaction quotient Q (Q = [Anode]/[Cathode]). Since ln(Q) decreases, the subtracted Nernst factor decreases, yielding a higher voltage.'
        }
      ]),
      localization: JSON.stringify({
        en: { title: 'Galvanic Electrochemistry Lab', prompt: 'Select electrodes' },
        so: { title: 'Muuqaalka Electrochemistry', prompt: 'Dooro biraha' },
        am: { title: 'የኤሌክትሮኬሚስትሪ ላብራቶሪ', prompt: 'ኤሌክትሮዶችን ይምረጡ' },
        om: { title: 'Laabii Elektirookemistirii', prompt: 'Biroda filadhu' }
      })
    },
    {
      labId: 'grade12_mathematics_calculus',
      grade: 12,
      subject: 'mathematics',
      chapterId: chapters['12-mathematics-ch-calculus'].id,
      lessonId: '12-mathematics-les-calculus',
      title: 'Calculus Limit Tangents & Riemann Sums Workspace',
      description: 'Observe secant slopes approach the tangent derivative as interval size h approaches 0. Calculate Riemann integrals under polynomial, trigonometric, and exponential curves.',
      learningObjectives: JSON.stringify([
        'Visualize secant-to-tangent lines limit transitions.',
        'Compare Riemann rectangle sums with true integration area.',
        'Analyze limits under variable partition partitions.'
      ]),
      labType: 'MATH',
      configuration: JSON.stringify({
        defaultFunction: 'POLYNOMIAL',
        defaultIntervalH: 1.5,
        defaultPartitionsN: 10
      }),
      equations: JSON.stringify({
        limitDerivative: "f'(x) = lim [f(x+h) - f(x)] / h as h->0",
        riemannDef: "Integral = lim sum( f(xi) * dx ) as N->infinity"
      }),
      questions: JSON.stringify([
        {
          id: 'q1',
          question: 'As the secant interval size h is reduced towards 0.01, the slope of the secant line approaches:',
          options: [
            'The vertical y-intercept',
            'The total continuous area under the curve',
            'The local coordinate maximum',
            'The instantaneous derivative slope at the base point'
          ],
          correctAnswer: 'The instantaneous derivative slope at the base point',
          explanation: 'By definition, the derivative f\'(x) is the limit of the secant line slope as h approaches 0.'
        },
        {
          id: 'q2',
          question: 'What happens to the discrepancy between a Riemann Sum area estimate and the true Definite Integral as partition count N increases from 5 to 50?',
          options: [
            'The discrepancy increases (estimate gets worse)',
            'The discrepancy decreases (estimate approaches exact area)',
            'The estimate oscillates and diverges',
            'N has no influence on summation limits'
          ],
          correctAnswer: 'The discrepancy decreases (estimate approaches exact area)',
          explanation: 'As N approaches infinity (dx approaches 0), the Riemann sum rectangles approximate the continuous curve contours with increasing precision, merging with the true integral.'
        }
      ]),
      localization: JSON.stringify({
        en: { title: 'Limits & Integration Lab', prompt: 'Select mode' },
        so: { title: 'Sheybaarka Calculus', prompt: 'Dooro qaabka' },
        am: { title: 'የካርታ የሊሚትና ኢንቴግራል ላብራቶሪ', prompt: 'አይነት ይምረጡ' },
        om: { title: 'Laabii Kaalkulasii Mirkaneessa', prompt: 'Mootii filadhu' }
      })
    }
  ];

  for (const lab of labsData) {
    await prisma.virtualLab.upsert({
      where: { labId: lab.labId },
      update: lab,
      create: lab
    });
  }
  console.log('Virtual Labs seeded successfully!');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Error during seeding:', e);
  process.exit(1);
});
