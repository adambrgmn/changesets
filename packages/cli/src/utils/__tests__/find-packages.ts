import { join } from "path";
import { findPackages } from "../find-packages";

describe("Util findPackages", () => {
  it("finds packages when passed a custom glob", async () => {
    let result = await findPackages(
      join(__dirname, "../../../../../"),
      "packages/changelog-*"
    );

    expect(result.packages.map(pkg => pkg.packageJson.name)).toEqual([
      "@changesets/changelog-git",
      "@changesets/changelog-github"
    ]);
  });
});
