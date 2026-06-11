import { cleanFileName } from "./InvoiceUtils.js";

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

    const { default: html2canvas } = await import("html2canvas");

    return html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
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

function canvasToBlob(canvas, mimeType, quality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                    return;
                }

                reject(new Error("Could not create image file."));
            },
            mimeType,
            quality
        );
    });
}

async function downloadCanvasAsImage(canvas, baseFileName, type = "png") {
    const mimeType =
        type === "jpg" || type === "jpeg" ? "image/jpeg" : "image/png";
    const extension = mimeType === "image/jpeg" ? "jpg" : "png";
    const blob = await canvasToBlob(canvas, mimeType, 0.95);

    downloadBlob(blob, `${cleanFileName(baseFileName)}.${extension}`);
}

async function downloadCanvasAsPDF(canvas, baseFileName) {
    const { jsPDF } = await import("jspdf");
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

export async function exportAsImage(element, baseFileName, type = "png") {
    const canvas = await createCanvas(element);

    await downloadCanvasAsImage(canvas, baseFileName, type);
}

export async function exportAsPDF(element, baseFileName) {
    const canvas = await createCanvas(element);

    await downloadCanvasAsPDF(canvas, baseFileName);
}

export async function exportAll(element, baseFileName) {
    const canvas = await createCanvas(element);

    await downloadCanvasAsPDF(canvas, baseFileName);
    await downloadCanvasAsImage(canvas, baseFileName, "png");
    await downloadCanvasAsImage(canvas, baseFileName, "jpg");
}
