# HeroDevs Packages

This is a repo where HeroDevs develop and test our public packages.
To see the source for each public npm package, head into the
`projects` folder and see each project.

#### Publishing a new package

To add a new package to be published, do the following:

1. Use the CLI to add the new package.
2. Modify the `tsconfig.json` to account for the new package and it's mock-npm status in this repo. See the `path` section in `tsconfig.json`.
3. Add a build and package step into the `package.json` so that it can be built.
4. Add a way in the main app for package to be tested and used.
5. Build and package your project into the `dist` directory.
6. The first time you publish it, you will need to cd into the dist folder and run `npm publish --access public`. After the first time, you can simply run `npm publish` from the `dist/<package>` folder.

If you have any access errors when publishing, request to be added to the HeroDevs team on npm.
