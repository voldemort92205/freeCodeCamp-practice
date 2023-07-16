function rot13(str) {
    const alphaReg = /[A-Z]/
    const shift13 = (char) => {
      return String.fromCharCode((char.charCodeAt(0) - 65 + 13) % 26 + 65)
    }
    let output = str.split('').map((char) => {
      if (alphaReg.test(char)) {
        return shift13(char)
      } else {
        return char
      }
    }).join('');
  
    return output;
  }
  
  rot13("SERR PBQR PNZC");