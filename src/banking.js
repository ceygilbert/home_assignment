const accounts = {};
const interestRules = [];

const processTransaction = (input) => {
    const [date, account, type, amount] = input.split(" ");
    if (!date || !account || !type || isNaN(amount) || amount <= 0) return "Invalid transaction format.";

    if (!accounts[account]) accounts[account] = [];
    const transactions = accounts[account];

    if (type.toUpperCase() === "W" && getBalance(account, date) < amount) return "Insufficient balance.";

    const txnId = `${date}-${String(transactions.length + 1).padStart(2, "0")}`;
    transactions.push({ date, txnId, type: type.toUpperCase(), amount: parseFloat(amount) });
    return `Transaction recorded: ${txnId}`;
};

const processInterestRule = (input) => {
    const [date, ruleId, rate] = input.split(" ");
    if (!date || !ruleId || isNaN(rate) || rate <= 0 || rate >= 100) return "Invalid interest rule format.";
    
    interestRules.push({ date, ruleId, rate: parseFloat(rate) / 100 });
    interestRules.sort((a, b) => a.date.localeCompare(b.date));
    return "Interest rule recorded.";
};

const calculateInterestAndStatement = (account, yearMonth) => {
    if (!accounts[account]) return "Account not found.";

    let transactions = accounts[account];

    let initialBalance = transactions
        .filter(txn => txn.date < `${yearMonth}01`)
        .reduce((sum, txn) => sum + (txn.type === "D" ? txn.amount : -txn.amount), 0);

    transactions = transactions.filter(txn => txn.date.startsWith(yearMonth));
    if (transactions.length === 0) return "No transactions for this period.";

    let balance = initialBalance;
    let interestAccrued = 0;
    let interestPeriods = [];
    let interestTxnId = `${yearMonth}30-99`;

    let currentStart = `${yearMonth}01`;
    let currentRate = getInterestRate(currentStart);
    let currentRuleId = getInterestRuleId(currentStart);

    for (let day = 1; day <= 30; day++) {
        const date = `${yearMonth}${String(day).padStart(2, "0")}`;
    
        // Get end-of-day balance before applying transactions
        const eodBalance = balance;
    
        const newRate = getInterestRate(date);
        const newRuleId = getInterestRuleId(date);
    
        // If the rate changes or a withdrawal occurs, calculate interest before change
        if (day === 30 || transactions.some(txn => txn.date === date && txn.type === "W") || newRate !== currentRate) {
            const numDays = parseInt(date.slice(-2)) - parseInt(currentStart.slice(-2)) + 1;
            const interestForPeriod = (eodBalance * currentRate * numDays) / 365;  // Use EOD balance
            interestAccrued += interestForPeriod;
    
            interestPeriods.push({ period: `${currentStart} - ${date}`, days: numDays, balance: eodBalance, rateId: currentRuleId, rate: currentRate, interestForPeriod });
    
            currentStart = `${yearMonth}${String(day + 1).padStart(2, "0")}`;
            currentRate = newRate;
            currentRuleId = newRuleId;
        }
    
        transactions
            .filter(txn => txn.date === date)
            .forEach(txn => {
                balance += txn.type === "D" ? txn.amount : -txn.amount;
            });
    }
    

    // Round final interest
    interestAccrued = parseFloat(interestAccrued.toFixed(2));

    // Apply interest as a transaction on the last day of the month
    accounts[account].push({ date: `${yearMonth}30`, txnId: '', type: "I", amount: interestAccrued });

    return formatStatement(account, yearMonth, initialBalance);
};

const formatStatement = (account, yearMonth, initialBalance) => {
    if (!accounts[account]) return "Account not found.";

    const transactions = accounts[account].filter(txn => txn.date.startsWith(yearMonth));
    if (transactions.length === 0) return "No transactions available.";

    let balance = initialBalance;
    let output = `📜 Account Statement - ${account}\n`;
    output += "| Date     | Txn Id      | Type | Amount | Balance |\n";

    transactions.forEach(txn => {
        balance += txn.type === "D" ? txn.amount : txn.type === "W" ? -txn.amount : txn.amount;
        output += `| ${txn.date} | ${txn.txnId.padEnd(10)} | ${txn.type}   | ${txn.amount.toFixed(2).padStart(6)} | ${balance.toFixed(2).padStart(7)} |\n`;
    });

    return output;
};

const getBalance = (account, date) => {
    if (!accounts[account]) return 0;
    return accounts[account]
        .filter(txn => txn.date < date)
        .reduce((sum, txn) => sum + (txn.type === "D" ? txn.amount : -txn.amount), 0);
};

const getInterestRuleId = (date) => {
    let applicableRuleId = "";
    for (const rule of interestRules) {
        if (rule.date <= date) applicableRuleId = rule.ruleId;
        else break;
    }
    return applicableRuleId;
};

const getInterestRate = (date) => {
    let applicableRate = 0;
    for (const rule of interestRules) {
        if (rule.date <= date) applicableRate = rule.rate;
        else break;
    }
    return applicableRate;
};


module.exports = { processTransaction, processInterestRule, calculateInterestAndStatement, formatStatement };
