// Enable update button only when form changes
const form = document.querySelector("#updateForm")

if (form) {
    const updateBtn = document.querySelector("#submitBtn")
    
    // Disable button initially (already done in HTML)
    // updateBtn.disabled = true // Not needed since HTML has disabled
    
    // Enable button when form changes
    form.addEventListener("change", function () {
        updateBtn.disabled = false
    })
    
    // Also enable on input (for text fields)
    form.addEventListener("input", function () {
        updateBtn.disabled = false
    })
    
    console.log("Update form detection enabled")
}