import { Order } from '../types.ts';

export function printOrderInvoice(order: Order, language: 'en' | 'hi' = 'en') {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    alert(language === 'hi' ? 'इनवॉइस प्रिंट करने के लिए कृपया ब्रौज़र में पॉप-अप की अनुमति दें।' : 'Please allow popups to print/download your invoice.');
    return;
  }

  const isHindi = language === 'hi';
  const heading = isHindi ? "आधिकारिक टैक्स इनवॉइस" : "Official Tax Invoice";
  const sellerLabel = isHindi ? "विक्रेता:" : "Seller:";
  const buyerLabel = isHindi ? "क्रेता (ग्राहक):" : "Buyer (Customer):";
  const orderIdLabel = isHindi ? "ऑर्डर संख्या:" : "Order Ref ID:";
  const dateLabel = isHindi ? "दिनांक:" : "Order Date:";
  const statusLabel = isHindi ? "भुगतान स्थिति:" : "Payment status:";
  const deliveryLabel = isHindi ? "लॉजिस्टिक्स पार्टनर:" : "Logistics Partner:";
  const itemLabel = isHindi ? "विवरण (उत्पाद का नाम)" : "Item Description";
  const qtyLabel = isHindi ? "मात्रा" : "Quantity";
  const rateLabel = isHindi ? "दर" : "Unit Rate";
  const amtLabel = isHindi ? "कुल राशि" : "Amount";
  const subtotalLabel = isHindi ? "उप-योग:" : "Sub-Total:";
  const gstLabel = isHindi ? "जीएसटी (5% शामिल):" : "CGST/SGST Tax (5% Incl.):";
  const deliveryChargesLabel = isHindi ? "वितरण शुल्क:" : "Delivery Charges:";
  const totalLabel = isHindi ? "कुल देय राशि:" : "Grand Total Payable:";
  const signLabel = isHindi ? "अधिकृत हस्ताक्षरकर्ता" : "Authorized Signatory";
  const thankYou = isHindi 
    ? "आदित्य न्युट्रा फार्म्स का चयन करने के लिए धन्यवाद! स्वादिष्ट और स्वस्थ रहें।" 
    : "Thank you for choosing Aditya Nutra Farms! Savor health & wellness.";
  
  const formattedDate = new Date(order.createdAt).toLocaleDateString();
  const taxAmount = (order.totalAmount * 0.05).toFixed(2);
  const beforeTax = (order.totalAmount - parseFloat(taxAmount)).toFixed(2);

  const itemsHtml = order.items?.map((item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left;">
        <strong style="color: #121417;">${item.productName}</strong>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">₹${item.quantity * item.price}</td>
    </tr>
  `).join('') || '';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
      <meta charset="UTF-8">
      <title>${heading} #${order.id}</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #333;
          background: #fff;
          margin: 0;
          padding: 20px;
          line-height: 1.5;
        }
        .invoice-box {
          max-width: 800px;
          margin: auto;
          padding: 30px;
          border: 1px solid #eee;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
          border-radius: 8px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 3px double #D4AF37;
          padding-bottom: 20px;
          margin-bottom: 25px;
        }
        .header h1 {
          color: #B48F27;
          margin: 0 0 5px 0;
          font-size: 24px;
          letter-spacing: 1px;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 25px;
          font-size: 13px;
        }
        .meta-card {
          padding: 12px;
          background: #fafafa;
          border: 1px solid #eaeaea;
          border-radius: 4px;
        }
        .meta-card h3 {
          margin: 0 0 8px 0;
          color: #333;
          border-bottom: 1px solid #ddd;
          padding-bottom: 4px;
          font-size: 14px;
        }
        .table-items {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
          font-size: 13px;
        }
        .table-items th {
          background: #f7f7f7;
          color: #444;
          font-weight: bold;
          padding: 10px;
          border-bottom: 2px solid #ddd;
        }
        .totals-box {
          float: right;
          width: 320px;
          font-size: 13px;
          margin-bottom: 30px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid #eee;
        }
        .totals-row.grand-total {
          border-top: 2px solid #333;
          border-bottom: 2px double #333;
          font-size: 15px;
          font-weight: bold;
          padding: 10px 0;
          color: #000;
        }
        .footer {
          clear: both;
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid #eee;
          font-size: 11px;
          color: #777;
        }
        .signature-box {
          float: left;
          width: 180px;
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
        }
        .signature-line {
          border-top: 1px solid #333;
          margin-top: 50px;
          padding-top: 5px;
          font-weight: bold;
        }
        @media print {
          body { padding: 0; }
          .invoice-box { border: none; box-shadow: none; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="header">
          <div>
            <h1>ADITYA NUTRA FARMS</h1>
            <div style="font-size: 12px; color: #555;">
              Purnea, Bihar, India<br>
              GSTIN: 10AABCA1234F1Z3<br>
              Email: contact@adityanutrafarm.com
            </div>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; color: #B48F27; font-size: 20px;">TAX INVOICE</h2>
            <div style="font-size: 12px; color: #555; margin-top: 5px;">
              <strong>${orderIdLabel}</strong> #${order.id}<br>
              <strong>${dateLabel}</strong> ${formattedDate}
            </div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-card">
            <h3>${sellerLabel}</h3>
            <strong>Aditya Nutra Farms Pvt. Ltd.</strong><br>
            Mithila Lotus Ponds Cultivation Center<br>
            Purnea District, Bihar - 854301
          </div>
          <div class="meta-card">
            <h3>${buyerLabel}</h3>
            <strong>${order.fullName}</strong><br>
            ${isHindi ? "सत्यापित उपभोक्ता खाता" : "Verified Customer Portal"}<br>
            ${isHindi ? "त्वरित शिपमेंट पता" : "Priority Dispatch Address"}<br>
            ${isHindi ? "ऑल इंडिया फास्ट शिपिंग" : "All India Fast Shipping Hub"}
          </div>
        </div>

        <table class="table-items">
          <thead>
            <tr>
              <th style="text-align: left;">${itemLabel}</th>
              <th style="width: 80px; text-align: center;">${qtyLabel}</th>
              <th style="width: 100px; text-align: right;">${rateLabel}</th>
              <th style="width: 120px; text-align: right;">${amtLabel}</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div>
          <div class="signature-box">
            <div style="font-style: italic; color: #777;">Aditya Singh</div>
            <div class="signature-line">${signLabel}</div>
          </div>

          <div class="totals-box">
            <div class="totals-row">
              <span>${subtotalLabel}</span>
              <span>₹${beforeTax}</span>
            </div>
            <div class="totals-row">
              <span>${gstLabel}</span>
              <span>₹${taxAmount}</span>
            </div>
            <div class="totals-row">
              <span>${deliveryChargesLabel}</span>
              <span style="color: green; font-weight: bold;">${isHindi ? "मुफ़्त" : "FREE"}</span>
            </div>
            <div class="totals-row">
              <span>${statusLabel}</span>
              <span>${order.status === 'Paid' ? (isHindi ? "सफल भुगतान" : "Prepaid Approval") : (isHindi ? "कैश ऑन डिलीवरी" : "COD Guaranteed")}</span>
            </div>
            <div class="totals-row grand-total">
              <span>${totalLabel}</span>
              <span>₹${order.totalAmount}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>${thankYou}</p>
          <p style="margin-top: 10px; font-size: 9px; color: #999;">This is a computer-generated tax invoice. No physical signature is required.</p>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
