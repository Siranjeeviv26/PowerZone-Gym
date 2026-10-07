const { Resend } = require("resend");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

const resend = new Resend(process.env.RESEND_API_KEY);

const BASE_STYLES = `
  font-family:Inter,sans-serif;
  background:#0a0a0a;
  color:#ffffff;
  padding:40px;
  max-width:520px;
  margin:0 auto;
  border-radius:16px;
  border:1px solid #2d2d2d
`;
const CONTAINER = `<div style="${BASE_STYLES}">`;
const HEADER = `
  <div style="text-align:center;margin-bottom:32px">
    <h1 style="font-family:Oswald,sans-serif;font-size:28px;color:#e63946;margin:0;letter-spacing:2px">POWERZONE</h1>
  </div>
`;
const FOOTER = `
  <hr style="border:none;border-top:1px solid #2d2d2d;margin:24px 0"/>
  <p style="color:#4b5563;font-size:11px;margin:0">© PowerZone Gym · Do not reply to this email</p>
</div>
`;

async function sendEmail({ to, subject, html, attachments = [] }) {
  await resend.emails.send({
    from: "PowerZone Gym <onboarding@resend.dev>",
    to,
    subject,
    html,
    attachments,
  });
}

async function sendResetEmail({ to, name, resetUrl }) {
  const html = `
    ${CONTAINER}
    ${HEADER}
    <h2 style="font-size:20px;font-weight:700;margin:0 0 12px">Reset Your Password</h2>
    <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px">Hi ${name}, we received a request to reset your PowerZone account password. Click the button below to choose a new password.</p>
    <a href="${resetUrl}" style="display:inline-block;background:#e63946;color:#ffffff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:50px;text-decoration:none;letter-spacing:0.5px">Reset Password</a>
    <p style="color:#6b7280;font-size:12px;margin:24px 0 0;line-height:1.6">This link expires in <strong style="color:#ffffff">1 hour</strong>. If you did not request a password reset, you can safely ignore this email.</p>
    ${FOOTER}
  `;
  await sendEmail({ to, subject: "Reset Your PowerZone Password", html });
}

async function sendWelcomeEmail({
  to,
  name,
  email,
  password,
  regNo,
  loginUrl,
}) {
  const html = `
    ${CONTAINER}
    ${HEADER}
    <h2 style="font-size:20px;font-weight:700;margin:0 0 12px">Welcome to PowerZone Gym! 🏋️‍♂️</h2>
    <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px">Hi ${name}, your account has been created successfully. Here are your login credentials:</p>
    
    <div style="background:#161616;border:1px solid #2d2d2d;border-radius:12px;padding:24px;margin:24px 0">
      <p style="margin:0 0 12px;font-size:14px;color:#d1d5db"><strong>Registration No:</strong> ${regNo}</p>
      <p style="margin:0 0 12px;font-size:14px;color:#d1d5db"><strong>Email:</strong> ${email}</p>
      <p style="margin:0;font-size:14px;color:#d1d5db"><strong>Password:</strong> ${password}</p>
    </div>
    
    <p style="color:#6b7280;font-size:12px;line-height:1.6;margin:0 0 16px"><strong>Security Note:</strong> For your security, please log in and change your password immediately after first login.</p>
    
    <a href="${loginUrl}" style="display:inline-block;background:#e63946;color:#ffffff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:50px;text-decoration:none;letter-spacing:0.5px">Login to PowerZone</a>
    
    <p style="color:#6b7280;font-size:12px;margin:24px 0 0;line-height:1.6">If you did not create this account, please contact our support team immediately.</p>
    ${FOOTER}
  `;
  await sendEmail({
    to,
    subject: "Welcome to PowerZone Gym — Your Account Credentials",
    html,
  });
}

// ---------- Helpers ----------
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

// Font setup: Noto Sans supports the ₹ glyph. Falls back to Helvetica + "Rs."
const FONT_DIR = path.join(__dirname, "fonts");
const REGULAR_TTF = path.join(FONT_DIR, "NotoSans-Regular.ttf");
const BOLD_TTF = path.join(FONT_DIR, "NotoSans-Bold.ttf");
const HAS_CUSTOM_FONT = fs.existsSync(REGULAR_TTF) && fs.existsSync(BOLD_TTF);

function generateInvoicePDF({ payment, plan, user }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4", layout: "portrait" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Fonts
    let FONT = "Helvetica";
    let FONT_BOLD = "Helvetica-Bold";
    let FONT_ITALIC = "Helvetica-Oblique";
    let currencySymbol = "Rs. ";
    if (HAS_CUSTOM_FONT) {
      doc.registerFont("Body", REGULAR_TTF);
      doc.registerFont("BodyBold", BOLD_TTF);
      FONT = "Body";
      FONT_BOLD = "BodyBold";
      FONT_ITALIC = "Body";
      currencySymbol = "₹";
    }

    const formatCurrency = (amount) =>
      `${currencySymbol}${Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    // GST (18%, amount is GST-inclusive)
    const GST_RATE = 0.18;
    const total = round2(payment.amount);
    const baseAmount = round2(total / (1 + GST_RATE));
    const gstAmount = round2(total - baseAmount);
    const cgst = round2(gstAmount / 2);
    const sgst = round2(gstAmount - cgst);

    // Colors
    const primaryColor = "#e63946";
    const darkColor = "#1a1a1a";
    const grayColor = "#6b7280";
    const white = "#ffffff";
    const borderColor = "#e5e7eb";

    // Page geometry
    const marginLeft = 40;
    const pageWidth = 515;
    const rightEdge = marginLeft + pageWidth;

    const line = (y, color = borderColor, width = 1) =>
      doc
        .strokeColor(color)
        .lineWidth(width)
        .moveTo(marginLeft, y)
        .lineTo(rightEdge, y)
        .stroke();

    // ============ HEADER ============
    let y = 40;
    doc
      .fillColor(primaryColor)
      .font(FONT_BOLD)
      .fontSize(24)
      .text("POWERZONE GYM", marginLeft, y, {
        width: pageWidth,
        align: "center",
      });
    y += 32;
    doc
      .fillColor(grayColor)
      .font(FONT)
      .fontSize(9)
      .text("TAX INVOICE / RECEIPT", marginLeft, y, {
        width: pageWidth,
        align: "center",
        characterSpacing: 1.5,
      });
    y += 20;
    line(y, primaryColor, 2);
    y += 16;

    // ============ COMPANY (left) & INVOICE DETAILS (right) ============
    const topY = y;
    const invX = marginLeft + pageWidth - 190;
    const invValueX = invX + 70;
    const invValueW = 120;

    doc
      .fillColor(darkColor)
      .font(FONT_BOLD)
      .fontSize(10)
      .text("PowerZone Gym", marginLeft, topY);
    const companyLines = [
      "123 Fitness Avenue, Sports Complex",
      "New Delhi 110001, India",
      "GSTIN: 07AAAAA0000A1Z5",
      "PAN: AAAAA0000A",
      "Phone: +91 12345 67890",
      "Email: billing@powerzone.com",
    ];
    let leftY = topY + 16;
    doc.fillColor(grayColor).font(FONT).fontSize(8);
    companyLines.forEach((l) => {
      doc.text(l, marginLeft, leftY, { width: 250 });
      leftY += 12;
    });

    doc
      .fillColor(darkColor)
      .font(FONT_BOLD)
      .fontSize(10)
      .text("Invoice Details", invX, topY);
    const invLines = [
      ["Invoice No:", payment.invoiceNumber],
      ["Date:", formatDate(payment.createdAt)],
      ["Status:", "PAID"],
      ["Payment Mode:", String(payment.paymentMethod || "").toUpperCase()],
    ];
    if (payment.transactionId)
      invLines.push(["Txn ID:", payment.transactionId]);

    let rightY = topY + 16;
    invLines.forEach(([label, value]) => {
      doc
        .font(FONT)
        .fillColor(grayColor)
        .fontSize(8)
        .text(label, invX, rightY, { width: 68 });
      doc
        .font(FONT_BOLD)
        .fillColor(darkColor)
        .fontSize(8)
        .text(String(value), invValueX, rightY, { width: invValueW });
      rightY += 12;
    });

    y = Math.max(leftY, rightY) + 8;

    // ============ BILL TO (left) & MEMBERSHIP DETAILS (right) ============
    line(y);
    y += 12;
    const billY = y;

    // Left: BILL TO
    doc
      .fillColor(darkColor)
      .font(FONT_BOLD)
      .fontSize(10)
      .text("BILL TO:", marginLeft, billY);
    let billLeftY = billY + 16;
    doc.fillColor(grayColor).font(FONT).fontSize(9);
    doc.text(user.name, marginLeft, billLeftY, { width: 270 });
    billLeftY += 13;
    doc.text(user.email, marginLeft, billLeftY, { width: 270 });
    billLeftY += 13;
    if (user.phone) {
      doc.text(user.phone, marginLeft, billLeftY, { width: 270 });
      billLeftY += 13;
    }
    if (user.regNo) {
      doc.text(`Reg No: ${user.regNo}`, marginLeft, billLeftY, { width: 270 });
      billLeftY += 13;
    }

    // Right: MEMBERSHIP & PAYMENT DETAILS (opposite BILL TO)
    const memX = marginLeft + pageWidth - 225;
    const memLabelW = 90;
    const memValueX = memX + memLabelW;
    const memValueW = 135;

    doc
      .fillColor(darkColor)
      .font(FONT_BOLD)
      .fontSize(10)
      .text("MEMBERSHIP & PAYMENT DETAILS", memX, billY, { width: 225 });

    const memDetails = [
      [
        "Membership Period:",
        `${formatDate(payment.startDate)} to ${formatDate(payment.endDate)}`,
      ],
      ["Billing Cycle:", capitalize(payment.billingCycle)],
    ];
    let memY = billY + 16;
    memDetails.forEach(([label, value]) => {
      doc
        .fillColor(grayColor)
        .font(FONT)
        .fontSize(8)
        .text(label, memX, memY, { width: memLabelW });
      doc
        .fillColor(darkColor)
        .font(FONT_BOLD)
        .fontSize(8)
        .text(value, memValueX, memY, { width: memValueW });
      memY += 14;
    });

    y = Math.max(billLeftY, memY) + 14;

    // ============ ITEMS TABLE ============
    const colDefs = [
      {
        key: "desc",
        label: "Description of Services",
        width: 175,
        align: "left",
      },
      { key: "hsn", label: "HSN/SAC", width: 60, align: "center" },
      { key: "qty", label: "Qty", width: 35, align: "center" },
      { key: "rate", label: "Unit Price", width: 80, align: "right" },
      { key: "gst", label: "GST (18%)", width: 80, align: "right" },
      { key: "amt", label: "Amount", width: 85, align: "right" },
    ];
    let cx = marginLeft;
    colDefs.forEach((c) => {
      c.x = cx;
      cx += c.width;
    });

    const PAD = 6;
    const headerHeight = 24;
    const rowHeight = 34;

    doc.rect(marginLeft, y, pageWidth, headerHeight).fill(primaryColor);
    doc.fillColor(white).font(FONT_BOLD).fontSize(7.5);
    colDefs.forEach((c) => {
      doc.text(c.label, c.x + PAD, y + 8, {
        width: c.width - PAD * 2,
        align: c.align,
      });
    });

    const rowY = y + headerHeight;
    doc
      .rect(marginLeft, rowY, pageWidth, rowHeight)
      .fillAndStroke(white, borderColor);

    const planDescription = `${plan.name} Membership — ${capitalize(payment.billingCycle)} Plan`;
    const cellY = rowY + 13;
    const cell = (colKey, text, opts = {}) => {
      const c = colDefs.find((d) => d.key === colKey);
      doc
        .fillColor(opts.color || darkColor)
        .font(opts.font || FONT)
        .fontSize(opts.size || 8)
        .text(text, c.x + PAD, opts.y ?? cellY, {
          width: c.width - PAD * 2,
          align: c.align,
        });
    };

    cell("desc", planDescription, { y: rowY + 7 });
    cell("hsn", "999711", { color: grayColor });
    cell("qty", "1", { color: grayColor });
    cell("rate", formatCurrency(baseAmount));
    cell("gst", formatCurrency(gstAmount), { color: grayColor });
    cell("amt", formatCurrency(total), {
      color: primaryColor,
      font: FONT_BOLD,
      size: 8.5,
    });

    // ============ TAX SUMMARY (right) ============
    const sectionY = rowY + rowHeight + 18;
    const taxBoxWidth = 200;
    const taxBoxX = rightEdge - taxBoxWidth;
    const labelCol = 90;
    const valueX = taxBoxX + labelCol;
    const valueW = taxBoxWidth - labelCol;
    let ty = sectionY;

    const summaryRow = (label, value) => {
      doc
        .fillColor(darkColor)
        .font(FONT)
        .fontSize(8)
        .text(label, taxBoxX, ty, { width: labelCol });
      doc
        .fillColor(grayColor)
        .font(FONT)
        .fontSize(8)
        .text(value, valueX, ty, { width: valueW, align: "right" });
      ty += 16;
    };
    summaryRow("Subtotal", formatCurrency(baseAmount));
    summaryRow("CGST (9%)", formatCurrency(cgst));
    summaryRow("SGST (9%)", formatCurrency(sgst));

    ty += 2;
    doc
      .strokeColor(primaryColor)
      .lineWidth(1.5)
      .moveTo(taxBoxX, ty)
      .lineTo(rightEdge, ty)
      .stroke();
    ty += 8;

    doc
      .fillColor(primaryColor)
      .font(FONT_BOLD)
      .fontSize(11)
      .text("TOTAL", taxBoxX, ty, { width: labelCol });
    doc
      .fillColor(primaryColor)
      .font(FONT_BOLD)
      .fontSize(11)
      .text(formatCurrency(total), valueX, ty, {
        width: valueW,
        align: "right",
      });
    ty += 22;

    doc
      .fillColor(grayColor)
      .font(FONT_ITALIC)
      .fontSize(7)
      .text(`Amount in words: ${numberToWords(total)}`, taxBoxX, ty, {
        width: taxBoxWidth,
        align: "right",
      });

    // ============ FOOTER ============
    const footerY = 760;
    line(footerY);

    doc
      .fillColor(grayColor)
      .font(FONT)
      .fontSize(7)
      .text(
        "Thank you for choosing PowerZone Gym! This is a computer-generated invoice and does not require a physical signature.",
        marginLeft,
        footerY + 8,
        { width: pageWidth, align: "center" },
      );
    doc
      .fontSize(6.5)
      .text(
        "For any queries, contact billing@powerzone.com | +91 12345 67890",
        marginLeft,
        footerY + 20,
        { width: pageWidth, align: "center" },
      );
    doc
      .fontSize(6.5)
      .text(
        "PowerZone Gym | 123 Fitness Avenue, Sports Complex, New Delhi 110001 | GSTIN: 07AAAAA0000A1Z5",
        marginLeft,
        footerY + 30,
        { width: pageWidth, align: "center" },
      );

    doc.end();
  });
}

// Helper: Convert number to Indian words (supports paise)
function numberToWords(amount) {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertHundreds(n) {
    let str = "";
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      str += ones[n] + " ";
    }
    return str.trim();
  }

  function convert(num) {
    if (num === 0) return "Zero";
    let str = "";
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    if (crore) str += convertHundreds(crore) + " Crore ";

    const lakh = Math.floor(num / 100000);
    num %= 100000;
    if (lakh) str += convertHundreds(lakh) + " Lakh ";

    const thousand = Math.floor(num / 1000);
    num %= 1000;
    if (thousand) str += convertHundreds(thousand) + " Thousand ";

    if (num > 0) str += convertHundreds(num);
    return str.trim();
  }

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let result = `${convert(rupees)} Rupees`;
  if (paise > 0) result += ` and ${convert(paise)} Paise`;
  return `${result} Only`;
}

async function sendPaymentReceipt({
  to,
  name,
  payment,
  plan,
  user,
  invoiceUrl,
}) {
  const formatCurrency = (amount) =>
    `₹${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Generate PDF attachment
  let pdfBuffer = null;
  try {
    pdfBuffer = await generateInvoicePDF({ payment, plan, user });
  } catch (e) {
    console.error("PDF generation failed:", e.message);
  }

  const html = `
    ${CONTAINER}
    ${HEADER}
    <h2 style="font-size:20px;font-weight:700;margin:0 0 12px">Payment Receipt & Invoice 🧾</h2>
    <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px">Hi ${name}, thank you for your payment. Your membership has been activated. Here are your payment details:</p>
    
    <div style="background:#161616;border:1px solid #2d2d2d;border-radius:12px;padding:24px;margin:24px 0">
      <p style="margin:0 0 8px;font-size:14px;color:#d1d5db"><strong>Invoice No:</strong> ${payment.invoiceNumber}</p>
      <p style="margin:0 0 8px;font-size:14px;color:#d1d5db"><strong>Plan:</strong> ${plan.name}</p>
      <p style="margin:0 0 8px;font-size:14px;color:#d1d5db"><strong>Billing Cycle:</strong> ${payment.billingCycle}</p>
      <p style="margin:0 0 8px;font-size:14px;color:#d1d5db"><strong>Amount Paid:</strong> ${formatCurrency(payment.amount)}</p>
      <p style="margin:0 0 8px;font-size:14px;color:#d1d5db"><strong>Payment Method:</strong> ${payment.paymentMethod}</p>
      <p style="margin:0 0 8px;font-size:14px;color:#d1d5db"><strong>Transaction ID:</strong> ${payment.transactionId || "N/A"}</p>
      <p style="margin:0 0 8px;font-size:14px;color:#d1d5db"><strong>Membership Period:</strong> ${formatDate(payment.startDate)} – ${formatDate(payment.endDate)}</p>
      <p style="margin:0;font-size:14px;color:#d1d5db"><strong>Payment Date:</strong> ${formatDate(payment.createdAt)}</p>
    </div>
    
    ${
      pdfBuffer
        ? `
      <p style="color:#22c55e;font-size:12px;margin:16px 0 0;line-height:1.6"><strong>📎 PDF Invoice (with GST breakdown) attached to this email</strong></p>
    `
        : ""
    }
    
    ${
      invoiceUrl
        ? `
      <a href="${invoiceUrl}" style="display:inline-block;background:#e63946;color:#ffffff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:50px;text-decoration:none;letter-spacing:0.5px">Download Invoice</a>
    `
        : ""
    }
    
    <p style="color:#6b7280;font-size:12px;margin:24px 0 0;line-height:1.6">Save this email for your records. For any queries, contact our support team.</p>
    ${FOOTER}
  `;

  const attachments = pdfBuffer
    ? [{ filename: `Invoice-${payment.invoiceNumber}.pdf`, content: pdfBuffer }]
    : [];

  await sendEmail({
    to,
    subject: `Payment Receipt — ${payment.invoiceNumber} | PowerZone Gym`,
    html,
    attachments,
  });
}

module.exports = { sendResetEmail, sendWelcomeEmail, sendPaymentReceipt };
