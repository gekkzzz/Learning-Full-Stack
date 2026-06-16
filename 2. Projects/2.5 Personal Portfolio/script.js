document.getElementById('year').textContent = new Date().getFullYear();

function handleSubmit(event) {
  event.preventDefault();
  const success = document.getElementById('form-success');
  success.hidden = false;
  event.target.reset();
}
