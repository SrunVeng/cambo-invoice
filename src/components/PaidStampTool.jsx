import { useState } from "react";

export default function PaidStampTool() {
    const [file, setFile] = useState(null);
    const [isStamping, setIsStamping] = useState(false);
    const [message, setMessage] = useState("");

    function handleFileChange(e) {
        const selectedFile = e.target.files?.[0];

        setMessage("");

        if (!selectedFile) {
            setFile(null);
            return;
        }

        const isPdf = selectedFile.type === "application/pdf";
        const isImage =
            selectedFile.type === "image/png" ||
            selectedFile.type === "image/jpeg" ||
            selectedFile.type === "image/jpg";

        if (!isPdf && !isImage) {
            setFile(null);
            e.target.value = "";
            setMessage("Please upload PDF, PNG, or JPG only.");
            return;
        }

        setFile(selectedFile);
    }

    function downloadBlob(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        link.remove();
        URL.revokeObjectURL(url);
    }

    function getPaidFileName(originalName, extension) {
        const cleanName = originalName.replace(/\.[^/.]+$/, "");
        return `${cleanName}-PAID.${extension}`;
    }

    function drawPaidStampOnCanvas(ctx, canvasWidth, canvasHeight) {
        const stampWidth = Math.min(canvasWidth * 0.48, 520);
        const stampHeight = stampWidth * 0.32;

        ctx.save();

        ctx.translate(canvasWidth * 0.52, canvasHeight * 0.42);
        ctx.rotate((-18 * Math.PI) / 180);

        ctx.globalAlpha = 0.88;
        ctx.strokeStyle = "#9f1d1d";
        ctx.lineWidth = Math.max(8, stampWidth * 0.025);
        ctx.setLineDash([18, 10]);

        ctx.beginPath();
        ctx.roundRect(
            -stampWidth / 2,
            -stampHeight / 2,
            stampWidth,
            stampHeight,
            22
        );
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.font = `900 ${stampHeight * 0.55}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#9f1d1d";
        ctx.fillText("PAID", 0, 0);

        ctx.restore();
    }

    async function stampImage(selectedFile) {
        const imageUrl = URL.createObjectURL(selectedFile);

        try {
            const image = await new Promise((resolve, reject) => {
                const img = new Image();

                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = imageUrl;
            });

            const canvas = document.createElement("canvas");
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;

            const ctx = canvas.getContext("2d");

            if (!ctx) {
                throw new Error("Canvas is not available in this browser.");
            }

            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            drawPaidStampOnCanvas(ctx, canvas.width, canvas.height);

            const isJpg =
                selectedFile.type === "image/jpeg" ||
                selectedFile.type === "image/jpg";

            const outputType = isJpg ? "image/jpeg" : "image/png";
            const extension = isJpg ? "jpg" : "png";

            const blob = await new Promise((resolve, reject) => {
                canvas.toBlob((result) => {
                    if (result) {
                        resolve(result);
                        return;
                    }

                    reject(new Error("Could not create stamped image."));
                }, outputType, 0.95);
            });

            downloadBlob(blob, getPaidFileName(selectedFile.name, extension));
        } finally {
            URL.revokeObjectURL(imageUrl);
        }
    }

    async function stampPdf(selectedFile) {
        const { degrees, PDFDocument, rgb, StandardFonts } = await import(
            "pdf-lib"
        );
        const bytes = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(bytes);
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const pages = pdfDoc.getPages();

        pages.forEach((page) => {
            const { width, height } = page.getSize();

            const fontSize = Math.min(width * 0.17, 110);
            const textWidth = font.widthOfTextAtSize("PAID", fontSize);

            page.drawText("PAID", {
                x: width / 2 - textWidth / 2,
                y: height / 2,
                size: fontSize,
                font,
                color: rgb(0.62, 0.08, 0.08),
                rotate: degrees(-20),
                opacity: 0.75,
            });
        });

        const stampedBytes = await pdfDoc.save();

        const blob = new Blob([stampedBytes], {
            type: "application/pdf",
        });

        downloadBlob(blob, getPaidFileName(selectedFile.name, "pdf"));
    }

    async function stampPaid() {
        try {
            if (!file) {
                setMessage("Please upload an invoice first.");
                return;
            }

            setIsStamping(true);
            setMessage("");

            if (file.type === "application/pdf") {
                await stampPdf(file);
            } else {
                await stampImage(file);
            }

            setMessage("PAID stamp added. File downloaded.");
        } catch (error) {
            setMessage(error.message || "Failed to stamp file.");
        } finally {
            setIsStamping(false);
        }
    }

    return (
        <div className="card paidStampTool">
            <h2>Stamp Existing Invoice</h2>

            <p>
                Upload an old invoice PDF, PNG, or JPG, then download a new copy with a
                PAID stamp.
            </p>

            <label className="uploadBox">
                <input
                    type="file"
                    accept="application/pdf,image/png,image/jpeg"
                    onChange={handleFileChange}
                />
                {file ? file.name : "Upload invoice file"}
            </label>

            <button
                type="button"
                className="primaryButton stampButton"
                disabled={isStamping}
                onClick={stampPaid}
            >
                {isStamping ? "Stamping..." : "Stamp PAID & Download"}
            </button>

            {message && <div className="stampMessage">{message}</div>}
        </div>
    );
}
