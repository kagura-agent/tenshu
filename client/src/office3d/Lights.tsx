export default function Lights() {
  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.3} />

      {/* Main directional light */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Central point light */}
      <pointLight position={[0, 4, 0]} intensity={0.5} color="#FFCC00" />

      {/* Hemisphere light for soft fill */}
      <hemisphereLight args={["#87CEEB", "#2d3748", 0.3]} />
    </>
  );
}
