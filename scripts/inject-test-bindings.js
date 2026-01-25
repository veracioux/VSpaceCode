const fs = require("fs");

// Read the test bindings template
const testBindings = JSON.parse(
    fs.readFileSync("./test-bindings.json", "utf8")
);

// Read package.json
const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

// Navigate to vspacecode.bindings
const vspacecodeBindings =
    packageJson.contributes.configuration[0].properties["vspacecode.bindings"]
        .default;

// Find the Major mode binding (key "m")
const majorBinding = vspacecodeBindings.find((b) => b.key === "m");
if (!majorBinding || !majorBinding.bindings) {
    console.error("Could not find Major mode binding (key 'm')");
    process.exit(1);
}

// Find all languageId entries in the conditional bindings
const languageBindings = majorBinding.bindings.filter((b) =>
    b.key.startsWith("languageId:")
);

console.log(`Found ${languageBindings.length} language bindings`);

// Process each language binding
let modifiedCount = 0;
for (const langBinding of languageBindings) {
    if (!langBinding.bindings) {
        console.log(`Skipping ${langBinding.key}: no bindings array`);
        continue;
    }

    // Deep copy the test bindings to avoid reference issues
    const testBindingsCopy = JSON.parse(JSON.stringify(testBindings));

    // Find existing "t" binding index
    const existingIndex = langBinding.bindings.findIndex((b) => b.key === "t");

    if (existingIndex >= 0) {
        // Replace existing binding
        langBinding.bindings[existingIndex] = testBindingsCopy;
        console.log(`Replaced +Test binding in ${langBinding.key}`);
    } else {
        // Add new binding
        langBinding.bindings.push(testBindingsCopy);
        console.log(`Added +Test binding to ${langBinding.key}`);
    }
    modifiedCount++;
}

console.log(`Modified ${modifiedCount} language bindings`);

// Write the updated package.json
fs.writeFileSync(
    "./package.json",
    JSON.stringify(packageJson, null, "\t") + "\n"
);

console.log("Successfully updated package.json");
