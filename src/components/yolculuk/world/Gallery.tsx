"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";

import { GALLERY, PAL } from "~/components/yolculuk/layout";
import { useDrive } from "~/components/yolculuk/store";
import { Billboard } from "~/components/yolculuk/world/Billboard";
import { useLabelVisible } from "~/components/yolculuk/world/parts";
import {
  PostsReading,
  PostsSummary,
  ProjectReading,
  ProjectSummary,
} from "~/components/yolculuk/world/BoardContent";
import {
  exhibitSpots,
  GALLERY_COLORS,
  POSTS_BOARD,
} from "~/components/yolculuk/zones";
import type { PostView } from "~/lib/posts";
import type { ProjectView } from "~/lib/projects";

/** pedestal, two posts and a pair of spot lamps under a board */
function Stand({ color }: { color: string }) {
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[3.6, 0.3, 1.6]} position={[0, 0.3, 0]} />
        <CuboidCollider args={[0.3, 1.8, 0.3]} position={[-2.2, 1.8, 0.45]} />
        <CuboidCollider args={[0.3, 1.8, 0.3]} position={[2.2, 1.8, 0.45]} />
      </RigidBody>
      <RoundedBox
        args={[7.2, 0.6, 3.2]}
        radius={0.2}
        smoothness={3}
        position={[0, 0.3, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#f4ead8" />
      </RoundedBox>
      <RoundedBox
        args={[7.4, 0.14, 3.4]}
        radius={0.06}
        position={[0, 0.62, 0]}
        receiveShadow
      >
        <meshStandardMaterial color={color} />
      </RoundedBox>
      {/* posts stand behind the board, so they never cross the text */}
      {[-2.2, 2.2].map((px) => (
        <RoundedBox
          key={px}
          args={[0.5, 3.6, 0.5]}
          radius={0.18}
          position={[px, 1.8, 0.45]}
          castShadow
        >
          <meshStandardMaterial color={PAL.ink} />
        </RoundedBox>
      ))}
      {[-2.4, 2.4].map((px) => (
        <mesh key={px} position={[px, 0.82, -1.2]}>
          <sphereGeometry args={[0.2, 10, 8]} />
          <meshStandardMaterial
            color="#fff6c2"
            emissive="#ffe27a"
            emissiveIntensity={1.4}
          />
        </mesh>
      ))}
    </>
  );
}

function Exhibit({
  project,
  x,
  z,
  rot,
}: {
  project: ProjectView;
  x: number;
  z: number;
  rot: number;
}) {
  const color = GALLERY_COLORS[project.gradient] ?? PAL.sun;
  return (
    <Billboard
      id={`project:${project.slug}`}
      pose={{ x, z, rot }}
      color={color}
      summary={<ProjectSummary project={project} color={color} />}
      reading={({ portrait }) => (
        <ProjectReading project={project} color={color} portrait={portrait} />
      )}
    >
      <Stand color={color} />
    </Billboard>
  );
}

function Arch() {
  const z = GALLERY.z + 14;
  const label = useLabelVisible(GALLERY.x, z, 60);
  return (
    <group position={[GALLERY.x, 0, z]}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.5, 3.5, 0.5]} position={[-6, 3.5, 0]} />
        <CuboidCollider args={[0.5, 3.5, 0.5]} position={[6, 3.5, 0]} />
      </RigidBody>
      {[-6, 6].map((px) => (
        <group key={px} position={[px, 0, 0]}>
          <RoundedBox
            args={[1.1, 7, 1.1]}
            radius={0.35}
            position={[0, 3.5, 0]}
            castShadow
          >
            <meshStandardMaterial color={PAL.pink} />
          </RoundedBox>
          <mesh position={[0, 7.6, 0]} castShadow>
            <sphereGeometry args={[0.7, 16, 12]} />
            <meshStandardMaterial color={PAL.sun} />
          </mesh>
        </group>
      ))}
      <RoundedBox
        args={[13.6, 1.7, 0.8]}
        radius={0.3}
        position={[0, 7.4, 0]}
        castShadow
      >
        <meshStandardMaterial color={PAL.ink} />
      </RoundedBox>
      {label && (
        <Html
          position={[0, 7.4, -0.45]}
          rotation={[0, Math.PI, 0]}
          transform
          distanceFactor={6}
          zIndexRange={[10, 0]}
        >
          <span className="font-pop pointer-events-none text-[44px] font-extrabold whitespace-nowrap text-[#FFC93C] select-none">
            PROJE SERGİSİ ✦
          </span>
        </Html>
      )}
    </group>
  );
}

export function Gallery({ projects }: { projects: ProjectView[] }) {
  const spots = exhibitSpots(projects.length, GALLERY.x, GALLERY.z);
  const rows = Math.ceil(projects.length / 7);
  const depth = 26 + (rows - 1) * 18;
  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[GALLERY.x, 0.016, GALLERY.z - 14 + depth / 2]}
        receiveShadow
      >
        <planeGeometry
          args={[Math.max(40, Math.min(projects.length, 7) * 12 + 10), depth]}
        />
        <meshStandardMaterial color={PAL.plaza} roughness={1} />
      </mesh>
      <Arch />
      {projects.map((p, i) => (
        <Exhibit
          key={p.slug}
          project={p}
          x={spots[i]!.x}
          z={spots[i]!.z}
          rot={spots[i]!.rot}
        />
      ))}
    </>
  );
}

/** the cork board in front of the kiosk, where the posts hang */
export function PostBoard({ posts }: { posts: PostView[] }) {
  const selected = useDrive((s) =>
    s.reading?.board === "posts" ? (s.reading.post ?? null) : null,
  );
  return (
    <Billboard
      id="posts"
      pose={POSTS_BOARD}
      color="#9a6a3f"
      face="#d39a5e"
      summary={<PostsSummary posts={posts} />}
      reading={({ portrait }) => (
        <PostsReading posts={posts} portrait={portrait} selected={selected} />
      )}
    >
      <Stand color={PAL.sky2} />
    </Billboard>
  );
}
