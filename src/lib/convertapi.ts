interface ConvertAPIUploadResponse {
  Url: string;
  FileName: string;
  FileSize: number;
}

interface ConvertAPIFile {
  Url: string;
  FileName: string;
  FileSize: number;
}

interface ConvertAPIPDFResponse {
  ConversionTime: number;
  Files: ConvertAPIFile[];
}

export class ConvertAPIError extends Error {
  constructor(
    message: string,
    public stage: 'upload' | 'convert' | 'download',
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ConvertAPIError';
  }
}

export async function convertHtmlToPdf(
  htmlContent: string,
  apiSecret: string,
  retries = 3
): Promise<Buffer> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`ConvertAPI attempt ${attempt}/${retries}`);

      // Step 1: Upload HTML content
      console.log('Uploading HTML content...');
      const uploadResponse = await fetch(
        `https://v2.convertapi.com/upload?filename=diagnostico.html&Secret=${apiSecret}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
          body: htmlContent,
        }
      );

      if (!uploadResponse.ok) {
        throw new ConvertAPIError(
          `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`,
          'upload',
          uploadResponse.status
        );
      }

      const uploadResult: ConvertAPIUploadResponse = await uploadResponse.json();
      console.log('HTML uploaded successfully:', uploadResult.Url);

      // Step 2: Convert HTML to PDF using multipart/form-data
      console.log('Converting HTML to PDF...');
      const formData = new FormData();
      formData.append('File', uploadResult.Url);
      formData.append('StoreFile', 'true');
      formData.append('FileName', 'diagnostico.pdf');

      const convertResponse = await fetch(
        `https://v2.convertapi.com/convert/html/to/pdf?Secret=${apiSecret}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!convertResponse.ok) {
        throw new ConvertAPIError(
          `Conversion failed: ${convertResponse.status} ${convertResponse.statusText}`,
          'convert',
          convertResponse.status
        );
      }

      const convertResult: ConvertAPIPDFResponse = await convertResponse.json();
      console.log('PDF converted successfully:', convertResult.Files[0]?.Url);

      if (!convertResult.Files || convertResult.Files.length === 0) {
        throw new ConvertAPIError('No PDF file generated', 'convert');
      }

      // Step 3: Download the PDF
      console.log('Downloading PDF...');
      const pdfResponse = await fetch(convertResult.Files[0].Url);

      if (!pdfResponse.ok) {
        throw new ConvertAPIError(
          `PDF download failed: ${pdfResponse.status} ${pdfResponse.statusText}`,
          'download',
          pdfResponse.status
        );
      }

      const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
      console.log(`PDF downloaded successfully: ${pdfBuffer.length} bytes`);

      if (pdfBuffer.length === 0) {
        throw new ConvertAPIError('Downloaded PDF is empty', 'download');
      }

      return pdfBuffer;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt < retries) {
        // Exponential backoff: wait 2^attempt seconds
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('All conversion attempts failed');
}