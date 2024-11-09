let selectedFiles = [];

document.getElementById('imageUpload').addEventListener('change', function(event) {
    selectedFiles = Array.from(event.target.files);
});

document.getElementById('convertButton').addEventListener('click', convertToPdf);
 
function convertToPdf() {
    const { jsPDF } = window.jspdf;
    const loadingText = document.getElementById('loadingText');
    const downloadLink = document.getElementById('downloadLink');
    const documentText = document.getElementById('documentText').value;

    if (selectedFiles.length > 0 || documentText.trim() !== '') {
        loadingText.style.display = 'block'; // Show loading text
        downloadLink.innerHTML = ''; // Clear previous link
        const pdf = new jsPDF();
        let imgLoadedCount = 0;

        // Add document text in a separate box
        if (documentText.trim() !== '') {
            const textLines = pdf.splitTextToSize(documentText, 180); // Adjust width
            pdf.rect(10, 10, 190, textLines.length * 10 + 10); // Draw rectangle for box
            pdf.text(textLines, 15, 15); // Add text
            pdf.addPage(); // Start a new page for the images
        }

        const processImage = (index) => {
            if (index >= selectedFiles.length) {
                const pdfBlob = pdf.output('blob');
                const link = document.createElement('a');
                link.href = URL.createObjectURL(pdfBlob);
                link.download = 'converted.pdf';
                downloadLink.innerHTML = ''; // Clear previous links
                downloadLink.appendChild(link);
                link.click(); // Automatically trigger download
                loadingText.style.display = 'none'; // Hide loading text
                return;
            }

            const file = selectedFiles[index];
            const reader = new FileReader();

            reader.onload = function(e) {
                const img = new Image();
                img.src = e.target.result;
                img.onload = function() {
                    const imgWidth = pdf.internal.pageSize.getWidth();
                    const imgHeight = (img.height * imgWidth) / img.width;
                    pdf.addImage(img, file.type === 'image/png' ? 'PNG' : 'JPEG', 0, 10, imgWidth, imgHeight);
                    imgLoadedCount++;
                    if (imgLoadedCount < selectedFiles.length) {
                        pdf.addPage();
                    }
                    processImage(index + 1); // Process next image
                };
            };
            reader.readAsDataURL(file);
        };

        processImage(0); // Start processing images
    } else {
        alert('Please upload at least one image or enter document text.');
    }
}
