import Client, { connect } from "@dagger.io/dagger"

 // initialize Dagger client
connect(async (client: Client) => {

  // Set Node versions against which to test and build
  const nodeVersions = ["12", "14", "16"]

  // get reference to the local project
  const source = await client.host().workdir(["node_modules/"]).id();

  // for each Node version
  for (const nodeVersion of nodeVersions) {

    // get Node image
    const node = await client
      .container()
      .from(`node:${nodeVersion}`)
      .id()

    // mount cloned repository into Node image
    const runner = client
      .container(node.id)
      .withMountedDirectory("/src", source.id)
      .withWorkdir("/src")
      .exec(["npm", "install"])

    // run tests
    await runner
      .exec(["npm", "test", "--", "--watchAll=false"])
      .exitCode()

    // build application using specified Node version
    // write the build output to the host
    await runner
      .exec(["npm", "run", "build"])
      .directory("build/")
      .export(`./build-node-${nodeVersion}`)
  }
});