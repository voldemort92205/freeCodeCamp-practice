var currencyType = [
    {type: "ONE HUNDRED", val: 100},
    {type: "TWENTY", val: 20},
    {type: "TEN", val: 10},
    {type: "FIVE", val: 5},
    {type: "ONE", val: 1},
    {type: "QUARTER", val: 0.25},
    {type: "DIME", val: 0.1},
    {type: "NICKEL", val: 0.05},
    {type: "PENNY", val: 0.01},
  ]
  
  function checkCashRegister(price, cash, cid) {
    let output = {status: null, change: []}
    let change = cash - price
    let currentCash = cid.reduce (function(accu, item) {
      accu["total"] += item[1]
      accu[item[0]] = item[1]
      return accu;
    }, {"total": 0});
  
    
    if (currentCash["total"] == change) {
      output["status"] = "CLOSED";
      output["change"] = cid
      return output
    } else if (currentCash["total"] < change) {
      output["status"] = "INSUFFICIENT_FUNDS";
      return output
    }
  
    let payCash = currencyType.reduce ((accu, item) => {
      if (currentCash[item["type"]] > 0) {
        // have some money for this type of currency
        let minAmount = (change >= currentCash[item["type"]])
                            ? currentCash[item["type"]]: change;
        let nCoin = Math.floor(minAmount / item["val"])
        if (nCoin > 0) {
          let paidAmount = nCoin * item["val"]
          change = Math.round((change-paidAmount)*100)/100;
          accu.push ([item["type"], paidAmount])
        }
      }
      return accu;
    }, [])
  
    if (change > 0 || payCash.length == 0) {
      output["status"] = "INSUFFICIENT_FUNDS"
      return output
    }
  
    output["status"] = "OPEN"
    output["change"] = payCash;
  
    return output;
  }
  
  //checkCashRegister(19.5, 20, [["PENNY", 1.01], ["NICKEL", 2.05], ["DIME", 3.1], ["QUARTER", 4.25], ["ONE", 90], ["FIVE", 55], ["TEN", 20], ["TWENTY", 60], ["ONE HUNDRED", 100]]);
  
  checkCashRegister(3.26, 100, [["PENNY", 1.01], ["NICKEL", 2.05], ["DIME", 3.1], ["QUARTER", 4.25], ["ONE", 90], ["FIVE", 55], ["TEN", 20], ["TWENTY", 60], ["ONE HUNDRED", 100]])
  
  
  
  // checkCashRegister(3.26, 100, [["PENNY", 1.01], ["NICKEL", 2.05], ["DIME", 3.1], ["QUARTER", 4.25], ["ONE", 90], ["FIVE", 55], ["TEN", 20], ["TWENTY", 60], ["ONE HUNDRED", 100]]) should return 
  // {status: "OPEN", change: [["TWENTY", 60], ["TEN", 20], ["FIVE", 15], ["ONE", 1], ["QUARTER", 0.5], ["DIME", 0.2], ["PENNY", 0.04]]}