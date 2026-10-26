import { modules } from "./modules/manifest.js";

const moduleSelect = document.querySelector("#moduleSelect");
const moduleForm = document.querySelector("#moduleForm");
const dynamicFields = document.querySelector("#dynamicFields");
const runButton = document.querySelector("#runButton");
const moduleOutput = document.querySelector("#moduleOutput");
const status = document.querySelector("#status");

function setStatus(message) {
    status.textContent = message;
}

function renderFields(module) {
    dynamicFields.replaceChildren();

    for (const field of module.metadata.fields) {
        const wrapper = document.createElement("div");
        const id = `field-${field.name}`;

        if (field.type === "checkbox") {
            wrapper.className = "checkbox-field";
            const input = document.createElement("input");
            input.type = "checkbox";
            input.id = id;
            input.name = field.name;
            input.checked = Boolean(field.default);
            input.required = Boolean(field.required);

            const label = document.createElement("label");
            label.htmlFor = id;
            label.textContent = field.label;
            wrapper.append(input, label);
        } else {
            const label = document.createElement("label");
            label.htmlFor = id;
            label.textContent = field.label;

            let input;
            if (field.type === "select") {
                input = document.createElement("select");
                for (const option of field.options) {
                    const optionElement = document.createElement("option");
                    optionElement.value = option.value;
                    optionElement.textContent = option.label;
                    input.append(optionElement);
                }
                if (field.default !== undefined) {
                    input.value = field.default;
                }
            } else if (field.type === "text") {
                input = document.createElement("input");
                input.type = "text";
                input.placeholder = field.placeholder ?? "";
                input.value = field.default ?? "";
            } else {
                throw new Error(`Unsupported field type "${field.type}".`);
            }

            input.id = id;
            input.name = field.name;
            input.required = Boolean(field.required);
            wrapper.append(label, input);
        }

        dynamicFields.append(wrapper);
    }
}

function selectedModule() {
    return modules.find((module) => module.metadata.id === moduleSelect.value);
}

moduleSelect.replaceChildren();
for (const module of modules) {
    const option = document.createElement("option");
    option.value = module.metadata.id;
    option.textContent = module.metadata.name;
    moduleSelect.append(option);
}

if (modules.length === 0) {
    moduleSelect.disabled = true;
    runButton.disabled = true;
    setStatus("No generators are registered.");
} else {
    moduleSelect.disabled = false;
    try {
        renderFields(modules[0]);
        runButton.disabled = false;
        setStatus("Ready.");
    } catch (error) {
        runButton.disabled = true;
        setStatus(error instanceof Error ? error.message : String(error));
    }
}

moduleSelect.addEventListener("change", () => {
    const module = selectedModule();
    if (!module) {
        runButton.disabled = true;
        dynamicFields.replaceChildren();
        setStatus("The selected generator is unavailable.");
        return;
    }

    try {
        renderFields(module);
        moduleOutput.value = "";
        runButton.disabled = false;
        setStatus("Ready.");
    } catch (error) {
        runButton.disabled = true;
        setStatus(error instanceof Error ? error.message : String(error));
    }
});

moduleForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const module = selectedModule();
    if (!module) {
        setStatus("The selected generator is unavailable.");
        return;
    }

    const values = module.metadata.fields.map((field) => {
        const control = moduleForm.elements.namedItem(field.name);
        return field.type === "checkbox" ? control.checked : control.value;
    });

    runButton.disabled = true;
    setStatus("Running generation...");

    try {
        const result = await module.interfaced(...values);
        moduleOutput.value = String(result ?? "");
        setStatus("Generation completed.");
    } catch (error) {
        moduleOutput.value = "";
        setStatus(`Module failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        runButton.disabled = false;
    }
});
