async function fetchVendors() {
    const apiKey = 'patCnUsdz4bORwYNV.5c27cab8c99e7caf5b0dc05ce177182df1a9d60f4afc4a5d4b57802f44c65328';
    const baseId = 'appeNSp44fJ8QYeY5';
    const tableName = 'tblLEYdDi0hfD9fT3';
    const view = 'viw8m7cAu6Oao2WiK';

    const url = `https://api.airtable.com/v0/${baseId}/${tableName}?view=${view}`;
    const headers = {
        Authorization: `Bearer ${apiKey}`
    };

    try {
        const response = await fetch(url, { headers });
        const data = await response.json();

        const dropdown = document.getElementById("vendor-dropdown");

        if (!dropdown) {
            console.warn("⚠️ vendor-dropdown not found.");
            return;
        }

        data.records.forEach(record => {
            const name = record.fields["Name"];
            if (name) {
                const option = document.createElement("option");
                option.value = name;
                option.textContent = name;
                dropdown.appendChild(option);
            }
        });
    } catch (error) {
        console.error("❌ Error fetching vendors:", error);
    }
}

document.addEventListener("DOMContentLoaded", fetchVendors);
