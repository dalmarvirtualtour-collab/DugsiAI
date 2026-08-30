import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Play, Pause, RefreshCw, ZoomIn, ZoomOut, Layers, Heart, Activity } from 'lucide-react';

interface BiologyHeartLabProps {
  onUpdateState: (state: any) => void;
}

interface StructureInfo {
  name: string;
  scientificName: string;
  role: string;
  description: string;
}

const BLOOD_FLOW_STEPS = [
  {
    step: 1,
    title: "Vena Cava",
    type: "deoxygenated",
    description: "Deoxygenated blood returns from systemic body circulation via the Superior and Inferior Vena Cava into the Right Atrium.",
    position: [1.15, 1.8, 0.1],
    cameraTarget: [1.15, 1.0, 0.1],
    cameraPos: [2.8, 1.5, 5.0],
  },
  {
    step: 2,
    title: "Right Atrium",
    type: "deoxygenated",
    description: "Receives deoxygenated blood from the Vena Cava and passes it through the Tricuspid Valve into the Right Ventricle.",
    position: [0.75, 0.85, 0.1],
    cameraTarget: [0.75, 0.85, 0.1],
    cameraPos: [2.2, 1.0, 4.2],
  },
  {
    step: 3,
    title: "Right Ventricle",
    type: "deoxygenated",
    description: "Receives blood from the Right Atrium and contracts to pump it through the pulmonary valve into the lungs.",
    position: [0.6, -0.8, 0.15],
    cameraTarget: [0.6, -0.8, 0.15],
    cameraPos: [1.8, -0.4, 4.5],
  },
  {
    step: 4,
    title: "Pulmonary Arteries",
    type: "deoxygenated",
    description: "Delivers low-oxygen blood to pulmonary circulation for gas exchange (releasing CO2 and taking up oxygen).",
    position: [0.18, 1.2, 0.35],
    cameraTarget: [0.18, 1.2, 0.35],
    cameraPos: [1.0, 2.0, 4.5],
  },
  {
    step: 5,
    title: "Pulmonary Veins",
    type: "oxygenated",
    description: "Carries oxygen-rich blood from the lungs back to the left atrium of the heart.",
    position: [-0.9, 0.6, -0.6],
    cameraTarget: [-0.9, 0.6, -0.6],
    cameraPos: [-2.0, 1.0, 4.0],
  },
  {
    step: 6,
    title: "Left Atrium",
    type: "oxygenated",
    description: "Receives oxygenated blood from pulmonary veins and moves it into the Left Ventricle through the Mitral Valve.",
    position: [-0.75, 0.75, -0.2],
    cameraTarget: [-0.75, 0.75, -0.2],
    cameraPos: [-1.8, 1.0, 4.0],
  },
  {
    step: 7,
    title: "Left Ventricle",
    type: "oxygenated",
    description: "Features thick myocardial walls to forcefully pump oxygenated blood through the Aorta to the systemic body organs.",
    position: [-0.6, -1.0, 0.0],
    cameraTarget: [-0.6, -1.0, 0.0],
    cameraPos: [-1.8, -0.5, 4.5],
  },
  {
    step: 8,
    title: "Aorta",
    type: "oxygenated",
    description: "The primary systemic artery that distributes oxygenated blood throughout the systemic circulation.",
    position: [-0.35, 2.2, -0.4],
    cameraTarget: [-0.35, 2.2, -0.4],
    cameraPos: [-0.9, 3.0, 4.0],
  }
];

export default function BiologyHeartLab({ onUpdateState }: BiologyHeartLabProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Animation / Speed states
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.0); // 0.5x, 1.0x, 2.0x
  const [selectedStructure, setSelectedStructure] = useState<StructureInfo | null>(null);

  // 6-Module Active View Selection
  const [activeTab, setActiveTab] = useState<number>(2); // Default to Surface Anatomy

  // Sub-controls
  const [skeletonOpacity, setSkeletonOpacity] = useState<number>(0.25); // View 1 opacity slider
  const [showCoronaryLayers, setShowCoronaryLayers] = useState<boolean>(true); // View 2 arteries/veins toggle
  const [clipPlaneAxisVal, setClipPlaneAxisVal] = useState<number>(0.15); // View 3 slice slider
  const [flowStep, setFlowStep] = useState<number>(1); // View 4 hemodynamic stepper (1-8)
  const [activeCondition, setActiveCondition] = useState<string>('HEALTHY'); // View 6 condition selector

  // Loading States
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Refs to decouple Three.js render loop from React state updates
  const activeTabRef = useRef<number>(activeTab);
  const skeletonOpacityRef = useRef<number>(skeletonOpacity);
  const showCoronaryLayersRef = useRef<boolean>(showCoronaryLayers);
  const clipPlaneAxisValRef = useRef<number>(clipPlaneAxisVal);
  const flowStepRef = useRef<number>(flowStep);
  const activeConditionRef = useRef<string>(activeCondition);
  const speedRef = useRef<number>(speed);
  const isPlayingRef = useRef<boolean>(isPlaying);

  // Sync state to refs immediately
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { skeletonOpacityRef.current = skeletonOpacity; }, [skeletonOpacity]);
  useEffect(() => { showCoronaryLayersRef.current = showCoronaryLayers; }, [showCoronaryLayers]);
  useEffect(() => { clipPlaneAxisValRef.current = clipPlaneAxisVal; }, [clipPlaneAxisVal]);
  useEffect(() => { flowStepRef.current = flowStep; }, [flowStep]);
  useEffect(() => { activeConditionRef.current = activeCondition; }, [activeCondition]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  // Three.js instance references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const heartGroupRef = useRef<THREE.Group | null>(null);
  const skeletonGroupRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Mesh Refs for animations
  const lvMeshRef = useRef<THREE.Mesh | null>(null);
  const rvMeshRef = useRef<THREE.Mesh | null>(null);
  const laMeshRef = useRef<THREE.Mesh | null>(null);
  const raMeshRef = useRef<THREE.Mesh | null>(null);
  const valveLMeshRef = useRef<THREE.Mesh | null>(null);
  const valveRMeshRef = useRef<THREE.Mesh | null>(null);
  const gltfModelRef = useRef<THREE.Group | null>(null);
  const coronaryGroupRef = useRef<THREE.Group | null>(null);
  const plaqueMeshRef = useRef<THREE.Mesh | null>(null);

  // Smooth Camera transition vectors
  const targetCamPos = useRef(new THREE.Vector3(0, 0, 10));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Animation variables
  const isGlidingRef = useRef<boolean>(false);
  const pulseTime = useRef<number>(0);
  const particles = useRef<Array<{ mesh: THREE.Mesh; path: THREE.Vector3[]; progress: number; oxygenated: boolean; stepIndex: number }>>([]);
  const leakParticles = useRef<Array<{ mesh: THREE.Mesh; progress: number }>>([]); // Mitral valve regurgitation leaks

  // Registry of anatomical structure metadata
  const structures: { [key: string]: StructureInfo } = {
    'Left Ventricle': {
      name: 'Left Ventricle',
      scientificName: 'Ventriculus Sinister',
      role: 'Pumps oxygenated blood to the systemic organs.',
      description: 'The thickest chamber of the heart. Forces oxygen-rich blood under high pressure into the Aorta to feed body tissues.'
    },
    'Right Ventricle': {
      name: 'Right Ventricle',
      scientificName: 'Ventriculus Dexter',
      role: 'Pumps deoxygenated blood to the lungs.',
      description: 'Receives oxygen-poor blood from the Right Atrium and pushes it through the Pulmonary Trunk for oxygenation.'
    },
    'Left Atrium': {
      name: 'Left Atrium',
      scientificName: 'Atrium Sinistrum',
      role: 'Receives oxygenated blood returning from lungs.',
      description: 'Collects oxygen-rich blood arriving via the pulmonary veins and pushes it down into the Left Ventricle through the Mitral Valve.'
    },
    'Right Atrium': {
      name: 'Right Atrium',
      scientificName: 'Atrium Dextrum',
      role: 'Receives deoxygenated blood from the body.',
      description: 'Receives venous return from the Superior and Inferior Vena Cava, directing it into the Right Ventricle.'
    },
    'Aorta': {
      name: 'Aorta',
      scientificName: 'Aorta Ascendens',
      role: 'Main arterial trunk supplying the entire body.',
      description: 'The largest artery, originating from the Left Ventricle. Arches superiorly to branch blood to the brain, upper limbs, and lower extremities.'
    },
    'Vena Cava': {
      name: 'Vena Cava',
      scientificName: 'Vena Cava Superior/Inferior',
      role: 'Brings deoxygenated blood back to the right atrium.',
      description: 'Superior Vena Cava drains the head and upper body; Inferior Vena Cava drains the lower abdominal organs and limbs.'
    },
    'Pulmonary Trunk': {
      name: 'Pulmonary Trunk / Arteries',
      scientificName: 'Truncus Pulmonalis',
      role: 'Carries deoxygenated blood to the respiratory lungs.',
      description: 'Branches into left and right pulmonary arteries to deliver oxygen-poor blood to the lungs for gas exchange.'
    },
    'Pulmonary Veins': {
      name: 'Pulmonary Veins',
      scientificName: 'Venae Pulmonales',
      role: 'Returns oxygenated blood to the heart.',
      description: 'Four vessels returning oxygen-rich blood from the lungs into the left atrium.'
    },
    'Interventricular Septum': {
      name: 'Interventricular Septum',
      scientificName: 'Septum Interventriculare',
      role: 'Separates left and right ventricles.',
      description: 'Thick muscular wall dividing the ventricles. Critical for separating high-pressure systemic oxygenated blood from pulmonary deoxygenated blood.'
    },
    'SA Node': {
      name: 'SA Node (Sinoatrial)',
      scientificName: 'Nodus Sinoatrialis',
      role: 'The primary natural pacemaker of the heart.',
      description: 'Located in the right atrium. Spontaneously generates electrical impulses that spread across atria to initiate contractions.'
    },
    'AV Node': {
      name: 'AV Node (Atrioventricular)',
      scientificName: 'Nodus Atrioventricularis',
      role: 'Electrical gateway delaying the impulse.',
      description: 'Located in the interatrial septum. Delays impulses to allow atria to finish emptying before ventricles contract.'
    },
    'Coronary Arteries': {
      name: 'Coronary Arteries',
      scientificName: 'Arteriae Coronariae',
      role: 'Supplies oxygenated blood directly to myocardium.',
      description: 'Branch off the aorta base. Blockage here causes coronary artery disease (CAD) or myocardial infarction.'
    },
    'Cardiac Veins': {
      name: 'Cardiac Veins',
      scientificName: 'Venae Cordis',
      role: 'Returns deoxygenated blood from the heart muscle.',
      description: 'Drains the myocardium and channels blood into the Coronary Sinus, emptying into the Right Atrium.'
    },
    'Epicardial Fat': {
      name: 'Epicardial Fat',
      scientificName: 'Adipose Epicardiale',
      role: 'Protective adipose padding on the heart.',
      description: 'Fat deposits that sit in the sulci of the heart. Acts as an energy reservoir and protects coronary vessels.'
    }
  };

  // Sync parameters back to parent for study context / AI tutor
  useEffect(() => {
    onUpdateState({
      activeHeartModule: activeTab === 1 ? 'Thoracic Enclosure' :
                         activeTab === 2 ? 'Surface Anatomy' :
                         activeTab === 3 ? 'Internal Coronal' :
                         activeTab === 4 ? 'Hemodynamic Flow' :
                         activeTab === 5 ? 'Electrical Conduction' : 'Pathophysiology',
      selectedStructure: selectedStructure ? selectedStructure.name : 'None',
      conditionMode: activeCondition,
      simulatedHeartRate: `${getHeartRate()} BPM`,
      cardiacOutput: `${(getHeartRate() * getStrokeVolume() / 1000).toFixed(2)} L/min`,
      isPlaying,
      bloodFlowSpeed: speed
    });
  }, [activeTab, selectedStructure, activeCondition, isPlaying, speed]);

  // Camera presets coordinates mapping
  useEffect(() => {
    if (activeTab === 1) {
      targetCamPos.current.set(0, 1.2, 14);
      targetLookAt.current.set(0, 0, 0);
    } else if (activeTab === 2) {
      targetCamPos.current.set(0, 0.8, 10);
      targetLookAt.current.set(0, 0, 0);
    } else if (activeTab === 3) {
      targetCamPos.current.set(0, 0.8, 9.5);
      targetLookAt.current.set(0, 0, 0);
    } else if (activeTab === 4) {
      const stepData = BLOOD_FLOW_STEPS.find(s => s.step === flowStep);
      if (stepData) {
        targetCamPos.current.set(stepData.cameraPos[0], stepData.cameraPos[1], stepData.cameraPos[2]);
        targetLookAt.current.set(stepData.cameraTarget[0], stepData.cameraTarget[1], stepData.cameraTarget[2]);
      }
    } else if (activeTab === 5) {
      targetCamPos.current.set(0, 0.5, 9.0);
      targetLookAt.current.set(0, 0, 0);
    } else if (activeTab === 6) {
      targetCamPos.current.set(0, 0.8, 10.5);
      targetLookAt.current.set(0, 0, 0);
    }
    isGlidingRef.current = true;
  }, [activeTab, flowStep]);

  const setQuickCameraAngle = (angle: 'ANTERIOR' | 'POSTERIOR' | 'SUPERIOR' | 'APEX') => {
    if (activeTab !== 2) return;
    switch (angle) {
      case 'ANTERIOR':
        targetCamPos.current.set(0, 0.8, 10);
        break;
      case 'POSTERIOR':
        targetCamPos.current.set(0, 0.8, -10);
        break;
      case 'SUPERIOR':
        targetCamPos.current.set(0, 8.5, 1.5);
        break;
      case 'APEX':
        targetCamPos.current.set(0, -7.0, 5.0);
        break;
    }
    targetLookAt.current.set(0, 0, 0);
    isGlidingRef.current = true;
  };

  const createProceduralMuscleTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 256, 256);
    // Draw muscle fiber normal/bump noise pattern
    for (let i = 0; i < 600; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#9f9f9f' : '#606060';
      ctx.fillRect(Math.random() * 256, 0, Math.random() * 3 + 1, 256);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    return texture;
  };

  // Primary Three.js setup running exactly ONCE at mount
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 340;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030303');
    sceneRef.current = scene;

    // Camera initialized to default (0, 0, 10)
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.localClippingEnabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 2;
    controls.maxDistance = 20;
    controls.addEventListener('start', () => {
      isGlidingRef.current = false;
    });
    controlsRef.current = controls;

    // Persistent Lighting Setup (Ambient = 1.2, Directional = 2.0 targeting 0, 0, 0)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(5, 10, 7);
    dirLight.target.position.set(0, 0, 0);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x3b82f6, 0.5);
    fillLight.position.set(-6, -6, 6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x7c3aed, 0.8);
    rimLight.position.set(-6, 8, -8);
    scene.add(rimLight);

    const heartGroup = new THREE.Group();
    scene.add(heartGroup);
    heartGroupRef.current = heartGroup;

    const skeletonGroup = new THREE.Group();
    scene.add(skeletonGroup);
    skeletonGroupRef.current = skeletonGroup;

    const coronalSlicePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), clipPlaneAxisValRef.current);
    const muscleBump = createProceduralMuscleTexture();

    // Standard Anatomical PBR materials
    const materials = {
      arteryMat: new THREE.MeshStandardMaterial({
        color: '#FF1100', // Vibrant Red (#FF1100)
        roughness: 0.3,
        metalness: 0.15,
        name: 'Arteries'
      }),
      veinMat: new THREE.MeshStandardMaterial({
        color: '#0055FF', // Royal Blue (#0055FF)
        roughness: 0.35,
        metalness: 0.1,
        name: 'Veins'
      }),
      lvMat: new THREE.MeshStandardMaterial({
        color: '#881337', // Deep Burgundy (#881337)
        roughness: 0.52,
        metalness: 0.05,
        bumpMap: muscleBump || undefined,
        bumpScale: 0.05,
        name: 'Left Ventricle'
      }),
      rvMat: new THREE.MeshStandardMaterial({
        color: '#991b1b', // Medium Crimson (#991b1b)
        roughness: 0.52,
        metalness: 0.05,
        bumpMap: muscleBump || undefined,
        bumpScale: 0.04,
        name: 'Right Ventricle'
      }),
      laMat: new THREE.MeshStandardMaterial({
        color: '#E11D48', // Rose Red (#E11D48)
        roughness: 0.6,
        bumpMap: muscleBump || undefined,
        bumpScale: 0.03,
        name: 'Left Atrium'
      }),
      raMat: new THREE.MeshStandardMaterial({
        color: '#DB2777', // Pinkish Magenta (#DB2777)
        roughness: 0.6,
        bumpMap: muscleBump || undefined,
        bumpScale: 0.03,
        name: 'Right Atrium'
      }),
      fatMat: new THREE.MeshStandardMaterial({
        color: '#fef08a', // Yellowish epicardial fat
        roughness: 0.9,
        metalness: 0.0,
        name: 'Epicardial Fat'
      }),
      boneMat: new THREE.MeshStandardMaterial({
        color: '#f1f5f9', // Skeleton rib bones
        roughness: 0.72,
        transparent: true,
        opacity: skeletonOpacityRef.current,
        name: 'Bones'
      }),
      cartilageMat: new THREE.MeshStandardMaterial({
        color: '#a5f3fc', // Costal cartilage
        roughness: 0.5,
        transparent: true,
        opacity: skeletonOpacityRef.current * 0.7,
        name: 'Cartilage'
      }),
      discMat: new THREE.MeshStandardMaterial({
        color: '#94a3b8',
        roughness: 0.8,
        transparent: true,
        opacity: skeletonOpacityRef.current,
        name: 'Spine Discs'
      }),
      internalMat: new THREE.MeshStandardMaterial({
        color: '#fda4af', // Papillary & Septum insides
        roughness: 0.65,
        name: 'Insides'
      }),
      valveMat: new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.2,
        metalness: 0.75,
        name: 'Valves'
      }),
      thickenedLvMat: new THREE.MeshStandardMaterial({
        color: '#7f1d1d', // Thickened Burgundy HCM Myocardium
        roughness: 0.65,
        bumpMap: muscleBump || undefined,
        bumpScale: 0.08,
        name: 'Thickened Left Ventricle'
      }),
      thickenedMuscleMat: new THREE.MeshStandardMaterial({
        color: '#8b1c1c',
        roughness: 0.65,
        bumpMap: muscleBump || undefined,
        bumpScale: 0.07,
        name: 'Thickened Right Ventricle'
      })
    };

    const setClippingPlanes = (mesh: THREE.Mesh | null, planes: THREE.Plane[]) => {
      if (mesh && mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => {
          if ('clippingPlanes' in mat) {
            (mat as any).clippingPlanes = planes;
          }
        });
      }
    };

    // ----------------------------------------------------
    // FALLBACK PROCEDURAL SKELETON GENERATOR
    // ----------------------------------------------------
    const proceduralSkeleton = new THREE.Group();
    skeletonGroup.add(proceduralSkeleton);

    // Spine Column T1-T12 vertebrae
    for (let i = 0; i < 12; i++) {
      const yVal = 3.2 - i * 0.6;
      
      const vert = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.52, 0.38, 16), materials.boneMat);
      vert.position.set(0, yVal, -3.2);
      vert.name = "Vertebra";
      proceduralSkeleton.add(vert);
      
      const spinous = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.6), materials.boneMat);
      spinous.position.set(0, yVal, -3.7);
      proceduralSkeleton.add(spinous);

      const transL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.2), materials.boneMat);
      transL.position.set(-0.6, yVal, -3.4);
      proceduralSkeleton.add(transL);

      const transR = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.2), materials.boneMat);
      transR.position.set(0.6, yVal, -3.4);
      proceduralSkeleton.add(transR);
      
      const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.08, 16), materials.discMat);
      disk.position.set(0, yVal - 0.23, -3.2);
      disk.name = "Spine Discs";
      proceduralSkeleton.add(disk);
    }

    // Segmented Sternum
    const manu = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 0.18), materials.boneMat);
    manu.position.set(0, 2.2, 3.2);
    manu.name = "Sternum";
    proceduralSkeleton.add(manu);

    for (let j = 0; j < 4; j++) {
      const bodySeg = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.16), materials.boneMat);
      bodySeg.position.set(0, 1.5 - j * 0.55, 3.2);
      bodySeg.name = "Sternum";
      proceduralSkeleton.add(bodySeg);
    }

    const xiph = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 4), materials.boneMat);
    xiph.position.set(0, -0.9, 3.2);
    xiph.rotation.x = Math.PI;
    xiph.name = "Sternum";
    proceduralSkeleton.add(xiph);

    // Rib cage loops
    for (let i = 0; i < 12; i++) {
      const ySpine = 3.2 - i * 0.6;

      // Rib points left
      const ribPtsL = [
        new THREE.Vector3(-0.5, ySpine, -3.2),
        new THREE.Vector3(-2.5 - i*0.05, ySpine - 0.1, -1.5),
        new THREE.Vector3(-2.8 - i*0.05, ySpine - 0.3, 0.5),
      ];
      
      let cartilagePtsL: THREE.Vector3[] = [];
      if (i < 7) {
        const ySternum = 2.2 - i * 0.45;
        ribPtsL.push(new THREE.Vector3(-1.4, ySternum - 0.1, 2.5));
        cartilagePtsL = [
          new THREE.Vector3(-1.4, ySternum - 0.1, 2.5),
          new THREE.Vector3(-0.5, ySternum, 3.15)
        ];
      } else if (i < 10) {
        const yTarget = 2.2 - 6 * 0.45 - (i - 6) * 0.25;
        ribPtsL.push(new THREE.Vector3(-1.5, yTarget - 0.1, 2.2));
        cartilagePtsL = [
          new THREE.Vector3(-1.5, yTarget - 0.1, 2.2),
          new THREE.Vector3(-1.2, yTarget + 0.15, 2.3)
        ];
      } else {
        ribPtsL.push(new THREE.Vector3(-2.0, ySpine - 0.6, 1.2));
      }
      
      const ribCurveL = new THREE.CatmullRomCurve3(ribPtsL);
      const ribMeshL = new THREE.Mesh(new THREE.TubeGeometry(ribCurveL, 24, 0.08, 6, false), materials.boneMat);
      ribMeshL.name = "Ribcage";
      proceduralSkeleton.add(ribMeshL);
      
      if (cartilagePtsL.length > 0) {
        const cartCurveL = new THREE.CatmullRomCurve3(cartilagePtsL);
        const cartMeshL = new THREE.Mesh(new THREE.TubeGeometry(cartCurveL, 8, 0.07, 6, false), materials.cartilageMat);
        cartMeshL.name = "Cartilage";
        proceduralSkeleton.add(cartMeshL);
      }

      // Rib points right
      const ribPtsR = [
        new THREE.Vector3(0.5, ySpine, -3.2),
        new THREE.Vector3(2.5 + i*0.05, ySpine - 0.1, -1.5),
        new THREE.Vector3(2.8 + i*0.05, ySpine - 0.3, 0.5),
      ];
      
      let cartilagePtsR: THREE.Vector3[] = [];
      if (i < 7) {
        const ySternum = 2.2 - i * 0.45;
        ribPtsR.push(new THREE.Vector3(1.4, ySternum - 0.1, 2.5));
        cartilagePtsR = [
          new THREE.Vector3(1.4, ySternum - 0.1, 2.5),
          new THREE.Vector3(0.5, ySternum, 3.15)
        ];
      } else if (i < 10) {
        const yTarget = 2.2 - 6 * 0.45 - (i - 6) * 0.25;
        ribPtsR.push(new THREE.Vector3(1.5, yTarget - 0.1, 2.2));
        cartilagePtsR = [
          new THREE.Vector3(1.5, yTarget - 0.1, 2.2),
          new THREE.Vector3(1.2, yTarget + 0.15, 2.3)
        ];
      } else {
        ribPtsR.push(new THREE.Vector3(2.0, ySpine - 0.6, 1.2));
      }
      
      const ribCurveR = new THREE.CatmullRomCurve3(ribPtsR);
      const ribMeshR = new THREE.Mesh(new THREE.TubeGeometry(ribCurveR, 24, 0.08, 6, false), materials.boneMat);
      ribMeshR.name = "Ribcage";
      proceduralSkeleton.add(ribMeshR);
      
      if (cartilagePtsR.length > 0) {
        const cartCurveR = new THREE.CatmullRomCurve3(cartilagePtsR);
        const cartMeshR = new THREE.Mesh(new THREE.TubeGeometry(cartCurveR, 8, 0.07, 6, false), materials.cartilageMat);
        cartMeshR.name = "Cartilage";
        proceduralSkeleton.add(cartMeshR);
      }
    }


    // ----------------------------------------------------
    // FALLBACK PROCEDURAL HEART GENERATOR
    // ----------------------------------------------------
    const proceduralHeart = new THREE.Group();
    heartGroup.add(proceduralHeart);

    // Left Ventricle (Burgundy)
    const lvGeo = new THREE.SphereGeometry(1.6, 48, 48);
    lvGeo.scale(0.85, 1.25, 0.7);
    const lvMesh = new THREE.Mesh(lvGeo, materials.lvMat);
    lvMesh.position.set(-0.6, -1.0, 0);
    lvMesh.name = 'Left Ventricle';
    proceduralHeart.add(lvMesh);
    lvMeshRef.current = lvMesh;

    // Right Ventricle (Crimson)
    const rvGeo = new THREE.SphereGeometry(1.45, 48, 48);
    rvGeo.scale(0.8, 1.05, 0.65);
    const rvMesh = new THREE.Mesh(rvGeo, materials.rvMat);
    rvMesh.position.set(0.6, -0.8, 0.15);
    rvMesh.name = 'Right Ventricle';
    proceduralHeart.add(rvMesh);
    rvMeshRef.current = rvMesh;

    // Left Atrium (Rose Red)
    const laGeo = new THREE.SphereGeometry(0.95, 32, 32);
    const laMesh = new THREE.Mesh(laGeo, materials.laMat);
    laMesh.position.set(-0.75, 0.75, -0.2);
    laMesh.name = 'Left Atrium';
    proceduralHeart.add(laMesh);
    laMeshRef.current = laMesh;

    // Right Atrium (Pinkish Magenta)
    const raGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const raMesh = new THREE.Mesh(raGeo, materials.raMat);
    raMesh.position.set(0.75, 0.85, 0.1);
    raMesh.name = 'Right Atrium';
    proceduralHeart.add(raMesh);
    raMeshRef.current = raMesh;

    // Inner Structures (Septum)
    const septumGeo = new THREE.BoxGeometry(0.35, 1.85, 0.7);
    const septumMesh = new THREE.Mesh(septumGeo, materials.internalMat);
    septumMesh.position.set(-0.02, -0.9, 0.05);
    septumMesh.name = 'Interventricular Septum';
    proceduralHeart.add(septumMesh);

    // Papillary Muscles
    const papCone = new THREE.ConeGeometry(0.2, 0.5, 12);
    const papL = new THREE.Mesh(papCone, materials.internalMat);
    papL.position.set(-0.8, -1.3, -0.15);
    proceduralHeart.add(papL);

    const papR = new THREE.Mesh(papCone, materials.internalMat);
    papR.position.set(0.7, -1.1, 0.1);
    proceduralHeart.add(papR);

    // Valves
    const valveLMesh = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.05, 12, 24), materials.valveMat);
    valveLMesh.position.set(-0.65, 0.0, -0.1);
    valveLMesh.rotation.x = Math.PI / 2;
    proceduralHeart.add(valveLMesh);
    valveLMeshRef.current = valveLMesh;

    const valveRMesh = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 12, 24), materials.valveMat);
    valveRMesh.position.set(0.65, 0.0, 0.05);
    valveRMesh.rotation.x = Math.PI / 2;
    proceduralHeart.add(valveRMesh);
    valveRMeshRef.current = valveRMesh;

    // Chordae Tendineae
    const chordaeMat = new THREE.LineBasicMaterial({ color: '#f8fafc', opacity: 0.6, transparent: true });
    for (let i = 0; i < 4; i++) {
      const ptsL = [
        new THREE.Vector3(-0.8, -1.1, -0.15),
        new THREE.Vector3(-0.65 - i*0.05, 0.0, -0.1)
      ];
      proceduralHeart.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ptsL), chordaeMat));

      const ptsR = [
        new THREE.Vector3(0.7, -0.9, 0.1),
        new THREE.Vector3(0.65 - i*0.05, 0.0, 0.05)
      ];
      proceduralHeart.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ptsR), chordaeMat));
    }

    // Epicardial Fat deposits
    const epicardialFatGroup = new THREE.Group();
    epicardialFatGroup.name = 'Epicardial Fat';
    proceduralHeart.add(epicardialFatGroup);

    const fatCurve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 0.1, 0.3),
      new THREE.Vector3(0.05, -0.6, 0.45),
      new THREE.Vector3(0.1, -1.2, 0.35)
    ]);
    const fatMesh1 = new THREE.Mesh(new THREE.TubeGeometry(fatCurve1, 16, 0.12, 8, false), materials.fatMat);
    epicardialFatGroup.add(fatMesh1);

    const fatCurve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.9, 0.1, 0.15),
      new THREE.Vector3(-0.4, 0.2, 0.25),
      new THREE.Vector3(0.0, 0.15, 0.3),
      new THREE.Vector3(0.5, 0.05, 0.28),
      new THREE.Vector3(0.9, 0.1, 0.1)
    ]);
    const fatMesh2 = new THREE.Mesh(new THREE.TubeGeometry(fatCurve2, 20, 0.14, 8, false), materials.fatMat);
    epicardialFatGroup.add(fatMesh2);

    // Coronaries
    const coronaryGroup = new THREE.Group();
    coronaryGroupRef.current = coronaryGroup;
    proceduralHeart.add(coronaryGroup);

    // Left Coronary branches (Arteries: Red)
    const lcaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.35, 0.2, 0.1),
      new THREE.Vector3(-0.55, -0.4, 0.35),
      new THREE.Vector3(-0.85, -0.9, 0.45),
      new THREE.Vector3(-1.0, -1.4, 0.3)
    ]);
    coronaryGroup.add(new THREE.Mesh(new THREE.TubeGeometry(lcaCurve, 16, 0.05, 6, false), materials.arteryMat));

    const lcaDiag = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.55, -0.4, 0.35),
      new THREE.Vector3(-0.7, -0.8, 0.1)
    ]), 10, 0.035, 6, false), materials.arteryMat);
    coronaryGroup.add(lcaDiag);

    // Right Coronary branches
    const rcaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.35, 0.2, 0.15),
      new THREE.Vector3(0.65, -0.3, 0.45),
      new THREE.Vector3(0.85, -0.8, 0.48),
      new THREE.Vector3(0.9, -1.3, 0.2)
    ]);
    coronaryGroup.add(new THREE.Mesh(new THREE.TubeGeometry(rcaCurve, 16, 0.05, 6, false), materials.arteryMat));

    // Cardiac Veins (Blue)
    const gcvCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.85, -0.9, 0.45),
      new THREE.Vector3(-0.5, -0.3, 0.38),
      new THREE.Vector3(-0.1, 0.0, 0.35)
    ]);
    const gcvMesh = new THREE.Mesh(new THREE.TubeGeometry(gcvCurve, 16, 0.045, 6, false), materials.veinMat);
    gcvMesh.name = 'Cardiac Veins';
    coronaryGroup.add(gcvMesh);

    // CAD atherosclerotic plaque
    const plaqueMat = new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.8, name: 'Plaque' });
    const plaqueMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), plaqueMat);
    plaqueMesh.position.set(-0.55, -0.4, 0.35);
    plaqueMesh.name = 'Coronary Arteries';
    plaqueMeshRef.current = plaqueMesh;
    coronaryGroup.add(plaqueMesh);

    // Main Great Vessels: Aorta (Artery: Red)
    const aorta = new THREE.Group();
    aorta.name = 'Aorta';
    const aortaTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 2.5, 24), materials.arteryMat);
    aortaTrunk.position.set(-0.35, 1.2, -0.4);
    aortaTrunk.rotation.z = -0.15;
    aorta.add(aortaTrunk);

    const archCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.35, 2.45, -0.4),
      new THREE.Vector3(-0.5, 2.95, -0.4),
      new THREE.Vector3(-1.15, 2.8, -0.4),
      new THREE.Vector3(-1.3, 2.1, -0.4)
    ]);
    aorta.add(new THREE.Mesh(new THREE.TubeGeometry(archCurve, 24, 0.38, 12, false), materials.arteryMat));
    
    for (let i = 0; i < 3; i++) {
      const br = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.8, 8), materials.arteryMat);
      br.position.set(-0.55 - i * 0.22, 2.92, -0.4);
      br.rotation.z = 0.12;
      aorta.add(br);
    }
    proceduralHeart.add(aorta);

    // Vena Cava (Vein: Blue)
    const vcGroup = new THREE.Group();
    vcGroup.name = 'Vena Cava';
    const svc = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 2.2, 24), materials.veinMat);
    svc.position.set(1.2, 1.35, 0.1);
    vcGroup.add(svc);
    
    const ivc = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.6, 24), materials.veinMat);
    ivc.position.set(1.15, -1.8, 0.0);
    vcGroup.add(ivc);
    proceduralHeart.add(vcGroup);

    // Pulmonary Trunk / Pulmonary Arteries (Arteries: Red)
    const pt = new THREE.Group();
    pt.name = 'Pulmonary Trunk';
    const ptTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 1.8, 24), materials.arteryMat);
    ptTrunk.position.set(0.18, 0.8, 0.35);
    ptTrunk.rotation.z = 0.6;
    ptTrunk.rotation.x = 0.25;
    pt.add(ptTrunk);

    const ptL = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.2, 12), materials.arteryMat);
    ptL.position.set(-0.5, 1.45, 0.0);
    ptL.rotation.z = 1.3;
    pt.add(ptL);

    const ptR = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.2, 12), materials.arteryMat);
    ptR.position.set(0.85, 1.25, -0.4);
    ptR.rotation.z = -1.1;
    pt.add(ptR);
    proceduralHeart.add(pt);

    // Pulmonary Veins (Veins: Blue)
    const pvGroup = new THREE.Group();
    pvGroup.name = 'Pulmonary Veins';
    for (let i = 0; i < 4; i++) {
      const theta = (i * Math.PI) / 3 - Math.PI / 6;
      const pv = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.0, 12), materials.veinMat);
      pv.position.set(
        -0.75 - Math.sin(theta) * 0.75,
        0.75 + (i % 2 === 0 ? 0.2 : -0.2),
        -0.2 - Math.cos(theta) * 0.75 - 0.2
      );
      pv.rotation.z = (Math.PI / 4) * (i % 2 === 0 ? 1 : -1);
      pv.rotation.x = Math.PI / 6;
      pvGroup.add(pv);
    }
    proceduralHeart.add(pvGroup);


    // ----------------------------------------------------
    // HIGH-RESOLUTION GLTF & DRACO MODEL LOADING PIPELINE
    // ----------------------------------------------------
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load(
      '/models/heart_skeleton.glb',
      (gltf) => {
        setIsLoading(false);
        setModelLoaded(true);

        proceduralHeart.visible = false;
        proceduralSkeleton.visible = false;

        const model = gltf.scene;
        gltfModelRef.current = model;
        scene.add(model);

        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const name = child.name.toLowerCase();

            if (name.includes('left_ventricle') || name.includes('lv')) {
              child.material = materials.lvMat;
              child.name = 'Left Ventricle';
              lvMeshRef.current = child;
            } else if (name.includes('right_ventricle') || name.includes('rv')) {
              child.material = materials.rvMat;
              child.name = 'Right Ventricle';
              rvMeshRef.current = child;
            } else if (name.includes('left_atrium') || name.includes('la')) {
              child.material = materials.laMat;
              child.name = 'Left Atrium';
              laMeshRef.current = child;
            } else if (name.includes('right_atrium') || name.includes('ra')) {
              child.material = materials.raMat;
              child.name = 'Right Atrium';
              raMeshRef.current = child;
            }
            else if (name.includes('aorta') || name.includes('artery') || name.includes('art')) {
              child.material = materials.arteryMat;
              child.name = 'Aorta';
            } else if (name.includes('cava') || name.includes('vein') || name.includes('vc') || name.includes('pv')) {
              child.material = materials.veinMat;
              child.name = 'Vena Cava';
            }
            else if (name.includes('rib') || name.includes('skelet') || name.includes('bone') || name.includes('sternum') || name.includes('spine') || name.includes('vertebra')) {
              child.material = materials.boneMat;
            }
            else if (name.includes('valve') || name.includes('mitral') || name.includes('tricuspid')) {
              child.material = materials.valveMat;
              if (name.includes('mitral') || name.includes('left')) {
                valveLMeshRef.current = child;
              } else {
                valveRMeshRef.current = child;
              }
            }

            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((mat) => {
              if ('clippingPlanes' in mat) {
                (mat as any).clippingPlanes = [];
              }
              if ('clipShadows' in mat) {
                (mat as any).clipShadows = true;
              }
            });
          }
        });
      },
      undefined,
      (error) => {
        console.warn('Draco GLTF cardiac asset not found at /models/heart_skeleton.glb. Displaying highly-detailed procedural anatomical fallback.', error);
        setIsLoading(false);
        setModelLoaded(false);
      }
    );


    // ----------------------------------------------------
    // PACEMAKER ELECTRICAL SYSTEM NODES & PATHS
    // ----------------------------------------------------
    const conductionGroup = new THREE.Group();
    scene.add(conductionGroup);

    const saNodeMat = new THREE.MeshBasicMaterial({ color: '#facc15' });
    const avNodeMat = new THREE.MeshBasicMaterial({ color: '#facc15' });
    const hisLineMat = new THREE.MeshBasicMaterial({ color: '#facc15' });
    const purkinjeLMat = new THREE.MeshBasicMaterial({ color: '#facc15' });
    const purkinjeRMat = new THREE.MeshBasicMaterial({ color: '#facc15' });

    const saNode = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), saNodeMat);
    saNode.position.set(0.75, 1.25, 0.2);
    saNode.name = 'SA Node';
    conductionGroup.add(saNode);

    const avNode = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), avNodeMat);
    avNode.position.set(0.08, 0.05, 0.05);
    avNode.name = 'AV Node';
    conductionGroup.add(avNode);

    const hisCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.08, 0.05, 0.05),
      new THREE.Vector3(-0.02, -0.5, 0.05),
      new THREE.Vector3(-0.02, -1.0, 0.05)
    ]);
    const hisLine = new THREE.Mesh(new THREE.TubeGeometry(hisCurve, 8, 0.03, 4, false), hisLineMat);
    conductionGroup.add(hisLine);

    const purkinjeL = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.02, -1.0, 0.05),
      new THREE.Vector3(-0.5, -1.4, 0.1),
      new THREE.Vector3(-0.9, -1.0, 0.0)
    ]), 8, 0.02, 4, false), purkinjeLMat);
    conductionGroup.add(purkinjeL);

    const purkinjeR = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.02, -1.0, 0.05),
      new THREE.Vector3(0.5, -1.2, 0.15),
      new THREE.Vector3(0.8, -0.9, 0.1)
    ]), 8, 0.02, 4, false), purkinjeRMat);
    conductionGroup.add(purkinjeR);


    // ----------------------------------------------------
    // LANDMARKS / PIN ANCHORS
    // ----------------------------------------------------
    const pinsGroup = new THREE.Group();
    scene.add(pinsGroup);
    const landmarks = [
      { name: 'Apex of Heart', pos: new THREE.Vector3(-0.7, -1.8, 0.4) },
      { name: 'Arch of Aorta', pos: new THREE.Vector3(-0.7, 2.8, -0.4) },
      { name: 'Pulmonary Trunk', pos: new THREE.Vector3(0.18, 1.2, 0.35) },
      { name: 'Sternocostal Surface', pos: new THREE.Vector3(0, 0, 1.5) },
      { name: 'Diaphragmatic Surface', pos: new THREE.Vector3(0, -1.8, -0.5) }
    ];
    landmarks.forEach(lm => {
      const pin = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: '#fbbf24' }));
      pin.position.copy(lm.pos);
      pin.name = lm.name;
      pinsGroup.add(pin);
    });


    // ----------------------------------------------------
    // HEMODYNAMIC FLOW PATHWAYS (8 STEPS)
    // ----------------------------------------------------
    const stepPathways = [
      // Step 1: Vena Cava to Right Atrium (Deoxygenated - Blue)
      [
        new THREE.Vector3(1.15, 2.0, 0.1),
        new THREE.Vector3(1.15, 1.2, 0.1),
        new THREE.Vector3(0.75, 0.85, 0.1)
      ],
      // Step 2: Right Atrium to Right Ventricle (Deoxygenated - Blue)
      [
        new THREE.Vector3(0.75, 0.85, 0.1),
        new THREE.Vector3(0.68, 0.1, 0.12),
        new THREE.Vector3(0.6, -0.8, 0.15)
      ],
      // Step 3: Right Ventricle to Pulmonary Trunk (Deoxygenated - Blue)
      [
        new THREE.Vector3(0.6, -0.8, 0.15),
        new THREE.Vector3(0.4, 0.1, 0.25),
        new THREE.Vector3(0.18, 1.2, 0.35)
      ],
      // Step 4: Pulmonary Trunk to Pulmonary Arteries (Deoxygenated - Blue)
      [
        new THREE.Vector3(0.18, 1.2, 0.35),
        new THREE.Vector3(0.5, 1.45, -0.2),
        new THREE.Vector3(0.85, 1.25, -0.4)
      ],
      // Step 5: Pulmonary Veins to Left Atrium (Oxygenated - Red)
      [
        new THREE.Vector3(-1.4, 0.6, -0.6),
        new THREE.Vector3(-1.0, 0.7, -0.4),
        new THREE.Vector3(-0.75, 0.75, -0.2)
      ],
      // Step 6: Left Atrium to Left Ventricle (Oxygenated - Red)
      [
        new THREE.Vector3(-0.75, 0.75, -0.2),
        new THREE.Vector3(-0.68, 0.0, -0.1),
        new THREE.Vector3(-0.6, -1.0, 0.0)
      ],
      // Step 7: Left Ventricle to Aorta Base (Oxygenated - Red)
      [
        new THREE.Vector3(-0.6, -1.0, 0.0),
        new THREE.Vector3(-0.5, 0.2, -0.2),
        new THREE.Vector3(-0.35, 1.2, -0.4)
      ],
      // Step 8: Aorta Base to Aorta Arch (Oxygenated - Red)
      [
        new THREE.Vector3(-0.35, 1.2, -0.4),
        new THREE.Vector3(-0.5, 2.45, -0.4),
        new THREE.Vector3(-1.15, 2.5, -0.4),
        new THREE.Vector3(-1.3, 1.8, -0.4)
      ]
    ];

    // Initialize Flow particles
    const particleGeo = new THREE.SphereGeometry(0.08, 8, 8);
    particles.current = [];

    stepPathways.forEach((pathPoints, stepIdx) => {
      const isOxygenated = stepIdx >= 4; // Steps 5-8 are oxygenated
      const pathMat = new THREE.MeshBasicMaterial({
        color: isOxygenated ? '#FF1100' : '#0055FF',
        transparent: true,
        opacity: 0.85
      });
      
      for (let i = 0; i < 6; i++) {
        const mesh = new THREE.Mesh(particleGeo, pathMat);
        const progress = i / 6;
        mesh.position.copy(getPointOnPath(pathPoints, progress));
        heartGroup.add(mesh);
        
        particles.current.push({
          mesh,
          path: pathPoints,
          progress,
          oxygenated: isOxygenated,
          stepIndex: stepIdx + 1
        });
      }
    });

    // Mitral Valve regurgitation leak particles
    leakParticles.current = [];
    const leakMat = new THREE.MeshBasicMaterial({ color: '#FF1100' });
    for (let i = 0; i < 8; i++) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), leakMat);
      mesh.position.set(-0.6, -0.8, 0);
      mesh.visible = false;
      heartGroup.add(mesh);
      leakParticles.current.push({ mesh, progress: Math.random() });
    }

    function getPointOnPath(points: THREE.Vector3[], progress: number): THREE.Vector3 {
      const segments = points.length - 1;
      const t = progress * segments;
      const index = Math.floor(t);
      const subT = t - index;
      if (index >= segments) return points[segments].clone();
      const pA = points[index];
      const pB = points[index + 1];
      return new THREE.Vector3().lerpVectors(pA, pB, subT);
    }


    // ----------------------------------------------------
    // RAYCAST CLICK AND FOCUS CONTROLS
    // ----------------------------------------------------
    const handleCanvasClick = (event: MouseEvent) => {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);

      const targetsToIntersect = [];
      if (modelLoaded && gltfModelRef.current) {
        targetsToIntersect.push(gltfModelRef.current);
      } else {
        targetsToIntersect.push(proceduralHeart);
      }
      targetsToIntersect.push(conductionGroup);
      targetsToIntersect.push(pinsGroup);

      const intersects = raycaster.intersectObjects(targetsToIntersect, true);
      
      const resetMeshHighlight = (obj: THREE.Object3D) => {
        if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshStandardMaterial) {
          const original = obj.userData.originalEmissive !== undefined ? obj.userData.originalEmissive : 0x000000;
          obj.material.emissive.setHex(original);
        }
        obj.children.forEach(resetMeshHighlight);
      };
      if (modelLoaded && gltfModelRef.current) {
        resetMeshHighlight(gltfModelRef.current);
      } else {
        resetMeshHighlight(proceduralHeart);
      }

      let targetHit: THREE.Intersection | null = null;
      for (let i = 0; i < intersects.length; i++) {
        const hit = intersects[i];
        if (activeTabRef.current === 3 && hit.point.z > clipPlaneAxisValRef.current && (hit.object.name.startsWith('Left Ventricle') || hit.object.name.startsWith('Right Ventricle'))) {
          continue;
        }
        targetHit = hit;
        break;
      }

      if (targetHit && targetHit.object) {
        let name = targetHit.object.name;
        let curr: THREE.Object3D | null = targetHit.object;
        while (curr && (!name || !structures[name])) {
          curr = curr.parent;
          name = curr?.name || '';
        }

        if (name && structures[name]) {
          setSelectedStructure(structures[name]);

          const applyGlow = (obj: THREE.Object3D) => {
            if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshStandardMaterial) {
              if (obj.userData.originalEmissive === undefined) {
                obj.userData.originalEmissive = obj.material.emissive.getHex();
              }
              obj.material.emissive.setHex(0x3b0764);
            }
            obj.children.forEach(applyGlow);
          };

          if (curr) {
            applyGlow(curr);
            const worldPos = new THREE.Vector3();
            curr.getWorldPosition(worldPos);
            targetLookAt.current.copy(worldPos);
            
            const currentDist = camera.position.distanceTo(controls.target);
            const cameraDirection = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
            targetCamPos.current.copy(worldPos).addScaledVector(cameraDirection, currentDist);
            isGlidingRef.current = true;
          } else {
            applyGlow(targetHit.object);
          }
        }
      }
    };
    renderer.domElement.addEventListener('click', handleCanvasClick);

    // ----------------------------------------------------
    // ANIMATION & RENDERING LOOP
    // ----------------------------------------------------
    let lastTime = 0;
    let reqId: number;

    const animate = (time: number) => {
      reqId = requestAnimationFrame(animate);
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isGlidingRef.current) {
        camera.position.lerp(targetCamPos.current, 0.08);
        controls.target.lerp(targetLookAt.current, 0.08);
        if (camera.position.distanceTo(targetCamPos.current) < 0.02 &&
            controls.target.distanceTo(targetLookAt.current) < 0.02) {
          isGlidingRef.current = false;
        }
      }
      controls.update();

      const activeTab = activeTabRef.current;
      const skeletonOpacity = skeletonOpacityRef.current;
      const showCoronaryLayers = showCoronaryLayersRef.current;
      const clipPlaneAxisVal = clipPlaneAxisValRef.current;
      const flowStep = flowStepRef.current;
      const activeCondition = activeConditionRef.current;
      const speed = speedRef.current;
      const isPlaying = isPlayingRef.current;

      skeletonGroup.visible = activeTab === 1;
      materials.boneMat.opacity = skeletonOpacity;
      materials.cartilageMat.opacity = skeletonOpacity * 0.7;
      materials.discMat.opacity = skeletonOpacity;
      pinsGroup.visible = activeTab === 1;

      const areCoronariesVisible = (activeTab === 2 && showCoronaryLayers) || (activeTab === 6 && activeCondition === 'CAD');
      if (coronaryGroupRef.current) coronaryGroupRef.current.visible = areCoronariesVisible;
      if (plaqueMeshRef.current) plaqueMeshRef.current.visible = activeCondition === 'CAD';

      const isSectionView = activeTab === 3;
      coronalSlicePlane.constant = clipPlaneAxisVal;
      const clipPlanes = isSectionView ? [coronalSlicePlane] : [];

      if (modelLoaded && gltfModelRef.current) {
        gltfModelRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            setClippingPlanes(child, clipPlanes);
          }
        });
      } else {
        setClippingPlanes(lvMeshRef.current, clipPlanes);
        setClippingPlanes(rvMeshRef.current, clipPlanes);
        setClippingPlanes(laMeshRef.current, clipPlanes);
        setClippingPlanes(raMeshRef.current, clipPlanes);
      }

      const isHemodynamicView = activeTab === 4;
      const chamberOpacity = isHemodynamicView ? 0.28 : 1.0;
      const isTransparent = isHemodynamicView;

      const setChamberTransparency = (mesh: THREE.Mesh | null) => {
        if (mesh && mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.transparent = isTransparent;
              mat.opacity = chamberOpacity;
            }
          });
        }
      };
      setChamberTransparency(lvMeshRef.current);
      setChamberTransparency(rvMeshRef.current);
      setChamberTransparency(laMeshRef.current);
      setChamberTransparency(raMeshRef.current);

      conductionGroup.visible = activeTab === 5;

      const isCardiomyopathy = activeCondition === 'HYPERTROPHIC' && activeTab === 6;
      if (lvMeshRef.current) {
        lvMeshRef.current.material = isCardiomyopathy ? materials.thickenedLvMat : materials.lvMat;
      }
      if (rvMeshRef.current) {
        rvMeshRef.current.material = isCardiomyopathy ? materials.thickenedMuscleMat : materials.rvMat;
      }

      if (isPlaying) {
        const condBpmFactor = activeCondition === 'CAD' ? 1.25 :
                              activeCondition === 'REGURGITATION' ? 1.3 :
                              activeCondition === 'HYPERTROPHIC' ? 0.8 : 1.0;
        
        pulseTime.current += delta * 5.0 * speed * condBpmFactor;
        
        const scaleAtria = 1.0 + Math.sin(pulseTime.current) * 0.05;
        const scaleVentricles = 1.0 - Math.sin(pulseTime.current) * 0.08;
        const apicalBaseShift = -Math.sin(pulseTime.current) * 0.12;

        const hcmThickness = isCardiomyopathy ? 1.3 : 1.0;

        if (laMeshRef.current) laMeshRef.current.scale.set(scaleAtria, scaleAtria, scaleAtria);
        if (raMeshRef.current) raMeshRef.current.scale.set(scaleAtria, scaleAtria, scaleAtria);

        if (lvMeshRef.current) {
          lvMeshRef.current.scale.set(0.85 * scaleVentricles * hcmThickness, 1.25 * scaleVentricles, 0.7 * scaleVentricles * hcmThickness);
          lvMeshRef.current.position.y = -1.0 + apicalBaseShift;
        }
        if (rvMeshRef.current) {
          rvMeshRef.current.scale.set(0.8 * scaleVentricles, 1.05 * scaleVentricles, 0.65 * scaleVentricles);
          rvMeshRef.current.position.y = -0.8 + apicalBaseShift;
        }

        if (activeTab === 1) {
          skeletonGroup.scale.set(
            1.0 + Math.sin(pulseTime.current * 0.2) * 0.015,
            1.0,
            1.0 + Math.sin(pulseTime.current * 0.2) * 0.015
          );
        }

        const valvesOpen = Math.sin(pulseTime.current) > 0;
        if (valveLMeshRef.current) valveLMeshRef.current.scale.set(1.0, 1.0, valvesOpen ? 1.0 : 0.08);
        if (valveRMeshRef.current) valveRMeshRef.current.scale.set(1.0, 1.0, valvesOpen ? 1.0 : 0.08);

        const particleSpeed = activeCondition === 'CAD' ? 0.6 : 1.0;
        particles.current.forEach(p => {
          p.progress += delta * 0.3 * speed * particleSpeed;
          if (p.progress >= 1.0) p.progress = 0;

          let isPartVisible = false;
          if (isHemodynamicView) {
            isPartVisible = true;
            if (p.stepIndex === flowStep) {
              p.mesh.scale.set(1.8, 1.8, 1.8);
              const mat = p.mesh.material;
              if (mat instanceof THREE.MeshBasicMaterial) {
                mat.opacity = 1.0;
              }
            } else {
              p.mesh.scale.set(0.5, 0.5, 0.5);
              const mat = p.mesh.material;
              if (mat instanceof THREE.MeshBasicMaterial) {
                mat.opacity = 0.15;
              }
            }
          } else if (activeTab === 5 || activeTab === 6) {
            isPartVisible = false;
          } else {
            isPartVisible = (p.stepIndex === 2 || p.stepIndex === 6);
            p.mesh.scale.set(1.0, 1.0, 1.0);
            const mat = p.mesh.material;
            if (mat instanceof THREE.MeshBasicMaterial) {
              mat.opacity = 0.5;
            }
          }

          p.mesh.visible = isPartVisible;
          if (isPartVisible) {
            p.mesh.position.copy(getPointOnPath(p.path, p.progress));
          }
        });

        const isRegurgMode = activeCondition === 'REGURGITATION' && activeTab === 6;
        leakParticles.current.forEach(lp => {
          if (isRegurgMode) {
            lp.progress += delta * 0.9 * speed;
            if (lp.progress >= 1.0) lp.progress = 0;
            lp.mesh.visible = !valvesOpen;
            lp.mesh.position.lerpVectors(
              new THREE.Vector3(-0.6, -0.8, 0.0),
              new THREE.Vector3(-0.75, 0.75, -0.2),
              lp.progress
            );
          } else {
            lp.mesh.visible = false;
          }
        });

        if (activeTab === 5) {
          const tCycle = (pulseTime.current % (Math.PI * 2)) / (Math.PI * 2);
          saNodeMat.color.set(tCycle < 0.2 ? '#facc15' : '#78350f');
          avNodeMat.color.set(tCycle >= 0.2 && tCycle < 0.4 ? '#facc15' : '#78350f');
          hisLineMat.color.set(tCycle >= 0.4 && tCycle < 0.65 ? '#facc15' : '#78350f');
          purkinjeLMat.color.set(tCycle >= 0.65 ? '#facc15' : '#78350f');
          purkinjeRMat.color.set(tCycle >= 0.65 ? '#facc15' : '#78350f');
        }

      } else {
        if (laMeshRef.current) laMeshRef.current.scale.set(1, 1, 1);
        if (raMeshRef.current) raMeshRef.current.scale.set(1, 1, 1);
        if (lvMeshRef.current) {
          lvMeshRef.current.scale.set(0.85, 1.25, 0.7);
          lvMeshRef.current.position.y = -1.0;
        }
        if (rvMeshRef.current) {
          rvMeshRef.current.scale.set(0.8, 1.05, 0.65);
          rvMeshRef.current.position.y = -0.8;
        }
        
        particles.current.forEach(p => { p.mesh.visible = false; });
        leakParticles.current.forEach(lp => { lp.mesh.visible = false; });
      }

      if (activeTab === 4 && camera && renderer) {
        const container = renderer.domElement.parentElement;
        if (container) {
          const width = container.clientWidth;
          const height = container.clientHeight || 340;
          const tempV = new THREE.Vector3();

          BLOOD_FLOW_STEPS.forEach((s) => {
            const el = document.getElementById(`flow-badge-${s.step}`);
            if (el) {
              tempV.set(s.position[0], s.position[1], s.position[2]);
              tempV.project(camera);

              if (tempV.z > 1) {
                el.style.display = 'none';
              } else {
                const x = (tempV.x * 0.5 + 0.5) * width;
                const y = (-(tempV.y) * 0.5 + 0.5) * height;

                el.style.left = `${x}px`;
                el.style.top = `${y}px`;
                el.style.display = 'flex';
              }
            }
          });
        }
      } else {
        BLOOD_FLOW_STEPS.forEach((s) => {
          const el = document.getElementById(`flow-badge-${s.step}`);
          if (el) el.style.display = 'none';
        });
      }

      renderer.render(scene, camera);
    };
    reqId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 340;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current?.domElement && mountRef.current) {
        rendererRef.current.domElement.removeEventListener('click', handleCanvasClick);
        try {
          mountRef.current.removeChild(rendererRef.current.domElement);
        } catch (e) {}
      }
    };
  }, [modelLoaded]);

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      targetCamPos.current.set(0, 0, 10);
      targetLookAt.current.set(0, 0, 0);
      isGlidingRef.current = true;
      controlsRef.current.update();
    }
  };

  const handleZoom = (amount: number) => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(4, Math.min(20, cameraRef.current.position.z + amount));
    }
  };

  const handleStepClick = (stepNum: number) => {
    setFlowStep(stepNum);
    const stepData = BLOOD_FLOW_STEPS.find(s => s.step === stepNum);
    if (stepData) {
      setSelectedStructure({
        name: stepData.title,
        scientificName: stepData.type === 'oxygenated' ? 'Oxygenated Hemodynamic Path' : 'Deoxygenated Hemodynamic Path',
        role: stepData.description,
        description: `Step ${stepData.step} of the sequential cardiac blood circulation pathway. The blood flow is ${stepData.type} (shown in ${stepData.type === 'oxygenated' ? 'Red' : 'Blue'}).`
      });
      targetCamPos.current.set(stepData.cameraPos[0], stepData.cameraPos[1], stepData.cameraPos[2]);
      targetLookAt.current.set(stepData.cameraTarget[0], stepData.cameraTarget[1], stepData.cameraTarget[2]);
      isGlidingRef.current = true;
    }
  };

  const getHeartRate = () => {
    let base = 72;
    if (activeCondition === 'CAD') base = 82;
    if (activeCondition === 'REGURGITATION') base = 90;
    if (activeCondition === 'HYPERTROPHIC') base = 56;
    return Math.round(base * speed);
  };

  const getStrokeVolume = () => {
    if (activeCondition === 'CAD') return 52;
    if (activeCondition === 'REGURGITATION') return 46;
    if (activeCondition === 'HYPERTROPHIC') return 40;
    return 70;
  };

  const getCardiacOutput = () => {
    return (getHeartRate() * getStrokeVolume()) / 1000;
  };

  return (
    <div className="flex flex-col space-y-4 p-2.5">
      
      {/* 6-Module Navigation Selector Row */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-1 bg-gray-950 border border-gray-900 rounded-xl p-1 shadow-inner">
        {[
          { id: 1, label: '1. Thoracic Cage' },
          { id: 2, label: '2. Surface & Vessels' },
          { id: 3, label: '3. Internal Coronal' },
          { id: 4, label: '4. Blood Flow' },
          { id: 5, label: '5. Electrical Conduction' },
          { id: 6, label: '6. Pathophysiology' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedStructure(null);
            }}
            className={`py-2 px-1 text-[10px] font-black rounded-lg text-center transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-purple-900/30 border border-purple-800 text-purple-300 shadow-md shadow-purple-950/20'
                : 'text-gray-500 hover:text-white hover:bg-gray-900 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Interactive 3D Canvas Box (Left column) */}
        <div className="lg:col-span-8 bg-gray-950 border border-gray-900 rounded-2xl flex flex-col relative h-[380px] shadow-2xl overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-950/95 flex flex-col items-center justify-center space-y-3 z-30">
              <Heart className="h-10 w-10 text-purple-500 animate-pulse" />
              <span className="text-xs font-mono text-purple-300">Initializing Cardiac Lab Scene...</span>
            </div>
          )}

          <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing z-0" />

          {/* 3D Projected HTML Badges */}
          {activeTab === 4 && BLOOD_FLOW_STEPS.map((stepData) => (
            <div
              key={stepData.step}
              id={`flow-badge-${stepData.step}`}
              className="flow-badge-overlay absolute pointer-events-auto cursor-pointer flex items-center space-x-1.5 z-20 group"
              onClick={() => handleStepClick(stepData.step)}
              style={{ display: 'none', transform: 'translate(-50%, -50%)' }}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-md border-2 transition-all ${
                flowStep === stepData.step
                  ? 'ring-2 ring-white scale-110'
                  : 'opacity-85 hover:opacity-100'
              } ${
                stepData.type === 'oxygenated'
                  ? 'bg-rose-600 border-rose-400'
                  : 'bg-blue-600 border-blue-400'
              }`}>
                {stepData.step}
              </div>
              <div className="hidden group-hover:block bg-gray-950/95 border border-gray-800 px-2 py-1 rounded-lg shadow-xl text-[9px] text-gray-300 w-44 pointer-events-none backdrop-blur-md">
                <span className="font-bold text-white block">{stepData.title}</span>
                {stepData.description}
              </div>
            </div>
          ))}

          {/* Module-Specific HUD Sub-Controls Layer Overlay */}
          <div className="absolute top-3.5 right-3.5 flex flex-col space-y-2 items-end z-10 font-mono text-[9px]">
            
            {activeTab === 1 && (
              <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-2.5 flex flex-col space-y-1 shadow-md w-[160px] animate-in slide-in-from-top-1">
                <span className="text-gray-400 font-bold">Ribcage Opacity: {Math.round(skeletonOpacity*100)}%</span>
                <input
                  type="range"
                  min={0.0}
                  max={1.0}
                  step={0.05}
                  value={skeletonOpacity}
                  onChange={(e) => setSkeletonOpacity(parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            )}

            {activeTab === 2 && (
              <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-2 w-[150px] shadow-md animate-in slide-in-from-top-1">
                <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showCoronaryLayers}
                    onChange={(e) => setShowCoronaryLayers(e.target.checked)}
                    className="rounded border-gray-800 bg-gray-950 text-purple-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-gray-400 font-bold uppercase">Coronary Vessels</span>
                </label>
              </div>
            )}

            {activeTab === 3 && (
              <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-2.5 flex flex-col space-y-1 shadow-md w-[160px] animate-in slide-in-from-top-1">
                <span className="text-gray-400 font-bold">Coronal Cut Axis: {clipPlaneAxisVal.toFixed(2)}</span>
                <input
                  type="range"
                  min={-1.5}
                  max={1.5}
                  step={0.05}
                  value={clipPlaneAxisVal}
                  onChange={(e) => setClipPlaneAxisVal(parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            )}

            {activeTab === 4 && (
              <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-2 flex flex-col space-y-1 shadow-md w-[160px] animate-in slide-in-from-top-1">
                <span className="text-purple-400 font-bold uppercase text-[8px] mb-1">Hemodynamic Tracker</span>
                <div className="grid grid-cols-4 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(st => (
                    <button
                      key={st}
                      onClick={() => handleStepClick(st)}
                      className={`py-1 text-[9px] font-black rounded cursor-pointer ${
                        flowStep === st ? 'bg-purple-600 text-white' : 'bg-gray-950 border border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      St {st}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 6 && (
              <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-2.5 flex flex-col space-y-1.5 shadow-md w-[170px] animate-in slide-in-from-top-1">
                <span className="text-purple-400 font-bold uppercase text-[8px]">Comparative Mode</span>
                <select
                  value={activeCondition}
                  onChange={(e) => setActiveCondition(e.target.value)}
                  className="bg-gray-950 border border-gray-800 rounded px-1.5 py-1 text-white text-[9px] font-bold focus:outline-none focus:border-purple-600 w-full cursor-pointer"
                >
                  <option value="HEALTHY">Normal Heart</option>
                  <option value="CAD">Coronary Disease (CAD)</option>
                  <option value="HYPERTROPHIC">Hypertrophic Cardiomyopathy</option>
                  <option value="REGURGITATION">Mitral Regurgitation</option>
                </select>
              </div>
            )}
          </div>

          {/* Quick-view camera controls on Surface Anatomy tab */}
          {activeTab === 2 && (
            <div className="absolute top-4 left-4 flex space-x-1.5 z-10 font-mono text-[9px]">
              {['ANTERIOR', 'POSTERIOR', 'SUPERIOR', 'APEX'].map(ang => (
                <button
                  key={ang}
                  onClick={() => setQuickCameraAngle(ang as any)}
                  className="bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-slate-330 font-bold px-2 py-1.5 rounded-xl cursor-pointer"
                >
                  {ang.substring(0, 4)}
                </button>
              ))}
            </div>
          )}

          {/* Camera zoom actions */}
          <div className="absolute top-4 left-4 flex space-x-1.5 z-10 font-mono text-[9px] translate-y-10">
            <button 
              onClick={() => handleZoom(-1.5)} 
              className="bg-gray-900/85 border border-gray-800 text-slate-350 p-2 rounded-xl cursor-pointer hover:bg-gray-800"
            >
              <ZoomIn className="h-3 w-3" />
            </button>
            <button 
              onClick={() => handleZoom(1.5)} 
              className="bg-gray-900/85 border border-gray-800 text-slate-350 p-2 rounded-xl cursor-pointer hover:bg-gray-800"
            >
              <ZoomOut className="h-3 w-3" />
            </button>
            <button 
              onClick={resetCamera} 
              className="bg-gray-900/85 border border-gray-800 text-slate-350 px-2.5 py-1.5 rounded-xl text-[8px] font-black cursor-pointer hover:bg-gray-800"
            >
              RESET
            </button>
          </div>

          {/* Standard playback controls board */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-gray-950/90 border border-gray-900 rounded-xl p-3.5 backdrop-blur-md z-10 shadow-lg">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-md shadow-purple-950/40 cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>PAUSE CYCLE</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>START CYCLE</span>
                </>
              )}
            </button>

            <div className="flex items-center space-x-2 text-xs font-bold text-gray-400">
              <span className="font-mono text-[10px]">Speed:</span>
              {[0.5, 1.0, 2.0].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2.5 py-1 rounded-lg border font-mono transition-all cursor-pointer ${
                    speed === s 
                      ? 'bg-purple-900/40 border-purple-800 text-purple-300' 
                      : 'bg-gray-900 border-gray-800 hover:text-white'
                  }`}
                >
                  {s.toFixed(1)}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Structure Inspection Column Panel (Right column) */}
        <div className="lg:col-span-4 bg-gray-950/40 border border-gray-900 rounded-2xl p-5 flex flex-col justify-between h-[380px] shadow-2xl z-10">
          <div>
            <h3 className="text-sm font-extrabold text-white border-b border-gray-900 pb-2 uppercase tracking-widest font-mono">
              Anatomical Inspector
            </h3>
            
            {activeTab === 4 ? (
              <div className="space-y-2 pt-2 overflow-y-auto max-h-[260px] pr-1 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-transparent">
                <span className="text-[10px] uppercase font-mono font-bold text-purple-400 block mb-1">Circulatory Pathway (Click to focus)</span>
                <div className="flex flex-col space-y-1.5">
                  {BLOOD_FLOW_STEPS.map((s) => (
                    <button
                      key={s.step}
                      onClick={() => handleStepClick(s.step)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start space-x-2 cursor-pointer ${
                        flowStep === s.step
                          ? 'bg-purple-900/25 border-purple-800 text-white shadow-md'
                          : 'bg-gray-900 border-gray-850 text-gray-400 hover:text-white hover:bg-gray-850'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        s.type === 'oxygenated' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {s.step}
                      </div>
                      <div className="flex-1 min-w-0 font-sans">
                        <div className="text-[11px] font-bold leading-tight">{s.title}</div>
                        {flowStep === s.step && (
                          <div className="text-[10px] text-gray-300 mt-1 leading-normal">
                            {s.description}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : selectedStructure ? (
              <div className="space-y-4 pt-3.5 overflow-y-auto max-h-[250px] pr-1">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-purple-400">Structure Name</span>
                  <h4 className="text-lg font-black text-white mt-0.5 leading-tight">{selectedStructure.name}</h4>
                  <p className="text-[10px] text-gray-500 font-mono italic">{selectedStructure.scientificName}</p>
                </div>
                
                <div className="bg-purple-950/10 border border-purple-900/20 p-3.5 rounded-xl">
                  <span className="text-[9px] uppercase tracking-wider text-purple-400 font-bold block mb-1">Circulatory Role</span>
                  <p className="text-xs text-purple-200 font-medium leading-relaxed font-sans">{selectedStructure.role}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-[9px] uppercase text-gray-500 font-bold font-mono">Detailed Bio-Description</span>
                  <p className="text-xs text-slate-350 leading-relaxed font-sans">{selectedStructure.description}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 space-y-3">
                <Heart className="h-6 w-6 animate-pulse mx-auto text-purple-500/60" />
                <p className="text-xs font-semibold px-4 font-sans leading-relaxed">
                  {activeTab === 1 ? 'Click spinal elements or rib segments to inspect structures.' :
                   activeTab === 5 ? 'Observe the yellow Pacemaker electrical circuit paths.' :
                   'Click on the ventricles, arteries, veins, or epicardial fat to inspect their biological functions.'}
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-900 pt-3 flex justify-around text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-650 shadow shadow-rose-950" style={{ backgroundColor: '#FF1100' }} />
              <span>Oxygenated</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-650 shadow shadow-blue-950" style={{ backgroundColor: '#0055FF' }} />
              <span>Deoxygenated</span>
            </div>
          </div>
        </div>

      </div>

      {/* Dynamic Telemetry HUD Panel */}
      <div className="bg-gray-950 border border-gray-900 rounded-2xl p-4 shadow-xl">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono mb-3">
          Telemetry & Cardiac Formulations
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex justify-between items-center">
            <div>
              <span className="text-[9px] uppercase text-gray-500 font-bold block">Heart Rate (HR)</span>
              <span className="text-white text-base font-black">{getHeartRate()} BPM</span>
            </div>
            <Activity className="h-5 w-5 text-purple-500" />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex justify-between items-center">
            <div>
              <span className="text-[9px] uppercase text-gray-500 font-bold block">Stroke Volume (SV)</span>
              <span className="text-white text-base font-black">{getStrokeVolume()} mL</span>
            </div>
            <Heart className="h-5 w-5 text-emerald-500" />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex justify-between items-center">
            <div>
              <span className="text-[9px] uppercase text-gray-500 font-bold block">Cardiac Output (CO)</span>
              <span className="text-white text-base font-black">{getCardiacOutput().toFixed(2)} L/min</span>
            </div>
            <Layers className="h-5 w-5 text-blue-500" />
          </div>

          <div className="bg-purple-950/10 border border-purple-900/20 rounded-xl p-3 text-[10px] text-purple-300 leading-normal flex items-center">
            <div>
              <span className="font-bold block uppercase text-[8px] text-purple-400">Cardiology Formula:</span>
              CO = HR × SV. Currently calculated:
              {' '}{(getHeartRate())} BPM × {getStrokeVolume()} mL = {getCardiacOutput().toFixed(2)} L/min.
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
