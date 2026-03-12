import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Box } from "@react-three/drei";
import type { Mesh } from "three";
import type { Agent } from "@tenshu/shared";
import { STATUS_COLORS } from "@tenshu/shared";
import VoxelChair from "./VoxelChair";
import VoxelKeyboard from "./VoxelKeyboard";
import VoxelMacMini from "./VoxelMacMini";

interface AgentDeskProps {
  agent: Agent;
  position: [number, number, number];
  rotation: number;
  onClick: () => void;
  isSelected: boolean;
}

export default function AgentDesk({ agent, position, rotation, onClick, isSelected }: AgentDeskProps) {
  const monitorRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const status = agent.state?.status ?? "offline";
  const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.offline;

  // Pulsing animation for thinking state
  useFrame((frameState) => {
    if (monitorRef.current && status === "thinking") {
      monitorRef.current.scale.setScalar(1 + Math.sin(frameState.clock.elapsedTime * 2) * 0.05);
    }
  });

  const getMonitorEmissive = () => {
    switch (status) {
      case "working": return "#15803d";
      case "thinking": return "#1e40af";
      case "error": return "#991b1b";
      default: return "#374151";
    }
  };

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Desk surface */}
      <Box
        args={[2, 0.1, 1.5]}
        position={[0, 0.75, 0]}
        castShadow
        receiveShadow
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={hovered || isSelected ? agent.color : "#8B4513"}
          emissive={hovered || isSelected ? agent.color : "#000000"}
          emissiveIntensity={hovered || isSelected ? 0.2 : 0}
        />
      </Box>

      {/* Monitor */}
      <Box
        ref={monitorRef}
        args={[1.2, 0.8, 0.05]}
        position={[0, 1.5, -0.5]}
        castShadow
        onClick={onClick}
      >
        <meshStandardMaterial
          color={statusColor}
          emissive={getMonitorEmissive()}
          emissiveIntensity={status === "idle" || status === "offline" ? 0.1 : 0.5}
        />
      </Box>

      {/* Monitor stand */}
      <Box args={[0.1, 0.4, 0.1]} position={[0, 1, -0.5]} castShadow>
        <meshStandardMaterial color="#2d2d2d" />
      </Box>

      {/* Keyboard */}
      <VoxelKeyboard position={[0, 0.81, 0.2]} />

      {/* Mac mini */}
      <VoxelMacMini position={[0.5, 0.825, -0.5]} />

      {/* Chair */}
      <group scale={2}>
        <VoxelChair position={[0, 0, 0.9]} rotation={[0, Math.PI, 0]} color="#1f2937" />
      </group>

      {/* Nameplate */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {agent.emoji} {agent.config.name}
      </Text>

      {/* Status text */}
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.1}
        color={statusColor}
        anchorX="center"
        anchorY="middle"
      >
        {status.toUpperCase()}
        {agent.state?.model ? ` \u2022 ${agent.state.model}` : ""}
      </Text>

      {/* Desk legs */}
      {[-0.8, 0.8].map((x, i) =>
        [-0.6, 0.6].map((z, j) => (
          <Box key={`leg-${i}-${j}`} args={[0.05, 0.7, 0.05]} position={[x, 0.35, z]} castShadow>
            <meshStandardMaterial color="#5d4037" />
          </Box>
        ))
      )}

      {/* Selection glow */}
      {isSelected && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.5, 32]} />
          <meshBasicMaterial color={agent.color} transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}
