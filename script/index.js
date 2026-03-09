// --- Store all issues here after fetching ---
let allIssues = [];

// --- Track which tab is active ---
let currentTab = "all";

//  HELPER: Turn a date string into a readable date

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

//  HELPER: Get a colored priority badge
//  Returns HTML string based on priority level

function getPriorityBadge(priority) {
  const p = (priority || "LOW").toUpperCase();

  if (p === "HIGH")   return `<span class="badge badge-error text-white text-xs font-bold">HIGH</span>`;
  if (p === "MEDIUM") return `<span class="badge badge-warning text-white text-xs font-bold">MEDIUM</span>`;
                      return `<span class="badge badge-ghost text-xs font-bold">LOW</span>`;
}



//  HELPER: Get a colored label badge (BUG, HELP WANTED etc.)
//  Returns HTML string

function getLabelBadge(name) {
  const labelName = typeof name === "string" ? name : (name.name || "");
  const l = labelName.toLowerCase();

  let colorClass = "badge-ghost";
  let icon = "fa-tag";

  if (l.includes("bug"))   { colorClass = "badge-error bg-[#FECACA] text-[#EF4444]";   icon = "fa-bug"; }
  if (l.includes("help"))  { colorClass = "badge-warning bg-[#FDE68A] text-[#D97706]";  icon = "fa-hand"; }
  if (l.includes("enhan")) { colorClass = "badge-success bg-[#BBF7D0] text-[#00A96E]";  icon = "fa-star"; }
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


//  CREATE ONE CARD for a single issue
//  Returns a <div> element
function createCard(issue) {
  const id     = issue.id    || issue._id || "?";
  const title  = issue.title || "Untitled";
  const desc   = issue.description || "No description.";
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

  // When card is clicked , open the modal
  card.addEventListener("click", function() {
    openModal(issue);
  });

  return card;
}


//  DISPLAY ISSUES on the page
//  Filters by currentTab, updates count, shows cards

function displayIssues(issues) {
  const grid = document.getElementById("cards-grid");

  // Clear old cards
  grid.innerHTML = "";

  // Filter by active tab
  let list = issues;
  if (currentTab === "open")   list = issues.filter(i => (i.status || "").toLowerCase() === "open");
  if (currentTab === "closed") list = issues.filter(i => (i.status || "").toLowerCase() === "closed");

  // Update issue count text
  document.getElementById("issue-count").textContent = `${list.length} Issues`;

  // If no issues, show a message
  if (list.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-16 text-gray-400">
        <i class="fa-solid fa-inbox text-4xl mb-3 block"></i>
        No ${currentTab} issues found.
      </div>
    `;
    return;
  }

  // Add each issue as a card
  list.forEach(function(issue) {
    grid.appendChild(createCard(issue));
  });
}
//  FETCH ALL ISSUES from the API
//  Using fetch → .then → .then as required
function fetchAllIssues() {
  showSpinner();

  fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues")

    // First .then: check response is OK, then parse JSON
    .then(function(response) {
      if (!response.ok) throw new Error("Failed to load issues");
      return response.json();
    })

    // Second .then: we now have the data!
    .then(function(data) {
      // Handle different API response shapes
      if (Array.isArray(data))  allIssues = data;
      else if (data.issues)     allIssues = data.issues;
      else if (data.data)       allIssues = data.data;
      else                      allIssues = [];

      hideSpinner();
      displayIssues(allIssues);
    })

    // If something goes wrong
    .catch(function(error) {
      console.error(error);
      hideSpinner();
      document.getElementById("cards-grid").innerHTML = `
        <div class="col-span-full text-center py-16 text-red-400">
          <i class="fa-solid fa-triangle-exclamation text-3xl mb-3 block"></i>
          Could not load issues. Please try again.
        </div>
      `;
    });
}


//  FETCH ONE ISSUE by ID (for the modal)
function fetchSingleIssue(id) {
  fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      const issue = data.issue || data.data || data;
      fillModal(issue);
    })
    .catch(function(err) {
      console.warn("Could not fetch full issue details:", err);
    });
}


//  OPEN THE MODAL when a card is clicked

function openModal(issue) {
  // Fill modal with card data right away
  fillModal(issue);

  // Show the DaisyUI modal
  document.getElementById("issue-modal").showModal();

  // Also fetch full details from the API
  const id = issue.id || issue._id;
  if (id) fetchSingleIssue(id);
}


//  CLOSE THE MODAL

function closeModal() {
  document.getElementById("issue-modal").close();
}


//  FILL THE MODAL with issue data

function fillModal(issue) {
  const status   = (issue.status || "open").toLowerCase();
  const title    = issue.title || "Untitled";
  const desc     = issue.description || "No description.";
  const author   = issue.author || issue.createdBy || "Unknown";
  const assignee = issue.assignee || author;
  const priority = issue.priority || "LOW";
  const date     = formatDate(issue.createdAt);
  const labels   = issue.labels || [];

  // Title
  document.getElementById("modal-title").textContent = title;

  // Status badge
  const statusEl = document.getElementById("modal-status");
  if (status === "open") {
    statusEl.className = "badge badge-success text-white font-semibold";
    statusEl.innerHTML = `<i class="fa-solid fa-circle-dot mr-1"></i> Opened`;
  } else {
    statusEl.className = "badge badge-secondary text-white font-semibold";
    statusEl.innerHTML = `<i class="fa-solid fa-circle-check mr-1"></i> Closed`;
  }

  // Author + date
  document.getElementById("modal-author").innerHTML = `<i class="fa-regular fa-user mr-1"></i> Opened by <strong>${author}</strong>`;
  document.getElementById("modal-date").innerHTML   = `<i class="fa-regular fa-calendar mr-1"></i> ${date}`;

  // Labels
  const labelsEl = document.getElementById("modal-labels");
  labelsEl.innerHTML = "";
  labels.forEach(function(lbl) {
    labelsEl.innerHTML += getLabelBadge(lbl);
  });

  // Description
  document.getElementById("modal-desc").textContent = desc;

  // Assignee
  document.getElementById("modal-assignee").textContent = assignee;

  // Priority
  document.getElementById("modal-priority").innerHTML = getPriorityBadge(priority);
}


//  TAB SWITCHING
//  Changes active tab style and re-filters cards

function switchTab(tab) {
  currentTab = tab;

  // Reset all tab buttons to outline style
  document.getElementById("tab-all").className    = "btn btn-sm btn-outline";
  document.getElementById("tab-open").className   = "btn btn-sm btn-outline";
  document.getElementById("tab-closed").className = "btn btn-sm btn-outline";

  // Make the clicked tab active (filled/primary)
  document.getElementById("tab-" + tab).className = "btn btn-sm btn-primary";

  // Re-render the cards with the new filter
  displayIssues(allIssues);
}


//  START: fetch issues when page loads

document.addEventListener("DOMContentLoaded", function() {
  fetchAllIssues();
});
