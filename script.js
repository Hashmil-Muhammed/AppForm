const API_URL = "http://localhost:5250/api/requests";

const form = document.getElementById("serviceForm");
const titleInput = document.getElementById("requestTitle");
const descInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const assetInput = document.getElementById("assetTag");
const impactInputs = document.querySelectorAll('input[name="impact"]');
const urgencyInputs = document.querySelectorAll('input[name="urgency"]');
const priorityInput = document.getElementById("suggestedPriority");
const targetDateInput = document.getElementById("targetDate");
const charCount = document.getElementById("charCount");

const previewStatus = document.getElementById("previewStatus");
const previewTitle = document.getElementById("previewTitle");
const previewCategory = document.getElementById("previewCategory");
const previewAsset = document.getElementById("previewAsset");
const previewPriority = document.getElementById("previewPriority");
const previewDate = document.getElementById("previewDate");

const saveDraftBtn = document.getElementById("saveDraftBtn");
const resetBtn = document.getElementById("resetBtn");
const recordsBody = document.getElementById("recordsBody");

function showError(inputEl, errorId, message) {
  document.getElementById(errorId).textContent = message;
}

function clearError(inputEl, errorId) {
  document.getElementById(errorId).textContent = "";
}

function getSelectedValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : "";
}

function formatTableDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function calculatePriorityAndDate() {
  const scores = {
    "Individual affected": 1,
    "Team affected": 2,
    "Work stopped": 3,
    "Routine": 1,
    "Needed soon": 2,
    "Immediate": 3
  };

  const total = (scores[getSelectedValue("impact")] || 0) + (scores[getSelectedValue("urgency")] || 0);

  let priority = "LOW";
  let daysToAdd = 10;

  if (total >= 5) {
    priority = "HIGH";
    daysToAdd = 2;
  } else if (total >= 3) {
    priority = "NORMAL";
    daysToAdd = 5;
  }

  const target = new Date();
  target.setDate(target.getDate() + daysToAdd);

  priorityInput.value = priority;
  targetDateInput.value = target.toLocaleDateString("en-CA");
  previewPriority.textContent = priority;
  previewDate.textContent = target.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  const priorityClass = { HIGH: "priority-high", NORMAL: "priority-normal", LOW: "badge-low" };
  previewPriority.className = "p-value " + priorityClass[priority];
}

function updatePreview() {
  previewTitle.textContent = titleInput.value.trim() || "Untitled request";
  previewCategory.textContent = categoryInput.value || "Not selected";
  previewAsset.textContent = assetInput.value.trim() || "Not provided";
}

function validateForm() {
  let isValid = true;

  if (titleInput.value.trim().length < 5) {
    showError(titleInput, "titleError", "Request title must be at least 5 characters.");
    isValid = false;
  } else {
    clearError(titleInput, "titleError");
  }

  if (descInput.value.trim().length < 5) {
    showError(descInput, "descError", "Description must be at least 5 characters.");
    isValid = false;
  } else {
    clearError(descInput, "descError");
  }

  if (categoryInput.value === "") {
    showError(categoryInput, "categoryError", "Please select a category.");
    isValid = false;
  } else {
    clearError(categoryInput, "categoryError");
  }

  if (!getSelectedValue("impact")) {
    showError(null, "impactError", "Please select a business impact.");
    isValid = false;
  } else {
    clearError(null, "impactError");
  }

  if (!getSelectedValue("urgency")) {
    showError(null, "urgencyError", "Please select an urgency level.");
    isValid = false;
  } else {
    clearError(null, "urgencyError");
  }

  return isValid;
}

function addRowToTable(item) {
  const badgeClasses = { HIGH: "badge-high", NORMAL: "badge-normal", LOW: "badge-low-light" };
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><strong></strong><br /><span></span></td>
    <td></td>
    <td><span class="${badgeClasses[item.priority] || "badge-low-light"}"></span></td>
    <td><span class="badge-progress"></span></td>
    <td></td>
  `;

  row.querySelector("strong").textContent = item.requestCode;
  row.querySelector("td:first-child span").textContent = item.title;
  row.cells[1].textContent = item.category;
  row.cells[2].querySelector("span").textContent = item.priority;
  row.cells[3].querySelector("span").textContent = item.status;
  row.cells[4].textContent = formatTableDate(item.targetDate);

  recordsBody.prepend(row);
}

async function loadRequests() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) return;
    const data = await response.json();
    data.reverse().forEach(addRowToTable);
  } catch (error) {
    console.error("Failed to load requests:", error);
  }
}

titleInput.addEventListener("input", () => {
  updatePreview();
  if (titleInput.value.trim().length >= 5) clearError(titleInput, "titleError");
});

descInput.addEventListener("input", () => {
  charCount.textContent = `${descInput.value.length} / 2000`;
  if (descInput.value.trim().length >= 5) clearError(descInput, "descError");
});

categoryInput.addEventListener("change", () => {
  updatePreview();
  if (categoryInput.value !== "") clearError(categoryInput, "categoryError");
});

assetInput.addEventListener("input", updatePreview);

impactInputs.forEach((radio) => {
  radio.addEventListener("change", () => {
    clearError(null, "impactError");
    calculatePriorityAndDate();
  });
});

urgencyInputs.forEach((radio) => {
  radio.addEventListener("change", () => {
    clearError(null, "urgencyError");
    calculatePriorityAndDate();
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const payload = {
    title: titleInput.value.trim(),
    description: descInput.value.trim(),
    category: categoryInput.value,
    assetTag: assetInput.value.trim(),
    businessImpact: getSelectedValue("impact"),
    urgency: getSelectedValue("urgency"),
    priority: priorityInput.value,
    targetDate: targetDateInput.value
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      alert("Error saving request to database.");
      return;
    }

    const savedItem = await response.json();
    addRowToTable(savedItem);
    alert(`Saved to database as ${savedItem.requestCode}!`);
    resetForm();
  } catch (error) {
    alert("Cannot connect to API. Make sure dotnet run is active.");
  }
});

function resetForm() {
  form.reset();
  charCount.textContent = "0 / 2000";
  clearError(titleInput, "titleError");
  clearError(descInput, "descError");
  clearError(categoryInput, "categoryError");
  clearError(null, "impactError");
  clearError(null, "urgencyError");
  previewStatus.textContent = "DRAFT";
  updatePreview();
  calculatePriorityAndDate();
}

resetBtn.addEventListener("click", resetForm);

saveDraftBtn.addEventListener("click", () => {
  previewStatus.textContent = "SAVED DRAFT";
  alert("Draft saved!");
});

calculatePriorityAndDate();
loadRequests();