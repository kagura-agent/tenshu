import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Vector3 } from "three";
import VoxelAvatar from "./VoxelAvatar";
import type { Agent } from "@tenshu/shared";

interface MovingAvatarProps {
  agent: Agent;
  /** Deterministic initial position (e.g. desk position) */
  initialPosition: [number, number, number];
  officeBounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
}

export default function MovingAvatar({ agent, initialPosition, officeBounds }: MovingAvatarProps) {
  const groupRef = useRef<Group>(null);
  const [mounted, setMounted] = useState(false);

  // Deterministic initial position from prop (avoids hydration mismatch)
  const [initPos] = useState(() => new Vector3(initialPosition[0], 0.6, initialPosition[2]));
  const [targetPos, setTargetPos] = useState(initPos);
  const currentPos = useRef(initPos.clone());

  // Defer randomization to useEffect
  useEffect(() => {
    const x = Math.random() * (officeBounds.maxX - officeBounds.minX - 2) + officeBounds.minX + 1;
    const z = Math.random() * (officeBounds.maxZ - officeBounds.minZ - 2) + officeBounds.minZ + 1;
    const pos = new Vector3(x, 0.6, z);
    currentPos.current.copy(pos);
    setTargetPos(pos);
    setMounted(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Change target periodically based on status
  useEffect(() => {
    if (!mounted) return;

    const status = agent.state?.status ?? "idle";

    const getInterval = () => {
      switch (status) {
        case "idle": return 3000 + Math.random() * 3000;
        case "working": return 8000 + Math.random() * 7000;
        case "thinking": return 15000 + Math.random() * 10000;
        case "error": return 30000;
        default: return 10000;
      }
    };

    const getNewTarget = () => {
      const x = Math.random() * (officeBounds.maxX - officeBounds.minX) + officeBounds.minX;
      const z = Math.random() * (officeBounds.maxZ - officeBounds.minZ) + officeBounds.minZ;
      setTargetPos(new Vector3(x, 0.6, z));
    };

    const timeout = setTimeout(getNewTarget, 1000);
    const interval = setInterval(getNewTarget, getInterval());

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [agent.state?.status, mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Smooth movement
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const status = agent.state?.status ?? "idle";
    const speed = status === "idle" ? 1.5 : 0.8;
    const moveSpeed = delta * speed;

    const newPos = currentPos.current.clone().lerp(targetPos, moveSpeed);
    currentPos.current.copy(newPos);
    groupRef.current.position.copy(currentPos.current);

    // Rotate toward movement direction
    const direction = new Vector3().subVectors(targetPos, currentPos.current);
    if (direction.length() > 0.1) {
      groupRef.current.rotation.y = Math.atan2(direction.x, direction.z);
    }
  });

  const status = agent.state?.status ?? "idle";

  return (
    <group ref={groupRef} scale={3}>
      <VoxelAvatar
        color={agent.color}
        emoji={agent.emoji}
        position={[0, 0, 0]}
        isWorking={status === "working"}
        isThinking={status === "thinking"}
        isError={status === "error"}
      />
    </group>
  );
}
