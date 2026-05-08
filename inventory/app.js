const STORAGE_KEY = "arkadians_inventory_units";

const TYPE_OPTIONS = ["4 Room", "5 Room", "Duplex", "Economy"];
const VIEW_OPTIONS = ["Golf View", "Arabian Sea View", "Other View"];
const STATUS_OPTIONS = ["Available", "Reserved", "Sold"];

const initialData = [
  {
    id: crypto.randomUUID(),
    tower: "A",
    flatNumber: "A-1102",
    sizeSqft: 1600,
    type: "4 Room",
    viewCategory: "Golf View",
    price: 1800000,
    status: "Available",
    customerName: "",
    notes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    tower: "B",
    flatNumber: "B-0901",
    sizeSqft: 2100,
    type: "Duplex",
    viewCategory: "Arabian Sea View",
    price: 2800000,
    status: "Reserved",
    customerName: "A. Khan",
    notes: "Follow-up next week",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const unitForm = document.getElementById("unitForm");
const resetBtn = document.getElementById("resetBtn");
const summaryCards = document.getElementById("summaryCards");
const inventoryBody = document.getElementById("inventoryBody");

const filters = {
  tower: document.getElementById("filterTower"),
  viewCategory: document.getElementById("filterViewCategory"),
  status: document.getElementById("filterStatus"),
  type: document.getElementById("filterType"),
  flatNumber: document.getElementById("filterFlatNumber")
};

function getUnits() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUnits(units) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(units));
}

function getFormData() {
  return {
    id: document.getElementById("id").value || crypto.randomUUID(),
    tower: document.getElementById("tower").value.trim(),
    flatNumber: document.getElementById("flatNumber").value.trim(),
    sizeSqft: Number(document.getElementById("sizeSqft").value),
    type: document.getElementById("type").value,
    viewCategory: document.getElementById("viewCategory").value,
    price: Number(document.getElementById("price").value),
    status: document.getElementById("status").value,
    customerName: document.getElementById("customerName").value.trim(),
    notes: document.getElementById("notes").value.trim()
  };
}

function resetForm() {
  unitForm.reset();
  document.getElementById("id").value = "";
}

function populateForm(unit) {
  document.getElementById("id").value = unit.id;
  document.getElementById("tower").value = unit.tower;
  document.getElementById("flatNumber").value = unit.flatNumber;
  document.getElementById("sizeSqft").value = unit.sizeSqft;
  document.getElementById("type").value = unit.type;
  document.getElementById("viewCategory").value = unit.viewCategory;
  document.getElementById("price").value = unit.price;
  document.getElementById("status").value = unit.status;
  document.getElementById("customerName").value = unit.customerName || "";
  document.getElementById("notes").value = unit.notes || "";
}

function renderSummaryCards(units) {
  const count = (predicate) => units.filter(predicate).length;
  const cards = [
    { label: "Total Flats", value: units.length },
    { label: "Available", value: count((u) => u.status === "Available") },
    { label: "Reserved", value: count((u) => u.status === "Reserved") },
    { label: "Sold", value: count((u) => u.status === "Sold") },
    { label: "Golf View", value: count((u) => u.viewCategory === "Golf View") },
    { label: "Arabian Sea View", value: count((u) => u.viewCategory === "Arabian Sea View") }
  ];

  summaryCards.innerHTML = cards
    .map(
      (card) => `
      <div class="card">
        <div class="label">${card.label}</div>
        <div class="value">${card.value}</div>
      </div>
    `
    )
    .join("");
}

function getFilteredUnits(units) {
  const selectedTower = filters.tower.value;
  const selectedView = filters.viewCategory.value;
  const selectedStatus = filters.status.value;
  const selectedType = filters.type.value;
  const flatSearch = filters.flatNumber.value.trim().toLowerCase();

  return units.filter((unit) => {
    const towerMatch = !selectedTower || unit.tower === selectedTower;
    const viewMatch = !selectedView || unit.viewCategory === selectedView;
    const statusMatch = !selectedStatus || unit.status === selectedStatus;
    const typeMatch = !selectedType || unit.type === selectedType;
    const flatMatch = !flatSearch || unit.flatNumber.toLowerCase().includes(flatSearch);

    return towerMatch && viewMatch && statusMatch && typeMatch && flatMatch;
  });
}

function sortUnitsForDisplay(units) {
  const viewPriority = {
    "Golf View": 0,
    "Arabian Sea View": 1,
    "Other View": 2
  };

  return [...units].sort((a, b) => {
    const viewDiff = (viewPriority[a.viewCategory] ?? 99) - (viewPriority[b.viewCategory] ?? 99);
    if (viewDiff !== 0) return viewDiff;

    const towerDiff = a.tower.localeCompare(b.tower);
    if (towerDiff !== 0) return towerDiff;

    return a.flatNumber.localeCompare(b.flatNumber);
  });
}

function renderTable(units) {
  if (!units.length) {
    inventoryBody.innerHTML = `
      <tr>
        <td colspan="9" class="empty-row">No flats match the current filters.</td>
      </tr>
    `;
    return;
  }

  inventoryBody.innerHTML = units
    .map(
      (unit) => `
      <tr>
        <td>${unit.flatNumber}</td>
        <td>${unit.tower}</td>
        <td>${unit.viewCategory}</td>
        <td>${unit.type}</td>
        <td>${unit.sizeSqft}</td>
        <td>${Number(unit.price).toLocaleString()}</td>
        <td><span class="status status-${unit.status}">${unit.status}</span></td>
        <td>${unit.customerName || "-"}</td>
        <td>
          <div class="row-actions">
            <button type="button" data-action="edit" data-id="${unit.id}">Edit</button>
            <button type="button" data-action="delete" data-id="${unit.id}" class="secondary">Delete</button>
          </div>
        </td>
      </tr>
    `
    )
    .join("");
}

function renderFilters(units) {
  const towers = [...new Set(units.map((u) => u.tower))].sort();

  const setSelectOptions = (select, options) => {
    const current = select.value;
    select.innerHTML = [`<option value="">All</option>`, ...options.map((o) => `<option value="${o}">${o}</option>`)].join("");
    select.value = options.includes(current) ? current : "";
  };

  setSelectOptions(filters.tower, towers);
  setSelectOptions(filters.viewCategory, VIEW_OPTIONS);
  setSelectOptions(filters.status, STATUS_OPTIONS);
  setSelectOptions(filters.type, TYPE_OPTIONS);
}

function render() {
  const units = getUnits();
  const filteredUnits = getFilteredUnits(units);
  renderFilters(units);
  renderSummaryCards(units);
  renderTable(sortUnitsForDisplay(filteredUnits));
}

unitForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = getFormData();
  const units = getUnits();
  const existing = units.find((u) => u.id === formData.id);

  if (existing) {
    Object.assign(existing, formData, { updatedAt: new Date().toISOString() });
  } else {
    units.push({
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  saveUnits(units);
  resetForm();
  render();
});

resetBtn.addEventListener("click", resetForm);

Object.values(filters).forEach((filterEl) => {
  filterEl.addEventListener("input", render);
  filterEl.addEventListener("change", render);
});

inventoryBody.addEventListener("click", (event) => {
  const btn = event.target.closest("button");
  if (!btn) return;

  const id = btn.getAttribute("data-id");
  const action = btn.getAttribute("data-action");
  const units = getUnits();
  const target = units.find((u) => u.id === id);
  if (!target) return;

  if (action === "edit") {
    populateForm(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (action === "delete") {
    const nextUnits = units.filter((u) => u.id !== id);
    saveUnits(nextUnits);
    render();
  }
});

render();
