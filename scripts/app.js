let txtInput, spanOutput;
document.addEventListener('DOMContentLoaded', () => {
  txtInput = document.querySelector('#txtInput');
  spanOutput = document.querySelector('#spanOutput');
});

let arg1 = 0;
let arg2 = 0;
let hasArg2 = false;
let operation = '';

function setArgument(target) {
  console.log(target);
  const value = parseFloat(target.value);
  txtInput.value += value.toString();

  if (!hasArg2) {
    arg1 = parseFloat(txtInput.value);
    updateOutput();
  } else {
    arg2 = parseFloat(txtInput.value);
    updateOutput();
  }
}

function setOperation(target) {
  operation = target.value;
  hasArg2 = true;
  txtInput.value = '';
  updateOutput();
}

function getResult() {
  let result = 0;
  switch (operation) {
    case '+':
      result = wasmExports.add(arg1, arg2);
      break;
    case '-':
      result = wasmExports.subtract(arg1, arg2);
      break;
    case '*':
      result = wasmExports.multiply(arg1, arg2);
      break;
    case '/':
      result = wasmExports.divide(arg1, arg2);
      break;
  }
  arg1 = result;
  hasArg2 = false;
  txtInput.value = result;
  updateOutput();
}

function clearAll() {
  arg1 = arg2 = 0;
  operation = '';
  hasArg2 = false;
  txtInput.value = '';
  spanOutput.innerHTML = '';
}

function updateOutput() {
  if (!hasArg2) {
    spanOutput.innerHTML = arg1 + ' ' + operation;
  } else {
    spanOutput.innerHTML = arg1 + ' ' + operation + ' ' + arg2;
  }
}
