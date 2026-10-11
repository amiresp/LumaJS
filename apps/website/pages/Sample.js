export function renderSample(host){host.replaceChildren();const h=host.ownerDocument.createElement("h1");h.textContent="Feature page";host.append(h);return {destroy(){host.replaceChildren();}};}
