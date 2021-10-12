const { pool } = require('./config/dbconnection')
const messageData = require('./messageData')
const defaultRet = {
  buyList: { success: false, list: null },
  sellList: { success: false, list: null },
  txList: { success: false, list: null },
  success: true,
  chartdata: [],
}




async function totalAsset(conn, data) {
  let ret = {
    success: false,
    myAsset: 0,
    lockedAsset: 0,
    availableAsset: 0,
    myCoin: 0,
    lockedCoin: 0,
    availableCoin: 0
  }
  const myAsset = await calcMyAsset(conn, data);
  const LockedAsset = await calcLockAsset(conn, data);
  const availableAsset = myAsset - LockedAsset;
  const myCoin = await calcMyCoin(conn, data);
  const LockedCoin = await calcLockCoin(conn, data);
  const availableCoin = myCoin - LockedCoin;
  ret.myAsset = myAsset;
  ret.lockedAsset = LockedAsset;
  ret.availableAsset = availableAsset;
  ret.myCoin = myCoin.coin;
  ret.lockedCoin = LockedCoin;
  ret.availableCoin = availableCoin;
  if (availableCoin != null && availableAsset != null) {
    ret.success = true;
  }
  return ret;
}








async function getBuyList() {
  let ret = { ...defaultRet };
  let connection;
  try {
    connection = await pool.getConnection(async conn => conn);
    try {
      const buyListSql = `
        SELECT price,sum(leftover) AS leftover 
        FROM order_list 
        WHERE order_type=0 AND leftover>0
        GROUP BY price
        ORDER BY price DESC
        LIMIT 5;
        `
      const temp = await connection.execute(buyListSql, []);
      ret.buyList.success = true;
      ret.buyList.list = temp[0];
    } catch (error) {
      console.log('Query Error');
      console.log(error)
      ret.buyList = messageData.errorMessage(error)
    }
  } catch (error) {
    console.log('DB Error')
    console.log(error)
    ret.buyList = messageData.errorMessage(error);
  } finally {
    connection.release();
  }
  return ret;
}



async function getSellList() {
  let ret = { ...defaultRet };
  let connection;
  try {
    connection = await pool.getConnection(async conn => conn);
    try {
      const sellListSql = `
        SELECT price,sum(leftover) AS leftover 
        FROM order_list 
        WHERE order_type=1 AND leftover>0
        GROUP BY price
        ORDER BY price ASC
        LIMIT 5;
        `
      const temp = await connection.execute(sellListSql, []);
      ret.sellList.success = true;
      ret.sellList.list = temp[0].reverse();
    } catch (error) {
      console.log('Query Error');
      console.log(error)
      ret.sellList = messageData.errorMessage(error)
    }
  } catch (error) {
    console.log('DB Error')
    console.log(error)
    ret.sellList = messageData.errorMessage(error);
  } finally {
    connection.release();
  }
  return ret;
}


async function getTransactionList(n) {
  let ret = { ...defaultRet };
  let connection;
  try {
    connection = await pool.getConnection(async conn => conn);
    try {
      const transactionListSql = `
        SELECT  *
        FROM transaction
        ORDER BY id DESC
        LIMIT ${n};
        `
      const temp = await connection.execute(transactionListSql, []);
      temp[0].forEach((v, i) => {
        temp[0][i].tx_date = temp[0][i].tx_date.toLocaleString();
      })
      ret.txList.success = true;
      ret.txList.list = temp[0];
    } catch (error) {
      console.log('Query Error');
      console.log(error)
      ret.txList = messageData.errorMessage(error)
    }
  } catch (error) {
    console.log('DB Error')
    console.log(error)
    ret.txList = messageData.errorMessage(error);
  } finally {
    connection.release();
  }
  return ret;
}

///고가 저가 시가 종가 뽑는 것도 만들어야되나? 
// 그건 내일 api 명세 보고 결정. 


async function getResult(n) {  //return array
  let ret = {
    ...defaultRet
  };
  let connection;
  try {
    connection = await pool.getConnection(async conn => conn);
    try {

      const buyListSql = `
      SELECT price,sum(leftover) AS leftover 
      FROM order_list 
      WHERE order_type=0 AND leftover>0
      GROUP BY price
      ORDER BY price DESC
      LIMIT 5;
      `
      const [buytemp] = await connection.execute(buyListSql, []);
      ret.buyList.success = true;
      ret.buyList.list = buytemp;


      const sellListSql = `
        SELECT price,sum(leftover) AS leftover 
        FROM order_list 
        WHERE order_type=1 AND leftover>0
        GROUP BY price
        ORDER BY price ASC
        LIMIT 5;
        `
      const [selltemp] = await connection.execute(sellListSql, []);
      ret.sellList.success = true;
      ret.sellList.list = selltemp.reverse();

      // //가짜 트랜잭션 데이터 
      // await makeTxTemp(connection);


      if (n == 0) {
        const allTxSql = `
        SELECT *
        FROM transaction 
        ORDER BY tx_date;
        `
        const [temp] = await connection.execute(allTxSql, []);
        if (temp.length == 0) {

        } else {

          //x: time, y: [0:open, 1:high, 2:low, 3:close]
          let result = [{ x: temp[0].tx_date, y: [temp[0].price, temp[0].price, temp[0].price, temp[0].price] }];
          let cnt = 1;
          while (cnt < temp.length) {
            let preData = result[result.length - 1];
            const now = new Date(temp[cnt].tx_date);
            preTime = new Date(preData.x)
            if (compareTime(preTime, now) == true) {
              preData.y[3] = temp[cnt].price; //종가는 가장 마지막 거래니까 들어올때마다 갱신
              if (preData.y[1] == null || preData.y[1] < temp[cnt].price) {
                preData.y[1] = temp[cnt].price;
              }
              if (preData.y[2] == null || preData.y[2] > temp[cnt].price) {
                preData.y[2] = temp[cnt].price;
              }
              cnt++;
            } else {
              const newDate = new Date(preTime).setMinutes(preTime.getMinutes() + 1);
              const open = preData.y[3] != null ? preData.y[3] : preData.y[0];
              result.push({ x: new Date(newDate), y: [open, null, null, null] })
            }
          }
          ret.chartdata = result;

        }
        ret.txList.success = true;
        ret.txList.list = temp;
      } else {
        let transactionListSql = `
        SELECT  *
        FROM transaction
        ORDER BY tx_date DESC
        LIMIT ${n};
        `
        const [txtemp] = await connection.execute(transactionListSql, []);
        ret.txList.success = true;
        ret.txList.list = txtemp.reverse();
      }

      ret.txList.list.forEach((v, i) => {
        ret.txList.list[i].tx_date = new Date(v.tx_date).toLocaleString();
      })

    } catch (error) {
      console.log('Query Error');
      console.log(error)
      ret = messageData.errorMessage(error)
    }
  } catch (error) {
    console.log('DB Error')
    console.log(error)
    ret = messageData.errorMessage(error);
  } finally {
    connection.release();
  }
  return ret;
}


async function calcMyAsset(conn, user_idx) {
  const assetSql = `SELECT SUM(input)-SUM(output) as asset from asset WHERE user_idx = ?`
  const assetParams = [user_idx]
  const [[myAsset]] = await conn.execute(assetSql, assetParams)
  return +myAsset.asset;
}

async function calcLockAsset(conn, user_idx) {
  const BuyOrderSql = `SELECT leftover,price FROM order_list WHERE user_idx = ?  AND order_type = 0 AND del=0;`;
  const BuyOrderParams = [user_idx];
  const [preBuyOrder] = await conn.execute(BuyOrderSql, BuyOrderParams)
  const LockedAsset = preBuyOrder.reduce((r, v) => { return r + (v.leftover * v.price) }, 0);
  return LockedAsset;
}


async function calcMyCoin(conn, user_idx) {
  const hasCoinSql = `SELECT SUM(c_input)-SUM(c_output) as coin from coin WHERE user_idx = ?`
  const hasCoinParams = [user_idx];
  const [[myCoin]] = await conn.execute(hasCoinSql, hasCoinParams)
  return +myCoin.coin
}


async function calcLockCoin(conn, user_idx) {

  const SellOrderSql = `SELECT SUM(leftover) as leftover FROM order_list WHERE user_idx = ? AND order_type = 1 AND del=0`;
  const SellOrderParams = [user_idx];
  const [[preSellOrder]] = await conn.execute(SellOrderSql, SellOrderParams);
  const LockedCoin = +preSellOrder.leftover;
  return LockedCoin;
}






function compareTime(pre, now) {
  const preDate = new Date(pre);
  const nowDate = new Date(now);

  if (preDate.getFullYear() == nowDate.getFullYear()
    && preDate.getMonth() == nowDate.getMonth()
    && preDate.getDate() == nowDate.getDate()
    && preDate.getHours() == nowDate.getHours()
    && preDate.getMinutes() == nowDate.getMinutes()
  ) {

    return true;
  }
  return false;
}



async function makeTxTemp(conn) {

  const sql = `INSERT INTO transaction (sell_orderid,sell_amount,sell_commission,buy_orderid,buy_amount,buy_commission,price,tx_date) VALUES(1,100,100,2,200,100,?,?)`
  let now = new Date();
  for (let i = 0; i < 25; i++) {
    let newDate = (new Date().setMinutes(now.getMinutes() - 50 + i));
    for (let j = 0; j < 5; j++) {
      let random = Math.random() * 1000;
      let finalDate = new Date(newDate);
      let params = [random, finalDate];
      const [temp] = await conn.execute(sql, params);
    }
  }
}




module.exports = {
  getResult,
  getBuyList,
  getSellList,
  getTransactionList,
  calcMyAsset,
  calcMyCoin,
  calcLockAsset,
  calcLockCoin,
  totalAsset
}