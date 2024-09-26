function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('ai-insights').classList.remove('hidden');
  document.getElementById('insights-content').innerHTML = '';

  fetch('/upload', {
      method: 'POST',
      body: formData
  })
  .then(response => {
      if (!response.ok) {
          return response.json().then(err => { throw err; });
      }
      return response.json();
  })
  .then(data => {
      console.log('Received insights:', data.insights);
      document.getElementById('loading').classList.add('hidden');
      document.getElementById('insights-content').innerHTML = `<p>${data.insights}</p>`;
  })
  .catch(error => {
      console.error('Detailed error:', error);
      document.getElementById('loading').classList.add('hidden');
      let errorMessage = 'An unknown error occurred.';
      if (error.error) {
          errorMessage = `${error.error}\n${error.details || ''}`;
      } else if (error.message) {
          errorMessage = error.message;
      }
      document.getElementById('insights-content').innerHTML = `
          <p class="text-red-500">An error occurred:</p>
          <pre class="text-xs mt-2 whitespace-pre-wrap">${errorMessage}</pre>
      `;
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const fileUpload = document.getElementById('file-upload');
  if (fileUpload) {
      fileUpload.addEventListener('change', (event) => {
          const file = event.target.files[0];
          if (file) {
              uploadFile(file);
          }
      });
  } else {
      console.error('File upload element not found');
  }
});