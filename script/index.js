
// --- Store all issues here after fetching ---
let allIssues = [];

// --- Track which tab is active ---
let currentTab = "all";


// Turn a date string into a readable date

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}





//  SHOW the loading spinner, HIDE the cards

function showSpinner() {
  document.getElementById("spinner").style.display = "flex";
  document.getElementById("cards-grid").style.display = "none";
}



//  HIDE the loading spinner, SHOW the cards
function hideSpinner() {
  document.getElementById("spinner").style.display = "none";
  document.getElementById("cards-grid").style.display = "grid";
}

//  CREATE ONE CARD for a single issue
//  Returns a <div> element
function createCard(issue) {
  // Get values from the issue 
  const id     = issue.id;
  const title  = issue.title;
  const desc   = issue.description;
  const status = (issue.status || "open").toLowerCase();
  const prio   = issue.priority || "LOW";
  const author = issue.author || issue.createdBy || "Unknown";
  const date   = formatDate(issue.createdAt);
  const labels = issue.labels || [];

  // Build label badges HTML
  let labelsHTML = "";
  labels.forEach(function(lbl) {
    labelsHTML += getLabelBadge(lbl);
  });

  // Top border color: green for open, purple for closed
  const borderColor = status === "open" ? "border-t-green-500" : "border-t-purple-500";

  // Status icon
  const statusIcon = status === "open"
    ? `<i class="fa-solid fa-circle-dot text-green-500"></i>`
    : `<i class="fa-solid fa-circle-check text-purple-500"></i>`;

  // Create the card element
  const card = document.createElement("div");
  card.className = `bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 ${borderColor} flex flex-col cursor-pointer hover:shadow-md transition-shadow`;

  card.innerHTML = `
    <div class="p-4 flex flex-col gap-3 flex-1">

      <!-- Status icon + Priority badge -->
      <div class="flex items-center justify-between">
        ${statusIcon}
        ${getPriorityBadge(prio)}
      </div>

      <!-- Title -->
      <p class="font-bold text-sm text-gray-800 leading-snug">${title}</p>

      <!-- Description (only 2 lines shown) -->
      <p class="text-xs text-gray-400 leading-relaxed line-clamp-2">${desc}</p>

      <!-- Label badges -->
      <div class="flex flex-wrap gap-1">${labelsHTML}</div>

    </div>

    <!-- Footer -->
    <div class="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
      <p>#${id} by <span class="font-semibold text-gray-700">${author}</span></p>
      <p>${date}</p>
    </div>
  `;

  // When card is clicked → open the modal
  card.addEventListener("click", function() {
    openModal(issue);
  });

  return card;
}

