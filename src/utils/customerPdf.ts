import jsPDF from "jspdf";
import type { Customer } from "../types/customer";

export type CustomerPdfMode =
  | "full"
  | "limited";

// =============================
// SINGLE CUSTOMER PDF
// =============================

export const downloadCustomerPdf = (
  customer: Customer,
  mode: CustomerPdfMode = "full"
) => {
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);

  doc.text(
    "Customer Details",
    20,
    20
  );

  doc.setFontSize(10);
  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setTextColor(120);

  doc.text(
    "Nirjara Beauty",
    20,
    28
  );

  let y = 42;

  const addLine = (
    label: string,
    value?: string
  ) => {
    const safeValue =
      value?.trim() ||
      "Not provided";

    doc.setTextColor(50);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      `${label}:`,
      20,
      y
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    const wrappedText =
      doc.splitTextToSize(
        safeValue,
        135
      );

    doc.text(
      wrappedText,
      60,
      y
    );

    y +=
      wrappedText.length *
        6 +
      6;
  };

  // LIMITED DETAILS
  addLine(
    "Name",
    customer.name
  );

  addLine(
    "Email",
    customer.email
  );

  addLine(
    "Phone",
    customer.phone
  );

  addLine(
    "Status",
    customer.status
  );

  // FULL DETAILS
  if (mode === "full") {
    addLine(
      "Address",
      customer.address
    );

    addLine(
      "Notes",
      customer.notes
    );

    addLine(
      "Created",
      new Date(
        customer.createdAt
      ).toLocaleDateString()
    );
  }

  const safeName =
    customer.name
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      );

  const suffix =
    mode === "full"
      ? "full-details"
      : "limited-details";

  doc.save(
    `${
      safeName ||
      "customer"
    }-${suffix}.pdf`
  );
};

// =============================
// CUSTOMER LIST PDF
// =============================

export const downloadCustomerListPdf = (
  customers: Customer[]
) => {
  const doc = new jsPDF();

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(20);

  doc.text(
    "Customer Contact List",
    20,
    20
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(10);

  doc.setTextColor(120);

  doc.text(
    "Nirjara Beauty",
    20,
    28
  );

  doc.text(
    `Total Customers: ${customers.length}`,
    20,
    34
  );

  let y = 48;

  customers.forEach(
    (customer, index) => {
      // New page when necessary
      if (y > 265) {
        doc.addPage();
        y = 20;
      }

      doc.setTextColor(40);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(11);

      doc.text(
        `${index + 1}. ${
          customer.name ||
          "Unnamed Customer"
        }`,
        20,
        y
      );

      y += 7;

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(10);

      doc.setTextColor(90);

      const email =
        doc.splitTextToSize(
          `Email: ${
            customer.email ||
            "-"
          }`,
          160
        );

      doc.text(
        email,
        25,
        y
      );

      y +=
        email.length * 6;

      const phone =
        doc.splitTextToSize(
          `Phone: ${
            customer.phone ||
            "-"
          }`,
          160
        );

      doc.text(
        phone,
        25,
        y
      );

      y +=
        phone.length * 6 +
        8;

      // separator
      doc.setDrawColor(230);

      doc.line(
        20,
        y - 3,
        190,
        y - 3
      );
    }
  );

  doc.save(
    "customer-contact-list.pdf"
  );
};