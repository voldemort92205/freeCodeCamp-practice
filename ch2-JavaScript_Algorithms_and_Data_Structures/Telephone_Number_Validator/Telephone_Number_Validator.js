function telephoneCheck(str) {
    let phoneReg = /^[1]?[-\ ]?(\([0-9]{3}\)|[0-9]{3})[-\ ]?[0-9]{3}[-\ ]?[0-9]{4}$/;
    let output = phoneReg.test(str)
    return output;
}
  
telephoneCheck("555-5555");