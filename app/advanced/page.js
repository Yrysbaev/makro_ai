'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const loadExternalScript = (src, globalName) =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not available.'));
      return;
    }
    if (window[globalName]) {
      resolve(window[globalName]);
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      if (window[globalName]) {
        resolve(window[globalName]);
      } else {
        reject(new Error(`Failed to load ${globalName} from ${src}`));
      }
    };
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });

const buildArrivalsPrompt = (invoiceData) => {
  const lines = invoiceData.lines
    .map((line) => `- ${line.productName || 'Unnamed item'} | Qty: ${line.quantity || 'N/A'}${line.caseCount ? ` | Cases: ${line.caseCount}` : ''}`)
    .join('\n');

  return `You are a sales team assistant for Makro Food. Write a short New Arrivals message for the sales team based on these invoice items. Mention the vendor, invoice number, invoice date, and product highlights. Do not include prices or costs. Use a professional, upbeat tone.\n\nInvoice details:\nVendor: ${invoiceData.vendorName || 'Unknown'}\nInvoice number: ${invoiceData.invoiceNumber || 'Unknown'}\nInvoice date: ${invoiceData.invoiceDate || 'Unknown'}\n\nProducts:\n${lines}`;
};

export default function AdvancedPage() {
  const [invoiceStatus, setInvoiceStatus] = useState('Upload a vendor invoice PDF, image, or Excel file to begin extraction.');
  const [invoiceData, setInvoiceData] = useState(null);
  const [newArrivalsMessage, setNewArrivalsMessage] = useState('');
  const [whatsappStatus, setWhatsappStatus] = useState('');
  const [history, setHistory] = useState([]);
  const [advancedLoading, setAdvancedLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('makroInvoiceHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setInvoiceStatus('Uploading and analyzing file with ChatGPT...');
    setInvoiceData(null);
    setNewArrivalsMessage('');
    setWhatsappStatus('');
    setAdvancedLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/invoice', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'File upload failed');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error);
      }

      const parsed = result.data;
      setInvoiceData({
        vendorName: parsed.vendorName || '',
        invoiceNumber: parsed.invoiceNumber || '',
        invoiceDate: parsed.invoiceDate || '',
        notes: parsed.notes || '',
        lines: Array.isArray(parsed.lines)
          ? parsed.lines.map((item) => ({
              productName: item.productName || '',
              quantity: item.quantity || '',
              caseCount: item.caseCount ?? '',
              price: item.price ?? '',
              cost: item.cost ?? '',
            }))
          : [],
      });
      setInvoiceStatus('Invoice extracted successfully. Review and edit before creating your packing slip.');
    } catch (error) {
      setInvoiceStatus(`Extraction error: ${error.message}`);
    } finally {
      setAdvancedLoading(false);
    }
  };

  const updateInvoiceField = (field, value) => {
    setInvoiceData((current) => ({ ...current, [field]: value }));
  };

  const updateLineField = (index, field, value) => {
    setInvoiceData((current) => {
      if (!current) return current;
      const nextLines = [...current.lines];
      nextLines[index] = { ...nextLines[index], [field]: value };
      return { ...current, lines: nextLines };
    });
  };

  const addLine = () => {
    setInvoiceData((current) => {
      if (!current) return current;
      return {
        ...current,
        lines: [...current.lines, { productName: '', quantity: '', caseCount: '', price: '', cost: '' }],
      };
    });
  };

  const removeLine = (index) => {
    setInvoiceData((current) => {
      if (!current) return current;
      return { ...current, lines: current.lines.filter((_, i) => i !== index) };
    });
  };

  const createPackingSlipDocument = async () => {
    if (!invoiceData) throw new Error('No invoice data available.');
    await loadExternalScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js', 'jspdf');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });

    const margin = 40;
    let y = 50;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('Makro Food', margin, y);
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('Packing Slip', margin, y + 28);
    doc.setDrawColor(80, 80, 120);
    doc.setLineWidth(1.5);
    doc.line(margin, y + 36, 560, y + 36);

    y += 60;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(34, 34, 34);
    doc.text(`Vendor: ${invoiceData.vendorName || 'N/A'}`, margin, y);
    doc.text(`Invoice #: ${invoiceData.invoiceNumber || 'N/A'}`, 320, y);
    y += 18;
    doc.text(`Date: ${invoiceData.invoiceDate || 'N/A'}`, margin, y);
    y += 30;

    doc.setFont('helvetica', 'bold');
    doc.text('Product', margin, y);
    doc.text('Quantity', 280, y);
    doc.text('Cases', 420, y);
    y += 10;
    doc.setLineWidth(0.5);
    doc.line(margin, y + 4, 560, y + 4);
    y += 18;

    doc.setFont('helvetica', 'normal');
    invoiceData.lines.forEach((line) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
      const productText = line.productName || 'Unnamed product';
      const splitText = doc.splitTextToSize(productText, 220);
      doc.text(splitText, margin, y);
      doc.text(String(line.quantity || ''), 280, y);
      doc.text(String(line.caseCount || ''), 420, y);
      y += splitText.length * 14 + 18;
    });

    if (invoiceData.notes) {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Notes', margin, y);
      y += 16;
      doc.setFont('helvetica', 'normal');
      const notesText = doc.splitTextToSize(invoiceData.notes, 520);
      doc.text(notesText, margin, y);
    }

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('This packing slip is for Makro Food internal delivery and sales coordination. Prices and costs are excluded.', margin, 770);

    return doc;
  };

  const downloadPackingSlip = async () => {
    try {
      if (!invoiceData) {
        setInvoiceStatus('No invoice data available for download.');
        return;
      }
      const doc = await createPackingSlipDocument();
      doc.save('makro-food-packing-slip.pdf');
      setInvoiceStatus('Packing slip downloaded successfully.');
    } catch (error) {
      setInvoiceStatus(`Download failed: ${error.message}`);
    }
  };

  const downloadCSV = () => {
    if (!invoiceData) {
      setInvoiceStatus('No invoice data available for CSV export.');
      return;
    }

    const headers = ['Product', 'Quantity', 'Cases', 'Notes'];
    const rows = invoiceData.lines.map((line) => [
      line.productName || '',
      line.quantity || '',
      line.caseCount || '',
      invoiceData.notes || '',
    ]);

    const csvContent = [
      `Vendor,${invoiceData.vendorName}`,
      `Invoice #,${invoiceData.invoiceNumber}`,
      `Date,${invoiceData.invoiceDate}`,
      '',
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'makro-invoice-data.csv';
    a.click();
    URL.revokeObjectURL(url);
    setInvoiceStatus('CSV exported successfully.');
  };

  const generateArrivalsMessage = async () => {
    if (!invoiceData) {
      setInvoiceStatus('Please extract invoice data before generating the New Arrivals message.');
      return;
    }
    setAdvancedLoading(true);
    setWhatsappStatus('');
    setInvoiceStatus('Generating New Arrivals message...');

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are an internal sales communication assistant for Makro Food.' },
            { role: 'user', content: buildArrivalsPrompt(invoiceData) },
          ],
          max_tokens: 220,
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || response.statusText);
      }

      const data = await response.json();
      const message = data.choices?.[0]?.message?.content || '';
      setNewArrivalsMessage(message);
      setInvoiceStatus('New Arrivals message ready. Review or send it to the sales group.');
    } catch (error) {
      setInvoiceStatus(`New Arrivals generation failed: ${error.message}`);
    } finally {
      setAdvancedLoading(false);
    }
  };

  const sendWhatsApp = async (type) => {
    if (!invoiceData) {
      setInvoiceStatus('Please extract invoice data before sending WhatsApp messages.');
      return;
    }

    const messageText =
      type === 'delivery'
        ? `Makro Food packing slip ready for delivery team:\nVendor: ${invoiceData.vendorName || 'N/A'}\nInvoice #: ${invoiceData.invoiceNumber || 'N/A'}\nDate: ${invoiceData.invoiceDate || 'N/A'}\nPlease review the packing slip and coordinate the delivery.`
        : newArrivalsMessage ||
          `New Arrivals from ${invoiceData.vendorName || 'N/A'} on ${invoiceData.invoiceDate || 'N/A'}. Please review the latest product quantities and cases.`;

    setWhatsappStatus(`Sending to WhatsApp ${type} group...`);
    try {
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message: messageText }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'WhatsApp API call failed');
      }
      setWhatsappStatus(`WhatsApp request sent successfully. Response: ${data.message || 'OK'}`);
    } catch (error) {
      setWhatsappStatus(`WhatsApp send failed: ${error.message}`);
    }
  };

  const saveHistory = () => {
    if (!invoiceData) {
      setInvoiceStatus('Cannot save history before invoice extraction.');
      return;
    }

    const entry = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      vendorName: invoiceData.vendorName,
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceDate: invoiceData.invoiceDate,
      notes: invoiceData.notes,
      lines: invoiceData.lines,
      message: newArrivalsMessage,
    };
    const nextHistory = [entry, ...history];
    setHistory(nextHistory);
    window.localStorage.setItem('makroInvoiceHistory', JSON.stringify(nextHistory));
    setInvoiceStatus('Invoice saved to history.');
  };

  const historyItems = useMemo(() => history.slice(0, 5), [history]);

  return (
    <main className="app-shell advanced-page">
      <header className="hero hero-advanced">
        <div>
          <span className="eyebrow">Advanced Mode</span>
          <h1>Invoice extraction and packing slip automation</h1>
          <p>
            Upload vendor invoices powered by ChatGPT. Extract data, generate packing slips, create CSVs, and send sales alerts.
          </p>
          <div className="hero-actions">
            <Link href="/" className="button button-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="advanced-panel">
        <article className="section-card file-card">
          <h2>Upload Invoice</h2>
          <p>Choose a PDF, image (JPG/PNG), or Excel/CSV file. ChatGPT will extract vendor details and product quantities.</p>
          <input type="file" accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg" onChange={handleFileChange} />
          <div className="status-box">{invoiceStatus}</div>
        </article>

        {invoiceData && (
          <article className="section-card invoice-form">
            <h2>Review & Edit Invoice Data</h2>
            <div className="invoice-fields">
              <input
                value={invoiceData.vendorName}
                onChange={(event) => updateInvoiceField('vendorName', event.target.value)}
                placeholder="Vendor name"
              />
              <input
                value={invoiceData.invoiceNumber}
                onChange={(event) => updateInvoiceField('invoiceNumber', event.target.value)}
                placeholder="Invoice number"
              />
              <input
                value={invoiceData.invoiceDate}
                onChange={(event) => updateInvoiceField('invoiceDate', event.target.value)}
                placeholder="Invoice date"
              />
              <textarea
                value={invoiceData.notes}
                onChange={(event) => updateInvoiceField('notes', event.target.value)}
                placeholder="Notes"
              />
            </div>

            <div>
              <h3>Line items</h3>
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Cases</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.lines.map((line, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          value={line.productName}
                          onChange={(event) => updateLineField(index, 'productName', event.target.value)}
                          placeholder="Product name"
                        />
                      </td>
                      <td>
                        <input
                          value={line.quantity}
                          onChange={(event) => updateLineField(index, 'quantity', event.target.value)}
                          placeholder="Quantity"
                        />
                      </td>
                      <td>
                        <input
                          value={line.caseCount}
                          onChange={(event) => updateLineField(index, 'caseCount', event.target.value)}
                          placeholder="Cases"
                        />
                      </td>
                      <td>
                        <button type="button" onClick={() => removeLine(index)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" onClick={addLine} disabled={advancedLoading}>
                Add product line
              </button>
            </div>

            <div className="action-row">
              <button type="button" onClick={downloadPackingSlip} disabled={advancedLoading}>
                Download Packing Slip PDF
              </button>
              <button type="button" onClick={downloadCSV} disabled={advancedLoading}>
                Export CSV
              </button>
              <button type="button" onClick={generateArrivalsMessage} disabled={advancedLoading}>
                Generate New Arrivals Message
              </button>
              <button type="button" onClick={saveHistory} disabled={advancedLoading}>
                Save History
              </button>
            </div>

            {newArrivalsMessage && (
              <div className="output">
                <strong>New Arrivals Message</strong>
                <p>{newArrivalsMessage}</p>
              </div>
            )}

            <div className="action-row">
              <button type="button" onClick={() => sendWhatsApp('delivery')}>
                Send Packing Slip to Delivery WhatsApp Group
              </button>
              <button type="button" onClick={() => sendWhatsApp('sales')}>
                Send New Arrivals Message to Sales WhatsApp Group
              </button>
            </div>
            {whatsappStatus && <div className="status-box">{whatsappStatus}</div>}
          </article>
        )}

        {historyItems.length > 0 && (
          <article className="section-card history-card">
            <h2>Saved Invoice History</h2>
            {historyItems.map((item) => (
              <div className="history-record" key={item.id}>
                <strong>{item.vendorName || 'Unknown Vendor'}</strong>
                <p>Invoice #{item.invoiceNumber || 'N/A'} • {item.invoiceDate || 'N/A'}</p>
                <p>{item.lines.length} line items saved</p>
              </div>
            ))}
          </article>
        )}
      </section>
    </main>
  );
};
