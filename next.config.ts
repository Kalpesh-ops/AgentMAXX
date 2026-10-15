import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Strict typing is verified via 'npm run typecheck' (tsc --noEmit)
    // Avoids Windows V8 worker Zone Allocation Out-Of-Memory during internal child process
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
