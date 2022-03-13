export default function (data: {
  [key: string]: {
    label: string;
    type: string;
    startValue?: string;
    min?: string;
    max?: string;
    step?: string;
  };
}) {
  const container = document.querySelector("#controlli");
  const out = {};
  // @ts-ignore
  const params = { scene: window.queryParams.scene };

  const openPresetButton = document.createElement("a");
  openPresetButton.textContent = "Crea Preset";
  openPresetButton.href = "/";
  openPresetButton.target = "_blank";
  openPresetButton.id = "createPresetButton";



  container.classList.add("hidden");
  
  document.addEventListener("keydown", function(e) {
    
    var keyCode = e.code;
    
    if(keyCode == "KeyK"){
      
      container.classList.toggle("hidden");

    }

  });
  /*
  //Nasconde ui se parametro "ui-hide" è settato
  if(window.queryParams['ui-hide']) {
    container.style.display = "none";
  }
  */
  

  function updateButton() {
    const parameters = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      parameters.set(key, params[key]);
    });
    openPresetButton.href = "/?" + parameters.toString();
  }

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
        input.min = data[varName].min || "-100";
        input.max = data[varName].max || "100";
        input.step = data[varName].step || "0.1";
        // @ts-ignore
        params[varName] = input.value = window.queryParams[varName] || data[varName].startValue || "0";
        break;
      case "color":
        // @ts-ignore
        params[varName] = input.value = window.queryParams[varName] || data[varName].startValue || "#000000";
        break;
    }

    out[varName] = toValue(input.value);
    span.textContent = toLabel(input.value);

    updateButton();

    input.addEventListener("input", (event) => {
      const value = (params[varName] = (
        event.target as HTMLInputElement
      ).value);
      out[varName] = toValue(value);
      span.textContent = toLabel(value);
      updateButton();
    });
    element.appendChild(input);
  });
  container.appendChild(openPresetButton);


  return out;
}
