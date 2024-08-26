// Initialize Quill editor
var quill = new Quill('#editor', {
    theme: 'snow'
});

// Handle form submission
document.querySelector('form').onsubmit = function () {
    // Set the content of the hidden input to the HTML of the editor
    var content = document.querySelector('#content');
    content.value = quill.root.innerHTML;
};