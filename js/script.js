document.addEventListener('DOMContentLoaded', async () => {
  const env = window.env || {};
  const airtableApiKey = env.AIRTABLE_API_KEY;
  const airtableBaseId = env.AIRTABLE_BASE_ID;
  const airtableTableName = env.AIRTABLE_TABLE_NAME;

  if (!airtableApiKey || !airtableBaseId || !airtableTableName) {
    console.error('❌ Airtable credentials are missing');
    return;
  }

  const mainContent = document.getElementById('main-content');
  const secondaryContent = document.getElementById('secoundary-content');

  setupFilterMenu();
  setupSearchInput();
  setupJumpLinkObserver();
  setupClearFilters();
  fetchDataAndInitialize();

function setupFilterMenu() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlTechs = urlParams.get('techs');
  if (urlTechs) {
    const techArray = urlTechs.split(',').map(t => t.trim());
    localStorage.setItem("selectedFilters", JSON.stringify(techArray));
  }

  const menuToggle = document.getElementById('menu-toggle');
  const checkboxContainer = document.getElementById('checkbox-container');

  // 🔄 Toggle visibility on button click
  menuToggle.addEventListener('click', () => {
    checkboxContainer.classList.toggle('show');
  });

  // ❌ Close on click outside
  document.addEventListener('click', (event) => {
    if (!checkboxContainer.contains(event.target) && !menuToggle.contains(event.target)) {
      checkboxContainer.classList.remove('show');
    }
  });

  // ❌ Close on scroll
  window.addEventListener('scroll', () => {
    if (checkboxContainer.classList.contains('show')) {
      checkboxContainer.classList.remove('show');
    }
  });
}

function setupSearchInput() {
  const input = document.getElementById('search-input');
  input.addEventListener('input', () => {
    const searchValue = input.value.toLowerCase();
    const isSearching = searchValue.trim() !== '';

    ['#airtable-data', '#feild-data'].forEach(tableSelector => {
      const rows = document.querySelectorAll(`${tableSelector} tbody tr`);
      let visibleCount = 0;

      rows.forEach(row => {
        const warrantyId = row.getAttribute('data-warranty-id')?.toLowerCase() || '';
        const cellMatch = Array.from(row.cells).some(cell =>
          cell.textContent.toLowerCase().includes(searchValue)
        );
        const match = cellMatch || warrantyId.includes(searchValue);
        row.style.display = match ? '' : 'none';

        // Unmerge: show all cells individually
        const firstCell = row.cells[0];
        if (firstCell) {
          firstCell.style.display = '';
          firstCell.removeAttribute('rowspan');
        }

        if (match) visibleCount++;
      });

      // ✅ Hide entire content section if no visible rows
      const section = tableSelector === '#airtable-data'
        ? document.getElementById('main-content')
        : document.getElementById('secoundary-content');
      section.style.display = visibleCount > 0 ? 'block' : 'none';

      // ✅ Restore merged cells only if not searching
      if (!isSearching) {
        mergeTableCells(tableSelector, 0);
      }
    });
  });
}

  function setupJumpLinkObserver() {
    const secondaryContent = document.getElementById("secoundary-content");
    const jumpLink = document.querySelector(".jump-link");
    const toggleJumpLinkVisibility = () => {
      const isHidden = !secondaryContent.offsetParent;
      jumpLink.style.display = isHidden ? "none" : "inline";
    };

    toggleJumpLinkVisibility();

    if (secondaryContent) {
      new MutationObserver(toggleJumpLinkVisibility).observe(secondaryContent, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }
  }

  function setupClearFilters() {
    const btn = document.getElementById('clear-filters');
    btn.addEventListener('click', () => {
      localStorage.removeItem('selectedFilters');
      document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = false);
      const allCheckbox = document.querySelector('.filter-checkbox[value="All"]');
      if (allCheckbox) allCheckbox.checked = true;
      applyFilters();
    });
  }

  async function fetchDataAndInitialize() {
    showLoader();
    mainContent.style.display = 'none';
    secondaryContent.style.display = 'none';

    const allRecords = await fetchAllRecords();
    if (!allRecords.length) return hideLoader();

    const techs = extractFieldTechs(allRecords);
    generateCheckboxes(techs);

    const primaryRecords = allRecords.filter(r => r.fields['Status'] === 'Field Tech Review Needed');
    const secondaryRecords = allRecords.filter(r => r.fields['Status'] === 'Scheduled- Awaiting Field');

    await Promise.all([
      displayRecords(primaryRecords, '#airtable-data'),
      displayRecords(secondaryRecords, '#feild-data')
    ]);

    mergeTableCells('#airtable-data', 0);
    mergeTableCells('#feild-data', 0);
    applyFilters();
    hideLoader();

    mainContent.style.display = 'block';
    secondaryContent.style.display = 'block';
    setTimeout(() => {
      mainContent.style.opacity = '1';
      secondaryContent.style.opacity = '1';
    }, 10);
  }

  function extractFieldTechs(records) {
    const set = new Set();
    records.forEach(r => {
      const val = r.fields['field tech'];
      if (val) val.split(',').map(n => n.trim()).forEach(n => set.add(n));
    });
    return Array.from(set).sort();
  }

  function generateCheckboxes(techs) {
    const container = document.getElementById('filter-branch');
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'checkbox-row';

    const allLabel = document.createElement('label');
    allLabel.innerHTML = `<input type="checkbox" class="filter-checkbox" value="All"> <span>All</span>`;
    wrapper.appendChild(allLabel);

    techs.forEach(name => {
      const label = document.createElement('label');
      label.innerHTML = `<input type="checkbox" class="filter-checkbox" value="${name}"> <span>${name}</span>`;
      wrapper.appendChild(label);
    });

    container.appendChild(wrapper);
    attachCheckboxListeners();
    loadFiltersFromLocalStorage();
  }

  function attachCheckboxListeners() {
    document.querySelectorAll('.filter-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        const selected = Array.from(document.querySelectorAll('.filter-checkbox:checked')).map(cb => cb.value);
        localStorage.setItem('selectedFilters', JSON.stringify(selected));
        updateURLWithFilters(selected);
        applyFilters();
      });
    });
  }

  function loadFiltersFromLocalStorage() {
    const saved = JSON.parse(localStorage.getItem('selectedFilters') || '[]');
    document.querySelectorAll('.filter-checkbox').forEach(cb => {
      cb.checked = saved.includes(cb.value);
    });
  }

function applyFilters() {
  const selected = Array.from(document.querySelectorAll('.filter-checkbox:checked')).map(cb => cb.value);
const isAll = selected.length === 0 || 
              (selected.includes('All') && selected.length === 1);

  ['#airtable-data', '#feild-data'].forEach(selector => {
    const table = document.querySelector(selector);
    const rows = table.querySelectorAll('tbody tr');
    const thead = table.querySelector('thead');
    const h2 = table.closest('.scrollable-div')?.previousElementSibling;

    let visibleCount = 0;

    rows.forEach(row => {
      const tech = row.cells[0]?.textContent.trim() || '';
      const techNames = tech.split(',').map(n => n.trim());
      const shouldShow = isAll || selected.some(name => techNames.includes(name));
      row.style.display = shouldShow ? '' : 'none';
      if (shouldShow) visibleCount++;
    });

    // Hide table/h2/thead if no visible rows
    if (visibleCount === 0) {
      table.style.display = 'none';
      if (thead) thead.style.display = 'none';
      if (h2) h2.style.display = 'none';
    } else {
      table.style.display = 'table';
      if (thead) thead.style.display = 'table-header-group';
      if (h2) h2.style.display = 'block';
    }
  });
}

  function updateURLWithFilters(selected) {
    const params = new URLSearchParams(window.location.search);
    if (selected.length > 0) {
      params.set('techs', selected.join(','));
    } else {
      params.delete('techs');
    }
    const newURL = `${window.location.pathname}?${params.toString()}`;
    history.replaceState(null, '', newURL);
  }

  async function fetchAllRecords(offset = null, collected = []) {
  const viewName = 'viw6ak9NqjR7r0A4g'; // 👈 REPLACE with your actual view name
  const encodedView = encodeURIComponent(viewName);
  const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}?view=${encodedView}${offset ? `&offset=${offset}` : ''}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${airtableApiKey}` }
    });

    const data = await response.json();
    const records = collected.concat(data.records);
    if (data.offset) return fetchAllRecords(data.offset, records);
    return records;
  } catch (err) {
    console.error("❌ Error fetching records:", err);
    return collected;
  }
}

function applyAlternatingColors(selector) {
  const table = document.querySelector(selector);
  if (!table) {
    console.warn(`⚠️ No table found for selector: ${selector}`);
    return;
  }

  const rows = table.querySelectorAll('tbody tr');
  console.log(`🎯 Found ${rows.length} rows in ${selector}`);

  let colorToggle = false;
const evenColor = '#ffffff';  // Stronger professional contrast
const oddColor = '#ffffff';   // White

  rows.forEach((row, index) => {
    const firstCell = row.cells[0];
    const isMerged = !firstCell || firstCell.style.display === 'none';
    const color = colorToggle ? evenColor : oddColor;

    if (isMerged) {
      row.style.setProperty('background-color', color, 'important');
    } else {
      colorToggle = !colorToggle;
      const toggleColor = colorToggle ? evenColor : oddColor;
      row.style.setProperty('background-color', toggleColor, 'important');
    }
  });
}

  async function displayRecords(records, tableSelector) {
  const table = document.querySelector(tableSelector);
  const tbody = table.querySelector('tbody');
  const thead = table.querySelector('thead');
  const h2 = table.closest('.scrollable-div')?.previousElementSibling;

  tbody.innerHTML = '';

  if (!records.length) {
    if (thead) thead.style.display = 'none';
    if (table) table.style.display = 'none';
    if (h2) h2.style.display = 'none';
    return;
  }

  // 🔤 Sort by 'field tech' alphabetically (case-insensitive)
  records.sort((a, b) => {
    const nameA = (a.fields['field tech'] || '').toLowerCase();
    const nameB = (b.fields['field tech'] || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

 records.forEach(record => {
  const row = document.createElement('tr');
  const tech = record.fields['field tech'] || 'N/A';
  const lot = record.fields['Lot Number and Community/Neighborhood'] || record.fields['Street Address'] || 'N/A';
  const warrantyId = record.fields['Warranty Record ID'] || '';

  row.setAttribute('data-warranty-id', warrantyId); // ✅ Add this line

  row.innerHTML = `
    <td data-field="field tech">${tech}</td>
    <td data-field="Lot Number and Community/Neighborhood" style="cursor:pointer;color:blue;text-decoration:underline">${lot}</td>
    <td data-field="b" style="display:none">${record.fields['b'] || ''}</td>
  `;

    row.querySelector('[data-field="Lot Number and Community/Neighborhood"]').addEventListener('click', () => {
      const id = record.fields['Warranty Record ID'];
      if (!id) return;
      localStorage.setItem("selectedJobId", id);
window.location.href = `${window.location.origin}/index.html?techs=${encodedName}`;
    });

    tbody.appendChild(row);
  });

  // ✅ Merge sorted duplicate values in column 1
  mergeTableCells(tableSelector, 0);
applyAlternatingColors(tableSelector);

  if (thead) thead.style.display = 'table-header-group';
  if (table) table.style.display = 'table';
  if (h2) h2.style.display = 'block';
}

  function mergeTableCells(selector, columnIndex) {
    const table = document.querySelector(selector);
    if (!table) return;
    const rows = table.querySelectorAll('tbody tr');

    let prevText = '', prevCell = null, rowspan = 1;
    rows.forEach((row, i) => {
      const cell = row.cells[columnIndex];
      const text = cell?.textContent.trim();
      if (text === prevText) {
        rowspan++;
        prevCell.rowSpan = rowspan;
        cell.style.display = 'none';
      } else {
        prevText = text;
        prevCell = cell;
        rowspan = 1;
      }
    });
  }

  function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'flex';
  }

  function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('nav');
  if (nav) {
    const h = nav.offsetHeight;
    document.documentElement.style.setProperty('--nav-height', h + 'px');
    // keep it correct on resize/zoom
    let rid;
    const onResize = () => {
      cancelAnimationFrame(rid);
      rid = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--nav-height', nav.offsetHeight + 'px');
      });
    };
    window.addEventListener('resize', onResize, { passive: true });
  }
});