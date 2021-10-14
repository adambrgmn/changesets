import globby from "globby";
import fs from "fs-extra";
import path from "path";
import { getPackages, Package, Packages } from "@manypkg/get-packages";

export async function findPackages(
  cwd: string = process.cwd(),
  glob?: string
): Promise<Packages> {
  let { packages, tool, root } = await getPackages(cwd);
  if (glob == null) return { packages, tool, root };

  const directories = await globby(glob, {
    cwd,
    onlyDirectories: true,
    absolute: true,
    expandDirectories: false,
    ignore: ["**/node_modules"]
  });

  let customPackages: Package[] = [];

  for (let dir of directories.sort()) {
    try {
      let packageJson = await fs.readJSON(path.join(dir, "package.json"));
      customPackages.push({ packageJson, dir });
    } catch (error) {
      if ((error as any).code === "ENOENT") continue;
      throw error;
    }
  }

  return { packages: customPackages, tool: "yarn", root: root };
}
