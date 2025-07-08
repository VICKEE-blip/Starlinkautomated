javascript
function startPayment(link) {
  const pkg = link.dataset.package;
  const amount = link.dataset.price;
  const phone = prompt("📱 Enter your M-PESA number (format: 2547XXXXXXXX):");

  if (!phone ||!/^2547\d{8}$/.test(phone)) {
    alert("❌ Please enter a valid Kenyan phone number.");
    return;
}

  fetch("/api/pay", {
    method: "POST",
    headers: { "Content-Type": "application/json"},
    body: JSON.stringify({ package: pkg, amount, phone})
})
.then(res => res.json())
.then(data => {
      alert(data.message || "✅ STK Push initiated. Check your phone to complete payment.");
})
.catch(() => {
      alert("⚠️ Something went wrong. Please try again.");
});
}