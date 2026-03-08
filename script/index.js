
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
//  Get a colored priority badge
function getPriorityBadge(priority) {
  const p = (priority || "LOW").toUpperCase();

  if (p === "HIGH")   return `<span class="badge badge-error text-white text-xs font-bold">HIGH</span>`;
  if (p === "MEDIUM") return `<span class="badge badge-warning text-white text-xs font-bold">MEDIUM</span>`;
                      return `<span class="badge badge-ghost text-xs font-bold">LOW</span>`;
}

//   Get a colored label badge (BUG, HELP WANTED etc.)
//  Returns HTML string

function getLabelBadge(name) {
  const labelName = typeof name === "string" ? name : (name.name || "");
  const l = labelName.toLowerCase();

  let colorClass = "badge-ghost";
  let icon = "fa-tag";

  if (l.includes("bug"))   { colorClass = "badge-error";   icon = "fa-bug"; }
  if (l.includes("help"))  { colorClass = "badge-warning";  icon = "fa-hand"; }
  if (l.includes("enhan")) { colorClass = "badge-success";  icon = "fa-star"; }
  if (l.includes("feat"))  { colorClass = "badge-info";     icon = "fa-rocket"; }

  return `
    <span class="badge ${colorClass} text-xs font-semibold gap-1">
      <i class="fa-solid ${icon} text-[9px]"></i>
      ${labelName.toUpperCase()}
    </span>
  `;
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

      <div class="flex items-center justify-between">
        ${statusIcon}
        ${getPriorityBadge(prio)}
      </div>

      <p class="font-bold text-sm text-gray-800 leading-snug">${title}</p>

      <p class="text-xs text-gray-400 leading-relaxed line-clamp-2">${desc}</p>


      <div class="flex flex-wrap gap-1">${labelsHTML}</div>

    </div>

   
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

