
function evaluateOperation(operation){
  const parts = operation.split(/\s*([-+*/])\s*/).filter(Boolean);

  if (parts.length % 2 === 0) return { status: false, msg: "Error" };

  operation = parseFloat(parts[0]);

  for (let i = 1; i < parts.length; i += 2) {
    const operator = parts[i];
    const operand = parseFloat(parts[i + 1]);

    if (isNaN(operand) || !'+-*/'.includes(operator)) return { status: false, msg: "Error" };

    switch (operator) {
      case '+':
        operation = window.wasmExports.add(operation, operand);
        break;
      case '-':
        operation = window.wasmExports.subtract(operation, operand);
        break;
      case '*':
        operation = window.wasmExports.multiply(operation, operand);
        break;
      case '/':
        operation = window.wasmExports.divide(operation, operand);
        if(isNaN(operation) || operation === Infinity || operation === -Infinity){
          return { status: false, msg: "Error" };
        }
        break;
    }
  }

  return {status: true, msg: operation.toFixed(9).replace(/\.?0+$/, '')};
  
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('inputBox');
  const buttons = document.querySelectorAll('button');
  
  Array.from(buttons).forEach(button => {
    button.addEventListener('click', (e) =>{
      if (e.target.innerHTML == '=') {
        const { status, msg: result } = evaluateOperation(input.value);
        
        if(status) input.value = operation = result;

        input.value = result;
      } else if(e.target.innerHTML == 'AC'){
        input.value = "";
      } else if(e.target.innerHTML == 'DEL'){
        input.value = input.value.substring(0, input.value.length-1);
      } else{
        input.value += e.target.innerHTML;
        input.value = input.value.replace(/([-+*/])+/g, '$1');
        if(isNaN(parseFloat(input.value.charAt(0)))){
          input.value = '0' + input.value;
        }
      };
    });
  });

  input.addEventListener('keyup', (e) => {
    e.target.value = e.target.value.replace(/[^0-9+\-*/]/g, '');
  });

  document.addEventListener('keydown', (e) => {
    e.key === 'Enter' ? document.querySelector('button.equalBtn').click() : null;
  });
});