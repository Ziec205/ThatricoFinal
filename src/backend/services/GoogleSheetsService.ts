export class GoogleSheetsService {
  static async appendOrder(accessToken: string, spreadsheetId: string, orderData: {
    customerName: string;
    phone: string;
    address: string;
    products: any[];
    totalPrice: number;
  }) {
    const range = 'Sheet1!A1'; // Defaulting to Sheet1
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

    const productDetails = orderData.products.map(p => `${p.name} (x${p.quantity})`).join(', ');
    const row = [
      new Date().toLocaleString('vi-VN'),
      orderData.customerName,
      orderData.phone,
      orderData.address,
      productDetails,
      orderData.totalPrice
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [row]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Google Sheets Error:', error);
      throw new Error(`Failed to update Google Sheet: ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }
}
