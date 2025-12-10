import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Match your actual data structure
interface GameQuestion {
  text: string;
  answers: { text: string; correct: boolean; _id: string }[];
  order: number;
  time: number;
  _id: string;
}

interface ExportableGame {
  title: string;
  gameCode: string;
  createdAt: string;
  questions: GameQuestion[];
}

// Type declaration for jsPDF
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}

/**
 * Clean retro-style PDF export for game data
 */
export async function exportGameToPdf(game: ExportableGame) {
  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Colors matching ResultModal
  const colors = {
    primary: [45, 55, 72] as [number, number, number], // #2D3748
    accent: [214, 158, 46] as [number, number, number], // #D69E2E
    correct: [56, 161, 105] as [number, number, number], // #38A169
    lightBg: [247, 250, 252] as [number, number, number], // #F7FAFC
    border: [203, 213, 224] as [number, number, number], // #CBD5E0
    text: [74, 85, 104] as [number, number, number], // #4A5568
    white: [255, 255, 255] as [number, number, number],
  };

  // ======================
  // 🎨 HEADER (CLEANED + FIXED)
  // ======================

  // Background color
  pdf.setFillColor(255, 250, 247);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // Main header container
  pdf.setFillColor(...colors.white);
  pdf.setDrawColor(...colors.primary);
  pdf.setLineWidth(4);
  pdf.rect(margin - 5, margin - 5, contentWidth + 10, 50, "FD");

  // Title — CLEAN (no shadow)
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.setTextColor(...colors.primary);
  pdf.text(game.title.toUpperCase(), margin, margin + 20);

  // Game info badges (shifted down 5mm)
  const badgeY = margin + 30;

  // Game code
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...colors.text);

  pdf.setFillColor(...colors.lightBg);
  pdf.setDrawColor(...colors.border);
  pdf.setLineWidth(1);
  pdf.rect(margin, badgeY, 40, 12, "D");
  pdf.text(`#${game.gameCode}`, margin + 5, badgeY + 8);

  // Date badge
  const dateText = new Date(game.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const dateWidth = pdf.getTextWidth(dateText) + 20;

  pdf.rect(margin + 45, badgeY, dateWidth, 12, "D");
  pdf.text(dateText, margin + 50, badgeY + 8);

  // Total questions badge — FIXED width
  const qText = `${game.questions.length} Qs`;
  const qBoxWidth = pdf.getTextWidth(qText) + 14;

  pdf.rect(pageWidth - margin - qBoxWidth, badgeY, qBoxWidth, 12, "D");
  pdf.text(qText, pageWidth - margin - qBoxWidth + 7, badgeY + 8);

  // Decorative accent line (moved slightly down)
  pdf.setDrawColor(...colors.accent);
  pdf.setLineWidth(2);
  pdf.line(margin, badgeY + 18, pageWidth - margin, badgeY + 18);

  // ======================
  // 📋 QUESTIONS
  // ======================
  let currentY = margin + 65;
  let pageNumber = 1;
  const totalPages = Math.ceil(game.questions.length / 2.5); // Better estimate

  game.questions.forEach((question, questionIndex) => {
    // Check for page break
    if (currentY > pageHeight - 100) {
      addFooter(pdf, pageWidth, pageHeight, margin, pageNumber, totalPages);
      pdf.addPage();
      pageNumber++;
      currentY = margin;

      // Redraw background
      pdf.setFillColor(255, 250, 247);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
    }

    // Question Card - matches ResultModal style
    pdf.setFillColor(...colors.white);
    pdf.setDrawColor(...colors.primary);
    pdf.setLineWidth(2);

    // Calculate question height based on text length
    const textWidth = contentWidth - 30;
    const questionLines = pdf.splitTextToSize(question.text, textWidth);
    const questionHeight = questionLines.length * 6 + 18;
    pdf.rect(margin, currentY, contentWidth, questionHeight, "FD");

    // Question number in accent bar (left side)
    pdf.setFillColor(...colors.accent);
    pdf.rect(margin, currentY, 20, questionHeight, "F"); // Wider accent bar

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.text(`Q${question.order}`, margin + 10, currentY + questionHeight / 2 + 3, {
      align: "center",
    });

    // Question text - with proper wrapping
    pdf.setTextColor(...colors.primary);
    pdf.setFontSize(11);
    pdf.text(questionLines, margin + 25, currentY + 10);

    // Time indicator
    pdf.setFontSize(9);
    pdf.setTextColor(...colors.text);
    pdf.text(`${question.time}s`, pageWidth - margin - 5, currentY + 10, { align: "right" });

    currentY += questionHeight + 10;

    // Answers table
    const answersData = question.answers.map((answer, answerIndex) => {
      const prefix = String.fromCharCode(65 + answerIndex); // A, B, C, D
      return [prefix, answer.text];
    });
    autoTable(pdf, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: "grid",
      head: [["Option", "Answer"]],
      body: answersData,
      styles: {
        font: "helvetica",
        fontSize: 10,
        cellPadding: 6,
        lineColor: colors.border,
        lineWidth: 0.5,
        textColor: colors.text,
        fillColor: colors.white,
      },
      headStyles: {
        fillColor: colors.lightBg,
        textColor: colors.primary,
        fontStyle: "bold",
        lineWidth: 0.5,
        lineColor: colors.border,
        halign: "center",
      },
      columnStyles: {
        0: {
          cellWidth: 28,
          halign: "center",
          fontStyle: "bold",
        },
        1: {
          cellWidth: contentWidth - 28 - 20,
          halign: "left",
        },

        headStyles: {
          minCellHeight: 12,
        },
      },
      didParseCell: function (data) {
        // Highlight correct answers in the answer column
        if (data.section === "body" && data.column.index === 1) {
          const rowIndex = data.row.index;
          if (question.answers[rowIndex]?.correct) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.textColor = colors.correct;
          }
        }

        // Style option column
        if (data.column.index === 0 && data.row.index > 0) {
          data.cell.styles.fillColor = colors.lightBg;
        }
      },
      willDrawCell: function (data) {
        // Add background to correct answer rows
        if (data.section === "body" && data.column.index === 1) {
          const rowIndex = data.row.index;
          if (question.answers[rowIndex]?.correct) {
            pdf.setFillColor(240, 255, 244); // Light green
            pdf.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, "F");
          }
        }
      },
    });

    // Update position
    currentY = (pdf as any).lastAutoTable?.finalY + 15 || currentY + 50;

    // Add separator between questions (except after last)
    if (questionIndex < game.questions.length - 1) {
      pdf.setDrawColor(...colors.border);
      pdf.setLineWidth(0.3);
      pdf.line(margin + 10, currentY, pageWidth - margin - 10, currentY);
      currentY += 10;
    }
  });

  // ======================
  // 🎮 CREATE BUTTON SECTION
  // ======================

  // Add some space before the button
  currentY += 20;

  // Check if we need a new page for the button
  if (currentY > pageHeight - 50) {
    addFooter(pdf, pageWidth, pageHeight, margin, pageNumber, totalPages);
    pdf.addPage();
    pageNumber++;
    currentY = margin + 40;

    // Redraw background
    pdf.setFillColor(255, 250, 247);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
  }

  // Create a retro button
  addRetroButton(pdf, pageWidth, pageHeight, margin, currentY, contentWidth);

  // ======================
  // 📄 FINAL FOOTER
  // ======================
  addFooter(pdf, pageWidth, pageHeight, margin, pageNumber, totalPages);

  // ======================
  // 📥 SAVE PDF
  // ======================
  const fileName = `${game.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${game.gameCode}.pdf`;
  pdf.save(fileName);

  return pdf;
}

/**
 * Add a retro-style "Create a Pregunta!" button
 */
function addRetroButton(
  pdf: jsPDF,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  yPos: number,
  contentWidth: number
) {
  const buttonHeight = 25;
  const buttonWidth = contentWidth;
  const buttonX = margin;
  const buttonY = yPos;

  // Button background with retro border
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(45, 55, 72);
  pdf.setLineWidth(3);
  pdf.rect(buttonX, buttonY, buttonWidth, buttonHeight, "FD");

  // Button text
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(45, 55, 72);
  pdf.text("CREATE A PREGUNTA!", pageWidth / 2, buttonY + buttonHeight / 2 + 4, {
    align: "center",
  });

  // URL below the button
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(113, 128, 150);
  pdf.link(buttonX, buttonY, buttonWidth, buttonHeight, { url: "https://preguntame.eu/create" });

  // Decorative elements
  pdf.setDrawColor(214, 158, 46);
  pdf.setLineWidth(1);
  pdf.line(buttonX + 10, buttonY + buttonHeight, buttonX + 50, buttonY + buttonHeight);
  pdf.line(
    pageWidth - margin - 50,
    buttonY + buttonHeight,
    pageWidth - margin - 10,
    buttonY + buttonHeight
  );
}

/**
 * Clean footer with preguntame.eu
 */
function addFooter(
  pdf: jsPDF,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  currentPage: number,
  totalPages: number
) {
  const footerY = pageHeight - 12;

  // Footer background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, footerY - 5, pageWidth, 25, "F");

  // Top border
  pdf.setDrawColor(45, 55, 72);
  pdf.setLineWidth(1);
  pdf.line(margin, footerY, pageWidth - margin, footerY);

  // preguntame.eu centered
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(45, 55, 72);
  pdf.text("preguntame.eu", pageWidth / 2, footerY + 8, { align: "center" });

  // Page number
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(113, 128, 150);
  pdf.text(`Page ${currentPage} of ${totalPages}`, pageWidth - margin, footerY + 8, {
    align: "right",
  });
}

/**
 * Even simpler version - just shows correct answers clearly
 */
export async function exportGameToPdfSimple(game: ExportableGame) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Colors
  const primaryColor = [45, 55, 72];
  const correctColor = [56, 161, 105];
  const accentColor = [214, 158, 46];

  // Background
  pdf.setFillColor(255, 250, 247);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // Header - FIXED: No shadow, larger badges
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text(game.title, margin, margin + 10);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");

  // Game code
  pdf.setFillColor(247, 250, 252);
  pdf.setDrawColor(203, 213, 224);
  pdf.setLineWidth(1);
  pdf.rect(margin, margin + 15, 60, 15, "D"); // Larger
  pdf.setTextColor(74, 85, 104);
  pdf.text(`Code: ${game.gameCode}`, margin + 5, margin + 24);

  // Date - larger badge
  const dateText = new Date(game.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const dateWidth = Math.max(pdf.getTextWidth(dateText) + 20, 70);
  pdf.rect(margin + 65, margin + 15, dateWidth, 15, "FD");
  pdf.text(dateText, margin + 70, margin + 24);

  // Questions count - larger badge
  const qCount = `${game.questions.length} Questions`;
  const qCountWidth = Math.max(pdf.getTextWidth(qCount) + 20, 80);
  pdf.rect(pageWidth - margin - qCountWidth, margin + 15, qCountWidth, 15, "FD");
  pdf.text(qCount, pageWidth - margin - qCountWidth + 5, margin + 24);

  // Separator
  pdf.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.setLineWidth(1);
  pdf.line(margin, margin + 35, pageWidth - margin, margin + 35);

  let yPos = margin + 45;
  let pageNum = 1;
  const questionsPerPage = 5;

  game.questions.forEach((question, qIndex) => {
    // Page break
    if (qIndex > 0 && qIndex % questionsPerPage === 0) {
      addSimpleFooter(pdf, pageWidth, pageHeight, margin, pageNum);
      // Add create button before new page
      addSimpleRetroButton(pdf, pageWidth, pageHeight, margin, yPos - 10);
      pdf.addPage();
      pageNum++;
      yPos = margin;
    }

    // Question header
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);

    // Handle long questions
    const questionLines = pdf.splitTextToSize(
      `${question.order}. ${question.text}`,
      pageWidth - margin * 2 - 20
    );
    pdf.text(questionLines, margin, yPos);
    yPos += questionLines.length * 5 + 3;

    // Time
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(113, 128, 150);
    pdf.text(`${question.time}s`, pageWidth - margin - 5, yPos - questionLines.length * 5 - 3, {
      align: "right",
    });

    // Answers
    question.answers.forEach((answer, aIndex) => {
      const prefix = String.fromCharCode(65 + aIndex);
      const isCorrect = answer.correct;

      // Answer row
      pdf.setFontSize(10);
      pdf.setFont("helvetica", isCorrect ? "bold" : "normal");

      if (isCorrect) {
        pdf.setTextColor(correctColor[0], correctColor[1], correctColor[2]);
        pdf.text(`✓ ${prefix}) ${answer.text}`, margin + 5, yPos);
      } else {
        pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.text(`  ${prefix}) ${answer.text}`, margin + 5, yPos);
      }

      yPos += 6;
    });

    yPos += 10; // Spacing between questions
  });

  // Add create button at the end
  addSimpleRetroButton(pdf, pageWidth, pageHeight, margin, yPos);
  yPos += 30;

  // Final footer
  addSimpleFooter(pdf, pageWidth, pageHeight, margin, pageNum);

  const fileName = `${game.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${game.gameCode}.pdf`;
  pdf.save(fileName);
  return pdf;
}

/**
 * Simple retro button for the simple version
 */
function addSimpleRetroButton(
  pdf: jsPDF,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  yPos: number
) {
  const buttonHeight = 20;
  const buttonWidth = pageWidth - margin * 2;

  // Make sure button fits on page
  if (yPos + buttonHeight + 20 > pageHeight) {
    return; // Skip button if no room
  }

  // Button
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(45, 55, 72);
  pdf.setLineWidth(2);
  pdf.rect(margin, yPos, buttonWidth, buttonHeight, "FD");

  // Button text
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(45, 55, 72);
  pdf.text("CREATE A PREGUNTA!", pageWidth / 2, yPos + buttonHeight / 2 + 3, { align: "center" });

  // URL
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(113, 128, 150);
  pdf.text("https://preguntame.eu/create", pageWidth / 2, yPos + buttonHeight + 6, {
    align: "center",
  });
}

function addSimpleFooter(
  pdf: jsPDF,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  pageNum: number
) {
  const footerY = pageHeight - 10;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(45, 55, 72);
  pdf.text("preguntame.eu", pageWidth / 2, footerY, { align: "center" });

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(113, 128, 150);
  pdf.text(`Page ${pageNum}`, pageWidth - margin, footerY, { align: "right" });
}

// Utility function to handle the export from your Dashboard
export async function handleGameExport(
  gameCode: string,
  gameTitle: string,
  getGameFunction: (code: string) => Promise<any>,
  showToastFunction: (message: string, type: "success" | "error" | "info" | "warning") => void
): Promise<void> {
  try {
    showToastFunction("Exporting game...", "info");

    // Fetch the game data
    const gameData = await getGameFunction(gameCode);

    if (!gameData || !gameData.questions) {
      throw new Error("Failed to fetch game data");
    }

    // Transform to ExportableGame format
    const exportableGame: ExportableGame = {
      title: gameData.title,
      gameCode: gameData.gameCode,
      createdAt: gameData.createdAt,
      questions: gameData.questions.map((q: any) => ({
        text: q.text,
        answers: q.answers.map((a: any) => ({
          text: a.text,
          correct: a.correct,
          _id: a._id,
        })),
        order: q.order,
        time: q.time,
        _id: q._id,
      })),
    };

    // Generate PDF
    await exportGameToPdf(exportableGame);

    showToastFunction("Game exported successfully!", "success");
  } catch (error) {
    console.error("Export error:", error);
    showToastFunction("Failed to export game", "error");
  }
}
