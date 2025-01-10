import { $ } from "bun";

type ReleaseType = "major" | "minor" | "patch";

function getVersionAsNumber(version: string) {
  const [major, minor, patch] = version.split(".").map((n) => parseInt(n));
  return major * 100_000 + minor * 1000 + patch;
}

/**
 * Call as `bun run release.ts <minor|major|patch|{version}>`
 */
async function release() {
  // All packages
  const packages = ["core", "server", "client", "react"];
  console.log(`Releasing packages: ${packages.join(", ")}`);

  // List all package JSON paths
  const packageJsons = [
    "./package.json",
    ...packages.map((p) => `./packages/${p}/package.json`),
  ].map((p) => Bun.file(p));

  // Versions from all package JSONs
  const versions = await Promise.all(
    packageJsons.map(async (file) => {
      const json = await file.json();
      return json.version as `${number}.${number}.${number}`;
    })
  );

  // Get version as maximum version across all package JSON's (they should be synced)
  const version = versions.reduce(
    (max, v) => (getVersionAsNumber(v) > getVersionAsNumber(max) ? v : max),
    versions[0]
  );
  console.log(`Current version: ${version}`);

  // Get release type or version
  const release = (() => {
    const v = process.argv[2];

    if (!v) {
      console.error(`No version specified. Must be version literal, major, minor or patch.`);
      process.exit(0);
    }

    // Version literal
    if (v.match(/^\d+\.\d+\.\d+$/)) {
      return {
        type: "version",
        value: v,
      };
    }

    // Shorthands
    if (v === "major") return { type: "release", value: "major" };
    if (v === "minor") return { type: "release", value: "minor" };
    if (v === "patch") return { type: "release", value: "patch" };

    console.error(
      `Invalid version specified: ${process.argv[2]}. Must be version literal, major, minor or patch.`
    );
    process.exit(0);
  })();

  console.log(`Release type: ${release.type} ${release.value}`);

  // Increment version
  const nextVersion = () => {
    // Use version literal
    if (release.type === "version") return release.value;

    // Use release type
    const [major, minor, patch] = version.split(".").map((n) => parseInt(n));
    switch (release.value) {
      case "major":
        return `${major + 1}.0.0`;
      case "minor":
        return `${major}.${minor + 1}.0`;
      case "patch":
        return `${major}.${minor}.${patch + 1}`;
    }
  };

  console.log(`Bumping version to ${nextVersion()}`);

  // Rewrite all versions
  await Promise.all(
    packageJsons.map(async (file) => {
      const json = await file.json();
      json.version = nextVersion();
      await Bun.write(file, JSON.stringify(json, null, 2));
    })
  );

  // Build
  await $`bun run build`;

  // Run `npm publish` for every package
  for (const pkg of packages) {
    await $`cd packages/${pkg} && npm publish`;
  }
}

release();
