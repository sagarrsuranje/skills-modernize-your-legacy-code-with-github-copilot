const readline = require('readline');

// In-memory data store (cents) for data integrity and precision.
let storageBalanceCents = 1000_00; // 1000.00 initially

function formatCurrency(cents) {
  return (cents / 100).toFixed(2);
}

function parseAmount(input) {
  const cleaned = input.trim();
  if (cleaned.length === 0) return NaN;

  // support 123, 123.4, 123.45
  const num = Number(cleaned);
  if (Number.isNaN(num) || num < 0) return NaN;

  // maintain cents and avoid FP error
  return Math.round(num * 100);
}

function readBalance() {
  return dataProgram('READ');
}

function writeBalance(balanceCents) {
  return dataProgram('WRITE', balanceCents);
}

function creditAmount(amountCents) {
  const current = readBalance();
  const next = current + amountCents;
  writeBalance(next);
  return next;
}

function debitAmount(amountCents) {
  const current = readBalance();
  if (current >= amountCents) {
    const next = current - amountCents;
    writeBalance(next);
    return { success: true, balance: next };
  }
  return { success: false, balance: current, error: 'Insufficient funds' };
}

function dataProgram(operationType, balanceCents) {
  // mimics COBOL DataProgram read/write operations
  if (operationType === 'READ') {
    return storageBalanceCents;
  }
  if (operationType === 'WRITE') {
    storageBalanceCents = balanceCents;
    return storageBalanceCents;
  }
  throw new Error(`Unknown DataProgram operation: ${operationType}`);
}

async function operations(operationType, rl) {
  // mimics COBOL Operations program
  if (operationType === 'TOTAL') {
    const current = dataProgram('READ');
    console.log(`Current balance: ${formatCurrency(current)}`);
    return;
  }

  const raw = await new Promise((resolve) => rl.question(`Enter ${operationType.toLowerCase()} amount: `, resolve));
  const amountCents = parseAmount(raw);

  if (Number.isNaN(amountCents)) {
    console.log('Invalid amount entered. Please try again with a positive numeric value.');
    return;
  }

  const currentBalance = dataProgram('READ');

  if (operationType === 'CREDIT') {
    const newBalance = currentBalance + amountCents;
    dataProgram('WRITE', newBalance);
    console.log(`Amount credited. New balance: ${formatCurrency(newBalance)}`);
    return;
  }

  if (operationType === 'DEBIT') {
    if (currentBalance >= amountCents) {
      const newBalance = currentBalance - amountCents;
      dataProgram('WRITE', newBalance);
      console.log(`Amount debited. New balance: ${formatCurrency(newBalance)}`);
    } else {
      console.log('Insufficient funds for this debit.');
    }
    return;
  }

  console.log('Unsupported operation: ' + operationType);
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  let continueFlag = true;

  while (continueFlag) {
    console.log('--------------------------------');
    console.log('Account Management System');
    console.log('1. View Balance');
    console.log('2. Credit Account');
    console.log('3. Debit Account');
    console.log('4. Exit');
    console.log('--------------------------------');

    const input = await new Promise((resolve) => rl.question('Enter your choice (1-4): ', resolve));
    const choice = input.trim();

    switch (choice) {
      case '1':
        await operations('TOTAL', rl);
        break;
      case '2':
        await operations('CREDIT', rl);
        break;
      case '3':
        await operations('DEBIT', rl);
        break;
      case '4':
        continueFlag = false;
        break;
      default:
        console.log('Invalid choice, please select 1-4.');
        break;
    }

    if (continueFlag) {
      console.log('');
    }
  }

  console.log('Exiting the program. Goodbye!');
  rl.close();
}

function resetBalance(cents = 1000_00) {
  storageBalanceCents = cents;
}

module.exports = {
  formatCurrency,
  parseAmount,
  readBalance,
  writeBalance,
  creditAmount,
  debitAmount,
  dataProgram,
  resetBalance,
  operations,
  main,
};

if (require.main === module) {
  main().catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
}
