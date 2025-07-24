document.addEventListener("DOMContentLoaded", () => {
  const feedbackInput = document.getElementById('user-feedback');
  const feedbackStatus = document.getElementById('feedback-status');
  let lastSubmittedFeedback = "";

  async function getAirtableRecordIdByComboField(comboValue) {
    if (!comboValue) return null;
    // Filter by Airtable field: Lot Number and Community/Neighborhood
    const formula = `{Lot Number and Community/Neighborhood}="${comboValue}"`;
    const url = `https://api.airtable.com/v0/${window.env.AIRTABLE_BASE_ID}/${window.env.AIRTABLE_TABLE_NAME}?filterByFormula=${encodeURIComponent(formula)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${window.env.AIRTABLE_API_KEY}` }
    });
    const data = await res.json();
    if (data.records && data.records.length > 0) {
      return data.records[0].id;
    }
    return null;
  }

  async function submitFeedback() {
    const feedback = feedbackInput.value.trim();
    if (!feedback || feedback === lastSubmittedFeedback) return;

    feedbackStatus.textContent = "Submitting...";
    feedbackStatus.style.color = "#666";

    // Get value from #job-name and use it as lookup
    const comboValue = document.getElementById('job-name')?.value;
    if (!comboValue) {
      feedbackStatus.textContent = "Missing job name. Cannot submit feedback.";
      feedbackStatus.style.color = "#c00";
      return;
    }

    const recordId = await getAirtableRecordIdByComboField(comboValue);

    if (!recordId) {
      feedbackStatus.textContent = "No record found for this Lot Number and Community/Neighborhood.";
      feedbackStatus.style.color = "#c00";
      return;
    }

    try {
      const url = `https://api.airtable.com/v0/${window.env.AIRTABLE_BASE_ID}/${window.env.AIRTABLE_TABLE_NAME}/${recordId}`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${window.env.AIRTABLE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fields: { "User Feedback": feedback } })
      });

      if (res.ok) {
        feedbackStatus.textContent = "Feedback submitted!";
        feedbackStatus.style.color = "#009900";
        lastSubmittedFeedback = feedback;
      } else {
        feedbackStatus.textContent = "Failed to submit feedback. Try again later.";
        feedbackStatus.style.color = "#c00";
      }
    } catch (e) {
      feedbackStatus.textContent = "Error submitting feedback.";
      feedbackStatus.style.color = "#c00";
    }
  }

  if (feedbackInput) {
    feedbackInput.addEventListener('blur', submitFeedback);
  }
});
