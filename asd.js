//가라데이터 삽입//
let getNow = new Date().getTime()  // 현재시간
let newTime =  getNow - 1*1000*30
let newnewTime = new Date(newTime)
function getRandomPrice(a){
    let output
    if(a<300){
        while(true){
            output = Math.floor(Math.random()*500)
            if(output>200 && output<=300){
                return output
            } 
        }
    } else if(a>=300 && a< 400){
        while(true){
            output = Math.floor(Math.random()*500)
            if(output>300 && output<=430){
                return output
            } 
        }
    } else{
        while(true){
            output = Math.floor(Math.random()*500)
            if(output>430 && output<=500){
                return output
            } 
        }
    }
}


function getRandomAmount(){
    let output
    while(true){
        output = Math.floor(Math.random()*10)
        if(output>1){
            return output
        }
    }
}

async function everyThirtySec(){
    for(let i = 0; i<500; i++){
        let newTime =  getNow - i*1000*30
        let newnewTime = new Date(newTime)
        let convertedTime = newnewTime
        let amount = getRandomAmount()
        let sql = `INSERT INTO transaction 
                   (sell_orderid,sell_amount,sell_commission,buy_orderid,buy_amount,buy_commission,price,txid, tx_date, coin_id)
                   VALUES (?,?, 10, ?, ?, 10, ?, ?, ?, 1);`
        const [result] = await connection.execute(sql, [i+1, amount, i+501, amount, getRandomPrice(i), i+1, convertedTime])
    }
}
everyThirtySec()