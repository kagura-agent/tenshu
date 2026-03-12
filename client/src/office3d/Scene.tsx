import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";
import type { Agent } from "@tenshu/shared";
import Floor from "./Floor";
import Walls from "./Walls";
import Lights from "./Lights";
import AgentDesk from "./AgentDesk";
import MovingAvatar from "./MovingAvatar";

interface SceneProps {
  agents: Agent[];
  selectedAgentId: string | null;
  onSelectAgent: (agent: Agent) => void;
}

const RADIUS = 9;

const OFFICE_BOUNDS = {
  minX: -12,
  maxX: 12,
  minZ: -8,
  maxZ: 8,
};

export default function Scene({ agents, selectedAgentId, onSelectAgent }: SceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 12, 18], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <Sky sunPosition={[100, 20, 100]} />
        <Lights />
        <Floor />
        <Walls />

        {agents.map((agent, i) => {
          const angle = (i / agents.length) * 2 * Math.PI;
          const x = RADIUS * Math.cos(angle);
          const z = RADIUS * Math.sin(angle);
          // Rotate desk to face center
          const rotation = -angle + Math.PI;

          return (
            <group key={agent.config.id}>
              <AgentDesk
                agent={agent}
                position={[x, 0, z]}
                rotation={rotation}
                onClick={() => onSelectAgent(agent)}
                isSelected={selectedAgentId === agent.config.id}
              />
              <MovingAvatar
                agent={agent}
                initialPosition={[x, 0, z]}
                officeBounds={OFFICE_BOUNDS}
              />
            </group>
          );
        })}

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          maxPolarAngle={Math.PI / 2.1}
          minDistance={5}
          maxDistance={30}
        />
      </Suspense>
    </Canvas>
  );
}
