import fs from "fs-extra";
import path from "path";
import { ChangesetPackage, GetPackages } from "@changesets/types";
import { getPackages as manyGetPackages } from "@manypkg/get-packages";

export const getPackages: GetPackages = async ctx => {
  let { root } = await manyGetPackages(ctx.cwd);

  let publishable = await getPublishableProjects(root.dir);
  let configs = await getProjectConfigs(publishable, root.dir);
  let packages = await getNxPackages(
    configs,
    root.dir,
    ctx.command === "publish"
  );

  return { isRoot: false, root, packages };
};

async function getPublishableProjects(cwd: string): Promise<string[]> {
  let nxPath = path.join(cwd, "nx.json");
  let nx = await fs.readJSON(nxPath);

  let publishable: string[] = [];

  for (let project of Object.keys(nx.projects)) {
    if (nx.projects[project].tags?.includes("publishable")) {
      publishable.push(project);
    }
  }

  return publishable;
}

async function getProjectConfigs(
  publishable: string[],
  cwd: string
): Promise<Record<string, any>[]> {
  let workspacePath = path.join(cwd, "workspace.json");
  let workspace = await fs.readJSON(workspacePath);

  let configs: Record<string, any>[] = [];

  for (let project of Object.keys(workspace.projects)) {
    if (publishable.includes(project)) {
      configs.push(workspace.projects[project]);
    }
  }

  return configs;
}

async function getNxPackages(
  configs: Record<string, any>[],
  cwd: string,
  readDist: boolean
) {
  let packages: ChangesetPackage[] = [];

  for (let config of configs) {
    let { source, dist } = parseConfig(config);

    let dir = path.join(cwd, readDist ? dist : source);
    let packageJson = await fs.readJSON(path.join(dir, "package.json"));

    packages.push({ dir, packageJson });
  }

  return packages;
}

function parseConfig(
  original: Record<string, any>
): { source: string; dist: string } {
  let source: string;
  let dist: string;

  if (typeof original.root !== "string") {
    throw new Error(`NX Project config is lacking a root prop.`);
  } else {
    source = original.root;
  }

  if (typeof original.targets?.build?.options?.outputPath !== "string") {
    throw new Error(
      "NX libraries should have a build target with an outputPath options"
    );
  } else {
    dist = original.targets.build.options.outputPath;
  }

  return { source, dist };
}
