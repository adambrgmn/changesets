export const getPackages = () => {
  return {
    isRoot: false,
    root: { dir: "/", packageJson: { name: "root-pkg", version: "0.0.0" } },
    packages: [
      {
        dir: "package-a",
        packageJson: { name: "package-a", version: "0.0.0" }
      },
      {
        dir: "package-b",
        packageJson: { name: "package-b", version: "0.0.0" }
      },
      {
        dir: "package-c",
        packageJson: { name: "package-c", version: "0.0.0" }
      }
    ]
  };
};
