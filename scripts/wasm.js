const wasmMemory = new WebAssembly.Memory({ initial: 256, maximum: 256 });
const wasmTable = new WebAssembly.Table({ initial: 1, maximum: 1, element: 'anyfunc' });

const asmLibraryArg = { 
  "__handle_stack_overflow": () => {},
  "emscripten_resize_heap": () => {},
  "__lock": () => {}, 
  "__unlock": () => {},
  "memory": wasmMemory, 
  "table": wasmTable 
};

const wasmInfo = { 'env': asmLibraryArg, 'wasi_snapshot_preview1': asmLibraryArg };

async function loadWasm(filePath = 'main.wasm') {
  try {
    const response = await fetch(filePath);
    const bytes    = await response.arrayBuffer();
    const wasmObj  = await WebAssembly.instantiate(bytes, wasmInfo);
    return wasmObj.instance.exports;
  } catch (error) {
    console.error('Error loading WASM:', error);
    return null;
  }
}

(async () => {
  const href = window.location.href;
  const production = href.includes('github.io');

  if(production) {
    window.wasmExports = await loadWasm('https://ernanej.github.io/wasm-calculator/build/arithmetic.wasm');
  }else{
    window.wasmExports = await loadWasm('../build/arithmetic.wasm');
  }
})();
