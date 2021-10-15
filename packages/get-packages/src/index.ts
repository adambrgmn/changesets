import fs from "fs-extra";
import path from "path";
import resolveFrom from "resolve-from";
import {
  GetPackages,
  GetPackagesContext,
  ChangesetPackage
} from "@changesets/types";
import { getPackages as manyPkgGetPackages } from "@manypkg/get-packages";

export const getPackages: GetPackages = async context => {
  const packages = await manyPkgGetPackages(context.cwd);

  if (packages.tool === "root") {
    return [{ isRoot: true, ...packages.root }];
  }

  return packages.packages.map(pkg => ({ isRoot: false, ...pkg }));
};

export const callGetPackages = async (
  cwd: string,
  command: GetPackagesContext["command"]
): Promise<ChangesetPackage[]> => {
  let changesetDir = path.join(cwd, ".changeset");
  let json = await fs.readJSON(path.join(changesetDir, "config.json"));

  let getPackagesFunction: GetPackages;
  if (typeof json.getPackages === "string") {
    let modulePath = resolveFrom(changesetDir, json.getPackages);
    let mod = require(modulePath);

    if (typeof mod.getPackages !== "function") {
      throw new Error(
        "getPackages was configured in .changeset/config.json. But the required module does not export a function named `getPackages`"
      );
    }

    getPackagesFunction = mod.getPackages;
  } else {
    getPackagesFunction = getPackages;
  }

  let context: GetPackagesContext = {
    cwd,
    command
  };

  return getPackagesFunction(context);
};
