// This script hides the map attribution when served locally improving screenshot testing precission.
if (document.URL.includes('file')) {
    const styleElement = document.createElement('style');
    styleElement.innerText = `.mapboxgl-ctrl.mapboxgl-ctrl-attrib {  display: none; }`;
    document.head.appendChild(styleElement);
}
