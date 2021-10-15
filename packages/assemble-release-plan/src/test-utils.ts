import {
  NewChangeset,
  Release,
  VersionType,
  ChangesetPackage,
  ChangesetPackages
} from "@changesets/types";

function getPackage({
  name,
  version
}: {
  name: string;
  version: string;
}): ChangesetPackage {
  return {
    packageJson: {
      name,
      version
    },
    dir: "this-shouldn't-matter"
  };
}

function getChangeset(
  data: {
    id?: string;
    summary?: string;
    releases?: Array<Release>;
  } = {}
): NewChangeset {
  let id = data.id || "strange-words-combine";
  let summary = data.summary || "base summary whatever";
  let releases = data.releases || [];
  return {
    id,
    summary,
    releases
  };
}

function getRelease({
  name,
  type
}: {
  name: string;
  type: VersionType;
}): Release {
  return { name, type };
}

let getSimpleSetup = () => ({
  packages: {
    root: {
      packageJson: {
        name: "root",
        version: "0.0.0"
      },
      dir: "/"
    },
    packages: [getPackage({ name: "pkg-a", version: "1.0.0" })],
    isRoot: false
  },
  changesets: [
    getChangeset({ releases: [getRelease({ name: "pkg-a", type: "patch" })] })
  ]
});

class FakeFullState {
  packages: ChangesetPackages;
  changesets: NewChangeset[];

  constructor(custom?: {
    packages?: ChangesetPackages;
    changesets?: NewChangeset[];
  }) {
    let { packages, changesets } = { ...getSimpleSetup(), ...custom };
    this.packages = packages;
    this.changesets = changesets;
  }

  addChangeset(
    data: {
      id?: string;
      summary?: string;
      releases?: Array<Release>;
    } = {}
  ) {
    let changeset = getChangeset(data);
    if (this.changesets.find(c => c.id === changeset.id)) {
      throw new Error(
        `tried to add a second changeset with same id: ${changeset.id}`
      );
    }
    this.changesets.push(changeset);
  }

  updateDependency(pkgA: string, pkgB: string, versionRange: string) {
    let pkg = this.packages.packages.find(a => a.packageJson.name === pkgA);
    if (!pkg) throw new Error(`No "${pkgA}" package`);
    if (!pkg.packageJson.dependencies) {
      pkg.packageJson.dependencies = {};
    }
    pkg.packageJson.dependencies[pkgB] = versionRange;
  }
  updateDevDependency(pkgA: string, pkgB: string, versionRange: string) {
    let pkg = this.packages.packages.find(a => a.packageJson.name === pkgA);
    if (!pkg) throw new Error(`No "${pkgA}" package`);
    if (!pkg.packageJson.devDependencies) {
      pkg.packageJson.devDependencies = {};
    }
    pkg.packageJson.devDependencies[pkgB] = versionRange;
  }
  updatePeerDependency(pkgA: string, pkgB: string, versionRange: string) {
    let pkg = this.packages.packages.find(a => a.packageJson.name === pkgA);
    if (!pkg) throw new Error(`No "${pkgA}" package`);
    if (!pkg.packageJson.peerDependencies) {
      pkg.packageJson.peerDependencies = {};
    }
    pkg.packageJson.peerDependencies[pkgB] = versionRange;
  }

  addPackage(name: string, version: string) {
    let pkg = getPackage({ name, version });
    if (
      this.packages.packages.find(
        c => c.packageJson.name === pkg.packageJson.name
      )
    ) {
      throw new Error(
        `tried to add a second package with same name': ${pkg.packageJson.name}`
      );
    }
    this.packages.packages.push(pkg);
  }
  updatePackage(name: string, version: string) {
    let pkg = this.packages.packages.find(c => c.packageJson.name === name);
    if (!pkg) {
      throw new Error(
        `could not update package ${name} because it doesn't exist - try addWorskpace`
      );
    }
    pkg.packageJson.version = version;
  }
}

export default FakeFullState;
