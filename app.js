const STORAGE_KEY = "tallyflow-erp-data-v1";

const defaultData = {
  ledgers: [
    { id: crypto.randomUUID(), name: "Cash", group: "Cash-in-Hand", openingBalance: 50000, balanceType: "Dr" },
    { id: crypto.randomUUID(), name: "Axis Bank", group: "Bank Accounts", openingBalance: 125000, balanceType: "Dr" },
    { id: crypto.randomUUID(), name: "Sales", group: "Sales Accounts", openingBalance: 0, balanceType: "Cr" },
    { id: crypto.randomUUID(), name: "Purchases", group: "Purchase Accounts", openingBalance: 0, balanceType: "Dr" },
    { id: crypto.randomUUID(), name: "Output GST", group: "Duties & Taxes", openingBalance: 0, balanceType: "Cr" },
    { id: crypto.randomUUID(), name: "Input GST", group: "Duties & Taxes", openingBalance: 0, balanceType: "Dr" },
    { id: crypto.randomUUID(), name: "Rahul Retailers", group: "Sundry Debtors", openingBalance: 32000, balanceType: "Dr" },
    { id: crypto.randomUUID(), name: "Metro Supplies", group: "Sundry Creditors", openingBalance: 18000, balanceType: "Cr" }
  ],
  stockItems: [
    { id: crypto.randomUUID(), name: "Steel Bottle 1L", category: "Finished Goods", unit: "Nos", openingQty: 120, rate: 450 },
    { id: crypto.randomUUID(), name: "Office Paper Pack", category: "Consumables", unit: "Pcs", openingQty: 80, rate: 220 }
  ],
  vouchers: [],
  invoices: []
};

let state = loadState();

const views = {
  dashboard: document.getElementById("dashboardView"),
  masters: document.getElementById("mastersView"),
  vouchers: document.getElementById("vouchersView"),
  invoices: document.getElementById("invoicesView"),
  reports: document.getElementById("reportsView")
};

const ledgerForm = document.getElementById("ledgerForm");
const stockForm = document.getElementById("stockForm");
const voucherForm = document.getElementById("voucherForm");
const invoiceForm = document.getElementById("invoiceForm");

document.querySelectorAll(".nav-link").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

document.getElementById("seedDataBtn").addEventListener("click", () => {
  state = createDemoData();
  persistState();
  render();
});

document.getElementById("resetDataBtn").addEventListener("click", () => {
  state = structuredClone(defaultData);
  persistState();
  render();
});

ledgerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(ledgerForm);
  state.ledgers.unshift({
    id: crypto.randomUUID(),
    name: formData.get("name").toString().trim(),
    group: formData.get("group"),
    openingBalance: Number(formData.get("openingBalance")),
    balanceType: formData.get("balanceType")
  });
  ledgerForm.reset();
  persistState();
  render();
});

stockForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(stockForm);
  state.stockItems.unshift({
    id: crypto.randomUUID(),
    name: formData.get("name").toString().trim(),
    category: formData.get("category").toString().trim(),
    unit: formData.get("unit").toString().trim(),
    openingQty: Number(formData.get("openingQty")),
    rate: Number(formData.get("rate"))
  });
  stockForm.reset();
  persistState();
  render();
});

voucherForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(voucherForm);
  const type = formData.get("type");
  const partyLedgerId = formData.get("partyLedger");
  const counterLedgerId = formData.get("counterLedger");
  const amount = Number(formData.get("amount"));
  state.vouchers.unshift({
    id: crypto.randomUUID(),
    type,
    date: formData.get("date"),
    reference: formData.get("reference").toString().trim(),
    partyLedgerId,
    counterLedgerId,
    amount,
    narration: formData.get("narration").toString().trim()
  });
  voucherForm.reset();
  setTodayDefaults();
  persistState();
  render();
});

invoiceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(invoiceForm);
  const type = formData.get("type");
  const quantity = Number(formData.get("quantity"));
  const rate = Number(formData.get("rate"));
  const taxRate = Number(formData.get("taxRate"));
  const taxable = quantity * rate;
  const taxAmount = taxable * (taxRate / 100);
  const total = taxable + taxAmount;
  const invoice = {
    id: crypto.randomUUID(),
    type,
    date: formData.get("date"),
    invoiceNo: formData.get("invoiceNo").toString().trim(),
    partyLedgerId: formData.get("partyLedger"),
    stockItemId: formData.get("stockItemId"),
    quantity,
    rate,
    taxRate,
    taxAmount,
    total,
    narration: formData.get("narration").toString().trim()
  };
  state.invoices.unshift(invoice);
  createVoucherFromInvoice(invoice);
  invoiceForm.reset();
  setTodayDefaults();
  persistState();
  render();
});

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return structuredClone(defaultData);
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      ledgers: parsed.ledgers || [],
      stockItems: parsed.stockItems || [],
      vouchers: parsed.vouchers || [],
      invoices: parsed.invoices || []
    };
  } catch {
    return structuredClone(defaultData);
  }
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function switchView(viewName) {
  Object.entries(views).forEach(([key, element]) => {
    element.classList.toggle("active", key === viewName);
  });

  document.querySelectorAll(".nav-link").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });
}

function render() {
  populateLedgerSelects();
  populateStockSelects();
  renderStats();
  renderLedgers();
  renderStockItems();
  renderVouchers();
  renderInvoices();
  renderReports();
  renderInsights();
}

function populateLedgerSelects() {
  const options = state.ledgers
    .map((ledger) => `<option value="${ledger.id}">${ledger.name} (${ledger.group})</option>`)
    .join("");

  ["partyLedger", "counterLedger", "invoiceParty"].forEach((id) => {
    const select = document.getElementById(id);
    if (select) {
      select.innerHTML = options;
    }
  });
}

function populateStockSelects() {
  const options = state.stockItems
    .map((item) => `<option value="${item.id}">${item.name} (${item.unit})</option>`)
    .join("");
  document.getElementById("invoiceStock").innerHTML = options;
}

function renderStats() {
  const summary = calculateSummary();
  const cards = [
    { label: "Total Sales", value: formatCurrency(summary.sales) },
    { label: "Total Purchases", value: formatCurrency(summary.purchases) },
    { label: "Cash + Bank", value: formatCurrency(summary.cashBank) },
    { label: "Closing Stock Value", value: formatCurrency(summary.stockValue) }
  ];

  document.getElementById("statsGrid").innerHTML = cards
    .map(
      (card) => `
        <article class="stat-card">
          <p class="eyebrow">${card.label}</p>
          <div class="value">${card.value}</div>
        </article>
      `
    )
    .join("");
}

function renderLedgers() {
  renderTable("ledgerTable", ["Name", "Group", "Opening"], state.ledgers.map((ledger) => [
    ledger.name,
    `<span class="chip">${ledger.group}</span>`,
    `${formatCurrency(ledger.openingBalance)} ${ledger.balanceType}`
  ]));
}

function renderStockItems() {
  renderTable("stockTable", ["Item", "Category", "Opening Qty", "Rate"], state.stockItems.map((item) => [
    item.name,
    item.category,
    `${item.openingQty} ${item.unit}`,
    formatCurrency(item.rate)
  ]));
}

function renderVouchers() {
  const rows = state.vouchers.map((voucher) => [
    voucher.date,
    `<span class="chip">${voucher.type}${voucher.source === "invoice" ? " Auto" : ""}</span>`,
    voucher.reference,
    getLedgerName(voucher.partyLedgerId),
    getLedgerName(voucher.counterLedgerId),
    formatCurrency(voucher.amount)
  ]);
  renderTable("voucherTable", ["Date", "Type", "Ref", "Ledger", "Counter", "Amount"], rows);

  const recentRows = [...state.vouchers.filter((voucher) => voucher.source !== "invoice").map(voucherToDayBookEntry), ...state.invoices.map(invoiceToDayBookEntry)]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8)
    .map((entry) => [
      entry.date,
      `<span class="chip">${entry.type}</span>`,
      entry.reference,
      entry.party,
      formatCurrency(entry.amount)
    ]);
  renderTable("recentTransactions", ["Date", "Type", "Reference", "Party", "Amount"], recentRows);
}

function renderInvoices() {
  const rows = state.invoices.map((invoice) => [
    invoice.date,
    `<span class="chip">${invoice.type}</span>`,
    invoice.invoiceNo,
    getLedgerName(invoice.partyLedgerId),
    getStockName(invoice.stockItemId),
    `${invoice.quantity}`,
    formatCurrency(invoice.total)
  ]);
  renderTable("invoiceTable", ["Date", "Type", "Invoice", "Party", "Item", "Qty", "Total"], rows);
}

function renderReports() {
  const trialBalance = calculateTrialBalance();
  renderTable(
    "trialBalanceTable",
    ["Ledger", "Group", "Debit", "Credit"],
    trialBalance.map((row) => [
      row.name,
      row.group,
      row.debit ? formatCurrency(row.debit) : "-",
      row.credit ? formatCurrency(row.credit) : "-"
    ])
  );

  const ledgerSummary = trialBalance
    .filter((row) => row.debit || row.credit)
    .map((row) => [row.name, row.group, row.debit ? formatCurrency(row.debit) : "-", row.credit ? formatCurrency(row.credit) : "-"]);
  renderTable("ledgerSummaryTable", ["Ledger", "Group", "Debit Movement", "Credit Movement"], ledgerSummary);

  const stockSummary = calculateStockSummary();
  renderTable(
    "stockSummaryTable",
    ["Item", "Opening", "Inward", "Outward", "Closing", "Value"],
    stockSummary.map((row) => [
      row.name,
      `${row.openingQty} ${row.unit}`,
      `${row.inward} ${row.unit}`,
      `${row.outward} ${row.unit}`,
      `${row.closing} ${row.unit}`,
      formatCurrency(row.value)
    ])
  );
}

function renderInsights() {
  const summary = calculateSummary();
  const stockSummary = calculateStockSummary();
  const lowStock = stockSummary.filter((item) => item.closing < 10);
  const transactionCount =
    state.vouchers.filter((voucher) => voucher.source !== "invoice").length + state.invoices.length;
  const insights = [
    `Net business margin currently stands at ${formatCurrency(summary.sales - summary.purchases)} before indirect expenses.`,
    `${transactionCount} total transactions have been posted in this company data.`,
    lowStock.length
      ? `${lowStock.length} stock items are running low and may need replenishment soon.`
      : "Stock levels look healthy across tracked items."
  ];

  document.getElementById("insightsList").innerHTML = insights
    .map((item) => `<div class="insight">${item}</div>`)
    .join("");
}

function renderTable(containerId, headers, rows) {
  const container = document.getElementById(containerId);
  if (!rows.length) {
    container.innerHTML = document.getElementById("emptyState").innerHTML;
    return;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  `;
}

function calculateSummary() {
  const sales = state.invoices.filter((invoice) => invoice.type === "Sales").reduce((sum, invoice) => sum + invoice.total, 0);
  const purchases = state.invoices.filter((invoice) => invoice.type === "Purchase").reduce((sum, invoice) => sum + invoice.total, 0);
  const cashBank = calculateTrialBalance()
    .filter((row) => ["Cash-in-Hand", "Bank Accounts"].includes(row.group))
    .reduce((sum, row) => sum + row.debit - row.credit, 0);
  const stockValue = calculateStockSummary().reduce((sum, item) => sum + item.value, 0);

  return { sales, purchases, cashBank, stockValue };
}

function calculateTrialBalance() {
  return state.ledgers.map((ledger) => {
    let debit = ledger.balanceType === "Dr" ? ledger.openingBalance : 0;
    let credit = ledger.balanceType === "Cr" ? ledger.openingBalance : 0;

    state.vouchers.filter((voucher) => voucher.source !== "invoice").forEach((voucher) => {
      const rules = getVoucherEffect(voucher.type);
      if (voucher.partyLedgerId === ledger.id) {
        debit += rules.party === "Dr" ? voucher.amount : 0;
        credit += rules.party === "Cr" ? voucher.amount : 0;
      }
      if (voucher.counterLedgerId === ledger.id) {
        debit += rules.counter === "Dr" ? voucher.amount : 0;
        credit += rules.counter === "Cr" ? voucher.amount : 0;
      }
    });

    state.invoices.forEach((invoice) => {
      const amount = invoice.total;
      const taxLedger = state.ledgers.find((ledgerItem) =>
        invoice.type === "Sales" ? ledgerItem.name === "Output GST" : ledgerItem.name === "Input GST"
      );
      const revenueLedger = state.ledgers.find((ledgerItem) =>
        invoice.type === "Sales" ? ledgerItem.name === "Sales" : ledgerItem.name === "Purchases"
      );
      const partyLedgerId = invoice.partyLedgerId;

      if (ledger.id === partyLedgerId) {
        if (invoice.type === "Sales") {
          debit += amount;
        } else {
          credit += amount;
        }
      }

      if (revenueLedger && ledger.id === revenueLedger.id) {
        if (invoice.type === "Sales") {
          credit += amount - invoice.taxAmount;
        } else {
          debit += amount - invoice.taxAmount;
        }
      }

      if (taxLedger && ledger.id === taxLedger.id) {
        if (invoice.type === "Sales") {
          credit += invoice.taxAmount;
        } else {
          debit += invoice.taxAmount;
        }
      }
    });

    return { name: ledger.name, group: ledger.group, debit, credit };
  });
}

function calculateStockSummary() {
  return state.stockItems.map((item) => {
    const inward = state.invoices
      .filter((invoice) => invoice.type === "Purchase" && invoice.stockItemId === item.id)
      .reduce((sum, invoice) => sum + invoice.quantity, 0);
    const outward = state.invoices
      .filter((invoice) => invoice.type === "Sales" && invoice.stockItemId === item.id)
      .reduce((sum, invoice) => sum + invoice.quantity, 0);
    const closing = item.openingQty + inward - outward;
    return {
      name: item.name,
      unit: item.unit,
      openingQty: item.openingQty,
      inward,
      outward,
      closing,
      value: closing * item.rate
    };
  });
}

function getVoucherEffect(type) {
  const map = {
    Payment: { party: "Cr", counter: "Dr" },
    Receipt: { party: "Dr", counter: "Cr" },
    Contra: { party: "Dr", counter: "Cr" },
    Journal: { party: "Dr", counter: "Cr" },
    Purchase: { party: "Dr", counter: "Cr" },
    Sales: { party: "Cr", counter: "Dr" }
  };
  return map[type] || { party: "Dr", counter: "Cr" };
}

function getLedgerName(id) {
  return state.ledgers.find((ledger) => ledger.id === id)?.name || "Unknown Ledger";
}

function getStockName(id) {
  return state.stockItems.find((item) => item.id === id)?.name || "Unknown Item";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value || 0);
}

function createVoucherFromInvoice(invoice) {
  const stockLedgerName = invoice.type === "Sales" ? "Sales" : "Purchases";
  const stockLedger = state.ledgers.find((ledger) => ledger.name === stockLedgerName);
  if (!stockLedger) {
    return;
  }

  state.vouchers.unshift({
    id: crypto.randomUUID(),
    type: invoice.type,
    date: invoice.date,
    reference: invoice.invoiceNo,
    partyLedgerId: invoice.partyLedgerId,
    counterLedgerId: stockLedger.id,
    amount: invoice.total,
    narration: invoice.narration,
    source: "invoice"
  });
}

function invoiceToDayBookEntry(invoice) {
  return {
    date: invoice.date,
    type: `${invoice.type} Invoice`,
    reference: invoice.invoiceNo,
    party: getLedgerName(invoice.partyLedgerId),
    amount: invoice.total
  };
}

function voucherToDayBookEntry(voucher) {
  return {
    date: voucher.date,
    type: voucher.type,
    reference: voucher.reference,
    party: getLedgerName(voucher.partyLedgerId),
    amount: voucher.amount
  };
}

function setTodayDefaults() {
  const today = new Date().toISOString().slice(0, 10);
  voucherForm.elements.date.value = today;
  invoiceForm.elements.date.value = today;
}

function createDemoData() {
  const seeded = structuredClone(defaultData);
  const rahul = seeded.ledgers.find((ledger) => ledger.name === "Rahul Retailers");
  const metro = seeded.ledgers.find((ledger) => ledger.name === "Metro Supplies");
  const cash = seeded.ledgers.find((ledger) => ledger.name === "Cash");
  const bank = seeded.ledgers.find((ledger) => ledger.name === "Axis Bank");
  const bottle = seeded.stockItems.find((item) => item.name === "Steel Bottle 1L");
  const paper = seeded.stockItems.find((item) => item.name === "Office Paper Pack");

  seeded.vouchers = [
    {
      id: crypto.randomUUID(),
      type: "Receipt",
      date: "2026-03-25",
      reference: "RCPT-302",
      partyLedgerId: cash.id,
      counterLedgerId: rahul.id,
      amount: 15000,
      narration: "Collection from customer"
    },
    {
      id: crypto.randomUUID(),
      type: "Payment",
      date: "2026-03-26",
      reference: "PMT-411",
      partyLedgerId: metro.id,
      counterLedgerId: bank.id,
      amount: 12000,
      narration: "Supplier payment through bank"
    },
    {
      id: crypto.randomUUID(),
      type: "Journal",
      date: "2026-03-27",
      reference: "JRN-110",
      partyLedgerId: seeded.ledgers.find((ledger) => ledger.name === "Input GST").id,
      counterLedgerId: bank.id,
      amount: 2200,
      narration: "Tax adjustment entry"
    }
  ];

  seeded.invoices = [
    {
      id: crypto.randomUUID(),
      type: "Sales",
      date: "2026-03-27",
      invoiceNo: "SI-1008",
      partyLedgerId: rahul.id,
      stockItemId: bottle.id,
      quantity: 12,
      rate: 650,
      taxRate: 18,
      taxAmount: 1404,
      total: 9204,
      narration: "Bottle supply to retailer"
    },
    {
      id: crypto.randomUUID(),
      type: "Purchase",
      date: "2026-03-28",
      invoiceNo: "PI-2015",
      partyLedgerId: metro.id,
      stockItemId: paper.id,
      quantity: 24,
      rate: 180,
      taxRate: 12,
      taxAmount: 518.4,
      total: 4838.4,
      narration: "Paper purchase for office and packaging"
    }
  ];

  return seeded;
}

setTodayDefaults();
render();
