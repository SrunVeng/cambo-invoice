import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { cleanFileName } from "./invoiceUtils";

async function waitForImages(element) {
    const images = Array.from(element.querySelectorAll("img"));

    await Promise.all(
        images.map((img) => {
            if (img.complete) return Promise.resolve();

            return new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        })
    );
}

async function createCanvas(element) {
    if (!element) {
        throw new Error("Invoice preview not found.");
    }

    if (document.fonts?.ready) {
        await document.fonts.ready;
    }

    await waitForImages(element);

    return html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fffaf2",
        logging: false,
    });
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    link.remove();
    URL.revokeObjectURL(url);
}

export async function exportAsImage(element, baseFileName, type = "png") {
    const canvas = await createCanvas(element);
    const mimeType = type === "jpg" || type === "jpeg" ? "image/jpeg" : "image/png";
    const extension = mimeType === "image/jpeg" ? "jpg" : "png";

    canvas.toBlob(
        (blob) => {
            if (!blob) return;
            downloadBlob(blob, `${cleanFileName(baseFileName)}.${extension}`);
        },
        mimeType,
        0.95
    );
}

export async function exportAsPDF(element, baseFileName) {
    const canvas = await createCanvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8;

    const usableWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * usableWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, "PNG", margin, position, usableWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;

    while (heightLeft > 0) {
        pdf.addPage();
        position = margin - (imgHeight - heightLeft);
        pdf.addImage(imgData, "PNG", margin, position, usableWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
    }

    pdf.save(`${cleanFileName(baseFileName)}.pdf`);
}

export async function exportAll(element, baseFileName) {
    await exportAsPDF(element, baseFileName);
    await exportAsImage(element, baseFileName, "png");
    await exportAsImage(element, baseFileName, "jpg");
}