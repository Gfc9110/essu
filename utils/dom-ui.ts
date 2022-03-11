export default function (data: {
  [key: string]: { label: string; type: string; startValue?: string};
}) {
  const container = document.querySelector("#controlli-bloom");
  const out = {};

  Object.keys(data).forEach((varName) => {

    const element = container.appendChild(document.createElement("div"));
    element.className = "ui-input";
    const label = document.createElement("label");
    label.textContent = data[varName].label;
    element.appendChild(label);
    const span = document.createElement("span");
    span.textContent = "0";
    element.appendChild(span);
    const input = document.createElement("input");

    input.type = data[varName].type;

    let toLabel = (x: any) => x;
    let toValue = (x: any) => x;

    switch (input.type) {
      case "range":
        toLabel = (stringValue: string) => parseFloat(stringValue).toFixed(2);
        toValue = (stringValue: string) => parseFloat(stringValue);
        input.min = "-100";
        input.max = "100";
        input.step = "0.5";
        input.value = data[varName].startValue || "0";        
        break;
      case "color":
        input.value = data[varName].startValue || "#000000";
        break;
    }

    
    out[varName] = toValue(input.value);
    span.textContent = toLabel(input.value);

    input.addEventListener("input", (event) => {
      const value = (event.target as HTMLInputElement).value;
      out[varName] = toValue(value);
      span.textContent = toLabel(value);
    });
    element.appendChild(input);
  });
  return out;
}
