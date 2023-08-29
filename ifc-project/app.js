import {IfcAPI} from "../node_modules/web-ifc/web-ifc-api.js";
const ifcFileLocation = "./rac_advanced_sample_project.ifc"; // dont forget to modify for your ifc filename
let modelID = 0;
const ifcapi = new IfcAPI();
ifcapi.SetWasmPath("./wasm/"); //only if the wasm file are note at the same level as app.js

/**
 * resolve a Uint8Array().
 * 
 * @param string url location of your ifc file
 * @returns {Promise}
 */
const url = "./rac_advanced_sample_project.ifc";
function getIfcFile(url) {
    return new Promise((resolve, reject) => {
        var oReq = new XMLHttpRequest();
        oReq.responseType = "arraybuffer";
        oReq.addEventListener("load", () => {
            resolve(new Uint8Array(oReq.response));
        });
        oReq.open("GET", url);
        oReq.send();
    });
}

ifcapi.Init().then(()=>{
    getIfcFile(ifcFileLocation).then((ifcData) => {
      modelID = ifcapi.OpenModel(ifcData);
      let isModelOpened = ifcapi.IsModelOpen(modelID);
      console.log({isModelOpened});
      ifcapi.CloseModel(modelID);
    });
  });