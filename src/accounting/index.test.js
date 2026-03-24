const {
  formatCurrency,
  parseAmount,
  readBalance,
  creditAmount,
  debitAmount,
  resetBalance,
  dataProgram,
} = require('./index');

describe('Accounting Node.js app business logic', () => {
  beforeEach(() => {
    resetBalance(1000_00);
  });

  test('TC-001: view initial balance is 1000.00', () => {
    expect(readBalance()).toBe(1000_00);
    expect(formatCurrency(readBalance())).toBe('1000.00');
  });

  test('TC-002: credit 500 then view 1500.00', () => {
    const newBalance = creditAmount(500_00);
    expect(newBalance).toBe(1500_00);
    expect(formatCurrency(readBalance())).toBe('1500.00');
  });

  test('TC-003: debit 200 with sufficient funds leaves 800.00', () => {
    const result = debitAmount(200_00);
    expect(result.success).toBe(true);
    expect(result.balance).toBe(800_00);
    expect(formatCurrency(readBalance())).toBe('800.00');
  });

  test('TC-004: debit 2000 with insufficient funds does not change balance', () => {
    const result = debitAmount(2000_00);
    expect(result.success).toBe(false);
    expect(result.balance).toBe(1000_00);
    expect(formatCurrency(readBalance())).toBe('1000.00');
  });

  test('TC-005: invalid amount parsing returns NaN for non-numeric', () => {
    expect(Number.isNaN(parseAmount('abc'))).toBe(true);
    expect(Number.isNaN(parseAmount('-1'))).toBe(true);
    expect(Number.isNaN(parseAmount(''))).toBe(true);
  });

  test('TC-007: sequence credit 100 then debit 50 then view 1050.00 then 1000.00 (reset)', () => {
    creditAmount(100_00);
    const debitRes = debitAmount(50_00);
    expect(debitRes.success).toBe(true);
    expect(formatCurrency(readBalance())).toBe('1050.00');

    // simulate new run with reset balance that starts from 1000, stateful in COBOL main
    resetBalance(1000_00);
    expect(formatCurrency(readBalance())).toBe('1000.00');
  });

  test('TC-008: no write on insufficient debit for starting 500.00', () => {
    resetBalance(500_00);
    const result = debitAmount(600_00);
    expect(result.success).toBe(false);
    expect(readBalance()).toBe(500_00);
  });

  test('dataProgram read and write mirror expected behavior', () => {
    expect(dataProgram('READ')).toBe(1000_00);
    dataProgram('WRITE', 777_00);
    expect(dataProgram('READ')).toBe(777_00);
  });
});
