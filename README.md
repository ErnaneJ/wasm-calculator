**WebAssembly Calculator - _study_**

A simple web calculator application using WebAssembly for basic mathematical operations. Utilizing C and JavaScript to create a tool capable of performing addition, multiplication, division, and subtraction.

![preview](./assets/preview.png)

### Introduction to WebAssembly (WASM)

WebAssembly (WASM) is a revolutionary binary instruction format designed to serve as a portable compilation target for high-level programming languages such as C, C++, and Rust. It was developed with the aim of enabling these languages to be efficiently executed within web browsers.

Unlike traditional scripting languages like JavaScript, which are interpreted by browsers, WebAssembly is compiled ahead of time and can be executed quickly and efficiently by browsers. This means that web applications, like the one in this repository, can run code written in languages such as C or Rust with near-native performance.

WebAssembly doesn't replace JavaScript but complements it. It can be used alongside JavaScript, allowing developers to choose the right tool for the right job. This flexibility opens up new possibilities for web development, enabling the creation of more complex and high-performance applications directly in the browser.

### How WebAssembly Works in this Project

In this project, the main focus is on efficiently implementing basic mathematical operations in a calculator application. While the project may seem simple at first glance, its primary purpose is to demonstrate how to work together with C and JavaScript in a web application. In this context, JavaScript acts as a handler, capturing user input data and providing it to the functions developed in C which, after execution and return, are displayed in the developed interface. These are C functions that are compiled/built into a .wasm file. This .wasm file, when loaded, can be easily used within the context of JavaScript as an object that serves the developed functions, as in this example:

```js
wasmExports.add(x, y);      // => x + y;
wasmExports.subtract(x, y); // => x - y;
wasmExports.multiply(x, y); // => x * y;
wasmExports.divide(x, y);   // => x / y;
```

For this specific application, optimization is not an immediate need. However, in more critical scenarios, the combination of different languages can be a powerful choice for developing fast and efficient applications. By using WebAssembly to perform critical operations, we ensure not only fast execution but also a smooth and responsive experience.

WebAssembly allows the integration of code written in languages such as C, C++, and Rust directly into our web application. This empowers our application to perform complex operations efficiently and reliably, regardless of the platform or device used by the user. In summary, WebAssembly plays a crucial role by providing a highly optimized execution environment for the essential functionalities of our application, which in this case is a simple web calculator.

### Loading the Binary into the JavaScript Context

The file [wasm.js](./scripts/wasm.js) is responsible for loading the compiled C binary of WebAssembly (`arithmetic.wasm`) and making its exported functions available for use within the JavaScript environment. Let's analyze the code in detail:

```javascript
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
```

- `wasmMemory` and `wasmTable`: Define WebAssembly memory and table objects for use by the WebAssembly instance.
- `asmLibraryArg`: Defines an object containing functions required by the WebAssembly module. These functions handle stack overflow, heap resizing, and memory locking/unlocking.
  - `__handle_stack_overflow`, `emscripten_resize_heap`, `__lock`, `__unlock`: Are empty functions, for our case, handling specific memory and stack manipulation situations as required by the Emscripten environment.
  - `memory`: Represents the WebAssembly memory object, allowing the module to access and manipulate memory.
  - `table`: Represents the WebAssembly function table, which is used to export and import functions between the WebAssembly module and the JavaScript environment.
- `wasmInfo`: Defines an object specifying environment settings for WebAssembly instantiation. Here, it sets two specific configurations:
  - `'env'`: Defines the WebAssembly execution environment, where `asmLibraryArg` is passed as an argument. This allows the WebAssembly module to access the functions and environment variables defined in `asmLibraryArg`.
  - `'wasi_snapshot_preview1'`: Defines the WASI (WebAssembly System Interface) execution environment, a specification that provides a standard set of APIs for interacting with the operating system from a WebAssembly module. In this case, `asmLibraryArg` is again passed as an argument.

```javascript
async function loadWasm(filePath) {
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
```

- `loadWasm`: An asynchronous function responsible for loading the WebAssembly binary file (`arithmetic.wasm` by default) using the Fetch API, instantiating it with the provided environment settings (`wasmInfo`), and returning its exported functions.
  - Uses the fetch function to make an HTTP request to the specified path (filePath) and awaits the response (response) from the server.
  - Awaits the conversion of the response into a byte buffer using the `arrayBuffer()` method of the response, which contains the raw data of the WebAssembly file and stores it in the `bytes` constant.
  - Uses the `WebAssembly.instantiate()` function to instantiate the WebAssembly module from the loaded bytes and environment information (`wasmInfo`). This results in an object containing the instance of the WebAssembly module. This object is then returned from the function as it contains the functions exported by the WebAssembly module, allowing these functions to be used within the JavaScript environment.

```javascript
(async () => {
  const href = window.location.href;
  const production = href.includes('github.io');

  if(production) {
    window.wasmExports = await loadWasm('https://ernanej.github.io/wasm-calculator/build/arithmetic.wasm');
  } else {
    window.wasmExports = await loadWasm('../build/arithmetic.wasm');
  }
})();
```

- `Immediately Invoked Async Function Block`: This code snippet checks if the application is running in a production environment. Depending on the context, it loads the appropriate WebAssembly binary using the `loadWasm` function and stores its exported functions in the `window.wasmExports` object for later use. Although it has chosen to expose everything directly on the window as it is an extremely simple application, this practice is optional.

### Explanation of C Code

The C code exclusively implements basic mathematical operations (addition, multiplication, division, and subtraction), with all functions marked with `EM

SCRIPTEN_KEEPALIVE`, allowing them to be exported to JavaScript and used in the web application. The complete code can be found in [`arithmetic.c`](./src/arithmetic.c).

```c
#include <emscripten.h>

EMSCRIPTEN_KEEPALIVE
float add(float x, float y);

EMSCRIPTEN_KEEPALIVE
float multiply(float x, float y);

EMSCRIPTEN_KEEPALIVE
float subtract(float x, float y);

EMSCRIPTEN_KEEPALIVE
float divide(float x, float y);
```

- `#include <emscripten.h>`: This header file provides necessary functions and macros for Emscripten-specific features. It is crucial for functions marked with `EMSCRIPTEN_KEEPALIVE` to be correctly exported and accessible from JavaScript.

The use of `emscripten.h` is essential to ensure interoperability between C and JavaScript code, allowing functions defined in C to be called and used in the JavaScript environment within the web application. This facilitates the integration of C code with the rest of the web application, leveraging the functionalities and optimizations offered by Emscripten to compile C code to WebAssembly.

### Compilation of WebAssembly Binary

The WebAssembly binary (`arithmetic.wasm`) used in this project was compiled using the [Emscripten compilation tool](https://emscripten.org/docs/getting_started/index.html). To build the binary, the following command was used (example):

```bash
emcc ./src/arithmetic.c -o ./build/arithmetic.html
```

This command compiles the C source code (`arithmetic.c`) and generates the corresponding WebAssembly binary (`arithmetic.wasm`), along with necessary auxiliary files.

[`Emscripten`](https://emscripten.org/docs/tools_reference/emcc.html) is a powerful tool that allows compiling C/C++ code to WebAssembly, leveraging advanced optimization and code generation features of LLVM. The compilation process generates not only the WebAssembly binary but also auxiliary files such as header and JavaScript files, which are useful for integrating WebAssembly code into a web application.
