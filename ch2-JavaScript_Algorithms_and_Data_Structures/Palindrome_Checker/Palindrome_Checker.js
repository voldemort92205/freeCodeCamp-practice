function palindrome(str) {
    let tmp = str.toLowerCase();
    let i = 0, j = tmp.length-1;
    let alphanumericReg = /[a-z0-9]/;
  
    while (i < j) {
      if (!alphanumericReg.test(tmp[i])) {
        i ++
      } else if (!alphanumericReg.test(tmp[j])) {
        j--
      } else {
        if (tmp[i] != tmp[j]) {
          return false
        } else {
          i++;
          j--;
        }
      }
    }
    return true;
  }
  
  console.log(palindrome("0_0 (: /-\ :) 0-0"))