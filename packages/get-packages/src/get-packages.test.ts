import path from "path";
import fs from "fs";
import { promisify } from "util";
import { callGetPackages } from ".";

const readdir = promisify(fs.readdir);

let readJSON = jest.fn();
function mockReadJSON(...args: any[]) {
  return readJSON(...args);
}

jest.mock("fs-extra", () => ({ readJSON: mockReadJSON }));

beforeEach(readJSON.mockReset);

// The root of this repository
const cwd = path.join(__dirname, "../../../");

const expectPackage = expect.objectContaining({
  dir: expect.any(String),
  packageJson: expect.objectContaining({
    name: expect.any(String),
    version: expect.any(String)
  })
});

describe("callGetPackages", () => {
  it("calls default getPackages function if no other config is provided", async () => {
    readJSON.mockResolvedValueOnce({});

    let result = await callGetPackages(cwd, "add");

    expect(result.isRoot).toBeFalsy();
    expect(result.root).toEqual(expectPackage);
    expect(result.packages.length).toBeGreaterThan(0);
    expect(result.packages).toEqual(expect.arrayContaining([expectPackage]));

    let actualPackages = await readdir(path.join(cwd, "packages"));
    expect(result.packages.map(pkg => path.basename(pkg.dir))).toEqual(
      actualPackages
    );
  });

  it("calls a getPackages export from specified module if `getPackages` option is defined in .changeset/config.json", async () => {
    readJSON.mockResolvedValueOnce({
      getPackages: path.relative(
        path.join(cwd, ".changeset"),
        path.join(__dirname, "fake-get-packages.js")
      )
    });

    let result = await callGetPackages(cwd, "add");
    expect(result.isRoot).toBeFalsy();
    expect(result.root).toEqual({
      dir: "/",
      packageJson: { name: "root-pkg", version: "0.0.0" }
    });

    expect(result.packages).toHaveLength(3);
    expect(result.packages[0]).toEqual({
      dir: "package-a",
      packageJson: { name: "package-a", version: "0.0.0" }
    });
  });
});
