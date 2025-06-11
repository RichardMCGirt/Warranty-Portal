let dropboxRefreshToken = null;

function getWarrantyId() {
    const id = document.getElementById("warranty-id")?.value?.trim();
    if (id) return id;
    if (currentWarrantyId) {
        console.warn("⚠️ Using fallback warranty ID from global context.");
        return currentWarrantyId;
    }
    console.warn("⚠️ Warranty ID is missing from both DOM and fallback.");
    return null;
}

function checkAndHideDeleteButton() {
    const deleteButton = document.getElementById("delete-images-btn");
    const issueContainer = document.getElementById("issue-pictures");
    const completedContainer = document.getElementById("completed-pictures");

    if (!deleteButton || !issueContainer || !completedContainer) return;

    const issueImages = issueContainer.querySelectorAll("img").length;
    const completedImages = completedContainer.querySelectorAll("img").length;
    const selectedCheckboxes = document.querySelectorAll(".image-checkbox:checked").length;

    console.log(`🔍 Issue Images: ${issueImages}, Completed Images: ${completedImages}, Checked Boxes: ${selectedCheckboxes}`);

    if (issueImages > 0 || completedImages > 0 || selectedCheckboxes > 0) {
        console.log("✅ Show delete button");
        deleteButton.style.setProperty("display", "block", "important");
    } else {
        console.log("🚫 Hide delete button");
        deleteButton.style.setProperty("display", "none", "important");
    }
}

async function displayImages(files, containerId, fieldName = "") {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`⚠️ Container not found: ${containerId}`);
        return;
    }

    container.innerHTML = ""; // Clear existing content

    if (!files || files.length === 0) {
        console.warn(`⚠️ No files found in ${containerId}`);
        container.innerHTML = "<p></p>";
        
        // ✅ Hide delete button if both are empty
        checkAndHideDeleteButton();
        return;
    }

    console.log(`✅ Displaying files for ${containerId}:`, files);

    for (const file of files) {
        if (!file.url) {
            console.error("❌ Missing 'url' field in file object:", file);
            continue;
        }
        const wrapperDiv = document.createElement("div");
        wrapperDiv.classList.add("file-wrapper");
        wrapperDiv.style.display = "inline-block";
        wrapperDiv.style.margin = "10px";
        wrapperDiv.style.position = "relative";
        wrapperDiv.style.textAlign = "center";
        wrapperDiv.style.width = "200px";
    
        // ✅ Declare checkbox properly before using it
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("file-checkbox", "image-checkbox");
        checkbox.dataset.imageId = file.id || "";
    
        // ✅ Add event listener inside the loop
        checkbox.addEventListener("change", function () {
            wrapperDiv.classList.toggle("checked", this.checked);
        });
    
        // Overlay text for "Marked for Deletion"
        const overlay = document.createElement("div");
        overlay.classList.add("marked-for-deletion");
        overlay.innerText = "Marked for Deletion";

        // Handle checkbox state changes
        checkbox.addEventListener("change", function () {
            if (this.checked) {
                wrapperDiv.classList.add("checked");
            } else {
                wrapperDiv.classList.remove("checked");
            }
        });

        // Filename label
        const fileLabel = document.createElement("p");
        fileLabel.innerText = file.filename || "Unknown File";
        fileLabel.style.fontSize = "12px";
        fileLabel.style.marginTop = "5px";
        fileLabel.style.wordBreak = "break-word"; 

        // Add this once outside the function
const previewModal = document.getElementById("previewModal");
const previewContent = document.getElementById("previewContent");
const closePreview = document.getElementById("closePreview");

closePreview.addEventListener("click", () => {
    previewModal.style.display = "none";
    previewContent.innerHTML = '<span id="closePreview" style="position:absolute; top:20px; right:30px; font-size:30px; cursor:pointer; color:white;">&times;</span>';
});
        let previewElement;

        if (file.type && file.type === "application/pdf") {
            previewElement = document.createElement("canvas");
            previewElement.style.width = "100%";
            previewElement.style.border = "1px solid #ddd";
            previewElement.style.borderRadius = "5px";
            previewElement.style.cursor = "pointer";

previewElement.addEventListener("click", () => {
  const fileIndex = currentCarouselFiles.findIndex(f => f.url === file.url);
openCarousel(currentCarouselFiles, fileIndex >= 0 ? fileIndex : 0, getWarrantyId(), fieldName);
});

            try {
                const pdf = await pdfjsLib.getDocument(file.url).promise;
                const page = await pdf.getPage(1);
                const scale = 1;
                const viewport = page.getViewport({ scale });
                const context = previewElement.getContext("2d");
                previewElement.height = viewport.height;
                previewElement.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                });
            } catch (error) {
                console.error("❌ Error loading PDF preview:", error);
                previewElement = document.createElement("iframe");
                previewElement.src = file.url;
                previewElement.width = "180";
                previewElement.height = "220";
                previewElement.style.borderRadius = "10px";
                previewElement.style.border = "1px solid #ddd";
            }
        } else if (file.type && typeof file.type === "string" && file.type.startsWith("image/")) {
            previewElement = document.createElement("img");
            previewElement.src = file.url; 
            previewElement.setAttribute("data-file-id", file.id || "");
            previewElement.classList.add("uploaded-file");
            previewElement.style.maxWidth = "100%";
            previewElement.style.borderRadius = "5px";
            previewElement.style.border = "1px solid #ddd";
            previewElement.style.cursor = "pointer";

previewElement.addEventListener("click", () => {
  const index = files.findIndex(f => f.url === file.url);
openCarousel(files, index >= 0 ? index : 0, getWarrantyId(), fieldName);
});
        } else {
            previewElement = document.createElement("a");
            previewElement.href = file.url;
            previewElement.innerText = "Download File";
            previewElement.target = "_blank";
            previewElement.style.display = "block";
            previewElement.style.padding = "5px";
            previewElement.style.background = "#f4f4f4";
            previewElement.style.borderRadius = "5px";
            previewElement.style.textDecoration = "none";
        }

        // Append elements
        wrapperDiv.appendChild(checkbox);
        wrapperDiv.appendChild(overlay);
        wrapperDiv.appendChild(previewElement);
        wrapperDiv.appendChild(fileLabel);
        container.appendChild(wrapperDiv);
    }

    container.style.display = "none";
    container.offsetHeight;
    container.style.display = "block";

    console.log(`✅ Files displayed for ${containerId}`);
    // ✅ Check if we need to show or hide delete button
    checkAndHideDeleteButton();
}

async function fetchCurrentImagesFromAirtable(warrantyId, imageField) {
    console.log("📡 Fetching images for Warranty ID:", warrantyId);
    
    if (!warrantyId) {
        console.error("❌ Warranty ID is missing. Cannot fetch images.");
        return [];
    }

    const url = `https://api.airtable.com/v0/${window.env.AIRTABLE_BASE_ID}/${window.env.AIRTABLE_TABLE_NAME}?filterByFormula=${encodeURIComponent(`{Warranty Record ID} = '${warrantyId}'`)}&fields[]=${imageField}`;

    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${window.env.AIRTABLE_API_KEY}` }
        });

        if (!response.ok) {
            console.error("❌ Error fetching record:", response.status, response.statusText);
            return [];
        }

        const data = await response.json();

        if (data.records.length === 0) {
            console.warn(`⚠️ No records found for Warranty ID: ${warrantyId}`);
            return [];
        }

        const record = data.records[0];

        if (record.fields && record.fields[imageField]) {
            console.log(`✅ Images found for '${warrantyId}' in field '${imageField}':`, record.fields[imageField]);
            return record.fields[imageField];
        } else {
            console.warn(`⚠️ No images found in field '${imageField}' for '${warrantyId}'`);
            return [];
        }
    } catch (error) {
        console.error("❌ Error fetching images by Warranty ID:", error);
        return [];
    }
}

async function loadImagesForLot(warrantyId, status) {
    console.log("📡 Loading images for warrantyId:", warrantyId);

    // Get elements and ensure they exist before accessing them
    const issuePicturesSection = document.getElementById("issue-pictures");
    const completedPicturesSection = document.getElementById("completed-pictures");
    const uploadIssueInput = document.getElementById("upload-issue-picture");
    const uploadCompletedInput = document.getElementById("upload-completed-picture");

    if (!issuePicturesSection || !completedPicturesSection || !uploadIssueInput || !uploadCompletedInput) {
        console.error("❌ One or more required elements are missing from the DOM.");
        return;
    }

    // Show loading indicators while fetching images
    issuePicturesSection.innerHTML = "📡 Loading issue images...";
    completedPicturesSection.innerHTML = "📡 Loading completed images...";

    try {
        // Fetch both sets of images
    const issueImages = await fetchCurrentImagesFromAirtable(warrantyId, "Picture(s) of Issue");
const completedImages = await fetchCurrentImagesFromAirtable(warrantyId, "Completed  Pictures");


        console.log("🖼️ Loaded Images - Issue:", issueImages);
        console.log("🖼️ Loaded Images - Completed:", completedImages);

        // Check if any images exist
        const hasIssueImages = issueImages && issueImages.length > 0;
        const hasCompletedImages = completedImages && completedImages.length > 0;

        // Show/Hide upload inputs based on images available
        uploadIssueInput.style.display = hasIssueImages ? "block" : "none";
        uploadCompletedInput.style.display = hasCompletedImages ? "block" : "none";

        // Clear loading message before inserting images
        issuePicturesSection.innerHTML = hasIssueImages ? "" : "";
        completedPicturesSection.innerHTML = hasCompletedImages ? "" : "";

if (!hasIssueImages && !hasCompletedImages) {
    console.warn("⚠️ No images found, hiding sections.");
    checkAndHideDeleteButton();
    return;
}

// ✅ Only show if status allows
if (status?.toLowerCase() === "scheduled- awaiting field") {
    console.log("🚫 Skipping display of issue images due to status:", status);
    // Do not show issue images
} else if (hasIssueImages) {
await displayImages(issueImages, "issue-pictures", "Picture(s) of Issue");
}

if (hasCompletedImages) {
await displayImages(completedImages, "completed-pictures", "Completed  Pictures");
}

        if (hasCompletedImages) {
await displayImages(completedImages, "completed-pictures", "Completed  Pictures");
        }

        // Ensure delete button updates correctly after image load
        setTimeout(checkAndHideDeleteButton, 500);
        checkAndHideDeleteButton();

    } catch (error) {
console.error(`❌ Error loading images for warranty ID: ${warrantyId}`, error);
        issuePicturesSection.innerHTML = "❌ Error loading issue images.";
        completedPicturesSection.innerHTML = "❌ Error loading completed images.";
    }
}

async function refreshImageContainers() {
  console.log("🔄 Refreshing image containers...");

  const warrantyId = getWarrantyId();
  if (!warrantyId) {
    console.error("❌ Cannot refresh images: missing warranty ID");
    return;
  }

  const statusField = document.getElementById("field-status");
  const status = statusField?.value || "";

  try {
    await loadImagesForLot(warrantyId, status);
    console.log("✅ Image containers refreshed successfully.");
  } catch (error) {
    console.error("❌ Failed to refresh image containers:", error);
    showToast("❌ Error refreshing images. Try again.", "error");
  }
}


function setInputValue(id, value) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`⚠️ Element with ID '${id}' not found.`);
        return;
    }

    if (id === "subcontractor-payment") {
        console.log("💰 Setting subcontractor-payment with:", value);

        // Show raw string (like "Sub Not Needed")
        if (typeof value === "string" && isNaN(parseFloat(value))) {
            element.value = value;
            return;
        }

        // Format number as currency
        const numberValue = parseFloat(value);
        if (!isNaN(numberValue)) {
            element.value = `$${numberValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        } else {
            element.value = "";
        }
        return;
    }

    // Default case
    element.value = value || "";
}

async function getRecordIdByWarrantyId(warrantyId) {
    const filterFormula = `{Warranty Record ID} = "${warrantyId}"`;
    const url = `https://api.airtable.com/v0/${window.env.AIRTABLE_BASE_ID}/${window.env.AIRTABLE_TABLE_NAME}?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=1`;
    console.log("🔎 Airtable Filter Formula:", filterFormula);
    console.log("🌐 Request URL:", url);

    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${window.env.AIRTABLE_API_KEY}` }
        });

        const data = await response.json();

        if (data.records?.length > 0) {
            console.log("✅ Found record ID by Warranty Record ID:", data.records[0].id);
            return data.records[0].id;
        }

        console.warn("❌ No record found with Warranty Record ID:", warrantyId);
        return null;
    } catch (error) {
        console.error("❌ Error fetching by Warranty Record ID:", error);
        return null;
    }
}

function showToast(message, type = "success", duration = 3000) {
    let toast = document.getElementById("toast-message");

    // Create toast element if it doesn’t exist
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast-message";
        toast.className = "toast-container";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    toast.style.background = type === "error"
        ? "rgba(200, 0, 0, 0.85)"
        : "rgba(0, 128, 0, 0.85)";

    // Remove any existing click handler to prevent duplicates
    document.removeEventListener("click", toastClickAwayHandler);

    // Add click-away dismiss logic
    function toastClickAwayHandler(e) {
        if (!toast.contains(e.target)) {
            toast.classList.remove("show");
            document.removeEventListener("click", toastClickAwayHandler);
        }
    }

    document.addEventListener("click", toastClickAwayHandler);

    // Auto-hide after duration
    setTimeout(() => {
        toast.classList.remove("show");
        document.removeEventListener("click", toastClickAwayHandler);
    }, duration);
}

async function updateAirtableRecord(tableName, lotNameOrRecordId, fields) {
    console.log("📡 Updating Airtable record for:", lotNameOrRecordId);

    const saveButton = document.getElementById("save-job");
    if (saveButton) saveButton.disabled = true;

    if (!navigator.onLine) {
        console.error("❌ No internet connection detected.");
        showToast("❌ You are offline. Please check your internet connection and try again.", "error");
        if (saveButton) saveButton.disabled = false;
        return;
    }

    try {
        let resolvedRecordId = lotNameOrRecordId;
        if (!resolvedRecordId.startsWith("rec")) {
            resolvedRecordId = await getRecordIdByWarrantyId(lotNameOrRecordId);
            if (!resolvedRecordId) {
                console.error("❌ Could not resolve Record ID for:", lotNameOrRecordId);
                return;
            }
        }

        await populateVendorDropdownWithSelection(resolvedRecordId);

        const url = `https://api.airtable.com/v0/${window.env.AIRTABLE_BASE_ID}/${tableName}/${resolvedRecordId}`;
        console.log("📡 Sending API Request to Airtable:", url);

        const sanitizedFields = Object.fromEntries(
            Object.entries(fields).filter(([key]) => key !== "Warranty Record ID")
        );

        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${window.env.AIRTABLE_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ fields: sanitizedFields })
        });

        if (!response.ok) {
            let errorDetails;
            try {
                errorDetails = await response.json();
            } catch (jsonErr) {
                console.error("❌ Failed to parse Airtable error JSON:", jsonErr);
                const text = await response.text();
                console.error("📄 Raw response body:", text);
                showToast("❌ Error updating Airtable: Unable to parse error response", "error");
                return;
            }

            console.group("📛 Airtable Update Error Details");
            console.error("❌ Status Code:", response.status);
            console.error("❌ Status Text:", response.statusText);
            console.error("❌ Error Type:", errorDetails.error?.type || "Unknown");
            console.error("❌ Error Message:", errorDetails.error?.message || "No message provided");
            console.error("📦 Full Error Object:", errorDetails);
            console.groupEnd();

            showToast(`❌ Airtable error: ${errorDetails.error?.message || 'Unknown error'}`, "error");
            return;
        }

        console.log("✅ Airtable record updated successfully:", fields);
        showToast("✅ Record updated successfully!", "success");

    } catch (error) {
        console.error("❌ Error updating Airtable:", error);
    } finally {
        if (saveButton) saveButton.disabled = false;
    }
}


function openMapApp() {
    const addressInput = document.getElementById("address");

    if (!addressInput || !addressInput.value) {
        alert("⚠️ No address available.");
        return;
    }

    const address = encodeURIComponent(addressInput.value.trim());
    const userAgent = navigator.userAgent.toLowerCase();

    // Automatically open Apple Maps on iOS
    if (userAgent.match(/(iphone|ipad|ipod)/i)) {
        window.location.href = `maps://maps.apple.com/?q=${address}`;
        return;
    }

    // Automatically open Google Maps on Android
    if (userAgent.match(/android/i)) {
        window.location.href = `geo:0,0?q=${address}`;
        return;
    }

    // Create a modal for other devices (Desktop, etc.)
    const modal = document.createElement("div");
    modal.id = "mapModal";
    modal.style.position = "fixed";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.background = "#fff";
    modal.style.padding = "20px";
    modal.style.borderRadius = "10px";
    modal.style.boxShadow = "0px 4px 6px rgba(0,0,0,0.1)";
    modal.style.zIndex = "1000";
    modal.style.textAlign = "center";

    // Modal content
    modal.innerHTML = `
        <h3>Select Navigation App</h3>
        <button id="googleMapsBtn" style="padding:10px; margin:5px; background:#4285F4; color:white; border:none; border-radius:5px; cursor:pointer;">Google Maps</button>
        <button id="wazeBtn" style="padding:10px; margin:5px; background:#1DA1F2; color:white; border:none; border-radius:5px; cursor:pointer;">Waze</button>
        <button id="closeModalBtn" style="padding:10px; margin:5px; background:#d9534f; color:white; border:none; border-radius:5px; cursor:pointer;">Close</button>
    `;

    document.body.appendChild(modal);

    // Event listeners for buttons
    document.getElementById("googleMapsBtn").addEventListener("click", function () {
        window.location.href = `https://www.google.com/maps/search/?api=1&query=${address}`;
    });

    document.getElementById("wazeBtn").addEventListener("click", function () {
        window.location.href = `https://waze.com/ul?q=${address}`;
    });

    document.getElementById("closeModalBtn").addEventListener("click", function () {
        document.body.removeChild(modal);
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    console.log("🚀 Page Loaded: JavaScript execution started!");
    
    const params = new URLSearchParams(window.location.search);
    let recordId = params.get("id") || getSavedRecordId();
    const isCarouselMode = params.get("carousel") === "true";

    console.log("📦 recordId:", recordId);
    console.log("🖼️ carousel mode:", isCarouselMode);

    if ((!recordId || recordId.trim() === "") && !isCarouselMode) {
        console.error("❌ ERROR: No record ID found in URL or localStorage!");
        alert("No job selected. Redirecting to job list.");
        window.location.href = "index.html";
        return;
    }

    // ✅ Save to localStorage if it came from URL
    if (recordId) saveRecordIdToLocal(recordId);

    console.log("✅ Record ID retrieved:", recordId);

    // ✅ Fetch Airtable API keys from environment
    const airtableApiKey = window.env?.AIRTABLE_API_KEY || "Missing API Key";
    const airtableBaseId = window.env?.AIRTABLE_BASE_ID || "Missing Base ID";
    const airtableTableName = window.env?.AIRTABLE_TABLE_NAME || "Missing Table Name";

    console.log("🔑 Airtable Credentials:", {
        API_Key: airtableApiKey ? "Loaded" : "Not Found",
        Base_ID: airtableBaseId,
        Table_Name: airtableTableName,
    });
    dropboxAccessToken = await fetchDropboxToken();
    

    if (!airtableApiKey || !airtableBaseId || !airtableTableName) {
        console.error("❌ Missing Airtable credentials! Please check your environment variables.");
        alert("Configuration error: Missing Airtable credentials.");
        return;
    }

    try {
        console.log("✅ Fetching Job Details...");
        primaryData = await fetchAirtableRecord(airtableTableName, recordId); // ✅ Assign it here

        let resolvedRecordId = recordId;
if (!resolvedRecordId.startsWith("rec")) {
  resolvedRecordId = await getRecordIdByWarrantyId(recordId);
  if (!resolvedRecordId) {
    console.error("❌ Could not resolve Record ID for:", recordId);
    return;
  }
}


await populateVendorDropdownWithSelection(resolvedRecordId);

        // ✅ Fetch Primary Job Details
        console.log("📋 Primary Data Fetched:", primaryData);

           // ✅ Populate UI with Primary Fields
populatePrimaryFields(primaryData.fields);
const lotName = primaryData.fields["Lot Number and Community/Neighborhood"];
const statusRaw = primaryData.fields["Status"];
const status = (statusRaw || "").trim().toLowerCase();
const warrantyId = primaryData.fields["Warranty Record ID"];

const redirectStatuses = [
    "pending review",
    "customer review needed",
    "material purchase needed",
    "subcontractor to pay",
    "ready to invoice",
    "completed",
    "confirmed"
];

const noLongerNeedsFieldTech = ![
    "field tech review needed",
    "scheduled awaiting field technician",
    "scheduled- awaiting field"
].includes(status);

if (redirectStatuses.includes(status) || noLongerNeedsFieldTech) {
    const fieldTechName = primaryData.fields["field tech"] || "Field Tech";
    showToast(`📦 ${lotName} status updated to "${statusRaw}" by ${fieldTechName}. Redirecting...`, "success", 6000);

    const redirectTimer = setTimeout(() => {
        window.location.href = "index.html";
    }, 6000);

    // Cancel redirect if toast is dismissed early
    document.addEventListener("click", function handleClickAway(event) {
        const toast = document.getElementById("toast-message");
        if (toast && !toast.contains(event.target)) {
            clearTimeout(redirectTimer);
            toast.classList.remove("show");
            document.removeEventListener("click", handleClickAway);
            console.log("🚫 Redirect canceled by user.");
        }
    });

    return;
}

await loadImagesForLot(warrantyId, statusRaw).then(() => {
    checkAndHideDeleteButton();
});

        
        // ✅ Fetch Subcontractors Based on `b` Value and Populate Dropdown

if (!recordId.startsWith("rec")) {
    resolvedRecordId = await getRecordIdByWarrantyId(recordId);
    if (!resolvedRecordId) {
        console.error("❌ Could not resolve Record ID for:", recordId);
        return;
    }
}

await fetchAndPopulateSubcontractors(resolvedRecordId);

        /** ✅ Subcontractor Handling Logic **/
        console.log("✅ Setting up subcontractor logic...");

        const subcontractorCheckbox = document.querySelector("#sub-not-needed");
        const subcontractorDropdown = document.querySelector("#subcontractor-dropdown");
        const saveButton = document.querySelector("#save-job");
 // Ensure the delete button exists before referencing it
 const deleteButton = document.getElementById("delete-images-btn");

 
 if (!deleteButton) {
     console.warn("⚠️ Warning: Delete button not found in the DOM. Skipping event listener setup.");
     return; // Exit to prevent errors
 }
        if (!subcontractorCheckbox || !subcontractorDropdown || !saveButton) {
            console.warn("⚠️ Subcontractor checkbox, dropdown, or save button not found in the DOM!");
            return;
        }

        console.log("✅ Found elements:", {
            checkbox: subcontractorCheckbox,
            dropdown: subcontractorDropdown,
            saveButton: saveButton
        });

        // Function to handle checkbox toggle
        function toggleSubcontractorField() {
            const input = document.getElementById("subcontractor-dropdown");
            const datalist = document.getElementById("subcontractor-options");
            const checkbox = document.getElementById("sub-not-needed");
            const paymentContainer = document.getElementById("subcontractor-payment-container");
            const paymentInput = document.getElementById("subcontractor-payment");
        
            if (!input || !checkbox || !datalist || !paymentContainer || !paymentInput) return;
        
            if (checkbox.checked) {
                input.value = "Sub Not Needed";
                input.setAttribute("readonly", "true");
                input.style.pointerEvents = "none";
                input.style.background = "#e9ecef";
        
                paymentContainer.style.display = "none";
                paymentInput.value = "Sub Not Needed"; // Set value to match logic
        
                // 🔁 Add "Sub Not Needed" to datalist if missing
                const exists = Array.from(datalist.options).some(opt => opt.value === "Sub Not Needed");
                if (!exists) {
                    const option = document.createElement("option");
                    option.value = "Sub Not Needed";
                    option.label = "Sub Not Needed (Manual Entry)";
                    datalist.appendChild(option);
                }
            } else {
                input.value = "";
                input.removeAttribute("readonly");
                input.style.pointerEvents = "auto";
                input.style.background = "";
        
                paymentContainer.style.display = "block";
                paymentInput.value = ""; // Clear when re-enabled
            }
        }
        
        function checkImagesVisibility() {
            const images = document.querySelectorAll(".image-container img"); // Adjust selector if needed
            if (images.length > 0) {
                deleteButton.style.display = "block"; // Show button if images exist
            } else {
                deleteButton.style.display = "none"; // Hide button if no images
            }
        }
    
        // Optional: Run check when images are dynamically added/removed
        const observer = new MutationObserver(checkImagesVisibility);
        observer.observe(document.body, { childList: true, subtree: true });
    
        // Handle delete button click (assuming you have logic to delete images)
        deleteButton.addEventListener("click", function () {
            document.querySelectorAll(".image-container img.selected").forEach(img => img.remove());
            checkImagesVisibility(); // Re-check visibility after deletion
        });

        // Initialize subcontractor checkbox and dropdown state from job data
  
        
        

        // Set initial checkbox state from job data
        setCheckboxValue("sub-not-needed", primaryData.fields["Subcontractor Not Needed"]);
        setTimeout(() => {
            toggleSubcontractorField();
        }, 50);
        // Apply subcontractor logic on load
        toggleSubcontractorField();

        console.log("🎯 Subcontractor logic fully integrated!");
        
        /** ✅ Add Event Listener for Save Button **/
        saveButton.addEventListener("click", async function () {
            const scrollPosition = window.scrollY;

            const requiredFields = ["job-name", "StartDate", "EndDate"];
            for (const id of requiredFields) {
              const el = document.getElementById(id);
              if (el && !el.value.trim()) {
                el.focus();
                showToast(`⚠️ Please fill out ${id.replace("-", " ")}`, "error");
                return;
              }
            }
          
            console.log("💾 Save button clicked!");
            const warrantyId = getWarrantyId(); // <-- ensure this is defined BELOW getWarrantyId()
            if (!warrantyId) {
                alert("Warranty ID missing!");
                return;
              }
            const lotName = document.getElementById("job-name")?.value?.trim();
            if (!lotName) {
                return;
            }
        
            try {
                // 🔄 Get the original record from Airtable to compare datetime values
                const recordData = await fetchAirtableRecord(window.env.AIRTABLE_TABLE_NAME, warrantyId);

                if (!recordData || !recordData.fields) {
                    alert("❌ Could not load record data. Try again.");
                    return;
                }
        
                const originalStartUTC = recordData.fields["StartDate"];
                const originalEndUTC = recordData.fields["EndDate"];
                const currentStartLocal = document.getElementById("StartDate")?.value;
                const currentEndLocal = document.getElementById("EndDate")?.value;
                
                // 🔥 ADD THESE TWO LINES
                const convertedStartUTC = safeToISOString(currentStartLocal);
                const convertedEndUTC = safeToISOString(currentEndLocal);
                
                
        
                const convertedStartAMPM = safeToISOString(currentStartLocal);
              
                const updatedFields = {}; // add this above all field assignments

                const selectedBillable = document.querySelector('input[name="billable-status"]:checked');
                if (!selectedBillable) {
                    return;
                }
                
                const value = selectedBillable?.value?.trim();
                
                if (value === "Billable" || value === "Non Billable") {
                    updatedFields["Billable/ Non Billable"] = value.trim();
                } else {
                    console.warn("⚠️ Invalid Billable value. Not updating field:", value);
                }
                                let jobData = {
                    "DOW to be Completed": document.getElementById("dow-completed").value,
                    "Subcontractor Not Needed": subcontractorCheckbox.checked,
                    "Billable/ Non Billable": selectedBillable ? selectedBillable.value : undefined,
                    "Homeowner Builder pay": document.getElementById("homeowner-builder").value,
                    "Billable Reason (If Billable)": document.getElementById("billable-reason").value,
                    "Field Review Not Needed": document.getElementById("field-review-not-needed")?.checked || false,
"Field Review Needed": document.getElementById("field-review-needed")?.checked || false,


                    "Subcontractor Payment": parseFloat(document.getElementById("subcontractor-payment").value) || 0,
                    "Materials Needed": document.getElementById("materials-needed").value,
"Field Tech Reviewed": document.getElementById("field-tech-reviewed")?.checked || false,
"Job Completed": document.getElementById("job-completed")?.checked || false,
             //       "Material Not Needed": document.getElementById("material-not-needed").checked,
                };
                const fieldTechReviewedEl = document.getElementById("field-tech-reviewed");
                const jobCompletedEl = document.getElementById("job-completed");
                
                if (!fieldTechReviewedEl) console.warn("⚠️ Element #field-tech-reviewed not found.");
                if (!jobCompletedEl) console.warn("⚠️ Element #job-completed not found.");
                
                jobData["Field Tech Reviewed"] = fieldTechReviewedEl?.checked || false;
                jobData["Job Completed"] = jobCompletedEl?.checked || false;
                
// ✅ Safely parse Subcontractor Payment input
const paymentInput = document.getElementById("subcontractor-payment");
let paymentValue = paymentInput?.value?.replace(/[^0-9.]/g, ""); // Strip $ and commas
paymentValue = parseFloat(paymentValue);
if (!isNaN(paymentValue)) {
    jobData["Subcontractor Payment"] = paymentValue;
}


                // ✅ Add dates only if they changed
                if (convertedStartAMPM !== originalStartUTC) {
                    jobData["StartDate"] = convertedStartAMPM;
                    console.log("🕓 Updated StartDate:", convertedStartUTC);
                } else {
                    console.log("⏸ No change in StartDate.");
                }
        
                if (convertedEndUTC !== originalEndUTC) {
                    jobData["EndDate"] = convertedEndUTC;
                    console.log("🕓 Updated EndDate:", convertedEndUTC);
                } else {
                    console.log("⏸ No change in EndDate.");
                }
        
                // ✅ Handle subcontractor logic
                const selectedSub = subcontractorDropdown.value.trim();
if (subcontractorCheckbox.checked) {
    jobData["Subcontractor"] = "Sub Not Needed";
} else if (selectedSub !== "") {
    jobData["Subcontractor"] = selectedSub;
}
        
                console.log("📤 Sending updated fields to Airtable:", jobData);
                console.log("🔎 Sending Billable value:", updatedFields["Billable/ Non Billable"]);

                if (!warrantyId) {
    console.error("❌ Warranty ID is missing.");
    return;
}
                // ✅ Save to Airtable
                await updateAirtableRecord(window.env.AIRTABLE_TABLE_NAME, warrantyId, jobData);
        
                // ✅ Refresh UI with new data
                const refreshed = await fetchAirtableRecord(window.env.AIRTABLE_TABLE_NAME, warrantyId);

                if (refreshed) {
                    await populatePrimaryFields(refreshed.fields);
                    showToast("✅ Job saved successfully!", "success");
                }
        
            } catch (err) {
                console.error("❌ Error saving job data:", err);
            }
        });
            
        // ✅ Apply subcontractor logic on load
        toggleSubcontractorField();
    
        // ✅ Event listener for checkbox
        subcontractorCheckbox.addEventListener("change", () => {
            toggleSubcontractorField();
        
            const status = document.getElementById("field-status")?.value || "";
            const normalizedStatus = status.toLowerCase().trim();
        
            console.log("📦 Subcontractor checkbox changed");
            console.log("🔍 Raw status:", status);
            console.log("🔍 Normalized status:", normalizedStatus);
        
            let shouldHideCompleted = [
                "scheduled- awaiting field",
                "field tech review needed"
            ].includes(normalizedStatus);
            
            // ✅ Force override: never hide if explicitly this status
            if (normalizedStatus === "scheduled awaiting field technician") {
                shouldHideCompleted = false;
            }
            
            if (normalizedStatus === "scheduled awaiting field technician") {
                console.log("✅ Forcing show for Scheduled Awaiting Field Technician");
            
                [
                    "job-completed-container",
                    "job-completed",
                    "job-completed-check",
                    "upload-completed-picture",
                    "completed-pictures-heading",
                    "completed-pictures"
                ].forEach(showElement);
            }
            
            const elementsToToggle = [
                "completed-pictures",
                "upload-completed-picture",
                "completed-pictures-heading",
                "job-completed-container",
                "job-completed",
                "job-completed-check"
            ];  
        });
        
        console.log("🎯 Subcontractor logic fully integrated!");
        
        // ✅ Fetch and Populate Subcontractor Dropdown
        await fetchAndPopulateSubcontractors(resolvedRecordId);
        
    } catch (error) {
        const timestamp = new Date().toISOString();
        console.groupCollapsed(`❌ Error occurred [${timestamp}]`);
        console.error("🔍 Operation Context: [Describe what was being done here]");
        console.error("📛 Error Name:", error.name || "N/A");
        console.error("📝 Error Message:", error.message || "No message");
        if (error.stack) {
            console.error("📜 Stack Trace:", error.stack);
        }
        console.error("🧾 Full Error Object:", error);
        console.groupEnd();
    }
    
 function safeToISOString(dateString) {
    if (!dateString || typeof dateString !== "string") return null;
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? null : d.toISOString();
}

// ✅ Global state
let currentCarouselFiles = [];
let currentCarouselIndex = 0;
let currentCarouselField = null;
let currentWarrantyId = null;

// ✅ Open the carousel
function openCarousel(files, startIndex = 0, warrantyId, field) {
  const overlay = document.getElementById("attachment-carousel");
  const body = document.getElementById("carousel-body");

  if (!overlay || !body) return;

  console.log("🚀 Opening carousel with files:", files, "Start index:", startIndex);

  currentCarouselFiles = files;
  currentCarouselIndex = startIndex;
  currentCarouselField = field;
  currentWarrantyId = warrantyId;

  overlay.style.display = "flex";
  displayCarouselItem(currentCarouselIndex);
}

// ✅ Display an individual item
function displayCarouselItem(index) {
  const body = document.getElementById("carousel-body");

  if (
    !body ||
    !Array.isArray(currentCarouselFiles) ||
    index < 0 ||
    index >= currentCarouselFiles.length
  ) {
    console.warn("⚠️ Invalid carousel state or index:", index, "Files:", currentCarouselFiles);
    return; // Do NOT close overlay
  }

  console.log("📸 Displaying carousel index:", index);
  console.log("📁 Files:", currentCarouselFiles);

  const file = currentCarouselFiles[index];
  body.innerHTML = ""; // Clear previous content

  if (file.type?.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = file.url;
    img.alt = file.filename || "Image Preview";
    img.style.maxWidth = "100%";
    img.style.maxHeight = "80vh";
    img.style.borderRadius = "8px";
    img.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
    body.appendChild(img);
  } else if (file.type === "application/pdf") {
    const iframe = document.createElement("iframe");
    iframe.src = file.url;
    iframe.title = file.filename || "PDF Preview";
    iframe.style.width = "80vw";
    iframe.style.height = "80vh";
    iframe.style.border = "none";
    iframe.style.borderRadius = "8px";
    body.appendChild(iframe);
  } else {
    const fallback = document.createElement("p");
    fallback.textContent = "⚠️ Unsupported file type.";
    fallback.style.color = "#fff";
    fallback.style.fontSize = "18px";
    body.appendChild(fallback);
  }
}

// ✅ Close the carousel
function closeCarousel() {
  const overlay = document.getElementById("attachment-carousel");
  if (overlay) overlay.style.display = "none";
}

// ✅ Setup navigation buttons
document.getElementById("carousel-next")?.addEventListener("click", (e) => {
  e.preventDefault();
  if (currentCarouselFiles.length > 0) {
    currentCarouselIndex = (currentCarouselIndex + 1) % currentCarouselFiles.length;
    displayCarouselItem(currentCarouselIndex);
  }
});

document.getElementById("carousel-prev")?.addEventListener("click", (e) => {
  e.preventDefault();
  if (currentCarouselFiles.length > 0) {
    currentCarouselIndex =
      (currentCarouselIndex - 1 + currentCarouselFiles.length) % currentCarouselFiles.length;
    displayCarouselItem(currentCarouselIndex);
  }
});

// ✅ Close button logic
document.getElementById("close-carousel")?.addEventListener("click", () => {
  closeCarousel();
});

// ✅ Optional: Delete button
document.getElementById("delete-current-attachment")?.addEventListener("click", async (e) => {
  e.preventDefault(); // ✅ STOP form from submitting
  e.stopPropagation(); // ✅ (Optional but helps if inside a form)

  console.log("🗑️ Delete button clicked in carousel.");

  if (!currentWarrantyId) {
    console.error("❌ currentWarrantyId is missing.");
    alert("Missing warranty ID. Cannot proceed with deletion.");
    return;
  }

  if (!currentCarouselField) {
    console.error("❌ currentCarouselField is missing.");
    alert("Missing image field name. Cannot proceed with deletion.");
    return;
  }

  if (!currentCarouselFiles || !currentCarouselFiles[currentCarouselIndex]) {
    console.error("❌ No current file selected or invalid index.");
    alert("No file selected. Cannot delete.");
    return;
  }

  const fileToDelete = currentCarouselFiles[currentCarouselIndex];
  console.log("📁 Attempting to delete file:", fileToDelete);

  if (!fileToDelete.id) {
    console.warn("⚠️ File missing 'id'. Cannot remove from Airtable:", fileToDelete);
    alert("File is missing a valid ID. Cannot delete.");
    return;
  }

  if (!confirm(`Delete ${fileToDelete.filename}?`)) {
    console.log("❌ Deletion canceled by user.");
    return;
  }

  try {
    const existing = await fetchCurrentImagesFromAirtable(currentWarrantyId, currentCarouselField);
    console.log("📦 Existing images fetched:", existing);

    const updated = existing.filter(file => file.id !== fileToDelete.id);
    console.log("🧹 Images after filtering out deleted file:", updated);

    await updateAirtableRecord(window.env.AIRTABLE_TABLE_NAME, currentWarrantyId, {
      [currentCarouselField]: updated
    });

    console.log("✅ Airtable field updated successfully.");

    currentCarouselFiles = updated;

    if (currentCarouselFiles.length === 0) {
      closeCarousel();
    } else {
      currentCarouselIndex = Math.min(currentCarouselIndex, currentCarouselFiles.length - 1);
      displayCarouselItem(currentCarouselIndex);
    }

    showToast("✅ File deleted successfully.", "success");

  } catch (error) {
    console.error("❌ Error deleting file from Airtable:", error);
    showToast("❌ Failed to delete file. Try again.", "error");
  }
});





document.addEventListener("DOMContentLoaded", () => {
  const carouselOverlay = document.getElementById("attachment-carousel");
  if (!carouselOverlay) return;

  let touchStartX = 0;

  carouselOverlay.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
  }, false);

  carouselOverlay.addEventListener("touchend", e => {
    const touchEndX = e.changedTouches[0].screenX;
    const diffX = touchEndX - touchStartX;

    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Swipe right → previous
        currentCarouselIndex = (currentCarouselIndex - 1 + currentCarouselFiles.length) % currentCarouselFiles.length;
      } else {
        // Swipe left → next
        currentCarouselIndex = (currentCarouselIndex + 1) % currentCarouselFiles.length;
      }
      displayCarouselItem(currentCarouselIndex);
    }
  }, false);
});



    async function ensureDropboxToken() {
        if (!dropboxAccessToken) {
            console.log("🔄 Fetching Dropbox token...");
            dropboxAccessToken = await fetchDropboxToken();
            console.log("🔐 Dropbox Access Token Retrieved:", dropboxAccessToken);
                    }
    
        if (!dropboxAccessToken) {
            console.error("❌ Dropbox Access Token could not be retrieved.");
            alert("Error: Could not retrieve Dropbox access token.");
            return false;
        }
        return true;
    }
    
    function updateDeleteButtonLabel() {
        const deleteButton = document.getElementById("delete-images-btn");
        if (!deleteButton) {
            console.warn("⚠️ Delete button not found in the DOM.");
            return;
        }
    
        const selectedImages = document.querySelectorAll(".image-checkbox:checked").length;
        console.log(`🖼️ Selected Images: ${selectedImages}`);
    
        deleteButton.textContent = selectedImages === 1 ? "Delete Selected Image" : "Delete Selected Images";
    
        // Log if the button state is changing
        if (selectedImages > 0) {
            console.log("✅ Delete button is now visible.");
            deleteButton.style.display = "block"; // Ensure the button is visible
        } else {
            console.log("🚫 No images selected. Hiding delete button.");
            deleteButton.style.display = "none";
        }
    }

    // 🔹 Listen for checkbox changes and update the button label accordingly
    document.addEventListener("change", function (event) {
        if (event.target.classList.contains("image-checkbox")) {
            console.log(`📌 Checkbox changed: ${event.target.dataset.imageId} | Checked: ${event.target.checked}`);
            checkAndHideDeleteButton();
        }
    });
    
    // 🔹 Initial check on page load to set correct delete button state
    document.addEventListener("DOMContentLoaded", function () {
        console.log("📢 Page Loaded - Checking Initial Delete Button State");
        updateDeleteButtonLabel();
    });
    
    document.getElementById("upload-issue-picture").addEventListener("change", async function (event) {
        if (event.target.files.length > 0) {
          if (await ensureDropboxToken()) {
            showToast("📤 Uploading issue photo...", "info");
            await uploadToDropbox(event.target.files, "Picture(s) of Issue");
            showToast("✅ Photo uploaded successfully!", "success");
          } else {
            showToast("❌ Dropbox authentication failed!", "error");
          }
        }
      });
      
      document.getElementById("upload-completed-picture").addEventListener("change", async function (event) {
        if (event.target.files.length > 0) {
          if (await ensureDropboxToken()) {
            showToast("📤 Uploading completed photo...", "info");
            await uploadToDropbox(event.target.files, "Completed  Pictures");
            showToast("✅ Photo uploaded successfully!", "success");
          } else {
            showToast("❌ Dropbox authentication failed!", "error");
          }
        }
      });
      
    const labels = document.querySelectorAll('.billable-label');
    let lastSelectedBillable = null;
    
    labels.forEach(label => {
        const input = label.querySelector('input');
    
        label.addEventListener('click', (e) => {
            e.preventDefault(); // prevent default radio behavior
    
            const isSelected = label.classList.contains('selected');
    
            // Deselect all
            labels.forEach(l => {
                l.classList.remove('selected');
                l.querySelector('input').checked = false;
            });
    
            const billableReasonDiv = document.getElementById("billable-reason-container");
            const homeownerBuilderSelect = document.getElementById("homeowner-builder");
            const homeownerBuilderContainer = homeownerBuilderSelect?.parentElement;
    
            if (isSelected) {
                // Toggle off
                lastSelectedBillable = null;
                console.log("🚫 Billable selection cleared.");
                if (billableReasonDiv) billableReasonDiv.style.display = "none";
                if (homeownerBuilderContainer) homeownerBuilderContainer.style.display = "none";
            } else {
                // Set new selection
                label.classList.add('selected');
                input.checked = true;
                lastSelectedBillable = input.value;
                console.log("✅ Billable selected:", input.value);
    
                const showExtra = input.value === "Billable";
    
                if (billableReasonDiv) {
                    billableReasonDiv.style.display = showExtra ? "block" : "none";
                    console.log(`${showExtra ? "📄 Showing" : "🙈 Hiding"} Billable Reason dropdown.`);
                }
    
                if (homeownerBuilderContainer) {
                    homeownerBuilderContainer.style.display = showExtra ? "block" : "none";
                    console.log(`${showExtra ? "👷 Showing" : "🙈 Hiding"} Homeowner/Builder select.`);
                }
            }
        });
    });
    
    async function fetchAirtableRecord(tableName, lotNameOrRecordId) {
        console.log("📡 Fetching record for:", lotNameOrRecordId);
    
        if (!lotNameOrRecordId) {
            console.error("❌ Lot Name or Record ID is missing. Cannot fetch record.");
            return null;
        }
    
        let recordId = lotNameOrRecordId;
    
        if (!recordId.startsWith("rec")) {
            console.log("🔍 Searching for Record ID using Lot Name...");
            recordId = await getRecordIdByWarrantyId(recordId);
            
            if (!recordId) {
                console.warn(`⚠️ No record found for Lot Name: "${lotNameOrRecordId}"`);
                return null;
            }
        }
    
        const url = `https://api.airtable.com/v0/${window.env.AIRTABLE_BASE_ID}/${tableName}/${recordId}`;
        console.log("🔗 Airtable API Request:", url);
    
        try {
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${window.env.AIRTABLE_API_KEY}` }
            });
    
            if (!response.ok) {
                console.error(`❌ Error fetching record: ${response.status} ${response.statusText}`);
                return null;
            }
    
            const data = await response.json();
            console.log("✅ Airtable Record Data:", data);
    
            if (data.fields && !data.fields["Completed  Pictures"]) {
                console.warn("⚠️ 'Completed  Pictures' field is missing. Initializing as empty array.");
                data.fields["Completed  Pictures"] = []; 
            }
    
            return data;
        } catch (error) {
            console.error("❌ Error fetching Airtable record:", error);
            return null;
        }
    }

 
    


    
document.querySelectorAll(".job-link").forEach(link => {
    link.addEventListener("click", function (event) {
        event.preventDefault();

        const jobId = this.dataset.recordId?.trim();
        const jobName = this.textContent.trim();

        if (!jobId) {
            console.error("❌ ERROR: Missing job ID in the link. Check 'data-record-id' attribute.");
            alert("Error: No job ID found. Please try again.");
            return;
        }

        console.log("🔗 Navigating to Job:", jobId);
        console.log("🏠 Job Name:", jobName);

        // ✅ Save to localStorage before redirect
        saveRecordIdToLocal(jobId);
console.log("💾 Saved record ID to localStorage:", jobId);

        const url = new URL(window.location.origin + window.location.pathname);
        url.searchParams.set("id", jobId);

        console.log("🌍 Navigating to:", url.toString());
        window.location.href = url.toString();
    });
});


    document.addEventListener("DOMContentLoaded", function () {
        const subcontractorDropdown = document.getElementById("subcontractor-dropdown");
        const paymentContainer = document.getElementById("subcontractor-payment-container");
        const subNotNeededCheckbox = document.getElementById("sub-not-needed");
    
        subcontractorDropdown.addEventListener("change", function () {
            const selectedValue = subcontractorDropdown.value.trim().toLowerCase();
    
            if (selectedValue === "sub not needed") {
                // Hide payment input and check the box
                paymentContainer.style.display = "none";
                if (subNotNeededCheckbox) subNotNeededCheckbox.checked = true;
            } else {
                // Show payment input and uncheck the box
                paymentContainer.style.display = "";
                if (subNotNeededCheckbox) subNotNeededCheckbox.checked = false;
            }
        });
    });
    
    async function fetchSubcontractorNameById(recordId) {
        const url = `https://api.airtable.com/v0/${window.env.AIRTABLE_BASE_ID}/tbl9SgC5wUi2TQuF7/${recordId}`;
      
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${window.env.AIRTABLE_API_KEY}`
          }
        });
      
        if (!response.ok) {
          console.error("Failed to fetch subcontractor record", recordId);
          return "";
        }
      
        const data = await response.json();
        return data.fields["Subcontractor Company Name"] || ""; // adjust "Name" to your actual field
      }
      
    
// 🔹 Populate Primary Fields
async function populatePrimaryFields(job) {
    console.log("🧪 Populating UI with fields:", job);
    console.log("🔎 Status at page load:", job["Status"]);

    function safeValue(value) {
        return value === undefined || value === null ? "" : value;
    }
    setInputValue("warranty-id", job["Warranty Record ID"]);
    setInputValue("job-name", safeValue(job["Lot Number and Community/Neighborhood"]));
    setInputValue("field-tech", safeValue(job["field tech"]));
    setInputValue("address", safeValue(job["Address"]));
    setInputValue("homeowner-name", safeValue(job["Homeowner Name"]));
    setInputValue("contact-email", safeValue(job["Contact Email"]));
    setInputValue("description", safeValue(job["Description of Issue"]));
    setInputValue("dow-completed", safeValue(job["DOW to be Completed"])); 
    setInputValue("materials-needed", safeValue(job["Materials Needed"]));
    setInputValue("field-status", safeValue(job["Status"]));
    setCheckboxValue("sub-not-needed", job["Subcontractor Not Needed"] || false);
    setInputValue("StartDate", convertUTCToLocalInput(job["StartDate"]));
    setInputValue("EndDate", convertUTCToLocalInput(job["EndDate"]));
    setInputValue("subcontractor", safeValue(job["Subcontractor"]));
    setInputValue("subcontractor-payment", safeValue(job["Subcontractor Payment"])); 

  // HIDE the job completed container if Status is "Field Tech Review Needed"
  const jobCompletedContainer = document.querySelector(".job-completed-container");
  if (job["Status"] === "Field Tech Review Needed") {
    jobCompletedContainer.style.display = "none";
  } else {
    jobCompletedContainer.style.display = "block";
  }

    const subNotNeededCheckbox = document.getElementById("sub-not-needed");
if (subNotNeededCheckbox) {
    const isChecked = !!job["Subcontractor Not Needed"];
    subNotNeededCheckbox.checked = isChecked;
    console.log("📦 Subcontractor Not Needed (fetched):", isChecked);
}

    document.getElementById("original-subcontractor").textContent = job["Original Subcontractor"] || "";
    const originalSubElement = document.getElementById("original-subcontractor");
const originalSubContainer = originalSubElement?.parentElement;

const originalPhone = job["Original Subcontractor Phone Number"];
const originalSub = job["Original Subcontractor"];

if (Array.isArray(originalSub) && originalSub.length > 0) {
  const originalSubId = originalSub[0];

  fetchSubcontractorNameById(originalSubId).then(name => {
    if (name && originalPhone) {
      originalSubElement.textContent = name;
      originalSubElement.onclick = () => {
        console.log(`📞 Calling ${originalPhone}...`);
        window.location.href = `tel:${originalPhone}`;
      };
      originalSubContainer.style.display = "";
    } else {
      originalSubElement.textContent = "";
      originalSubElement.onclick = null;
      originalSubContainer.style.display = "none";
    }
  });
} else {
  originalSubElement.textContent = "";
  originalSubElement.onclick = null;
  originalSubContainer.style.display = "none";
}

  //  setCheckboxValue("material-not-needed", job["Material Not Needed"] || false);
  setTimeout(() => {
    const materialsTextarea = document.getElementById("materials-needed");
    const materialSelect = document.getElementById("material-needed-select");

    if (materialsTextarea && materialsTextarea.value.trim() !== "") {
        let exists = Array.from(materialSelect.options).some(opt => opt.value === "Needs Materials");
        if (!exists) {
            const option = document.createElement("option");
            option.value = "Needs Materials";
            option.textContent = "Needs Materials";
            materialSelect.appendChild(option);
        }
        materialSelect.value = "Needs Materials";
    }

    updateMaterialsTextareaVisibility(); // ← ✅ toggle visibility after value is set
}, 50); // slight delay to ensure dropdown is in DOM

  // 🔄 Auto-set dropdown to "Needs Materials" if textarea has content
const materialsTextarea = document.getElementById("materials-needed");
const materialSelect = document.getElementById("material-needed-select");
const textareaContainer = document.getElementById("materials-needed-container");
const homeownerBuilderSelect = document.getElementById("homeowner-builder");
const homeownerBuilderContainer = homeownerBuilderSelect?.parentElement;

if (materialsTextarea && materialSelect && textareaContainer) {
    const value = materialsTextarea.value.trim();
    console.log("📦 Materials Needed value:", value);

    if (value !== "") {
        // Ensure "Needs Materials" option exists
        let hasNeedsMaterials = Array.from(materialSelect.options).some(opt => opt.value === "Needs Materials");
        if (!hasNeedsMaterials) {
            const option = document.createElement("option");
            option.value = "Needs Materials";
            option.textContent = "Needs Materials";
            materialSelect.appendChild(option);
            console.log("➕ Added 'Needs Materials' option to dropdown.");
        }

        materialSelect.value = "Needs Materials";
        textareaContainer.style.display = "block";
        console.log("✅ Set dropdown to 'Needs Materials' and showed textarea.");
    } else {
        console.log("📭 Textarea is empty, leaving dropdown as is.");
    }
}

    // ✅ Set dropdown's data-selected attribute for use in dropdown population
    const subDropdown = document.getElementById("subcontractor-dropdown");
    if (subDropdown) {
        subDropdown.setAttribute("data-selected", safeValue(job["Subcontractor"]));
    }

    console.log("✅ Fields populated successfully.");
    console.log("🕓 Start Date shown in UI:", document.getElementById("StartDate").value);

    adjustTextareaSize("description");
    adjustTextareaSize("dow-completed");
    adjustTextareaSize("materials-needed");

    if (job["Status"] === "Scheduled- Awaiting Field") {
        console.log("🚨 Job is 'Scheduled - Awaiting Field' - Hiding upload elements...");
    
        [
            "billable-status",
            "homeowner-builder",
            "subcontractor",
            "vendor-dropdown-container",
            "materials-needed",
            "billable-reason",
            "field-review-not-needed",
            "field-review-needed",
            "field-tech-reviewed",
            "additional-fields-container",
            "message-container",
            "materials-needed-label",
            "upload-issue-picture-label",
            "field-tech-reviewed-label",
            "materials-needed-container",
            "material-needed-container",
            "issue-pictures",                
            "upload-issue-picture",         
            "trigger-issue-upload", 
            "issue-file-list"              
        ].forEach(hideElementById);
          if (job["Status"] !== "Field Tech Review Needed") {
            hideParentFormGroup("field-tech-reviewed");
        }
        
    } else {
        console.log("✅ Status is NOT 'Scheduled- Awaiting Field' - Showing all fields.");

        showElement("job-completed");
        showElement("job-completed-label");

        const billableValue = safeValue(job["Billable/ Non Billable"]);
        document.querySelectorAll('label.billable-label').forEach(label => {
            const radio = label.querySelector('input[name="billable-status"]');
            if (!radio) return;
        
            if (radio.value === billableValue) {
                radio.checked = true;
                label.classList.add("selected");
            } else {
                label.classList.remove("selected");
                radio.checked = false;
            }
        
            // 🔄 Show or hide the Billable Reason dropdown
            const billableReasonDiv = document.getElementById("billable-reason-container");
            if (radio.checked) {
                if (radio.value === "Billable") {
                    billableReasonDiv.style.display = "block";
                    homeownerBuilderContainer.style.display = "block";
                    console.log("📄 Showing Billable Reason and Homeowner/Builder dropdowns.");
                } else {
                    billableReasonDiv.style.display = "none";
                    homeownerBuilderContainer.style.display = "none";
                    console.log("🙈 Hiding Billable Reason and Homeowner/Builder dropdowns.");
                }
            }
        });
        setInputValue("homeowner-builder", safeValue(job["Homeowner Builder pay"]));
        setInputValue("billable-reason", safeValue(job["Billable Reason (If Billable)"]));
        console.log("🧪 Subcontractor Payment Raw Value:", job["Subcontractor Payment"]);
        console.log("🔍 Calling setInputValue for 'subcontractor-payment'");
        setCheckboxValue("field-tech-reviewed", job["Field Tech Reviewed"]);
    }

    setCheckboxValue("job-completed-checkbox", job["Job Completed"]);

    const status = (job["Status"] || "").trim().toLowerCase();

    // 🚨 Hide completed job section if status is "Field Tech Review Needed"
    if (status === "field tech review needed") {
        console.log("🚨 Field Tech Review Needed - Hiding completed job elements (override).");
        [
            "completed-pictures",
            "upload-completed-picture",
            "completed-pictures-heading",
            "file-input-container",
            "job-completed-container",
            "job-completed",
            "job-completed-check"
        ].forEach(hideElementById);
    }
       
    // Always show save button
    showElement("save-job");
    
}



function hideParentFormGroup(elementId) {
    const el = document.getElementById(elementId);
    if (el && el.closest(".form-group")) {
        el.closest(".form-group").style.display = "none";
    }
}

function updateMaterialsTextareaVisibility() {
    const materialSelect = document.getElementById("material-needed-select");
    const textareaContainer = document.getElementById("materials-needed-container");

    if (!materialSelect || !textareaContainer) return;

    if (materialSelect.value === "Needs Materials") {
        console.log("📂 Showing materials-needed textarea based on dropdown");
        textareaContainer.style.display = "block";
    } else {
        console.log("📁 Hiding materials-needed textarea based on dropdown");
        textareaContainer.style.display = "none";
    }
}

// Function to hide an element safely
function hideElementById(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`⚠️ Cannot hide — Element not found: ${elementId}`);
        return;
    }
    console.log(`✅ Hiding element: ${elementId}`);
    element.style.display = "none";
    element.style.margin = "0";     // reset margin
    element.style.padding = "0";    // reset padding
    element.style.height = "0";     // if it's a block element that may take height
}

// Function to resize any textarea dynamically
function adjustTextareaSize(id) {
    const textarea = document.getElementById(id);
    if (textarea) {
        textarea.style.height = "auto"; // Reset height
        textarea.style.height = textarea.scrollHeight + "px"; // Adjust height based on content
    }
}

// Ensure resizing also happens when a user types in the textarea
document.addEventListener("input", function (event) {
    if (event.target.tagName.toLowerCase() === "textarea") {
        adjustTextareaSize(event.target.id);
    }
});

function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = "block";
    } else {
        console.warn(`⚠️ Element not found: ${elementId}`);
    }
}


   
function checkAndHideDeleteButton() {
    const deleteButton = document.getElementById("delete-images-btn");

    if (!deleteButton) {
        console.warn("⚠️ Delete button not found.");
        return;
    }

    const issueImages = document.querySelectorAll("#issue-pictures .file-wrapper img").length;
    const completedImages = document.querySelectorAll("#completed-pictures .file-wrapper img").length;

    console.log(`📌 Checking images: Issue Images: ${issueImages}, Completed Images: ${completedImages}`);

    if (issueImages > 0 || completedImages > 0) {
        console.log("✅ Images found. Showing delete button.");
        deleteButton.style.display = "block";
    } else {
        console.log("🚫 No images found. Hiding delete button.");
        deleteButton.style.display = "none";
    }
}

document.getElementById("delete-images-btn").addEventListener("click", async function (event) {
    event.preventDefault(); // ✅ Prevents page refresh
    console.log("🗑️ Delete Images button clicked! ✅");
    const warrantyId = getWarrantyId();

    const checkboxes = document.querySelectorAll(".image-checkbox:checked");
    if (checkboxes.length === 0) {
        alert("⚠️ Please select at least one image to delete.");
        console.log("⚠️ No images selected.");
        return;
    }

    // 🔹 Extract selected image IDs
    const imageIdsToDelete = Array.from(checkboxes).map(cb => cb.dataset.imageId).filter(id => id);
    console.log("📌 Selected Image IDs to Delete:", imageIdsToDelete);

    if (imageIdsToDelete.length === 0) {
        console.warn("⚠️ No valid image IDs found for deletion.");
        return;
    }

    // 🔹 Delete from both "Picture(s) of Issue" and "Completed Pictures"
    await deleteImagesByLotName(warrantyId, imageIdsToDelete, "Picture(s) of Issue");
    await deleteImagesByLotName(warrantyId, imageIdsToDelete, "Completed  Pictures");

    console.log("✅ Images deleted successfully from both fields!");

    // ✅ Refresh UI to reflect changes
    await loadImagesForLot(warrantyId, document.getElementById("field-status")?.value);
});

/** ✅ Function to remove images from Airtable */
async function deleteImagesByLotName(warrantyId, imageIdsToDelete, imageField) {
    console.log(`🗑️ Attempting to delete images from '${imageField}' for Lot Name:`, warrantyId);

    // Validate input parameters
    if (!warrantyId) {
        console.error("❌ Lot Name is missing. Cannot delete images.");
        return;
    }

    if (!Array.isArray(imageIdsToDelete) || imageIdsToDelete.length === 0) {
        console.warn("⚠️ No image IDs provided for deletion. Skipping process.");
        return;
    }

    try {
        // Fetch existing images
        if (!warrantyId) {
            console.error("❌ Warranty ID is missing.");
            return;
        }
        let existingImages = await fetchCurrentImagesFromAirtable(warrantyId, imageField);
        
        if (!existingImages || existingImages.length === 0) {
            console.warn(`⚠️ No images found in '${imageField}'. Nothing to delete.`);
            return;
        }

        console.log(`📸 Current Images in '${imageField}' Before Deletion:`, existingImages);

        // Filter out images to be deleted
        const updatedImages = existingImages.filter(img => !imageIdsToDelete.includes(img.id));

        console.log("📌 Updated image list after deletion:", updatedImages);

        // Check if anything was deleted
        if (updatedImages.length === existingImages.length) {
            console.warn("⚠️ No matching images found for deletion. Skipping Airtable update.");
            return;
        }

        console.log(`📩 Sending updated image list to Airtable for '${imageField}':`, updatedImages);
        checkAndHideDeleteButton();

        // Update Airtable record
        await updateAirtableRecord(window.env.AIRTABLE_TABLE_NAME, warrantyId, {
            [imageField]: updatedImages.length > 0 ? updatedImages : []
        });

console.log(`✅ Successfully deleted selected images from '${imageField}' for Warranty ID: ${warrantyId}`);

        // ✅ **Refresh UI by reloading images dynamically**
        await loadImagesForLot(warrantyId);

    } catch (error) {
        console.error(`❌ Error deleting images from '${imageField}' in Airtable:`, error);
    }
}

async function fetchImagesByLotName(warrantyId, imageField) {
    console.log(`📡 Fetching images for Warranty ID: ${warrantyId}, field: ${imageField}`);

    if (!warrantyId) {
        console.error("❌ Warranty ID is missing. Cannot fetch images.");
        return [];
    }

    const filterFormula = `{Warranty Record ID} = "${warrantyId}"`;
    const url = `https://api.airtable.com/v0/${window.env.AIRTABLE_BASE_ID}/${window.env.AIRTABLE_TABLE_NAME}?filterByFormula=${encodeURIComponent(filterFormula)}&fields[]=${encodeURIComponent(imageField)}`;

    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${window.env.AIRTABLE_API_KEY}` }
        });

        if (!response.ok) {
            console.error("❌ Error fetching record:", response.status, response.statusText);
            return [];
        }

        const data = await response.json();
        return data.records[0]?.fields?.[imageField] || [];
    } catch (error) {
        console.error("❌ Error fetching images:", error);
        return [];
    }
}



    async function testFetchImages() {
        try {
            const recordData = await fetchAirtableRecord(airtableTableName, recordId);
            console.log("✅ Airtable Record Data:", recordData);
    
            if (recordData.fields["Picture(s) of Issue"]) {
                console.log("🖼️ Issue Pictures Field Data:", recordData.fields["Picture(s) of Issue"]);
                console.log("🖼️ Completed Pictures Field Data:", recordData.fields["Completed  Pictures"]);

            } else {
                console.warn("⚠️ 'Picture(s) of Issue' field is empty or missing.");
            }
        } catch (error) {
            console.error("❌ Error fetching test images from Airtable:", error);
        }
    }
    
    testFetchImages();
    document.getElementById("delete-images-btn").addEventListener("click", function () {
        console.log("🗑️ Delete Images button clicked! ✅");
    });
    
    // ✅ Save record ID in localStorage before navigating away
function saveRecordIdToLocal(recordId) {
    localStorage.setItem("currentRecordId", recordId);
}

// ✅ Retrieve record ID from localStorage on page load
function getSavedRecordId() {
    return localStorage.getItem("currentRecordId");
}



// ✅ Set the record ID on page load
document.addEventListener("DOMContentLoaded", () => {
let recordId = new URLSearchParams(window.location.search).get("id") || getSavedRecordId();
console.log("📦 Resolved record ID:", recordId);

    if (!recordId) {
        console.error("❌ No record ID found! Preventing redirect loop.");
        alert("No job selected.");
        return; // ✅ Prevents infinite redirects
    }

    console.log("🆔 Using saved Record ID:", recordId);
    saveRecordIdToLocal(recordId); 
    setTimeout(checkAndHideDeleteButton, 500); // slight delay if images render async
    document.getElementById("material-needed-select").addEventListener("change", updateMaterialsTextareaVisibility);

});

    document.addEventListener("DOMContentLoaded", function () {
        console.log("✅ Job Details Page Loaded.");
    
        const formElements = document.querySelectorAll(
            'input:not([disabled]), textarea:not([disabled]), select:not([disabled])'
        );
    
        formElements.forEach(element => {
            element.addEventListener("input", () => handleInputChange(element), { once: true });
            element.addEventListener("change", () => handleInputChange(element), { once: true });
        });
    
        function handleInputChange(element) {
            console.log(`📝 Field changed: ${element.id}, New Value:`, element.type === "checkbox" ? element.checked : element.value);
        }
          // ✅ 💡 Add this right here:
          setTimeout(() => {
            const input = document.getElementById("upload-completed-picture");
            const label = document.querySelector("label[for='upload-completed-picture']");
        
            if (input) input.style.setProperty("display", "none", "important");
            if (label) label.style.setProperty("display", "none", "important");
        }, 500);
        
    });
    
    document.getElementById("save-job").addEventListener("click", async function () {
        const scrollPosition = window.scrollY; // ✅ Add this as your first line

        console.log("🔄 Save button clicked. Collecting all field values...");
    
        const warrantyId = getWarrantyId();
    
        if (!warrantyId) {
            const warrantyElement = document.getElementById("warranty-id");
            const rawWarrantyId = warrantyElement ? warrantyElement.value : undefined;
    
            console.error("❌ Warranty ID is missing. Cannot update Airtable.");
            console.warn("🕵️ Debug Info:");
            console.warn("• DOM Element with ID 'warranty-id':", warrantyElement);
            console.warn("• Raw Value from 'warranty-id' input:", rawWarrantyId);
            console.warn("• Trimmed Value (used as Warranty ID):", rawWarrantyId ? rawWarrantyId.trim() : "❌ No value to trim");
    
            showToast("❌ Error: Warranty ID is missing or empty. Please check the field.", "error");
            alert("⚠️ Cannot save because the 'Warranty ID' is missing or invalid. Please ensure the field is filled in.");
            return;
        }
        
        console.log("🕒 Saving StartDate:", document.getElementById("StartDate").value);

        // ✅ Require materials-needed textarea if "Needs Materials" selected
const materialSelect = document.getElementById("material-needed-select");
const materialsTextarea = document.getElementById("materials-needed");

if (materialSelect && materialsTextarea) {
    if (materialSelect.value === "Needs Materials" && (!materialsTextarea.value.trim())) {
        materialsTextarea.focus();
        showToast("⚠️ Please list the materials needed before saving.", "error");
        console.warn("❌ Cannot save: Materials description is required.");
        return; // ⛔ Prevent saving
    }
}

        const currentRecord = await fetchAirtableRecord(airtableTableName, recordId);
        const originalStartUTC = currentRecord?.fields?.["StartDate"];
        const originalEndUTC = currentRecord?.fields?.["EndDate"];
                
        const currentStartLocal = document.getElementById("StartDate")?.value;
        const currentEndLocal = document.getElementById("EndDate")?.value;
        
      

        const subNotNeededCheckbox = document.getElementById("sub-not-needed");
const subcontractorNotNeeded = subNotNeededCheckbox?.checked || false;
        
        const updatedFields = {}; // begin fresh field collection

        if (!currentRecord || !currentRecord.fields) {
            alert("❌ Could not load original record data. Try again.");
            return;
        }
        updatedFields["Subcontractor Not Needed"] = subcontractorNotNeeded;

        // ✅ Only add StartDate if it changed
        const convertedStartUTC = safeToISOString(currentStartLocal);
        if (convertedStartUTC && convertedStartUTC !== originalStartUTC) {
            updatedFields["StartDate"] = convertedStartUTC;
        } else {
            console.log("⏸ No change or empty StartDate.");
        }
        
        const convertedEndUTC = safeToISOString(currentEndLocal);
        if (convertedEndUTC && convertedEndUTC !== originalEndUTC) {
            updatedFields["EndDate"] = convertedEndUTC;
        } else {
            console.log("⏸ No change or empty EndDate.");
        }
        
        
        // ✅ Manually handle radio buttons for Billable/Non Billable
        const selectedRadio = document.querySelector('input[name="billable-status"]:checked');
        const billableField = selectedRadio?.getAttribute("data-field") || "Billable/ Non Billable";
        
        // Handle toggle-off logic
        updatedFields[billableField] = selectedRadio ? selectedRadio.value.trim() : ""; // send empty string to Airtable
        console.log("📤 Billable Field Value:", updatedFields[billableField]);
        
        const subcontractorPaymentInput = document.getElementById("subcontractor-payment");
if (subcontractorPaymentInput) {
    let subcontractorPaymentRaw = subcontractorPaymentInput.value.replace(/[^0-9.]/g, ""); // Remove $ and commas
    let subcontractorPayment = parseFloat(subcontractorPaymentRaw);

    if (!isNaN(subcontractorPayment)) {
        updatedFields["Subcontractor Payment"] = subcontractorPayment; // ✅ Send pure number
    } else {
        updatedFields["Subcontractor Payment"] = null; // or 0 if you prefer
    }
}
// ✅ Vendor patch (already exists in your code)
const vendorDropdown = document.getElementById("vendor-dropdown");
const selectedVendorName = vendorDropdown?.value?.trim();
const selectedVendorId = vendorIdMap[selectedVendorName];

if (selectedVendorName && selectedVendorId) {
  updatedFields["Material Vendor"] = [selectedVendorId]; // 🔗 Link record
} else if (selectedVendorName) {
  console.warn("⚠️ Vendor selected but not found in vendorIdMap:", selectedVendorName);
}

// ✅ ⬇️ Place this logging block here
console.log("🧪 Material Vendor ID:", selectedVendorId);
console.log("🧪 Vendor Field Value Being Sent:", updatedFields["Material Vendor"]);

// ⬇️ Airtable update happens after logging
await updateAirtableRecord(window.env.AIRTABLE_TABLE_NAME, warrantyId, updatedFields);



        const inputs = document.querySelectorAll("input:not([disabled]), textarea:not([disabled]), select:not([disabled])");

        inputs.forEach(input => {

            const fieldName = input.getAttribute("data-field");
            if (!fieldName) return;
        
            // 🛑 SKIP this field because we already handled it correctly above
            if (fieldName === "Subcontractor Payment") return; 
        
            if (input.name === "billable-status") return;
        
            let value = input.value.trim();
        
            if (input.type === "checkbox") {
                value = input.checked;
            } else if (input.tagName === "SELECT") {
                if (value === "") return;
            }
            else if (input.type === "number") {
                value = value === "" || isNaN(value) ? null : parseFloat(value);
            } else if (input.type === "date") {
                value = formatDateToISO(value);
            } else {
                value = value === "" ? null : value;
            }
        
            updatedFields[fieldName] = value;
        });
        
        // Clean empty strings to nulls (avoid Airtable errors)
        for (let key in updatedFields) {
            const value = updatedFields[key];
        
            if (value === "") updatedFields[key] = null;
            if (typeof value === "undefined") delete updatedFields[key];
            if (typeof value === "number" && isNaN(value)) delete updatedFields[key];
        }
        
        console.log("📌 Final Fields to be Updated:", JSON.stringify(updatedFields, null, 2));
    
        if (Object.keys(updatedFields).length === 0) {
            console.warn("⚠️ No valid fields found to update.");
            alert("No changes detected.");
            return;
        }
    
        try {
            // ✅ Update Airtable with cleaned values
            await updateAirtableRecord(window.env.AIRTABLE_TABLE_NAME, warrantyId, updatedFields);
            window.scrollTo({ top: scrollPosition, behavior: "instant" });

            console.log("✅ Airtable record updated successfully.");
            const debugStartDate = safeToISOString(document.getElementById("StartDate")?.value);
            console.log("🕔 UTC Sent to Airtable:", debugStartDate || "No valid StartDate");
            
            showToast("✅ Job details saved successfully!", "success");
    
           // ✅ Refresh UI after save to reflect correct date format
           await new Promise(resolve => setTimeout(resolve, 3000)); // ⏳ wait 3 seconds for automation

           console.log("🔄 Fetching updated data from Airtable...");
           const updatedData = await fetchAirtableRecord(window.env.AIRTABLE_TABLE_NAME, warrantyId);
           
           if (updatedData && updatedData.fields) {
               console.log("📩 Reloading checkboxes with updated Airtable data:", updatedData);
               await populatePrimaryFields(updatedData.fields);
           
               const statusRaw = updatedData.fields["Status"];
               const status = (statusRaw || "").trim().toLowerCase();
           
                              const redirectStatuses = [
                                "pending review",
                                "customer review needed",
                                "material purchase needed",
                                "subcontractor to pay",
                                "ready to invoice",
                                "completed",
                                "confirmed"
                            ];
                            
                            const noLongerNeedsFieldTech = ![
                                "field tech review needed",
                                "scheduled awaiting field technician",
                                "scheduled- awaiting field"
                            ].includes(status);
                            
                            if (redirectStatuses.includes(status) || noLongerNeedsFieldTech) {
                                showToast("success", 4000);
                                setTimeout(() => {
                                    window.location.href = "index.html";
                                }, 4000);
                                return;
                            }
           }
        } catch (error) {
            console.error("❌ Error updating Airtable:", error);
            showToast("❌ Error saving job details. Please try again.", "error");
        }
    });
    
    function formatDateToISO(dateStr) {
        if (!dateStr) return ""; // If empty, return blank
    
        const dateObj = new Date(dateStr);
        if (isNaN(dateObj.getTime())) {
            console.error("❌ Invalid date format:", dateStr);
            return ""; // Return empty if invalid
        }
    
        return dateObj.toISOString().split("T")[0]; // Convert to 'YYYY-MM-DD'
    }
    
    
    
   // 🔹 Fetch Dropbox Token from Airtable
async function fetchDropboxToken() {
    try {
        const url = `https://api.airtable.com/v0/${airtableBaseId}/tbl6EeKPsNuEvt5yJ?maxRecords=1`;

        console.log("🔄 Fetching latest Dropbox credentials from Airtable...");
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${airtableApiKey}` }
        });

        if (!response.ok) {
            throw new Error(`❌ Error fetching Dropbox token: ${response.statusText}`);
        }

        const data = await response.json();
        const record = data.records[0];

        if (!record) {
            console.error("❌ No record found in Airtable view.");
            return null;
        }

        const fields = record.fields;

        dropboxAppKey = fields["Dropbox App Key"];
        dropboxAppSecret = fields["Dropbox App Secret"];
        const token = fields["Dropbox Token"];
        const refreshToken = fields["Dropbox Refresh Token"];
        dropboxRefreshToken = fields["Dropbox Refresh Token"]; 

        if (!dropboxAppKey || !dropboxAppSecret) {
            console.error("❌ Dropbox App Key or Secret is missing.");
            return null;
        }

        // 🛠 If access token is present, use it
        if (token) {
            dropboxAccessToken = token;
            return dropboxAccessToken;
        }

        // 🛠 If no token, try to refresh it
        if (refreshToken) {
            console.log("🔄 No access token found, refreshing using refresh token...");
            return await refreshDropboxAccessToken(refreshToken, dropboxAppKey, dropboxAppSecret);
        }

        console.warn("⚠️ No Dropbox token or refresh token found.");
        return null;

    } catch (error) {
        console.error("❌ Error fetching Dropbox token:", error);
        return null;
    }
}
 
async function refreshDropboxAccessToken(refreshToken, dropboxAppKey, dropboxAppSecret) {
    console.log("🔄 Refreshing Dropbox Access Token...");
    const dropboxAuthUrl = "https://api.dropboxapi.com/oauth2/token";

    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken);
    params.append("client_id", dropboxAppKey);
    params.append("client_secret", dropboxAppSecret);

    try {
        const response = await fetch(dropboxAuthUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`❌ Error refreshing Dropbox token:`, data);
            return null;
        }

        console.log("✅ New Dropbox Access Token:", data.access_token);

        dropboxAccessToken = data.access_token;

        // ✅ Update Airtable with the new token
        const tokenUpdateUrl = `https://api.airtable.com/v0/${window.env.AIRTABLE_BASE_ID}/tbl6EeKPsNuEvt5yJ?maxRecords=1`;
        const tokenResponse = await fetch(tokenUpdateUrl, {
            headers: {
                Authorization: `Bearer ${window.env.AIRTABLE_API_KEY}`
            }
        });

        const tokenData = await tokenResponse.json();
        const recordId = tokenData.records?.[0]?.id;

        if (!recordId) {
            console.warn("⚠️ Could not find Dropbox credentials record ID to update.");
            return dropboxAccessToken;
        }

        // Update Airtable record with the new token
        const patchUrl = `https://api.airtable.com/v0/${window.env.AIRTABLE_BASE_ID}/tbl6EeKPsNuEvt5yJ/${recordId}`;
        await fetch(patchUrl, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${window.env.AIRTABLE_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fields: {
                    "Dropbox Token": dropboxAccessToken
                }
            })
        });

        console.log("📡 Updated Airtable with new Dropbox access token.");
        return dropboxAccessToken;

    } catch (error) {
        console.error("❌ Error refreshing Dropbox access token:", error);
        return null;
    }
}



    function convertUTCToLocalInput(utcDateString) {
        if (!utcDateString) return "";
        const utcDate = new Date(utcDateString);
        const offsetMs = utcDate.getTimezoneOffset() * 60000;
        const localDate = new Date(utcDate.getTime() - offsetMs);
        return localDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
    }
       
    // 🔹 Dropbox Image Upload
let uploadInProgress = false; // Global flag for unload warning

async function uploadToDropbox(files, targetField) {
    if (!dropboxAccessToken) {
        console.error("❌ Dropbox token is missing.");
        return;
    }

    uploadInProgress = true;

    const warrantyId = getWarrantyId();
    const existingImages = await fetchCurrentImagesFromAirtable(warrantyId, targetField) || [];
    const uploadedUrls = [...existingImages];
    const creds = { appKey: dropboxAppKey, appSecret: dropboxAppSecret, refreshToken: dropboxRefreshToken };

    // ⏳ Show and reset progress UI
    const progressContainer = document.getElementById("upload-progress-container");
    const progressBar = document.getElementById("upload-progress-bar");
    const progressLabel = document.getElementById("upload-progress-label");
    progressContainer.style.display = "block";
    progressBar.style.width = "0%";
    progressLabel.textContent = "Starting upload...";

    let completed = 0;
    const total = files.length;

  for (let index = 0; index < files.length; index++) {
  const file = files[index];
  try {
    progressLabel.textContent = `Compressing (${index + 1} of ${files.length})...`;
    const compressedFile = await compressImage(file);

    progressLabel.textContent = `Uploading (${index + 1} of ${files.length})...`;
    const dropboxUrl = await uploadFileToDropbox(compressedFile, dropboxAccessToken, creds);

    if (dropboxUrl) {
      const uploadedFile = {
        url: dropboxUrl,
        filename: file.name || "upload.png",
      };
      uploadedUrls.push(uploadedFile);

      await displayImages(
        [uploadedFile],
        targetField === "Completed  Pictures" ? "completed-pictures" : "issue-pictures",
        targetField
      );
    }

    const percent = Math.round(((index + 1) / files.length) * 100);
    progressBar.style.width = `${percent}%`;
  } catch (error) {
    console.error(`❌ Upload failed for ${file.name}:`, error);
    showToast(`❌ Failed to upload ${file.name}`, "error");
  }
}
    await updateAirtableRecord(window.env.AIRTABLE_TABLE_NAME, warrantyId, {
        [targetField]: uploadedUrls
    });

    uploadInProgress = false;
    checkAndHideDeleteButton();

    progressBar.style.width = `100%`;
    progressLabel.textContent = "✅ Upload complete!";
    setTimeout(() => {
        progressContainer.style.display = "none";
    }, 2000);

  showToast("✅ All files uploaded successfully!", "success");

// ⏳ Wait so the user sees the toast, then refresh only image section
try {
    console.log("🔁 Calling refreshImageContainers...");

  await refreshImageContainers(); // ✅ Ensure we wait for it to finish
  console.log("✅ Image containers refreshed after upload.");
} catch (err) {
  console.error("❌ Failed to refresh image containers after upload:", err);
}

}

async function compressImage(file) {
    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
        useWebWorker: true
    };

    try {
        if (file.type.startsWith("image/")) {
            const compressed = await window.imageCompression(file, options);
            console.log(`📉 Compressed ${file.name} from ${file.size} to ${compressed.size} bytes`);
            return compressed;
        } else {
            return file; // Skip non-image
        }
    } catch (err) {
        console.error("❌ Image compression failed:", err);
        return file;
    }
}

   // 🔹 Upload File to Dropbox
async function uploadFileToDropbox(file, token, creds = {}, attempt = 1) {
    if (!token) {
        console.error("❌ No Dropbox token provided.");
        return null;
    }

    const dropboxUploadUrl = "https://content.dropboxapi.com/2/files/upload";
    const path = `/uploads/${encodeURIComponent(file.name)}`;

    try {
        const response = await fetch(dropboxUploadUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Dropbox-API-Arg": JSON.stringify({
                    path: path,
                    mode: "add",
                    autorename: true,
                    mute: false
                }),
                "Content-Type": "application/octet-stream"
            },
            body: file
        });

        if (response.status === 429) {
            const delayMs = Math.pow(2, attempt) * 1000; // exponential backoff
            console.warn(`⏳ Rate limit hit. Retrying in ${delayMs / 1000}s (Attempt ${attempt})`);

            if (attempt <= 5) {
                await new Promise(res => setTimeout(res, delayMs));
                return await uploadFileToDropbox(file, token, creds, attempt + 1);
            } else {
                console.error("❌ Max retry attempts reached for rate limiting.");
                return null;
            }
        }

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error("❌ Dropbox Upload Error:", errorResponse);

            const tag = errorResponse?.error?.[".tag"];
            if (
                tag === "expired_access_token" ||
                errorResponse?.error_summary?.startsWith("expired_access_token")
            ) {
                console.warn("⚠️ Dropbox token expired. Refreshing...");

                // Refresh the token
                await refreshDropboxAccessToken(creds.refreshToken, creds.appKey, creds.appSecret);
                const newToken = await fetchDropboxToken();

                if (newToken) {
                    console.log("🔄 Retrying file upload with refreshed token...");
                    return await uploadFileToDropbox(file, newToken, creds); // Recursive retry
                }
            }

            return null;
        }

        const data = await response.json();
        console.log("✅ File uploaded successfully:", data);
        return await getDropboxSharedLink(data.path_lower);

    } catch (error) {
        console.error("❌ Error during Dropbox upload:", error);
        return null;
    }
}



 window.addEventListener("beforeunload", function (e) {
    if (uploadInProgress) {
        e.preventDefault();
        e.returnValue = "Uploads are still in progress. Are you sure you want to leave?";
        return "Uploads are still in progress. Are you sure you want to leave?";
    }
});

    // 🔹 Get Dropbox Shared Link
  async function getDropboxSharedLink(filePath) {
  const url = "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${dropboxAccessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        path: filePath,
        settings: {
          requested_visibility: "public"
        }
      })
    });

    if (response.status === 409) {
      console.warn("⚠️ Shared link already exists. Fetching existing link...");
      return await getExistingDropboxLink(filePath); // 🧠 Fallback handler
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Dropbox shared link error: ${errorData?.error_summary || response.statusText}`);
    }

    const data = await response.json();
    return convertToDirectLink(data.url);

  } catch (error) {
    console.error("Dropbox link error:", error);
    return null;
  }
}


    async function fetchAndPopulateSubcontractors(resolvedRecordId) {
        console.log("🚀 Fetching branch `b` and 'Subcontractor' for record:", resolvedRecordId);
    
        const airtableBaseId = window.env.AIRTABLE_BASE_ID;
        const primaryTableId = "tbl6EeKPsNuEvt5yJ"; // Table where `b` and `Subcontractor` are stored
        const subcontractorTableId = "tbl9SgC5wUi2TQuF7"; // Subcontractor Table
    
        if (!resolvedRecordId) {
            console.error("❌ Record ID is missing.");
            return;
        }
    
        try {
            // 1️⃣ Fetch primary record
            const primaryUrl = `https://api.airtable.com/v0/${airtableBaseId}/${primaryTableId}/${resolvedRecordId}`;
            console.log(`🔗 Fetching Primary Record URL: ${primaryUrl}`);
    
            const primaryResponse = await fetch(primaryUrl, {
                headers: { Authorization: `Bearer ${window.env.AIRTABLE_API_KEY}` }
            });
    
            if (!primaryResponse.ok) {
                throw new Error(`❌ Error fetching primary record: ${primaryResponse.statusText}`);
            }
    
            const primaryData = await primaryResponse.json();
            const branchB = primaryData.fields?.b;
            const currentSubcontractor = primaryData.fields?.Subcontractor;
    
            if (!branchB) {
                console.warn("⚠️ No branch `b` found for this record.");
                return;
            }
    
            console.log(`📌 Found Branch 'b': ${branchB}`);
            console.log(`🔧 Current Subcontractor: ${currentSubcontractor || "None"}`);
    
            // 2️⃣ Fetch subcontractors for this branch
            let allSubcontractors = await fetchAllSubcontractors(airtableBaseId, subcontractorTableId, branchB);
    
            // 3️⃣ If the current subcontractor isn't in the list, add it manually
            const namesOnly = allSubcontractors.map(sub => sub.name);
            if (currentSubcontractor && !namesOnly.includes(currentSubcontractor)) {
                allSubcontractors.push({
                    name: currentSubcontractor,
                    vanirOffice: "Previously Selected"
                });
                console.log("➕ Appended missing subcontractor to the list.");
            }
    
            // 4️⃣ Populate dropdown with updated list
            populateSubcontractorDropdown(allSubcontractors, currentSubcontractor);
    
        } catch (error) {
            console.error("❌ Error fetching subcontractors:", error);
        }
    }
    
    // 🔹 Function to fetch all subcontractors (Handles offsets)
    async function fetchAllSubcontractors(baseId, tableId, branchB) {
        let allRecords = [];
        let offset = null;
    
        do {
            let url = `https://api.airtable.com/v0/${baseId}/${tableId}?filterByFormula=${encodeURIComponent(`{Vanir Branch} = '${branchB}'`)}&fields[]=Subcontractor Company Name&fields[]=Vanir Branch`;
            if (offset) {
                url += `&offset=${offset}`;
            }
    
            console.log(`🔗 Fetching Subcontractors URL: ${url}`);
    
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${window.env.AIRTABLE_API_KEY}` }
            });
    
            if (!response.ok) {
                throw new Error(`❌ Error fetching subcontractors: ${response.statusText}`);
            }
    
            const data = await response.json();
            allRecords.push(...data.records);
    
            // If Airtable returns an offset, we need to fetch more records
            offset = data.offset || null;
    
        } while (offset);
    
        console.log(`📦 Retrieved ${allRecords.length} total subcontractors from Airtable.`);
    
        return allRecords.map(record => ({
            name: record.fields['Subcontractor Company Name'] || 'Unnamed Subcontractor',
            vanirOffice: record.fields['Vanir Branch'] || 'Unknown Branch'
        }));
    }
    
async function getExistingDropboxLink(filePath) {
  const url = "https://api.dropboxapi.com/2/sharing/list_shared_links";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${dropboxAccessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        path: filePath,
        direct_only: true
      })
    });

    if (!response.ok) {
      throw new Error(`Error listing existing shared links: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.links && data.links.length > 0) {
      return convertToDirectLink(data.links[0].url);
    } else {
      console.warn("⚠️ No shared links found for:", filePath);
      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching existing Dropbox link:", error);
    return null;
  }
}

    
    function convertToDirectLink(sharedUrl) {
        if (sharedUrl.includes("dropbox.com")) {
            return sharedUrl.replace("www.dropbox.com", "dl.dropboxusercontent.com").replace("?dl=0", "?raw=1");
        }
        return sharedUrl;
    }
    
    document.getElementById("subcontractor-dropdown").addEventListener("change", function () {
        const selectedValue = this.value.trim().toLowerCase();
        console.log("📌 Subcontractor Selected:", selectedValue);
    
        const paymentContainer = document.getElementById("subcontractor-payment-container");
        const subNotNeededCheckbox = document.getElementById("sub-not-needed");
    
        if (selectedValue === "sub not needed") {
            // Only check box and hide payment if value is "Sub Not Needed"
            if (paymentContainer) paymentContainer.style.display = "none";
            if (subNotNeededCheckbox) subNotNeededCheckbox.checked = true;
        } else {
            // Uncheck the box and show payment input
            if (paymentContainer) paymentContainer.style.display = "";
            if (subNotNeededCheckbox) subNotNeededCheckbox.checked = false;
        }
    });
    
    
    function populateSubcontractorDropdown(subcontractors, currentSelection = "") {
        console.log("📌 Populating the subcontractor dropdown...");
    
        const existing = document.getElementById("subcontractor-dropdown");
    
        const parent = existing?.parentElement;
        if (!parent) {
            console.error("❌ Subcontractor dropdown element not found.");
            return;
        }

        // Create input field
        const input = document.createElement("input");
        input.setAttribute("list", "subcontractor-options");
        input.setAttribute("id", "subcontractor-dropdown");
        input.setAttribute("placeholder", "Select or type subcontractor...");
        input.setAttribute("data-field", "Subcontractor"); // ✅ Add this line

        input.style.width = "100%";
        input.style.padding = "10px";
        input.style.borderRadius = "5px";
        input.style.border = "1px solid #ccc";
        input.value = currentSelection;
    
        parent.replaceChild(input, existing);
    
        // Create datalist
        let dataList = document.getElementById("subcontractor-options");
        if (!dataList) {
            dataList = document.createElement("datalist");
            dataList.id = "subcontractor-options";
            document.body.appendChild(dataList);
        } else {
            dataList.innerHTML = ""; // clear previous
        }
    
        // Add "Sub Not Needed" at the top
        const subNotNeeded = document.createElement("option");
        subNotNeeded.value = "Sub Not Needed";
        subNotNeeded.label = "Sub Not Needed (Manual Entry)";
        dataList.appendChild(subNotNeeded);
    
        // Sort and fill datalist with unique options
        const added = new Set();
        const sortedSubs = subcontractors
            .filter(sub => sub.name && sub.name !== "Sub Not Needed")
            .sort((a, b) => a.name.localeCompare(b.name));
    
        sortedSubs.forEach(({ name, vanirOffice }) => {
            if (added.has(name)) return;
    
            const option = document.createElement("option");
            option.value = name;
            option.label = name === currentSelection
                ? `⭐ ${name} `
                : `${name} `;
    
            dataList.appendChild(option);
            added.add(name);
        });
    }
        
    // ✅ Call this function when the page loads
    document.addEventListener('DOMContentLoaded', populateSubcontractorDropdown);

    function setCheckboxValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.checked = Boolean(value);
            console.log(`✅ Checkbox ${id} set to:`, element.checked);
        }
    }
});

let vendorIdMap = {};

async function fetchVendors() {
    const apiKey = 'patCnUsdz4bORwYNV.5c27cab8c99e7caf5b0dc05ce177182df1a9d60f4afc4a5d4b57802f44c65328';
    const baseId = 'appO21PVRA4Qa087I';
    const tableId = 'tblHZqptShyGhbP5B';
    const view = 'viwioQYJrw5ZhmfIN';
  
    const url = `https://api.airtable.com/v0/${baseId}/${tableId}?view=${view}`;
    const headers = { Authorization: `Bearer ${apiKey}` };
  
    try {
      const response = await fetch(url, { headers });
      const data = await response.json();
  
      const dropdown = document.getElementById("vendor-dropdown");
      if (!dropdown) return;
  
      dropdown.innerHTML = '<option value="">Select a Vendor...</option>';
      vendorIdMap = {}; // reset
  
      data.records.forEach(record => {
        const name = record.fields["Name"];
        if (name) {
          vendorIdMap[name] = record.id;
  
          const option = document.createElement("option");
          option.value = name;
          option.textContent = name;
          dropdown.appendChild(option);
        }
      });
  
      return vendorIdMap;
    } catch (error) {
      console.error("❌ Error fetching vendors:", error);
    }
  }
  
  async function populateVendorDropdownWithSelection(recordId) {
    const dropdown = document.getElementById("vendor-dropdown");
    if (!dropdown) {
      console.warn("⚠️ Vendor dropdown element not found.");
      return;
    }
  
    console.log("🔍 Starting vendor dropdown population for record:", recordId);
  
    // 1. Fetch current record to get linked vendor
    const currentRecordUrl = `https://api.airtable.com/v0/${window.env.AIRTABLE_BASE_ID}/tbl6EeKPsNuEvt5yJ/${recordId}`;
    const headers = {
      Authorization: `Bearer ${window.env.AIRTABLE_API_KEY}`
    };
    
      
  
    let selectedVendorId = null;
  
    try {
      console.log("📡 Fetching current record from Airtable:", currentRecordUrl);
      const response = await fetch(currentRecordUrl, { headers });
      const data = await response.json();
      console.log("✅ Current record data:", data);
  
      const vendorField = data.fields["Material Vendor"];
      if (Array.isArray(vendorField) && vendorField.length > 0) {
        selectedVendorId = vendorField[0]; // ID of linked vendor
        console.log("🔗 Found linked Material Vendor ID:", selectedVendorId);
      } else {
        console.log("ℹ️ No linked Material Vendor found for this record.");
      }
    } catch (error) {
      console.error("❌ Failed to fetch current record:", error);
    }
  
    // 2. Fetch all vendors
    const vendorListUrl = `https://api.airtable.com/v0/${window.env.AIRTABLE_BASE_ID}/tblHZqptShyGhbP5B?view=viwioQYJrw5ZhmfIN`;
  
    try {
      console.log("📡 Fetching vendor list from Airtable:", vendorListUrl);
      const vendorResponse = await fetch(vendorListUrl, { headers });
      const vendorData = await vendorResponse.json();
      console.log(`✅ Fetched ${vendorData.records.length} vendors`);
  
      // 3. Clear old options and add new ones
      dropdown.innerHTML = `<option value="">Select a Vendor...</option>`;
  
      vendorData.records.forEach(vendor => {
        const option = document.createElement("option");
        option.value = vendor.id;
        option.textContent = vendor.fields["Name"] || "(No name)";
        
        if (vendor.id === selectedVendorId) {
          option.selected = true;
          console.log(`⭐ Preselected vendor: ${option.textContent} (${vendor.id})`);
        }
      
        dropdown.appendChild(option);
      });  
  
      console.log("✅ Vendor dropdown populated successfully.");
    } catch (error) {
      console.error("❌ Failed to fetch vendor list:", error);
    }
  }
  
  
  