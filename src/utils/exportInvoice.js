import { cleanFileName } from "./InvoiceUtils.js";

const IMAGE_EXPORT_SCALE = 2;
const PDF_EXPORT_SCALE = 1.35;
const PDF_JPEG_QUALITY = 0.78;

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

function waitForLayout() {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
        });
    });
}

async function createCanvas(element, scale = IMAGE_EXPORT_SCALE) {
    if (!element) {
        throw new Error("Invoice preview not found.");
    }

    await waitForLayout();

    if (document.fonts?.ready) {
        await document.fonts.ready;
    }

    await waitForImages(element);

    const { default: html2canvas } = await import("html2canvas");

    return html2canvas(element, {
        scale,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: Math.max(document.documentElement.clientWidth, element.scrollWidth),
        windowHeight: Math.max(
            document.documentElement.clientHeight,
            element.scrollHeight
        ),
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
    const imgData = canvas.toDataURL("image/jpeg", PDF_JPEG_QUALITY);

    const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
        compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8;

    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;
    const imageRatio = canvas.width / canvas.height;
    const pageRatio = usableWidth / usableHeight;
    const renderWidth = imageRatio > pageRatio
        ? usableWidth
        : usableHeight * imageRatio;
    const renderHeight = imageRatio > pageRatio
        ? usableWidth / imageRatio
        : usableHeight;
    const x = (pageWidth - renderWidth) / 2;
    const y = (pageHeight - renderHeight) / 2;

    pdf.addImage(
        imgData,
        "JPEG",
        x,
        y,
        renderWidth,
        renderHeight,
        undefined,
        "MEDIUM"
    );

    pdf.save(`${cleanFileName(baseFileName)}.pdf`);
}

export async function exportAsImage(element, baseFileName, type = "png") {
    const canvas = await createCanvas(element, IMAGE_EXPORT_SCALE);

    await downloadCanvasAsImage(canvas, baseFileName, type);
}

export async function exportAsPDF(element, baseFileName) {
    const canvas = await createCanvas(element, PDF_EXPORT_SCALE);

    await downloadCanvasAsPDF(canvas, baseFileName);
}

export async function exportAll(element, baseFileName) {
    const pdfCanvas = await createCanvas(element, PDF_EXPORT_SCALE);
    const imageCanvas = await createCanvas(element, IMAGE_EXPORT_SCALE);

    await downloadCanvasAsPDF(pdfCanvas, baseFileName);
    await downloadCanvasAsImage(imageCanvas, baseFileName, "png");
    await downloadCanvasAsImage(imageCanvas, baseFileName, "jpg");
}
